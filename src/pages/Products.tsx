import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductCard, ProductDetailPanel } from '@/components/ProductCard';
import { getProducts, getCategories } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Category } from '@/utils/mockData';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl bg-sw-offwhite mb-3" style={{ aspectRatio: '3/4' }} />
      <div className="h-2 bg-sw-offwhite rounded-full w-1/4 mb-2" />
      <div className="h-3.5 bg-sw-offwhite rounded-full w-3/4 mb-1" />
      <div className="h-2.5 bg-sw-offwhite rounded-full w-1/2" />
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(() => {});
    document.title = 'Products — Stone World | Premium Surface Materials';
  }, []);

  const loadProducts = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory;
    if (search.trim()) params.search = search.trim();
    getProducts(params)
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  useEffect(() => {
    const t = setTimeout(loadProducts, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadProducts, search]);

  const setCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchParams(cat ? { category: cat } : {});
  };

  return (
    <div className="bg-white min-h-screen" data-testid="products-page">
      <Navbar />

      {/* Header */}
      <div className="pt-[44px]">
        <div className="apple-section pb-8">
          <div className="container-sw">
            <h1 className="apple-headline mb-2" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
              Our Products.
            </h1>
            <p className="apple-subhead text-lg max-w-lg mx-auto">
              Explore our curated collection of premium surface materials.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="sticky top-[44px] z-30 bg-white/80 backdrop-blur-xl border-b border-sw-border/20">
          <div className="container-wide mx-auto px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sw-gray" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  data-testid="product-search"
                  className="w-full pl-9 pr-8 py-2 bg-sw-offwhite rounded-lg text-sm text-sw-black placeholder:text-sw-gray/60 focus:outline-none focus:ring-1 focus:ring-sw-border transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-sw-gray hover:text-sw-black">
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide" data-testid="category-filters">
                <button
                  onClick={() => setCategory('')}
                  data-testid="filter-all"
                  className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    !selectedCategory ? 'bg-sw-black text-white' : 'text-sw-gray hover:text-sw-black'
                  }`}
                >
                  All
                </button>
                {categories.filter(c => c.active).slice(0, 6).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(selectedCategory === c.name ? '' : c.name)}
                    data-testid={`filter-${c.slug}`}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      selectedCategory === c.name ? 'bg-sw-black text-white' : 'text-sw-gray hover:text-sw-black'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-sw-gray shrink-0 ml-auto hidden md:block">
                {loading ? '—' : `${products.length} items`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-10 md:py-16 px-6">
        <div className="container-wide mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-28"
              data-testid="no-products"
            >
              <p className="font-semibold text-2xl tracking-tight mb-2">No products found.</p>
              <p className="text-sw-gray text-sm mb-6">Try a different category or clear your search.</p>
              <button onClick={() => { setSearch(''); setCategory(''); }} className="btn-blue text-sm">
                Browse All
              </button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProductCard product={p} onClick={setSelectedProduct} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />

      <AnimatePresence>
        {selectedProduct && <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}
