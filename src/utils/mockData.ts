export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  material: string;
  dimensions: string;
  finish: string;
  description: string;
  image_url: string;
  gallery_images: string[];
  tags: string[];
  featured: boolean;
  active: boolean;
  price_range: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  active: boolean;
}

export interface SiteInfo {
  company_name: string;
  tagline: string;
  about_short: string;
  about_full: string;
  founded_year: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  address: string;
  whatsapp: string;
  stat_years: string;
  stat_inventory: string;
  stat_warehouse: string;
  stat_team: string;
  notable_clients: string[];
}

export const MOCK_SITE_INFO: SiteInfo = {
  company_name: "Stone World",
  tagline: "Quality Matters the MOST!",
  about_short: "Founded in 2003, AB Stone World Pvt Ltd. has grown from a regional supplier to one of Gujarat's most trusted names in premium surface materials.",
  about_full: "Stone World was founded in 2003 with a single vision: to bring the world's finest surface materials to Indian homes and businesses. From the quarries of Rajasthan to Italian marble halls, we source only the best. Our 30,000 sq.ft. warehouse stocks over 5 Crores worth of premium inventory, ready for your project.",
  founded_year: "2003",
  phone1: "+91 9377521509",
  phone2: "+91 9427459805",
  email: "Stoneworld1947@gmail.com",
  website: "stone-world.in",
  address: "Near Dantali Gam, Dantali, Gujarat 382165",
  whatsapp: "+91 9377521509",
  stat_years: "20+",
  stat_inventory: "5Cr+",
  stat_warehouse: "30,000",
  stat_team: "25+",
  notable_clients: ["IIM Ahmedabad", "Motera Stadium", "Zydus", "Adani Group", "Volkswagen", "Taco Bell", "HDFC Bank", "Sun Pharma"],
};

export const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Marble", slug: "marble", description: "Italian & Indian luxury marble", icon: "gem", order: 0, active: true },
  { id: "2", name: "Granite", slug: "granite", description: "Enduring strength & beauty", icon: "mountain", order: 1, active: true },
  { id: "3", name: "Vitrified Tiles", slug: "vitrified-tiles", description: "Infinite design possibilities", icon: "layers", order: 2, active: true },
  { id: "4", name: "Natural Stone", slug: "natural-stone", description: "Raw natural beauty", icon: "tree", order: 3, active: true },
  { id: "5", name: "Quartz", slug: "quartz", description: "Zero maintenance luxury", icon: "droplets", order: 4, active: true },
  { id: "6", name: "Sanitaryware", slug: "sanitaryware", description: "Premium bathroom fittings", icon: "bath", order: 5, active: true },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1", name: "Statuario White", slug: "statuario-white", category: "Marble",
    material: "Italian Marble", dimensions: "120x240 cm", finish: "Polished",
    description: "Premium Italian Statuario marble with distinctive grey veining on a pristine white background. Perfect for luxury flooring and wall cladding.",
    image_url: "https://images.unsplash.com/photo-1719107647328-dd2134da4fa7?w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?w=800&q=80"],
    tags: ["Italian", "Luxury", "White"], featured: true, active: true, price_range: "₹800-1200/sqft",
  },
  {
    id: "2", name: "Cosmic Black", slug: "cosmic-black", category: "Granite",
    material: "Indian Granite", dimensions: "120x180 cm", finish: "Polished",
    description: "Deep black granite with subtle golden flecks reminiscent of a cosmic night sky. Ideal for corporate lobbies and statement walls.",
    image_url: "https://images.unsplash.com/photo-1690229160941-ed70482540de?w=800&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1769008302060-74c03f712dfb?w=800&q=80"],
    tags: ["Black", "Corporate", "Statement"], featured: true, active: true, price_range: "₹200-400/sqft",
  },
  {
    id: "3", name: "Roman Travertine", slug: "roman-travertine", category: "Natural Stone",
    material: "Italian Travertine", dimensions: "60x120 cm", finish: "Honed",
    description: "Classic Roman travertine with warm earth tones and distinctive natural pitting. Timeless elegance for modern sanctuaries.",
    image_url: "https://images.pexels.com/photos/34473055/pexels-photo-34473055.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery_images: [],
    tags: ["Natural", "Warm", "Classic"], featured: true, active: true, price_range: "₹400-600/sqft",
  },
  {
    id: "4", name: "Abstract Slate", slug: "abstract-slate", category: "Natural Stone",
    material: "Indian Slate", dimensions: "60x90 cm", finish: "Natural Cleft",
    description: "Artistic slate surfaces with unique natural patterns. Bold and distinctive for contemporary interiors.",
    image_url: "https://images.unsplash.com/photo-1736506159814-25bcd056da22?w=800&q=80",
    gallery_images: [],
    tags: ["Artistic", "Bold", "Contemporary"], featured: true, active: true, price_range: "₹150-300/sqft",
  },
  {
    id: "5", name: "Calacatta Gold", slug: "calacatta-gold", category: "Marble",
    material: "Italian Marble", dimensions: "120x260 cm", finish: "Book-matched",
    description: "The crown jewel of Italian marbles. Rich golden veining on brilliant white — for spaces that demand the extraordinary.",
    image_url: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80",
    gallery_images: [],
    tags: ["Italian", "Gold", "Premium"], featured: true, active: true, price_range: "₹1500-3000/sqft",
  },
  {
    id: "6", name: "Kashmir White", slug: "kashmir-white", category: "Granite",
    material: "Indian Granite", dimensions: "120x200 cm", finish: "Polished",
    description: "Elegant white granite from the valleys of Kashmir with soft grey and garnet speckling. Versatile and refined.",
    image_url: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80",
    gallery_images: [],
    tags: ["White", "Elegant", "Versatile"], featured: true, active: true, price_range: "₹120-250/sqft",
  },
  {
    id: "7", name: "Emperador Dark", slug: "emperador-dark", category: "Marble",
    material: "Spanish Marble", dimensions: "80x120 cm", finish: "Polished",
    description: "Rich dark brown Spanish marble with lighter veining. Sophisticated warmth for luxury interiors.",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    gallery_images: [],
    tags: ["Spanish", "Dark", "Warm"], featured: false, active: true, price_range: "₹500-900/sqft",
  },
  {
    id: "8", name: "Premium Porcelain", slug: "premium-porcelain", category: "Vitrified Tiles",
    material: "Porcelain", dimensions: "120x120 cm", finish: "Matt",
    description: "Large-format porcelain tiles with marble-effect finish. The modern alternative with zero maintenance.",
    image_url: "https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?w=800&q=80",
    gallery_images: [],
    tags: ["Large Format", "Matt", "Low Maintenance"], featured: false, active: true, price_range: "₹80-200/sqft",
  },
  {
    id: "9", name: "Crystal Quartz White", slug: "crystal-quartz-white", category: "Quartz",
    material: "Engineered Quartz", dimensions: "150x300 cm", finish: "Polished",
    description: "Engineered quartz with crystalline sparkle. Non-porous, scratch-resistant, and eternally beautiful.",
    image_url: "https://images.unsplash.com/photo-1630756377422-7cfae60dd550?w=800&q=80",
    gallery_images: [],
    tags: ["Engineered", "Non-porous", "Durable"], featured: false, active: true, price_range: "₹300-600/sqft",
  },
];
