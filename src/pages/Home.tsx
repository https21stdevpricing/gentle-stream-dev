import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import Footer from '@/components/Footer';
import { ProductCard, ProductDetailPanel } from '@/components/ProductCard';
import { getProducts, getSiteInfo } from '@/utils/api';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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

const CATEGORY_CARDS = [
  { label: 'Marble', desc: 'Italian & Indian luxury marble', image: 'https://images.unsplash.com/photo-1719107647328-dd2134da4fa7?w=600&q=80' },
  { label: 'Granite', desc: 'Enduring strength & beauty', image: 'https://images.unsplash.com/photo-1690229160941-ed70482540de?w=600&q=80' },
  { label: 'Tiles', desc: 'Infinite possibilities', image: 'https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?w=600&q=80' },
  { label: 'Quartz', desc: 'Zero maintenance luxury', image: 'https://images.unsplash.com/photo-1630756377422-7cfae60dd550?w=600&q=80' },
];

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
    <div className="bg-white overflow-x-hidden" data-testid="home-page">
      <Navbar />
      <HeroCarousel />

      {/* Stats — Apple style centered */}
      <section className="apple-section bg-sw-offwhite" data-testid="stats-section">
        <div className="container-sw">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="font-semibold tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--sw-black)' }}>
                  <AnimatedNumber value={value} />
                </div>
                <p className="text-sw-gray text-xs mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured — Apple product grid */}
      {featured.length > 0 && (
        <section className="apple-section" data-testid="featured-section">
          <div className="container-wide px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="apple-headline mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Featured Products.
              </h2>
              <p className="apple-subhead text-lg md:text-xl max-w-2xl mx-auto">
                Our most sought-after surface materials, handpicked by our experts.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProductCard product={p} onClick={setSelectedProduct} />
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
              <Link to="/products" className="link-blue text-sm" data-testid="view-all-products-btn">
                View all products <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories — Apple card grid */}
      <section className="apple-section bg-sw-offwhite" data-testid="categories-section">
        <div className="container-wide px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="apple-headline mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Explore by Category.
            </h2>
            <p className="apple-subhead text-lg md:text-xl">From quarry to your door — every surface you need.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORY_CARDS.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(cat.label)}`}
                  className="group relative block rounded-2xl overflow-hidden"
                  style={{ aspectRatio: '16/9' }}
                >
                  <img src={cat.image} alt={cat.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-white font-semibold text-xl tracking-tight">{cat.label}</h3>
                    <p className="text-white/60 text-sm mt-1">{cat.desc}</p>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      Explore <ArrowUpRight size={11} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About strip — Apple dark section */}
      <section className="relative overflow-hidden bg-black text-center py-24 md:py-32 px-6" data-testid="about-section">
        <div className="container-sw relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-semibold text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}>
              Two decades of<br />
              <span className="text-sw-gray">surface excellence.</span>
            </h2>
            <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed mb-8">
              {siteInfo.about_short || "Founded in 2003, Stone World has grown to be Gujarat's most trusted name in premium surfaces and building materials."}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/about" className="link-blue text-sm" data-testid="about-cta-btn">
                Learn more about us <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="apple-section" data-testid="cta-section">
        <div className="container-sw">
          <h2 className="apple-headline mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Let's build something<br />beautiful together.
          </h2>
          <p className="apple-subhead text-lg mb-8 max-w-lg mx-auto">
            Share your vision — our experts will find the perfect surface.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-blue text-sm" data-testid="home-contact-btn">
              Request a Quote <ArrowRight size={14} />
            </Link>
            <a
              href="https://wa.me/919377521509"
              target="_blank"
              rel="noreferrer"
              data-testid="home-whatsapp-btn"
              className="btn-secondary text-sm"
            >
              WhatsApp Us
            </a>
          </div>
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
