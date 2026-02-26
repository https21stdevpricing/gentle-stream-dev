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

    const prompt = `You are an invoice/quotation data extraction expert. Analyze this document and extract all invoice/quotation details.

Extract the following structure:
{
  "invoice_number": "Invoice/quotation number",
  "invoice_type": "gst_invoice" or "quotation" or "proforma",
  "date": "Date string",
  "due_date": "Due date if found",
  "customer": {
    "name": "Customer/party name",
    "address": "Full address",
    "gstin": "GSTIN if found",
    "phone": "Phone if found",
    "email": "Email if found"
  },
  "seller": {
    "name": "Seller/company name",
    "address": "Address",
    "gstin": "GSTIN"
  },
  "items": [
    {
      "description": "Item description",
      "hsn_code": "HSN code",
      "quantity": 1,
      "unit": "sqft/pcs/box",
      "rate": 100,
      "amount": 100,
      "discount_percent": 0,
      "tax_rate": 18
    }
  ],
  "subtotal": 0,
  "discount_amount": 0,
  "cgst_rate": 9,
  "cgst_amount": 0,
  "sgst_rate": 9,
  "sgst_amount": 0,
  "igst_rate": 0,
  "igst_amount": 0,
  "total_tax": 0,
  "grand_total": 0,
  "notes": "Any notes",
  "terms": "Payment terms",
  "bank_details": "Bank details if found"
}

Return ONLY valid JSON. Extract every detail you can find.`;

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

    let invoiceData = {};
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        invoiceData = JSON.parse(jsonMatch[0]);
      } catch {
        const cleaned = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        invoiceData = JSON.parse(cleaned);
      }
    }

    return new Response(JSON.stringify({ data: invoiceData, raw: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Invoice parse error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
