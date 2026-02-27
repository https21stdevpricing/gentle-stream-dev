import { useState, forwardRef } from 'react';
import { X, MessageCircle, ArrowRight, Sparkles, Ruler, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/utils/mockData';

/* ── Product Detail Panel (slide-up overlay) ── */
interface ProductDetailPanelProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetailPanel({ product, onClose }: ProductDetailPanelProps) {
  const [activeImg, setActiveImg] = useState(0);
  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);
  const navigate = useNavigate();

  const specs = [
    { label: 'Material', value: product.material },
    { label: 'Finish', value: product.finish },
    { label: 'Dimensions', value: product.dimensions },
    { label: 'Price Range', value: product.price_range },
  ].filter(s => s.value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full max-w-4xl bg-background md:rounded-3xl overflow-hidden max-h-[92vh] md:max-h-[82vh] flex flex-col md:flex-row z-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors">
          <X size={14} strokeWidth={2} />
        </button>

        {/* Image */}
        <div className="w-full md:w-[55%] bg-[hsl(var(--muted))] shrink-0 relative">
          <div className="aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              {allImages.length > 0 ? (
                <motion.img key={activeImg} src={allImages[activeImg]} alt={product.name}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }} className="w-full h-full object-cover" />
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
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-medium mb-1">{product.category}</p>
          <h2 className="font-bold text-2xl md:text-3xl tracking-tight mb-3">{product.name}</h2>

          {product.price_range && (
            <div className="inline-flex items-center bg-[hsl(var(--muted))] text-foreground text-sm font-semibold px-4 py-2 rounded-xl mb-5">
              {product.price_range}
            </div>
          )}

          <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {specs.map(({ label, value }) => (
                <div key={label} className="bg-[hsl(var(--muted))] rounded-xl p-3.5">
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
                  <span key={app} className="text-xs bg-[hsl(var(--muted))] text-foreground px-3 py-1.5 rounded-full font-medium">{app}</span>
                ))}
              </div>
            </div>
          )}

          <div className="h-px bg-border/30 mb-6" />

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onClose(); navigate(`/products/${product.slug}`); }}
              className="w-full btn-secondary text-sm justify-center py-3 rounded-xl"
            >
              View Full Details <ArrowRight size={14} />
            </button>
            <div className="flex gap-3">
              <Link
                to={`/support?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}`}
                className="flex-1 btn-primary text-sm justify-center py-3 rounded-xl"
                onClick={onClose}
              >
                Get Quote
              </Link>
              <a
                href={`https://wa.me/919377521509?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} from Stone World`)}`}
                target="_blank" rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BD5A] transition-colors"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Product Card ── */
interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  linkTo?: string;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product, onClick, linkTo }, ref) => {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (linkTo) {
      navigate(linkTo);
    } else {
      onClick(product);
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      data-testid="product-card"
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--muted))] mb-3" style={{ aspectRatio: '3/4' }}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <Sparkles size={20} className="text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium text-center">{product.name}</p>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-medium bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-lg">
            {product.category}
          </span>
        </div>

        {/* Hover overlay with quick view */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center pb-5">
          <span className="inline-flex items-center gap-1.5 bg-white text-foreground text-xs font-medium px-4 py-2 rounded-full shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            Quick View <ArrowRight size={11} />
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
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
