import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award, Star, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import Footer from '@/components/Footer';
import { ProductCard, ProductDetailPanel } from '@/components/ProductCard';
import { getProducts, getSiteInfo } from '@/utils/api';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import type { Product, SiteInfo } from '@/utils/mockData';

/* ── Animated counter ── */
function AnimatedNumber({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const numericValue = parseFloat(value?.replace(/[^0-9.]/g, '') || '0');

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = numericValue / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= numericValue) { setDisplay(numericValue); clearInterval(timer); }
      else { setDisplay(Math.floor(start)); }
    }, 30);
    return () => clearInterval(timer);
  }, [inView, numericValue]);

  return <span ref={ref}>{display}{value?.replace(/[0-9.]/g, '') || suffix}</span>;
}

const CATEGORY_CARDS = [
  { label: 'Marble', desc: 'Italian & Indian luxury marble for timeless surfaces', image: 'https://images.unsplash.com/photo-1719107647328-dd2134da4fa7?w=600&q=80' },
  { label: 'Granite', desc: 'Strength meets enduring natural beauty', image: 'https://images.unsplash.com/photo-1690229160941-ed70482540de?w=600&q=80' },
  { label: 'Tiles', desc: 'Vitrified, ceramic & porcelain — infinite possibilities', image: 'https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?w=600&q=80' },
  { label: 'Quartz', desc: 'Engineered perfection, zero maintenance luxury', image: 'https://images.unsplash.com/photo-1630756377422-7cfae60dd550?w=600&q=80' },
];

const PROMISES = [
  { icon: Shield, title: 'Quality Guaranteed', desc: 'Every slab hand-inspected before delivery' },
  { icon: Truck, title: 'Pan-India Delivery', desc: 'Safe, insured transport to your doorstep' },
  { icon: Award, title: 'Expert Guidance', desc: '20+ years of surface material expertise' },
  { icon: Star, title: 'Competitive Pricing', desc: 'Direct sourcing means better prices for you' },
];

const CLIENTS = ['IIM Ahmedabad', 'Motera Stadium', 'Zydus', 'Adani Group', 'Volkswagen', 'Taco Bell', 'HDFC Bank', 'Sun Pharma'];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [siteInfo, setSiteInfo] = useState<Partial<SiteInfo>>({});

  useEffect(() => {
    getProducts({ featured: true, limit: 4 }).then(r => setFeatured(r.data)).catch(() => {});
    getSiteInfo().then(r => setSiteInfo(r.data)).catch(() => {});
    document.title = 'Stone World — Premium Surface Solutions | Marble, Granite & Tiles';
  }, []);

  const STATS = [
    { value: siteInfo.stat_years || '20+', label: 'Years of Trust' },
    { value: siteInfo.stat_inventory || '5Cr+', label: 'Inventory Value' },
    { value: (siteInfo.stat_warehouse || '30000').replace(/,/g, ''), label: 'Sqft Warehouse' },
    { value: siteInfo.stat_team || '25+', label: 'Team Members' },
  ];

  return (
    <div className="bg-background overflow-x-hidden" data-testid="home-page">
      <Navbar />
      <HeroCarousel />

      {/* ── Trusted by — clean ticker ── */}
      <section className="py-5 border-b border-border/20 overflow-hidden bg-background">
        <div className="flex items-center gap-16 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((c, i) => (
            <span key={`${c}-${i}`} className="text-muted-foreground/30 text-[11px] font-medium tracking-[0.2em] uppercase shrink-0">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats — large, centered, Apple-style ── */}
      <section className="py-28 md:py-40 px-6 bg-background" data-testid="stats-section">
        <div className="container-sw">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="apple-headline" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Numbers that speak.
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map(({ value, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-center">
                <div className="font-semibold tracking-tight text-foreground" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}>
                  <AnimatedNumber value={value} />
                </div>
                <p className="text-muted-foreground text-xs mt-2 tracking-wider uppercase">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products — Apple grid ── */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28 px-6 bg-[#f5f5f7]" data-testid="featured-section">
          <div className="container-wide">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="text-center mb-14">
              <h2 className="apple-headline mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Featured Collection.
              </h2>
              <p className="apple-subhead text-base md:text-lg max-w-md mx-auto">
                Our most sought-after surface materials, curated for excellence.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                  <ProductCard product={p} onClick={setSelectedProduct} />
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/products" data-testid="view-all-products-btn"
                className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline underline-offset-4 transition-all">
                View All Products <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Categories — Immersive cards ── */}
      <section className="py-20 md:py-28 px-6 bg-background" data-testid="categories-section">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="apple-headline mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Explore by Category.
            </h2>
            <p className="apple-subhead text-base md:text-lg">From quarry to your doorstep — sourced worldwide.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORY_CARDS.map((cat, i) => (
              <motion.div key={cat.label} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7 }}>
                <Link to={`/products?category=${encodeURIComponent(cat.label)}`}
                  className="group relative block rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img src={cat.image} alt={cat.label} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-white font-semibold text-xl tracking-tight">{cat.label}</h3>
                    <p className="text-white/50 text-sm mt-1">{cat.desc}</p>
                  </div>
                  <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <span className="inline-flex items-center gap-1 glass-dark text-white text-[11px] font-medium px-4 py-2 rounded-full">
                      Explore <ChevronRight size={10} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Stone World — clean white cards ── */}
      <section className="py-20 md:py-28 px-6 bg-[#f5f5f7]">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="apple-headline mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              The Stone World Promise.
            </h2>
            <p className="apple-subhead text-base md:text-lg max-w-lg mx-auto">
              Two decades of delivering Gujarat's finest surface materials.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROMISES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
                className="bg-background rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-500">
                <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-sm tracking-tight mb-2">{title}</h3>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Statement — Apple dark section ── */}
      <section className="relative overflow-hidden bg-[#1d1d1f] text-center py-28 md:py-40 px-6" data-testid="about-section">
        <div className="container-sw relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="font-semibold text-white leading-[1.05] mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em' }}>
              Two decades of<br />surface excellence.
            </h2>
            <p className="text-white/40 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-10">
              {siteInfo.about_short || "Founded in 2003, Stone World has grown to be Gujarat's most trusted name in premium surfaces and building materials."}
            </p>
            <Link to="/about" data-testid="about-cta-btn"
              className="inline-flex items-center gap-2 text-[#2997ff] text-sm font-medium hover:underline underline-offset-4 transition-all">
              Learn more about us <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA — clean white ── */}
      <section className="py-24 md:py-36 px-6 bg-background" data-testid="cta-section">
        <div className="container-sw text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="apple-headline mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
              Let's build something<br />beautiful together.
            </h2>
            <p className="apple-subhead text-base md:text-lg mb-10 max-w-lg mx-auto">
              Share your vision — our experts will find the perfect surface.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/support" data-testid="home-contact-btn" className="btn-primary">
                Request a Quote <ArrowRight size={14} />
              </Link>
              <a href="https://wa.me/919377521509" target="_blank" rel="noreferrer" data-testid="home-whatsapp-btn"
                className="btn-secondary">
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer siteInfo={siteInfo} />

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
