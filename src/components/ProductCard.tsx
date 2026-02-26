import { useState } from 'react';
import { X, Phone, MessageCircle, ArrowRight, ArrowUpRight } from 'lucide-react';
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
    { label: 'Material', value: product.material },
    { label: 'Finish', value: product.finish },
    { label: 'Size', value: product.dimensions },
    { label: 'Price Range', value: product.price_range },
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
        className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row z-10"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          data-testid="product-detail-close"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
        >
          <X size={14} strokeWidth={2} />
        </button>

        {/* Image */}
        <div className="w-full md:w-1/2 bg-sw-offwhite shrink-0">
          <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
            {allImages.length > 0 && (
              <img
                src={allImages[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-4 left-4">
              <span className="text-[11px] font-medium bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {product.category}
              </span>
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-sw-black' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <h2 className="font-semibold text-2xl tracking-tight mb-2">{product.name}</h2>
          <p className="text-sw-gray text-sm leading-relaxed mb-6">{product.description}</p>

          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {specs.map(({ label, value }) => (
                <div key={label} className="bg-sw-offwhite rounded-xl p-3">
                  <p className="text-[10px] text-sw-gray uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>
          )}

          {product.applications && product.applications.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-sw-gray uppercase tracking-wider mb-2">Applications</p>
              <div className="flex flex-wrap gap-1.5">
                {product.applications.map(app => (
                  <span key={app} className="text-xs bg-sw-offwhite px-3 py-1.5 rounded-full font-medium">{app}</span>
                ))}
              </div>
            </div>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs text-sw-gray bg-sw-offwhite px-3 py-1.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          <div className="h-px bg-sw-offwhite mb-6" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/contact?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}`}
              className="btn-blue flex-1 justify-center text-sm"
              data-testid="product-quote-btn"
              onClick={onClose}
            >
              Get Quote <ArrowRight size={14} />
            </Link>
            <a
              href={`https://wa.me/919377521509?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} from Stone World`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 flex-1 px-5 py-3 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#20bd5a] transition-colors"
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

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onClick(product)}
      data-testid="product-card"
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl bg-sw-offwhite mb-3" style={{ aspectRatio: '3/4' }}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sw-offwhite to-sw-border/20">
            <p className="text-xs text-sw-gray/60 font-medium px-4 text-center">{product.name}</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="inline-flex items-center gap-1 bg-white text-sw-black text-xs font-medium px-4 py-2 rounded-full">
            Quick View <ArrowUpRight size={11} />
          </span>
        </div>
      </div>

      <div className="px-1">
        <p className="text-[11px] text-sw-gray uppercase tracking-wider mb-0.5">{product.category}</p>
        <h3 className="font-medium text-[15px] tracking-tight">{product.name}</h3>
        {product.price_range && (
          <p className="text-sm text-sw-gray mt-0.5">{product.price_range}</p>
        )}
      </div>
    </div>
  );
}
