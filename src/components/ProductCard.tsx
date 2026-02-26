import { useState, forwardRef } from 'react';
import { X, MessageCircle, ArrowRight, ArrowUpRight, Sparkles, Ruler, Palette } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      data-testid="product-detail-overlay"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />

      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
        className="relative w-full max-w-4xl bg-background rounded-3xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row z-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} data-testid="product-detail-close"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors">
          <X size={15} strokeWidth={2} />
        </button>

        {/* Image */}
        <div className="w-full md:w-1/2 bg-muted shrink-0">
          <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
            {allImages.length > 0 ? (
              <img src={allImages[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={28} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{product.name}</p>
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="text-[11px] font-semibold bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                {product.category}
              </span>
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-foreground shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mb-1">{product.category}</p>
          <h2 className="font-semibold text-2xl tracking-tight mb-3">{product.name}</h2>
          
          {product.price_range && (
            <div className="inline-flex items-center gap-1.5 bg-sw-offwhite text-sw-gold text-sm font-semibold px-4 py-2 rounded-xl mb-4 border border-border/30">
              {product.price_range}
            </div>
          )}
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {specs.map(({ label, value }) => (
                <div key={label} className="glass-card rounded-2xl p-3.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">{label}</p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>
          )}

          {product.applications && product.applications.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Applications</p>
              <div className="flex flex-wrap gap-1.5">
                {product.applications.map(app => (
                  <span key={app} className="text-xs bg-muted text-foreground px-3 py-1.5 rounded-full font-medium">{app}</span>
                ))}
              </div>
            </div>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="text-[11px] text-muted-foreground bg-muted border border-border/30 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          <div className="gold-line mb-6" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/contact?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}`}
              className="flex-1 btn-gold text-sm justify-center py-3.5 rounded-2xl"
              data-testid="product-quote-btn"
              onClick={onClose}
            >
              Get Quote <ArrowRight size={14} />
            </Link>
            <a
              href={`https://wa.me/919377521509?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} from Stone World`)}`}
              target="_blank" rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
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

  return (
    <div
      ref={ref}
      onClick={() => onClick(product)}
      data-testid="product-card"
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted mb-3" style={{ aspectRatio: '3/4' }}>
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
            <div className="w-14 h-14 rounded-2xl bg-border/50 flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground font-medium text-center leading-relaxed">{product.name}</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="inline-flex items-center gap-1.5 glass-card text-foreground text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg">
            Quick View <ArrowUpRight size={11} />
          </span>
        </div>

        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-semibold bg-background/80 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-lg">
            {product.category}
          </span>
        </div>
      </div>

      <div className="px-0.5">
        <h3 className="font-semibold text-[14px] tracking-tight mb-0.5 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">{product.material || product.category}</p>
          {product.price_range && (
            <p className="text-[12px] font-semibold text-sw-gold">{product.price_range}</p>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
