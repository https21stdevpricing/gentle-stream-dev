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

const AUTOPLAY_MS = 5500;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setProgress(0);
  }, []);

  const next = useCallback(() => setActive(a => (a + 1) % SLIDES.length), []);
  const prev = useCallback(() => setActive(a => (a - 1 + SLIDES.length) % SLIDES.length), []);

  // Autoplay with progress
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const tick = 50;
    const steps = AUTOPLAY_MS / tick;
    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) {
        setActive(a => (a + 1) % SLIDES.length);
        step = 0;
        setProgress(0);
      }
    }, tick);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, paused]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goTo((active + 1) % SLIDES.length) : goTo((active - 1 + SLIDES.length) % SLIDES.length);
  };

  const slide = SLIDES[active];

  return (
    <section className="pt-[48px]" data-testid="hero-carousel">
      <div className="container-wide mx-auto px-4 md:px-6 py-4 md:py-6">
        <div
          className="relative w-full overflow-hidden rounded-3xl bg-foreground/5"
          style={{ aspectRatio: '16/7' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background images */}
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.key}
              src={slide.image}
              alt={slide.label}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </AnimatePresence>

          {/* Subtle gradient for text readability — no heavy dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Nav arrows — pill-shaped, glass morphism */}
          <button
            onClick={prev}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white transition-all duration-200 active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => goTo((active + 1) % SLIDES.length)}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white transition-all duration-200 active:scale-95"
            aria-label="Next"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>

          {/* Content — bottom-left aligned, clean */}
          <div className="absolute bottom-0 left-0 right-0 z-[3] p-5 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${active}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-lg"
              >
                <h2
                  className="text-white font-bold leading-[1.05] mb-2"
                  style={{ fontSize: 'clamp(1.75rem, 4vw, 3.25rem)', letterSpacing: '-0.03em' }}
                >
                  {slide.tagline}
                </h2>
                <p className="text-white/60 text-sm md:text-base mb-5 leading-relaxed max-w-sm">
                  {slide.description}
                </p>
                <Link
                  to={slide.link}
                  data-testid="hero-explore-btn"
                  className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full bg-white text-foreground hover:bg-white/90 transition-all duration-200 active:scale-[0.97]"
                >
                  {slide.cta} <ArrowRight size={14} />
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Tab indicators — bottom right */}
            <div className="absolute bottom-5 md:bottom-10 right-5 md:right-10 flex items-center gap-2" data-testid="material-tabs">
              {SLIDES.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => goTo(i)}
                  data-testid={`material-tab-${s.key}`}
                  className="group relative"
                >
                  <span className={`block text-[10px] font-medium tracking-wide mb-1.5 text-right transition-colors duration-200 ${
                    i === active ? 'text-white' : 'text-white/30 hover:text-white/60'
                  }`}>
                    {s.label}
                  </span>
                  <div className="w-12 h-[2px] rounded-full overflow-hidden bg-white/10">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{
                        width: i === active ? `${progress}%` : '0%',
                        transition: i === active ? 'width 50ms linear' : 'width 300ms ease',
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
