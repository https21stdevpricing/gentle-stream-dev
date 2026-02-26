import { useEffect, useState } from 'react';
import { X, Phone, ArrowUpRight, MessageCircle, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setActiveImg(i => (i - 1 + allImages.length) % allImages.length);
      if (e.key === 'ArrowRight') setActiveImg(i => (i + 1) % allImages.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [allImages.length, onClose]);

  const specs = [
    { label: 'Material', value: product.material },
    { label: 'Finish', value: product.finish },
    { label: 'Size', value: product.dimensions },
    { label: 'Price', value: product.price_range },
  ].filter(s => s.value);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
        data-testid="product-detail-overlay"
      >
        <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="relative w-full md:max-w-5xl bg-white rounded-t-3xl md:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col z-10 mx-0 md:mx-4"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            data-testid="product-detail-close"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <X size={15} strokeWidth={2} />
          </button>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            <div className="relative w-full md:w-[52%] bg-sw-offwhite shrink-0">
              <div className="aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden" style={{ minHeight: 'min(460px, 50vh)' }}>
                {allImages.length > 0 ? (
                  <>
                    <motion.img
                      key={activeImg}
                      src={allImages[activeImg]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        >
                          <ChevronRight size={14} />
                        </button>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                          {allImages.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImg(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-white scale-125' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-sw-border/30 flex items-center justify-center">
                      <ZoomIn size={24} className="text-sw-gray/40" />
                    </div>
                    <p className="text-sw-gray text-xs">No Image Available</p>
                  </div>
                )}

                <div className="absolute top-4 left-4">
                  <span className="text-xs font-medium text-sw-black bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                    {product.category}
                  </span>
                </div>
                {product.featured && (
                  <div className="absolute top-4 right-12">
                    <span className="text-xs font-medium text-white bg-sw-black px-2.5 py-1.5 rounded-full">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 p-3 bg-sw-offwhite overflow-x-auto scrollbar-hide">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-sw-black' : 'border-transparent hover:border-sw-border'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 md:p-8 flex flex-col gap-5">
                <div>
                  <h2 className="font-bold text-sw-black text-2xl md:text-3xl leading-tight tracking-tight mb-2">
                    {product.name}
                  </h2>
                  <p className="text-sw-gray text-sm leading-relaxed">
                    {product.description || 'Premium quality surface material from Stone World. Contact us for detailed specifications and pricing.'}
                  </p>
                </div>

                {specs.length > 0 && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {specs.map(({ label, value }) => (
                      <div key={label} className="bg-sw-offwhite rounded-xl p-3.5">
                        <p className="text-[10px] text-sw-gray uppercase tracking-[0.15em] mb-1 font-medium">{label}</p>
                        <p className="font-semibold text-sw-black text-sm leading-snug">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-xs text-sw-gray bg-sw-offwhite px-3 py-1.5 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="h-px bg-sw-border/40" />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/contact?product=${encodeURIComponent(product.name)}`}
                    className="btn-primary flex-1 justify-center text-sm"
                    data-testid="product-quote-btn"
                    onClick={onClose}
                  >
                    <Phone size={14} strokeWidth={1.5} /> Request Quote
                  </Link>
                  <a
                    href={`https://wa.me/919377521509?text=Hi%2C+I%E2%80%99m+interested+in+${encodeURIComponent(product.name)}+from+Stone+World`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 flex-1 px-5 py-3.5 rounded-full bg-[#22c55e] text-white text-sm font-medium hover:bg-[#16a34a] transition-colors"
                    data-testid="product-whatsapp-btn"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      onClick={() => onClick(product)}
      data-testid="product-card"
      className="group cursor-pointer"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative overflow-hidden rounded-xl bg-sw-offwhite mb-3" style={{ aspectRatio: '4/5' }}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sw-offwhite to-sw-border/20">
            <div className="w-10 h-10 rounded-full bg-sw-border/30 flex items-center justify-center">
              <ZoomIn size={16} className="text-sw-gray/50" />
            </div>
            <p className="text-xs text-sw-gray/60 font-medium text-center px-4 leading-tight">{product.name}</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-end justify-between p-4">
          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
            {product.category}
          </span>
          <span className="bg-white text-sw-black text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            View <ArrowUpRight size={11} />
          </span>
        </div>

        {product.featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-sw-black/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="px-0.5">
        <p className="text-[10px] text-sw-gray uppercase tracking-[0.18em] mb-1 font-medium">
          {product.category}
        </p>
        <h3 className="font-semibold text-sw-black text-[14px] leading-snug tracking-tight group-hover:text-sw-gray transition-colors duration-200">
          {product.name}
        </h3>
        {product.finish && (
          <p className="text-xs text-sw-gray mt-0.5 truncate">{product.finish}</p>
        )}
        {product.price_range && (
          <p className="text-xs text-sw-black/70 font-medium mt-1">{product.price_range}</p>
        )}
      </div>
    </motion.div>
  );
}
