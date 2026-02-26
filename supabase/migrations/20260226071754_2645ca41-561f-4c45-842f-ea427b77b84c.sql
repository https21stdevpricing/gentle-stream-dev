-- Create site_settings table for editable company info
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('company_name', 'Stone World'),
  ('tagline', 'Quality Matters the MOST!'),
  ('about_short', 'Founded in 2003, AB Stone World Pvt Ltd. has grown from a regional supplier to one of Gujarat''s most trusted names in premium surface materials and building products.'),
  ('about_full', 'Stone World was founded in 2003 with a single vision: to bring the world''s finest surface materials to Indian homes and businesses. From the quarries of Rajasthan to Italian marble halls, we source only the best. Our 30,000 sq.ft. warehouse stocks over 5 Crores worth of premium inventory, ready for your project.'),
  ('phone1', '+91 9377521509'),
  ('phone2', '+91 9427459805'),
  ('email', 'Stoneworld1947@gmail.com'),
  ('address', 'Near Dantali Gam, Dantali, Gujarat 382165'),
  ('whatsapp', '+91 9377521509'),
  ('stat_years', '20+'),
  ('stat_inventory', '5Cr+'),
  ('stat_warehouse', '30,000'),
  ('stat_team', '25+'),
  ('founded_year', '2003'),
  ('company_gstin', '24AAKCA1234F1Z5')
ON CONFLICT (key) DO NOTHING;