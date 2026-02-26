import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Gem, Mountain, Layers, Droplets } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import Footer from '@/components/Footer';
import { ProductCard, ProductDetailPanel } from '@/components/ProductCard';
import { getProducts, getSiteInfo } from '@/utils/api';
import { motion, useInView } from 'framer-motion';
import type { Product, SiteInfo } from '@/utils/mockData';

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

const MARQUEE_ITEMS = ['Marble', 'Granite', 'Natural Stone', 'Vitrified Tiles', 'Quartz', 'Sandstone', 'Travertine', 'Sanitaryware', 'Ceramic', 'Cement'];

const CATEGORIES_GRID = [
  { icon: Gem, label: 'Marble', desc: 'Italian & Indian luxury' },
  { icon: Mountain, label: 'Granite', desc: 'Enduring strength' },
  { icon: Layers, label: 'Tiles', desc: 'Infinite possibilities' },
  { icon: Droplets, label: 'Quartz', desc: 'Zero maintenance' },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Browse', desc: 'Explore 500+ premium surface materials in our curated catalog.' },
  { num: '02', title: 'Sample', desc: 'Get physical samples delivered to your doorstep, free of charge.' },
  { num: '03', title: 'Quote', desc: 'Receive a detailed, transparent quotation within 24 hours.' },
  { num: '04', title: 'Deliver', desc: 'Pan-India delivery with certified installation support.' },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [siteInfo, setSiteInfo] = useState<Partial<SiteInfo>>({});

  useEffect(() => {
    getProducts({ featured: true, limit: 6 }).then(r => setFeatured(r.data)).catch(() => {});
    getSiteInfo().then(r => setSiteInfo(r.data)).catch(() => {});
    document.title = 'Stone World — Premium Surface Solutions';
  }, []);

  const STATS = [
    { value: siteInfo.stat_years || '20+', label: 'Years' },
    { value: siteInfo.stat_inventory || '5Cr+', label: 'Inventory' },
    { value: (siteInfo.stat_warehouse || '30000').replace(/,/g, '') + '+', label: 'Sqft Warehouse' },
    { value: siteInfo.stat_team || '25+', label: 'Team Members' },
  ];

  return (
    <div className="bg-white overflow-x-hidden" data-testid="home-page">
      <Navbar />
      <HeroCarousel />

      {/* Marquee strip */}
      <div className="overflow-hidden py-5 border-b border-sw-border/30 bg-white" aria-hidden>
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 25s linear infinite' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 font-medium text-xs text-sw-black/15 uppercase tracking-[0.3em] shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="py-20 md:py-24" data-testid="stats-section">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center md:border-r last:border-r-0 border-sw-border/30"
              >
                <div className="font-bold text-sw-black tracking-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                  <AnimatedNumber value={value} />
                </div>
                <p className="text-sw-gray text-xs tracking-[0.1em] uppercase mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28 bg-sw-offwhite" data-testid="featured-section">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="text-sw-gray text-xs tracking-[0.2em] uppercase mb-3">Curated Selection</p>
                <h2 className="font-bold text-sw-black tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                  Featured Products
                </h2>
              </div>
              <Link
                to="/products"
                className="hidden md:flex items-center gap-2 group text-sm font-medium text-sw-black hover:text-sw-gray transition-colors"
                data-testid="view-all-products-btn"
              >
                View All <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
              {featured.slice(0, 6).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProductCard product={p} onClick={setSelectedProduct} />
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-10 md:hidden">
              <Link to="/products" className="btn-primary text-sm" data-testid="mob-view-all">
                View All Products <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 md:py-28" data-testid="categories-section">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <p className="text-sw-gray text-xs tracking-[0.2em] uppercase mb-3">What We Offer</p>
            <h2 className="font-bold text-sw-black tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              Surface Solutions
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES_GRID.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(cat.label)}`}
                  className="group block bg-sw-offwhite rounded-2xl p-8 md:p-10 transition-all duration-500 hover:bg-sw-black hover:text-white"
                >
                  <cat.icon size={28} strokeWidth={1.5} className="text-sw-black group-hover:text-white mb-6 transition-colors" />
                  <h3 className="font-semibold text-lg tracking-tight mb-1.5 transition-colors">{cat.label}</h3>
                  <p className="text-sm text-sw-gray group-hover:text-white/60 transition-colors">{cat.desc}</p>
                  <ArrowUpRight size={16} className="mt-5 opacity-0 group-hover:opacity-100 text-white/60 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About strip */}
      <section className="relative overflow-hidden bg-sw-black" data-testid="about-section">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img
            src="https://images.pexels.com/photos/6568675/pexels-photo-6568675.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Stone samples"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sw-black via-sw-black/70 to-transparent" />
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32 relative z-10">
          <div className="max-w-xl">
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-5">Our Story</p>
            <h2 className="font-bold text-white leading-tight mb-6 tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              Two decades of{' '}
              <span className="font-display italic font-normal">surface excellence.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              {siteInfo.about_short || "Founded in 2003, AB Stone World Pvt Ltd. has grown from a regional supplier to one of Gujarat's most trusted names in premium surface materials."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/about" className="inline-flex items-center gap-2 bg-white text-sw-black font-medium px-8 py-3.5 rounded-full text-sm hover:bg-sw-offwhite transition-colors" data-testid="about-cta-btn">
                Learn More <ArrowRight size={14} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-8 py-3.5 rounded-full text-sm font-medium hover:bg-white/10 transition-all">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28" data-testid="process-section">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <p className="text-sw-gray text-xs tracking-[0.2em] uppercase mb-3">How It Works</p>
            <h2 className="font-bold text-sw-black tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              From Quarry to Your Door
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="group"
              >
                <div className="text-5xl font-bold text-sw-black/5 mb-4 tracking-tighter">{step.num}</div>
                <div className="w-8 h-[1px] bg-sw-black mb-4 transition-all duration-500 group-hover:w-14" />
                <h3 className="font-semibold text-sw-black text-base mb-2">{step.title}</h3>
                <p className="text-sw-gray text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-sw-offwhite" data-testid="cta-section">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center">
          <h2 className="font-bold text-sw-black tracking-tight mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            Let's Build Something<br />Beautiful Together.
          </h2>
          <p className="text-sw-gray text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Share your vision — our experts will find the perfect surface solution for your project.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-primary px-10 py-4 text-sm" data-testid="home-contact-btn">
              Request a Quote <ArrowRight size={14} />
            </Link>
            <a
              href="https://wa.me/919377521509"
              target="_blank"
              rel="noreferrer"
              data-testid="home-whatsapp-btn"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-medium px-10 py-4 rounded-full text-sm hover:bg-[#20bd5a] transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer siteInfo={siteInfo} />

      {selectedProduct && (
        <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
