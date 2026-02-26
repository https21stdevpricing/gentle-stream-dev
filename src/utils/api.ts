import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SITE_INFO, type Product, type Category, type SiteInfo } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getProducts = async (params: { featured?: boolean; category?: string; search?: string; limit?: number } = {}): Promise<{ data: Product[] }> => {
  await delay(300);
  let products = [...MOCK_PRODUCTS].filter(p => p.active);

  if (params.featured) {
    products = products.filter(p => p.featured);
  }
  if (params.category) {
    products = products.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.material.toLowerCase().includes(s) ||
      p.tags.some(t => t.toLowerCase().includes(s))
    );
  }
  if (params.limit) {
    products = products.slice(0, params.limit);
  }

  return { data: products };
};

export const getCategories = async (): Promise<{ data: Category[] }> => {
  await delay(200);
  return { data: MOCK_CATEGORIES };
};

export const getSiteInfo = async (): Promise<{ data: SiteInfo }> => {
  await delay(100);
  return { data: MOCK_SITE_INFO };
};

export const submitInquiry = async (data: { name: string; email: string; phone?: string; message: string; product_interest?: string }): Promise<{ data: { success: boolean } }> => {
  await delay(800);
  console.log('Inquiry submitted:', data);
  return { data: { success: true } };
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
  if (token) {
    return { data: { username: 'admin' } };
  }
  throw new Error('No token');
};
