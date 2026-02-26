import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

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
    label: 'Tiles',
    tagline: 'Precision Redefined.',
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
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Progress bar animation
  const progress = useMotionValue(0);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setAutoplay(false);
    progress.set(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAutoplay(true), 10000);
  }, [progress]);

  const next = useCallback(() => setActive(a => (a + 1) % SLIDES.length), []);
  const prev = useCallback(() => setActive(a => (a - 1 + SLIDES.length) % SLIDES.length), []);

  // Autoplay with progress
  useEffect(() => {
    if (!autoplay) return;
    progress.set(0);
    const ctrl = animate(progress, 100, { duration: 6, ease: 'linear' });
    const t = setTimeout(() => {
      setActive(a => (a + 1) % SLIDES.length);
    }, 6000);
    return () => { ctrl.stop(); clearTimeout(t); };
  }, [autoplay, active, progress]);

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo((active + 1) % SLIDES.length);
      else goTo((active - 1 + SLIDES.length) % SLIDES.length);
    }
  };

  const slide = SLIDES[active];

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section
      className="relative w-full h-[100svh] overflow-hidden bg-[#0a0a0a]"
      data-testid="hero-carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background images */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.key}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.image}
            alt={slide.label}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Minimal gradient overlay — less dark, more cinematic */}
      <div className="absolute inset-0 z-[1]" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.25) 100%)'
      }} />

      {/* Nav arrows — minimal, edge-aligned */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[5] w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      <button
        onClick={() => goTo((active + 1) % SLIDES.length)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[5] w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>

      {/* Content */}
      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-end pb-[18%] md:pb-[14%] px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${active}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-2xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-white font-semibold leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '-0.04em' }}
            >
              {slide.tagline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-white/50 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed font-light"
            >
              {slide.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Link
                to={slide.link}
                data-testid="hero-explore-btn"
                className="inline-flex items-center gap-2 text-sm font-medium px-7 py-3 rounded-full bg-white text-black transition-all duration-300 hover:bg-white/90 hover:shadow-lg active:scale-[0.97]"
              >
                {slide.cta} <ArrowRight size={14} />
              </Link>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 text-white/50 text-sm font-medium hover:text-white/80 transition-colors duration-300"
              >
                Get a quote →
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicators — minimal bottom bar */}
      <div className="absolute bottom-[6%] left-0 right-0 z-[4]" data-testid="material-tabs">
        <div className="flex justify-center gap-4 md:gap-6">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goTo(i)}
              data-testid={`material-tab-${s.key}`}
              className="group flex flex-col items-center gap-2"
            >
              <span className={`text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                i === active ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}>
                {s.label}
              </span>
              <div className="w-12 h-[2px] rounded-full overflow-hidden bg-white/10">
                {i === active ? (
                  <motion.div
                    className="h-full bg-white rounded-full"
                    style={{ width: useTransform(progress, [0, 100], ['0%', '100%']) }}
                  />
                ) : (
                  <div className="h-full w-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[4] text-white/20 hover:text-white/50 transition-colors"
      >
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
          <ChevronDown size={18} strokeWidth={1.5} />
        </motion.div>
      </motion.button>
    </section>
  );
}
