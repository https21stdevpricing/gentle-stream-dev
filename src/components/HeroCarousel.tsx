import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KEN_BURNS_CLASSES = [
  'ken-burns-zoom-in',
  'ken-burns-zoom-out',
  'ken-burns-pan-left',
  'ken-burns-pan-right',
];

const SLIDES = [
  {
    key: 'marble',
    label: 'Marble',
    tagline: 'Where Elegance Lives.',
    description: 'Italian, Spanish & Indian marble — timeless luxury for every surface.',
    image: 'https://images.unsplash.com/photo-1630756377422-7cfae60dd550?w=1920&q=85',
    cta: 'Explore Marble',
    link: '/products?category=Marble',
  },
  {
    key: 'granite',
    label: 'Granite',
    tagline: 'Built to Last Forever.',
    description: 'From Cosmic Black to Kashmir White — strength meets enduring beauty.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85',
    cta: 'Explore Granite',
    link: '/products?category=Granite',
  },
  {
    key: 'natural',
    label: 'Natural Stone',
    tagline: "Nature's Masterpiece.",
    description: 'Travertine, Sandstone, Slate — raw beauty, unfiltered.',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1920&q=85',
    cta: 'Explore Stone',
    link: '/products?category=Natural+Stone',
  },
  {
    key: 'tiles',
    label: 'Tiles & Surfaces',
    tagline: 'Precision Redefined.',
    description: 'Vitrified, ceramic, porcelain — infinite design possibilities.',
    image: 'https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?w=1920&q=85',
    cta: 'Explore Tiles',
    link: '/products?category=Vitrified+Tiles',
  },
  {
    key: 'quartz',
    label: 'Quartz',
    tagline: 'Engineered Perfection.',
    description: 'The future of surfaces — zero maintenance, infinite beauty.',
    image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1920&q=85',
    cta: 'Explore Quartz',
    link: '/products?category=Quartz',
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setAutoplay(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAutoplay(true), 12000);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => setActive(a => (a + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, [autoplay]);

  const slide = SLIDES[active];
  const kenBurns = KEN_BURNS_CLASSES[active % KEN_BURNS_CLASSES.length];

  return (
    <section className="relative w-full h-[100svh] overflow-hidden bg-black letterbox" data-testid="hero-carousel">
      {/* Background Image with Ken Burns */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 z-0"
        >
          <div
            className={`w-full h-full bg-cover bg-center ${kenBurns}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-black/45 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 z-[1]" />
      
      {/* Film grain overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-[3] flex flex-col justify-center px-6 md:px-12 lg:px-24">
        <div className="max-w-[980px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${active}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-white/50 text-xs tracking-[0.3em] uppercase font-medium mb-4"
              >
                {slide.label}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-white font-semibold leading-[1.05] mb-4"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '-0.03em' }}
              >
                {slide.tagline}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed font-light"
              >
                {slide.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                <Link
                  to={slide.link}
                  data-testid="hero-explore-btn"
                  className="btn-blue text-sm"
                >
                  {slide.cta} <ArrowRight size={14} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-white/80 text-sm font-medium hover:text-white transition-colors"
                >
                  Get a free quote &rsaquo;
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation pills */}
      <div className="absolute bottom-[12%] left-0 right-0 z-[4]" data-testid="material-tabs">
        <div className="max-w-[600px] mx-auto px-6">
          <div className="flex justify-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.key}
                onClick={() => goTo(i)}
                data-testid={`material-tab-${s.key}`}
                className={`relative px-4 py-2 rounded-full text-[11px] font-medium tracking-wide transition-all duration-500 ${
                  i === active
                    ? 'bg-white/20 backdrop-blur-md text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {i === active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/15 backdrop-blur-md rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
