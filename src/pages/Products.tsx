import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductCard, ProductDetailPanel } from '@/components/ProductCard';
import { getProducts, getCategories } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Category } from '@/utils/mockData';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-xl bg-sw-offwhite mb-3" style={{ aspectRatio: '4/5' }} />
      <div className="h-2 bg-sw-offwhite rounded-full w-1/4 mb-2" />
      <div className="h-3.5 bg-sw-offwhite rounded-full w-3/4 mb-1.5" />
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
    document.title = 'Products — Stone World';
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

      {/* Hero Header */}
      <div className="bg-sw-black pt-28 pb-16 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
          <span
            className="font-bold text-white/[0.025] uppercase tracking-tighter leading-none"
            style={{ fontSize: 'clamp(7rem, 18vw, 22rem)' }}
          >
            STONE
          </span>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <p className="text-white/40 text-xs tracking-[0.25em] uppercase mb-4 font-medium">
                The Collection
              </p>
              <h1
                className="font-bold text-white leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
              >
                Products
              </h1>
              <p className="text-white/40 text-sm mt-4 max-w-sm leading-relaxed">
                Explore our curated collection of premium surface materials — marble, granite, tiles, and beyond.
              </p>
            </div>

            <div className="relative lg:w-80">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stones, tiles, marble..."
                data-testid="product-search"
                className="w-full pl-10 pr-10 py-3 border border-white/15 rounded-full text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all bg-white/[0.08]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b border-sw-border/20 sticky top-14 z-30 shadow-sm" data-testid="category-filters">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setCategory('')}
              data-testid="filter-all"
              className={`shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                !selectedCategory
                  ? 'bg-sw-black text-white shadow-sm'
                  : 'text-sw-gray hover:text-sw-black hover:bg-sw-offwhite'
              }`}
            >
              All Materials
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(selectedCategory === c.name ? '' : c.name)}
                data-testid={`filter-${c.slug}`}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  selectedCategory === c.name
                    ? 'bg-sw-black text-white shadow-sm'
                    : 'text-sw-gray hover:text-sw-black hover:bg-sw-offwhite'
                }`}
              >
                {c.name}
              </button>
            ))}
            <div className="ml-auto shrink-0 pl-4 border-l border-sw-border/30 flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-sw-gray" />
              <span className="text-xs text-sw-gray font-medium whitespace-nowrap">
                {loading ? '—' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-14 md:py-20 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <AnimatePresence>
            {(selectedCategory || search) && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 mb-8"
              >
                <span className="text-xs text-sw-gray">Filtering by</span>
                {selectedCategory && (
                  <button
                    onClick={() => setCategory('')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-sw-black bg-sw-offwhite px-3 py-1.5 rounded-full hover:bg-sw-border/30 transition-colors"
                  >
                    {selectedCategory} <X size={10} />
                  </button>
                )}
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-sw-black bg-sw-offwhite px-3 py-1.5 rounded-full hover:bg-sw-border/30 transition-colors"
                  >
                    "{search}" <X size={10} />
                  </button>
                )}
                <button onClick={() => { setSearch(''); setCategory(''); }} className="text-xs text-sw-gray hover:text-sw-black transition-colors ml-1">
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-28"
              data-testid="no-products"
            >
              <div className="w-16 h-16 rounded-2xl bg-sw-offwhite flex items-center justify-center mx-auto mb-5">
                <Search size={24} className="text-sw-gray/40" />
              </div>
              <p className="font-bold text-sw-black text-2xl tracking-tight mb-2">Nothing found</p>
              <p className="text-sw-gray text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                No products match your current filters. Try browsing a different category or clear your search.
              </p>
              <button
                onClick={() => { setSearch(''); setCategory(''); }}
                className="btn-primary text-sm"
              >
                Browse All Products
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      delay: Math.min(i * 0.035, 0.25),
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1]
                    }}
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
        {selectedProduct && (
          <ProductDetailPanel
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
