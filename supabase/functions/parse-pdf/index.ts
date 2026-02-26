import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const action = formData.get("action") as string || "parse_products";

    if (!file) throw new Error("No file uploaded");

    // Convert file to base64 for AI processing
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = file.type || "application/pdf";

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "parse_products") {
      systemPrompt = `You are a product catalog parser for a building materials company (Stone World). Extract ALL products from the uploaded document.

For each product, extract:
- name: Product name
- category: One of: Marble, Granite, Vitrified Tiles, Natural Stone, Quartz, Sanitaryware, Cement & Sand, TMT Bars, Polycab Wires, Ceramic, Sinks, General
- subcategory: More specific type if available
- material: Material type
- finish: Surface finish (Polished, Honed, Matt, etc.)
- color: Primary color
- dimensions: Size/dimensions as text
- price: Numeric price per unit (0 if not found)
- unit: sqft, piece, bag, ton, meter, etc.
- hsn_code: HSN code if available
- origin: Country/region of origin
- description: Brief product description
- tags: Array of relevant tags

Return a JSON array of products. Be thorough - extract EVERY product you can find.`;

      userPrompt = "Extract all products from this catalog/document. Return ONLY a valid JSON array of product objects.";
    } else if (action === "parse_invoice") {
      systemPrompt = `You are an invoice/quotation parser. Extract all details from the uploaded invoice or quotation document.

Extract:
- invoice_number: Invoice/quotation number
- invoice_type: "invoice", "quotation", "proforma", or "credit_note"
- customer_name: Customer/buyer name
- customer_address: Full address
- customer_gstin: GSTIN number if present
- customer_phone: Phone number
- customer_email: Email
- date: Invoice date (ISO format)
- due_date: Due date if present
- items: Array of line items, each with:
  - description: Item description
  - hsn_code: HSN code
  - quantity: Quantity
  - unit: Unit of measure
  - rate: Rate per unit
  - amount: Line total
  - tax_rate: Tax percentage
- subtotal: Subtotal before tax
- cgst_rate: CGST rate %
- cgst_amount: CGST amount
- sgst_rate: SGST rate %
- sgst_amount: SGST amount
- igst_rate: IGST rate %
- igst_amount: IGST amount
- total_tax: Total tax
- grand_total: Grand total
- notes: Any notes
- terms: Terms and conditions
- payment_terms: Payment terms
- company_gstin: Seller GSTIN

Return a single JSON object with all extracted fields.`;

      userPrompt = "Extract all details from this invoice/quotation. Return ONLY valid JSON.";
    } else {
      throw new Error("Invalid action. Use 'parse_products' or 'parse_invoice'.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI processing failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find JSON array or object
      const arrMatch = jsonStr.match(/\[[\s\S]*\]/);
      const objMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (arrMatch) parsed = JSON.parse(arrMatch[0]);
      else if (objMatch) parsed = JSON.parse(objMatch[0]);
      else throw new Error("Could not parse AI response as JSON");
    }

    return new Response(JSON.stringify({ data: parsed, raw: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
