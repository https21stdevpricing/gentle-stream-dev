import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const AUTOPLAY_MS = 6000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const goTo = useCallback((idx: number, dir?: number) => {
    setDirection(dir ?? (idx > active ? 1 : -1));
    setActive(idx);
    setProgress(0);
  }, [active]);

  const next = useCallback(() => {
    setDirection(1);
    setActive(a => (a + 1) % SLIDES.length);
    setProgress(0);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive(a => (a - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  // Autoplay
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const tick = 40;
    const steps = AUTOPLAY_MS / tick;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) {
        setDirection(1);
        setActive(a => (a + 1) % SLIDES.length);
        step = 0;
        setProgress(0);
      }
    }, tick);
    return () => clearInterval(interval);
  }, [active, paused]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      if (dx > 0) next();
      else prev();
    }
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const slide = SLIDES[active];

  const imageVariants = {
    enter: (d: number) => ({ opacity: 0, scale: 1.08, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const } },
    exit: (d: number) => ({ opacity: 0, scale: 0.98, x: d > 0 ? -40 : 40, transition: { duration: 0.5 } }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 30, filter: 'blur(4px)' },
    center: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, y: -16, filter: 'blur(2px)', transition: { duration: 0.3 } },
  };

  return (
    <section className="pt-[56px]" data-testid="hero-carousel">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 md:py-6">
        <div
          className="relative w-full overflow-hidden rounded-[28px] bg-muted/30"
          style={{ aspectRatio: '21/9' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="Featured products carousel"
          aria-roledescription="carousel"
        >
          {/* Background image with directional animation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={slide.key}
              src={slide.image}
              alt={slide.label}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </AnimatePresence>

          {/* Minimal gradient — just enough for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none" />

          {/* Navigation arrows — glassmorphism pills */}
          <button
            onClick={prev}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white hover:scale-105 transition-all duration-300 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} strokeWidth={1.8} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white hover:scale-105 transition-all duration-300 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>

          {/* Content — bottom-left with staggered text animation */}
          <div className="absolute bottom-0 left-0 right-0 z-[3] p-6 md:p-10 lg:p-12">
            <div className="flex items-end justify-between gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${active}`}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="max-w-xl"
                >
                  <span className="inline-block text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-2 md:mb-3">
                    {slide.label}
                  </span>
                  <h2
                    className="text-white font-bold leading-[1.02] mb-3"
                    style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', letterSpacing: '-0.035em' }}
                  >
                    {slide.tagline}
                  </h2>
                  <p className="text-white/50 text-sm md:text-[15px] mb-5 md:mb-6 leading-relaxed max-w-md">
                    {slide.description}
                  </p>
                  <Link
                    to={slide.link}
                    data-testid="hero-explore-btn"
                    className="group inline-flex items-center gap-2.5 text-[13px] font-semibold px-6 py-3 rounded-full bg-white/95 text-neutral-900 hover:bg-white transition-all duration-300 active:scale-[0.97] shadow-lg shadow-black/10"
                  >
                    {slide.cta}
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Progress indicators — bottom right */}
              <div className="hidden sm:flex items-end gap-3" data-testid="material-tabs">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => goTo(i)}
                    data-testid={`material-tab-${s.key}`}
                    className="group flex flex-col items-end gap-1.5"
                  >
                    <span className={`text-[10px] font-medium tracking-wider transition-all duration-300 ${
                      i === active ? 'text-white opacity-100' : 'text-white/25 group-hover:text-white/50'
                    }`}>
                      {s.label}
                    </span>
                    <div className="w-14 h-[2px] rounded-full overflow-hidden bg-white/10">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: i === active ? `${progress}%` : '0%' }}
                        transition={i === active ? { duration: 0.04, ease: 'linear' } : { duration: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile dots */}
            <div className="flex sm:hidden justify-center gap-2 mt-4">
              {SLIDES.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                  }`}
                  aria-label={`Go to ${s.label}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
