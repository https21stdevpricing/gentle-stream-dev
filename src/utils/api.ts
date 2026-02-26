import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SITE_INFO, type Product, type Category, type SiteInfo } from './mockData';
import { supabase } from '@/integrations/supabase/client';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch products from DB first, fallback to mock
export const getProducts = async (params: { featured?: boolean; category?: string; search?: string; limit?: number } = {}): Promise<{ data: Product[] }> => {
  try {
    let query = supabase.from('products').select('*').eq('active', true);
    if (params.featured) query = query.eq('featured', true);
    if (params.category) query = query.ilike('category', params.category);
    if (params.limit) query = query.limit(params.limit);
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let products: Product[] = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: p.category,
      material: p.material || '',
      dimensions: p.length_mm && p.width_mm ? `${p.length_mm}x${p.width_mm} mm` : '',
      finish: p.finish || '',
      description: p.description || '',
      image_url: p.thumbnail || (p.images && p.images[0]) || '',
      gallery_images: p.images || [],
      tags: p.tags || [],
      featured: p.featured ?? false,
      active: p.active ?? true,
      price_range: p.price ? `₹${p.price}/${p.unit || 'sqft'}` : '',
      applications: [],
    }));

    if (params.search) {
      const s = params.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.material.toLowerCase().includes(s) ||
        p.tags.some(t => t.toLowerCase().includes(s))
      );
    }

    // If DB has products, return them; otherwise fall back to mock
    if (products.length > 0) return { data: products };
  } catch {
    // Fall through to mock
  }

  // Fallback to mock data
  await delay(200);
  let products = [...MOCK_PRODUCTS].filter(p => p.active);
  if (params.featured) products = products.filter(p => p.featured);
  if (params.category) products = products.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
  if (params.search) {
    const s = params.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.material.toLowerCase().includes(s) ||
      p.tags.some(t => t.toLowerCase().includes(s))
    );
  }
  if (params.limit) products = products.slice(0, params.limit);
  return { data: products };
};

export const getCategories = async (): Promise<{ data: Category[] }> => {
  await delay(100);
  return { data: MOCK_CATEGORIES };
};

// Fetch site info from DB settings, fallback to mock
export const getSiteInfo = async (): Promise<{ data: SiteInfo }> => {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      const map: Record<string, string> = {};
      data.forEach((s: any) => { map[s.key] = s.value; });
      return {
        data: {
          ...MOCK_SITE_INFO,
          ...Object.fromEntries(Object.entries(map).filter(([_, v]) => v)),
        } as SiteInfo,
      };
    }
  } catch {}
  return { data: MOCK_SITE_INFO };
};

export const submitInquiry = async (data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  product_interest?: string;
  purpose?: string;
  material?: string;
  project_type?: string;
  area?: string;
  product_category?: string;
  custom_specs?: Record<string, string>;
}): Promise<{ data: { success: boolean } }> => {
  const { error } = await supabase.from('inquiries').insert({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    message: data.message || 'General inquiry',
    product_interest: data.product_interest || null,
    purpose: data.purpose || null,
    material: data.material || null,
    project_type: data.project_type || null,
    area: data.area || null,
    product_category: data.product_category || null,
    custom_specs: data.custom_specs || {},
  });

  if (error) throw error;
  return { data: { success: true } };
};

export const getInquiries = async () => {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getInquiryReplies = async (inquiryId: string) => {
  const { data, error } = await supabase
    .from('inquiry_replies')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .order('sent_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const sendReply = async (inquiryId: string, replyText: string, replyType: string) => {
  const { data, error } = await supabase
    .from('inquiry_replies')
    .insert({
      inquiry_id: inquiryId,
      reply_text: replyText,
      reply_type: replyType,
    })
    .select()
    .single();
  if (error) throw error;

  // Update inquiry status
  await supabase
    .from('inquiries')
    .update({ status: 'replied' })
    .eq('id', inquiryId);

  return data;
};

export const updateInquiryStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
};

export const getBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getBlogPost = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error) throw error;
  return data;
};

export const login = async (username: string, password: string): Promise<{ data: { token: string; username: string } }> => {
  await delay(500);
  if (username === 'admin' && password === 'StoneWorld@2024') {
    return { data: { token: 'mock-jwt-token', username: 'admin' } };
  }
  throw { response: { data: { detail: 'Invalid credentials' } } };
};

export const verifyToken = async (): Promise<{ data: { username: string } }> => {
  await delay(200);
  const token = localStorage.getItem('sw_token');
  if (token) return { data: { username: 'admin' } };
  throw new Error('No token');
};
