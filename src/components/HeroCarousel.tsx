import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MATERIALS = [
  {
    key: 'marble',
    label: 'Marble',
    tagline: 'Where Elegance Lives.',
    description: 'Italian, Spanish & Indian marble — timeless luxury for every space.',
    image: 'https://images.unsplash.com/photo-1630756377422-7cfae60dd550?w=1920&q=85',
  },
  {
    key: 'granite',
    label: 'Granite',
    tagline: 'Built to Last Forever.',
    description: 'Cosmic Black to Kashmir White — strength meets enduring beauty.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85',
  },
  {
    key: 'natural-stone',
    label: 'Natural Stone',
    tagline: "Earth's Own Canvas.",
    description: 'Travertine, Sandstone, Kota — raw natural beauty, unfiltered.',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1920&q=85',
  },
  {
    key: 'tiles',
    label: 'Tiles',
    tagline: 'Precision Redefined.',
    description: 'Vitrified, ceramic, porcelain — infinite design possibilities.',
    image: 'https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?w=1920&q=85',
  },
  {
    key: 'quartz',
    label: 'Quartz',
    tagline: 'Engineered Perfection.',
    description: 'The future of surfaces — zero maintenance luxury.',
    image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1920&q=85',
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (idx: number) => {
    setActive(idx);
    setAutoplay(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAutoplay(true), 10000);
  };

  const next = () => goTo((active + 1) % MATERIALS.length);
  const prev = () => goTo((active - 1 + MATERIALS.length) % MATERIALS.length);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      setActive(a => (a + 1) % MATERIALS.length);
    }, 6000);
    return () => clearInterval(t);
  }, [autoplay, active]);

  const mat = MATERIALS[active];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black" data-testid="hero-carousel">
      <AnimatePresence initial={false}>
        <motion.div
          key={mat.key}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center ken-burns"
            style={{ backgroundImage: `url(${mat.image})` }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-end pb-32 md:pb-40 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`cat-${active}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-block text-white/60 text-xs tracking-[0.3em] uppercase font-medium">
                {mat.label} Collection
              </span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${active}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-white font-bold leading-[0.95] mb-6"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.04em' }}
            >
              {mat.tagline}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${active}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-white/60 text-base md:text-lg max-w-lg mb-10 leading-relaxed font-light"
            >
              {mat.description}
            </motion.p>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to={`/products?category=${encodeURIComponent(mat.label)}`}
              data-testid="hero-explore-btn"
              className="group inline-flex items-center gap-2 bg-white text-sw-black font-medium px-8 py-3.5 rounded-full text-sm transition-all duration-300 hover:bg-sw-offwhite"
            >
              Explore {mat.label}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-white/80 border border-white/25 rounded-full px-8 py-3.5 text-sm font-medium hover:bg-white/10 transition-all duration-300"
            >
              Get Consultation
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" data-testid="material-tabs">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex border-t border-white/10">
            {MATERIALS.map((m, i) => (
              <button
                key={m.key}
                onClick={() => goTo(i)}
                data-testid={`material-tab-${m.key}`}
                className="flex-1 relative py-4 transition-all group"
              >
                <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-500 ${
                  i === active ? 'bg-white' : 'bg-transparent'
                }`} />
                <span className={`text-xs font-medium tracking-wide block text-center transition-colors duration-300 ${
                  i === active ? 'text-white' : 'text-white/30 group-hover:text-white/60'
                }`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        data-testid="hero-prev"
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 text-white/60 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <button
        onClick={next}
        data-testid="hero-next"
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 text-white/60 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      <div className="absolute top-1/2 -translate-y-1/2 right-6 hidden lg:flex flex-col items-center gap-2">
        {MATERIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            data-testid={`hero-dot-${i}`}
            className={`transition-all duration-500 rounded-full ${
              i === active ? 'w-[2px] h-8 bg-white' : 'w-[2px] h-3 bg-white/25 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
