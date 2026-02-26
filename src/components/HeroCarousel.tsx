import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
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
    tagline: 'Where Elegance\nLives.',
    description: 'Italian, Spanish & Indian marble — timeless luxury for every surface.',
    image: 'https://images.unsplash.com/photo-1630756377422-7cfae60dd550?w=1920&q=85',
    cta: 'Explore Marble',
    link: '/products?category=Marble',
  },
  {
    key: 'granite',
    label: 'Granite',
    tagline: 'Built to Last\nForever.',
    description: 'From Cosmic Black to Kashmir White — strength meets enduring beauty.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85',
    cta: 'Explore Granite',
    link: '/products?category=Granite',
  },
  {
    key: 'natural',
    label: 'Natural Stone',
    tagline: "Nature's\nMasterpiece.",
    description: 'Travertine, Sandstone, Slate — raw beauty, unfiltered.',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1920&q=85',
    cta: 'Explore Stone',
    link: '/products?category=Natural+Stone',
  },
  {
    key: 'tiles',
    label: 'Tiles',
    tagline: 'Precision\nRedefined.',
    description: 'Vitrified, ceramic, porcelain — infinite design possibilities.',
    image: 'https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?w=1920&q=85',
    cta: 'Explore Tiles',
    link: '/products?category=Vitrified+Tiles',
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

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-[100svh] overflow-hidden bg-black" data-testid="hero-carousel">
      {/* Background */}
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

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-[1]" />

      {/* Content — centered, Apple-style */}
      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${active}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-white/40 text-[11px] tracking-[0.35em] uppercase font-medium mb-6"
            >
              {slide.label}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-white font-semibold leading-[1.02] mb-5 whitespace-pre-line"
              style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', letterSpacing: '-0.04em' }}
            >
              {slide.tagline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-white/50 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light"
            >
              {slide.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link
                to={slide.link}
                data-testid="hero-explore-btn"
                className="btn-gold text-sm"
              >
                {slide.cta} <ArrowRight size={14} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-white/60 text-sm font-medium hover:text-white transition-colors duration-300"
              >
                Get a free quote →
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — minimal pill style */}
      <div className="absolute bottom-[10%] left-0 right-0 z-[4]" data-testid="material-tabs">
        <div className="flex justify-center gap-1.5 md:gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goTo(i)}
              data-testid={`material-tab-${s.key}`}
              className="relative px-4 py-2 text-[11px] font-medium tracking-wide transition-all duration-400"
            >
              {i === active && (
                <motion.div
                  layoutId="heroTab"
                  className="absolute inset-0 bg-white/15 backdrop-blur-md rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-300 ${
                i === active ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-[3%] left-1/2 -translate-x-1/2 z-[4] text-white/25 hover:text-white/50 transition-colors"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} strokeWidth={1.5} />
        </motion.div>
      </motion.button>
    </section>
  );
}
