
-- Fix invoices RLS: drop restrictive policies and create permissive ones
DROP POLICY IF EXISTS "Authenticated can manage invoices" ON public.invoices;
CREATE POLICY "Anyone can manage invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

-- Fix invoice_items RLS
DROP POLICY IF EXISTS "Authenticated can manage invoice items" ON public.invoice_items;
CREATE POLICY "Anyone can manage invoice items" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);

-- Fix blog_posts ALL policy
DROP POLICY IF EXISTS "Authenticated can manage blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can manage blog posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

-- Fix products ALL policy
DROP POLICY IF EXISTS "Authenticated can manage products" ON public.products;
CREATE POLICY "Anyone can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Fix site_settings ALL policy
DROP POLICY IF EXISTS "Authenticated can manage site settings" ON public.site_settings;
CREATE POLICY "Anyone can manage site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
