
-- Products table with full inventory management
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  subcategory text DEFAULT NULL,
  material text DEFAULT NULL,
  finish text DEFAULT NULL,
  color text DEFAULT NULL,
  origin text DEFAULT NULL,
  length_mm numeric DEFAULT NULL,
  width_mm numeric DEFAULT NULL,
  thickness_mm numeric DEFAULT NULL,
  weight_kg numeric DEFAULT NULL,
  unit text DEFAULT 'sqft',
  price numeric NOT NULL DEFAULT 0,
  cost_price numeric DEFAULT 0,
  margin_percent numeric DEFAULT 0,
  hsn_code text DEFAULT NULL,
  stock_quantity integer DEFAULT 0,
  min_stock_level integer DEFAULT 0,
  supplier text DEFAULT NULL,
  supplier_code text DEFAULT NULL,
  images text[] DEFAULT '{}',
  thumbnail text DEFAULT NULL,
  tags text[] DEFAULT '{}',
  variants jsonb DEFAULT '[]',
  specs jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT USING (active = true);

CREATE POLICY "Authenticated can manage products" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL,
  invoice_type text NOT NULL DEFAULT 'quotation',
  customer_name text NOT NULL,
  customer_email text DEFAULT NULL,
  customer_phone text DEFAULT NULL,
  customer_address text DEFAULT NULL,
  customer_gstin text DEFAULT NULL,
  company_gstin text DEFAULT NULL,
  billing_address text DEFAULT NULL,
  shipping_address text DEFAULT NULL,
  subtotal numeric DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  taxable_amount numeric DEFAULT 0,
  cgst_rate numeric DEFAULT 0,
  cgst_amount numeric DEFAULT 0,
  sgst_rate numeric DEFAULT 0,
  sgst_amount numeric DEFAULT 0,
  igst_rate numeric DEFAULT 0,
  igst_amount numeric DEFAULT 0,
  total_tax numeric DEFAULT 0,
  grand_total numeric DEFAULT 0,
  amount_in_words text DEFAULT NULL,
  notes text DEFAULT NULL,
  terms text DEFAULT NULL,
  payment_terms text DEFAULT NULL,
  due_date timestamptz DEFAULT NULL,
  status text DEFAULT 'draft',
  tally_exported boolean DEFAULT false,
  tally_voucher_number text DEFAULT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage invoices" ON public.invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoice items
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  description text NOT NULL,
  hsn_code text DEFAULT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'sqft',
  rate numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  tax_rate numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage invoice items" ON public.invoice_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

CREATE POLICY "Anyone can read uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated can upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Authenticated can update uploads" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated can delete uploads" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'uploads');

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
