
-- Create inquiries table for storing customer quotes/inquiries
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL DEFAULT 'General inquiry',
  product_interest TEXT,
  purpose TEXT,
  material TEXT,
  project_type TEXT,
  area TEXT,
  product_category TEXT,
  custom_specs JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inquiry_replies table for admin replies
CREATE TABLE public.inquiry_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  reply_type TEXT NOT NULL DEFAULT 'email' CHECK (reply_type IN ('email', 'whatsapp', 'internal')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by TEXT DEFAULT 'admin'
);

-- Create blog_posts table for SEO content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'Stone World Team',
  published BOOLEAN NOT NULL DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Inquiries: anyone can insert (public form)
CREATE POLICY "Anyone can submit inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read inquiries" ON public.inquiries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (true);

-- Inquiry replies: authenticated can insert, anyone can read
CREATE POLICY "Authenticated can insert replies" ON public.inquiry_replies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read replies" ON public.inquiry_replies FOR SELECT USING (true);

-- Blog posts: anyone can read published posts
CREATE POLICY "Anyone can read published blog posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Authenticated can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for inquiries
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
