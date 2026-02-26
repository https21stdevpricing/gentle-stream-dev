import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    const bytes = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));

    const prompt = `You are a product data extraction expert. Analyze this PDF document and extract ALL product information you can find.

For EACH product found, extract these fields (use null if not found):
- name: Product name
- description: Brief description
- category: Product category (e.g., Marble, Granite, Tiles, Cement, Sanitaryware)
- subcategory: Subcategory if applicable
- material: Material type
- finish: Surface finish (polished, honed, brushed, etc.)
- color: Color/shade
- origin: Country/region of origin
- length_mm: Length in mm
- width_mm: Width in mm
- thickness_mm: Thickness in mm
- weight_kg: Weight in kg
- unit: Unit of measurement (sqft, piece, box, etc.)
- price: Price (number only, no currency symbol)
- hsn_code: HSN/SAC code if found
- supplier: Supplier/manufacturer name
- supplier_code: Supplier's product code/SKU
- tags: Array of relevant tags

Return ONLY a valid JSON array of products. Example:
[{"name":"Italian Carrara Marble","category":"Marble","material":"Natural Marble","finish":"Polished","color":"White with grey veins","origin":"Italy","price":450,"unit":"sqft","hsn_code":"6802","tags":["premium","imported"]}]

If the document is a price list, extract all items with their prices.
If it's a catalog, extract product details and descriptions.
If it's a spec sheet, extract all technical specifications.
Be thorough - extract EVERY product mentioned.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 8000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI Gateway error [${response.status}]: ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    // Extract JSON from response
    let products = [];
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        products = JSON.parse(jsonMatch[0]);
      } catch {
        // Try to clean up and parse
        const cleaned = jsonMatch[0].replace(/,\s*\]/g, ']').replace(/,\s*}/g, '}');
        products = JSON.parse(cleaned);
      }
    }

    return new Response(JSON.stringify({ products, raw: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF Parse error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
