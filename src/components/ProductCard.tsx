import { useState, forwardRef, useRef, useEffect } from 'react';
import { X, MessageCircle, ArrowRight, ArrowUpRight, Sparkles, Ruler, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/utils/mockData';

interface ProductDetailPanelProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetailPanel({ product, onClose }: ProductDetailPanelProps) {
  const [activeImg, setActiveImg] = useState(0);
  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);

  const specs = [
    { label: 'Material', value: product.material, icon: Sparkles },
    { label: 'Finish', value: product.finish, icon: Palette },
    { label: 'Dimensions', value: product.dimensions, icon: Ruler },
    { label: 'Price Range', value: product.price_range, icon: null },
  ].filter(s => s.value);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      data-testid="product-detail-overlay"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-5xl bg-background md:rounded-2xl overflow-hidden max-h-[95vh] md:max-h-[85vh] flex flex-col md:flex-row z-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} data-testid="product-detail-close"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors">
          <X size={14} strokeWidth={2} />
        </button>

        {/* Image — full height */}
        <div className="w-full md:w-[55%] bg-[#f5f5f7] shrink-0 relative">
          <div className="aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              {allImages.length > 0 ? (
                <motion.img
                  key={activeImg}
                  src={allImages[activeImg]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles size={32} className="text-muted-foreground/30" />
                </div>
              )}
            </AnimatePresence>
            {allImages.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                  <ChevronRight size={14} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-white w-4' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-medium mb-1">{product.category}</p>
          <h2 className="font-semibold text-2xl md:text-3xl tracking-tight mb-3">{product.name}</h2>

          {product.price_range && (
            <div className="inline-flex items-center gap-1.5 bg-[#f5f5f7] text-foreground text-sm font-semibold px-4 py-2 rounded-xl mb-5">
              {product.price_range}
            </div>
          )}

          <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {specs.map(({ label, value }) => (
                <div key={label} className="bg-[#f5f5f7] rounded-xl p-3.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-medium">{label}</p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>
          )}

          {product.applications && product.applications.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">Applications</p>
              <div className="flex flex-wrap gap-1.5">
                {product.applications.map(app => (
                  <span key={app} className="text-xs bg-[#f5f5f7] text-foreground px-3 py-1.5 rounded-full font-medium">{app}</span>
                ))}
              </div>
            </div>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="text-[11px] text-muted-foreground bg-[#f5f5f7] px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          <div className="h-px bg-border/30 mb-6" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/support?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}`}
              className="flex-1 btn-primary text-sm justify-center py-3.5 rounded-xl"
              data-testid="product-quote-btn"
              onClick={onClose}
            >
              Get Quote <ArrowRight size={14} />
            </Link>
            <a
              href={`https://wa.me/919377521509?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} from Stone World`)}`}
              target="_blank" rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BD5A] transition-colors"
              data-testid="product-whatsapp-btn"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product, onClick }, ref) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      onClick={() => onClick(product)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-testid="product-card"
      className="group cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#f5f5f7] mb-3" style={{ aspectRatio: '3/4' }}>
        {product.image_url && !imgError ? (
          <motion.img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <Sparkles size={20} className="text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium text-center">{product.name}</p>
          </div>
        )}

        {/* Quick view overlay */}
        <motion.div
          className="absolute inset-0 bg-black/30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.span
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: hovered ? 0 : 8, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="inline-flex items-center gap-1.5 bg-white text-foreground text-xs font-medium px-4 py-2.5 rounded-full shadow-lg"
          >
            Quick View <ArrowUpRight size={11} />
          </motion.span>
        </motion.div>

        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-medium bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-lg">
            {product.category}
          </span>
        </div>
      </div>

      <div className="px-0.5">
        <h3 className="font-semibold text-[14px] tracking-tight mb-0.5 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">{product.material || product.category}</p>
          {product.price_range && (
            <p className="text-[12px] font-semibold text-foreground">{product.price_range}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
