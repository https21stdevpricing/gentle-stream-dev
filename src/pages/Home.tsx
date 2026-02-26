import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award, Star, ChevronRight, Play, Quote } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import Footer from '@/components/Footer';
import { ProductCard, ProductDetailPanel } from '@/components/ProductCard';
import { getProducts, getSiteInfo } from '@/utils/api';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  { label: 'Marble', desc: 'Italian & Indian luxury marble', image: 'https://images.unsplash.com/photo-1719107647328-dd2134da4fa7?w=800&q=80', link: '/products?category=Marble' },
  { label: 'Granite', desc: 'Strength meets natural beauty', image: 'https://images.unsplash.com/photo-1690229160941-ed70482540de?w=800&q=80', link: '/products?category=Granite' },
  { label: 'Tiles', desc: 'Infinite design possibilities', image: 'https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?w=800&q=80', link: '/products?category=Vitrified+Tiles' },
  { label: 'Quartz', desc: 'Engineered perfection', image: 'https://images.unsplash.com/photo-1630756377422-7cfae60dd550?w=800&q=80', link: '/products?category=Quartz' },
];

const PROMISES = [
  { icon: Shield, title: 'Quality Guaranteed', desc: 'Every slab hand-inspected before delivery' },
  { icon: Truck, title: 'Pan-India Delivery', desc: 'Safe, insured transport to your doorstep' },
  { icon: Award, title: 'Expert Guidance', desc: '20+ years of surface material expertise' },
  { icon: Star, title: 'Best Pricing', desc: 'Direct sourcing means unbeatable rates' },
];

const CLIENTS = ['IIM Ahmedabad', 'Motera Stadium', 'Zydus', 'Adani Group', 'Volkswagen', 'Taco Bell', 'HDFC Bank', 'Sun Pharma'];

const SHOWCASE_SLIDES = [
  {
    title: 'Italian Statuario',
    subtitle: 'The Pinnacle of Marble',
    desc: 'Sourced directly from Carrara, Italy. Every vein tells a story of millions of years. Our premium Statuario collection brings museum-grade elegance to your space.',
    image: 'https://images.unsplash.com/photo-1719107647328-dd2134da4fa7?w=1200&q=85',
    specs: ['Thickness: 18–20mm', 'Finish: Polished / Honed', 'Origin: Carrara, Italy'],
  },
  {
    title: 'Cosmic Black Granite',
    subtitle: 'Eternal Strength',
    desc: 'Deep galaxies frozen in stone. Cosmic Black transforms any surface into a statement piece that withstands the test of time.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
    specs: ['Thickness: 20–30mm', 'Finish: Polished / Leathered', 'Origin: South India'],
  },
  {
    title: 'Travertine Collection',
    subtitle: 'Warmth of the Earth',
    desc: 'Natural travertine with its organic texture brings Mediterranean warmth to any architectural vision, from floors to feature walls.',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&q=85',
    specs: ['Thickness: 15–20mm', 'Finish: Tumbled / Filled', 'Origin: Turkey / Iran'],
  },
];

