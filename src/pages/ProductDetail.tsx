import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageCircle, Sparkles, ChevronLeft, ChevronRight, Ruler, Palette, Layers, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/utils/mockData';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts().then(r => {
      const found = r.data.find(p => p.slug === slug);
      setProduct(found || null);
      if (found) {
        document.title = `${found.name} — Stone World`;
        const rel = r.data.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4);
        setRelated(rel);
      }
    }).catch(() => {}).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="pt-[48px] flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="pt-[48px] flex flex-col items-center justify-center min-h-[60vh] px-6">
          <h1 className="text-2xl font-bold mb-3">Product not found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary text-sm">Browse Products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);
  const specs = [
    { label: 'Material', value: product.material, icon: Sparkles },
    { label: 'Finish', value: product.finish, icon: Palette },
    { label: 'Dimensions', value: product.dimensions, icon: Ruler },
    { label: 'Category', value: product.category, icon: Layers },
  ].filter(s => s.value);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <div className="pt-[48px]">
        {/* Breadcrumb */}
        <div className="container-wide mx-auto px-6 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Link to="/products" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft size={12} /> Products
            </Link>
            <span>/</span>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>

        {/* Hero — Apple-style large image + details side by side */}
        <section className="container-wide mx-auto px-6 py-8 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14">
            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl bg-[hsl(var(--muted))]" style={{ aspectRatio: '4/3' }}>
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
                      <Sparkles size={40} className="text-muted-foreground/20" />
                    </div>
                  )}
                </AnimatePresence>

                {allImages.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImg ? 'border-foreground' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium mb-2">{product.category}</p>
              <h1 className="font-bold tracking-tight mb-4 leading-[1.05]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em' }}>
                {product.name}
              </h1>

              {product.price_range && (
                <div className="inline-flex items-center self-start bg-[hsl(var(--muted))] text-foreground text-base font-semibold px-5 py-2.5 rounded-2xl mb-5">
                  {product.price_range}
                </div>
              )}

              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                {product.description}
              </p>

              {/* Specs grid */}
              {specs.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {specs.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-[hsl(var(--muted))] rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon size={14} className="text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                      </div>
                      <p className="font-semibold text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Applications */}
              {product.applications && product.applications.length > 0 && (
                <div className="mb-8">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">Ideal for</p>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map(app => (
                      <span key={app} className="text-xs bg-[hsl(var(--muted))] text-foreground px-3 py-1.5 rounded-full font-medium">{app}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-[11px] text-muted-foreground border border-border rounded-full px-3 py-1">{tag}</span>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/support?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}`}
                  className="flex-1 btn-primary text-sm justify-center py-3.5 rounded-xl"
                >
                  Get Quote <ArrowRight size={14} />
                </Link>
                <a
                  href={`https://wa.me/919377521509?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} from Stone World`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BD5A] transition-colors"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Full-width feature image — Apple style */}
        {allImages.length > 0 && (
          <section className="px-6 pb-16">
            <div className="container-wide mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl overflow-hidden"
                style={{ aspectRatio: '21/9' }}
              >
                <img src={allImages[0]} alt={product.name} className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </section>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section className="py-16 md:py-24 px-6 bg-[hsl(var(--muted))]">
            <div className="container-wide mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-10"
              >
                <h2 className="apple-headline mb-2" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
                  More in {product.category}.
                </h2>
                <p className="apple-subhead text-sm">You might also like these.</p>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {related.map((p, i) => (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                  >
                    <ProductCard product={p} onClick={() => {}} linkTo={`/products/${p.slug}`} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