const TESTIMONIALS = [
  { name: 'Rajesh Patel', role: 'Interior Designer, Ahmedabad', text: 'Stone World consistently delivers the finest marble we\'ve used in our luxury projects. Their eye for quality is unmatched.', rating: 5 },
  { name: 'Sneha Joshi', role: 'Architect, Gandhinagar', text: 'From selection to delivery, the entire experience is seamless. The team\'s expertise saved us both time and cost.', rating: 5 },
  { name: 'Vivek Shah', role: 'Builder, Surat', text: 'We\'ve sourced over ₹2 Cr worth of materials from Stone World. Consistent quality, competitive pricing, reliable delivery.', rating: 5 },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [siteInfo, setSiteInfo] = useState<Partial<SiteInfo>>({});
  const [showcaseIdx, setShowcaseIdx] = useState(0);

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

  // Parallax ref
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  return (
    <div className="bg-background overflow-x-hidden" data-testid="home-page">
      <Navbar />
      <HeroCarousel />

      {/* ── Trusted by — clean ticker ── */}
      <section className="py-5 border-b border-border/10 overflow-hidden bg-background">
        <div className="flex items-center gap-16 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((c, i) => (
            <span key={`${c}-${i}`} className="text-muted-foreground/25 text-[11px] font-medium tracking-[0.25em] uppercase shrink-0">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ── Product Showcase — Apple-style full-width feature slides ── */}
      <section className="bg-[#f5f5f7]" data-testid="showcase-section">
        <div className="container-wide mx-auto px-6 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="apple-headline mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Signature Collection.
            </h2>
            <p className="apple-subhead text-base md:text-lg max-w-md mx-auto">
              Materials that define spaces.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-background rounded-3xl overflow-hidden shadow-lg">
            {/* Image side */}
            <div className="relative aspect-square lg:aspect-auto overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={showcaseIdx}
                  src={SHOWCASE_SLIDES[showcaseIdx].image}
                  alt={SHOWCASE_SLIDES[showcaseIdx].title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            {/* Content side */}
            <div className="flex flex-col justify-center p-8 md:p-14">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showcaseIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium mb-3">
                    {SHOWCASE_SLIDES[showcaseIdx].subtitle}
                  </p>
                  <h3 className="font-semibold text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
                    {SHOWCASE_SLIDES[showcaseIdx].title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8">
                    {SHOWCASE_SLIDES[showcaseIdx].desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {SHOWCASE_SLIDES[showcaseIdx].specs.map(s => (
                      <span key={s} className="text-[11px] bg-[#f5f5f7] text-muted-foreground px-3 py-1.5 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
                    View Collection <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Slide nav dots */}
              <div className="flex gap-2 mt-10">
                {SHOWCASE_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setShowcaseIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === showcaseIdx ? 'bg-foreground w-8' : 'bg-foreground/15 w-1.5 hover:bg-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats — large, centered ── */}
      <section className="py-28 md:py-36 px-6 bg-background" data-testid="stats-section">
        <div className="container-sw">
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

      {/* ── Categories — immersive full-width cards ── */}
      <section className="py-20 md:py-28 px-6 bg-background" data-testid="categories-section">
        <div className="container-wide mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="apple-headline mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Explore by Category.
            </h2>
            <p className="apple-subhead text-base md:text-lg">From quarry to your doorstep.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORY_CARDS.map((cat, i) => (
              <motion.div key={cat.label} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7 }}>
                <Link to={cat.link}
                  className="group relative block rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img src={cat.image} alt={cat.label} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-xl tracking-tight">{cat.label}</h3>
                      <p className="text-white/50 text-sm mt-0.5">{cat.desc}</p>
                    </div>
                    <span className="text-white/40 group-hover:text-white/80 transition-colors">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28 px-6 bg-[#f5f5f7]" data-testid="featured-section">
          <div className="container-wide mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="flex items-end justify-between mb-12">
              <div>
                <h2 className="apple-headline mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                  Featured.
                </h2>
                <p className="apple-subhead text-base">Our most sought-after materials.</p>
              </div>
              <Link to="/products" className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
                View All <ChevronRight size={14} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                  <ProductCard product={p} onClick={setSelectedProduct} />
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center md:hidden">
              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                View All Products <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Why Stone World ── */}
      <section className="py-20 md:py-28 px-6 bg-background">
        <div className="container-wide mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="apple-headline mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              The Promise.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROMISES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
                className="bg-[#f5f5f7] rounded-2xl p-6 text-center group hover:bg-foreground hover:text-background transition-all duration-500">
                <div className="w-12 h-12 rounded-full bg-background/80 group-hover:bg-white/10 flex items-center justify-center mx-auto mb-4 transition-colors duration-500">
                  <Icon size={22} strokeWidth={1.5} className="text-foreground group-hover:text-background transition-colors duration-500" />
                </div>
                <h3 className="font-semibold text-sm tracking-tight mb-2">{title}</h3>
                <p className="text-muted-foreground group-hover:text-background/60 text-[13px] leading-relaxed transition-colors duration-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 md:py-28 px-6 bg-[#f5f5f7]" data-testid="testimonials">
        <div className="container-wide mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="apple-headline mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              What they say.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-background rounded-2xl p-6 md:p-8">
                <Quote size={20} className="text-muted-foreground/20 mb-4" />
                <p className="text-foreground text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-[12px]">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parallax brand statement ── */}
      <section ref={parallaxRef} className="relative overflow-hidden bg-[#1d1d1f] text-center py-32 md:py-44 px-6" data-testid="about-section">
        <motion.div style={{ y: parallaxY }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1630756377422-7cfae60dd550?w=1920&q=60"
            alt=""
            className="w-full h-[120%] object-cover opacity-20"
          />
        </motion.div>
        <div className="container-sw relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="font-semibold text-white leading-[1.05] mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em' }}>
              Two decades of<br />surface excellence.
            </h2>
            <p className="text-white/40 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-10">
              {siteInfo.about_short || "Founded in 2003, Stone World has grown to be Gujarat's most trusted name in premium surfaces."}
            </p>
            <Link to="/about" data-testid="about-cta-btn"
              className="inline-flex items-center gap-2 text-[#2997ff] text-sm font-medium hover:underline underline-offset-4 transition-all">
              Learn more about us <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
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
