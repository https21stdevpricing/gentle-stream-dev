import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductCard, ProductDetailPanel } from '@/components/ProductCard';
import { getProducts, getCategories } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Category } from '@/utils/mockData';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl bg-stone-100 mb-3" style={{ aspectRatio: '3/4' }} />
      <div className="h-2.5 bg-stone-100 rounded-full w-1/4 mb-2" />
      <div className="h-3.5 bg-stone-100 rounded-full w-3/4 mb-1" />
      <div className="h-2.5 bg-stone-100 rounded-full w-1/2" />
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
  const [gridCols, setGridCols] = useState<3 | 4>(4);

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

      {/* Hero */}
      <div className="pt-[44px]">
        <section className="relative overflow-hidden bg-stone-950 text-center py-20 md:py-28 px-6">
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(191,155,94,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(191,155,94,0.2) 0%, transparent 50%)'
          }} />
          <div className="container-sw relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-amber-400/80 text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Premium Collection</p>
              <h1 className="font-semibold text-white leading-tight mb-3" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.03em' }}>
                Our Products.
              </h1>
              <p className="text-stone-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                Explore our curated collection of premium surface materials — from Italian marble to Indian granite.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters Bar */}
        <div className="sticky top-[44px] z-30 bg-white/90 backdrop-blur-xl border-b border-stone-100">
          <div className="container-wide mx-auto px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..." data-testid="product-search"
                  className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200/50 focus:border-amber-300 transition-all" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1" data-testid="category-filters">
                <button onClick={() => setCategory('')} data-testid="filter-all"
                  className={`shrink-0 px-4 py-2 rounded-xl text-[12px] font-medium transition-all ${
                    !selectedCategory ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  }`}>
                  All
                </button>
                {categories.filter(c => c.active).slice(0, 8).map(c => (
                  <button key={c.id} onClick={() => setCategory(selectedCategory === c.name ? '' : c.name)}
                    data-testid={`filter-${c.slug}`}
                    className={`shrink-0 px-4 py-2 rounded-xl text-[12px] font-medium transition-all ${
                      selectedCategory === c.name ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                    }`}>
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-1 ml-auto shrink-0">
                <button onClick={() => setGridCols(3)} className={`p-2 rounded-lg transition-colors ${gridCols === 3 ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>
                  <Grid3X3 size={15} />
                </button>
                <button onClick={() => setGridCols(4)} className={`p-2 rounded-lg transition-colors ${gridCols === 4 ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>
                  <LayoutGrid size={15} />
                </button>
                <span className="text-[11px] text-stone-400 ml-2">
                  {loading ? '—' : `${products.length} items`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-10 md:py-16 px-6">
        <div className="container-wide mx-auto">
          {loading ? (
            <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-5 md:gap-6`}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-28" data-testid="no-products">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-stone-300" />
              </div>
              <p className="font-semibold text-xl tracking-tight mb-2 text-stone-800">No products found</p>
              <p className="text-stone-400 text-sm mb-6">Try a different category or clear your search.</p>
              <button onClick={() => { setSearch(''); setCategory(''); }}
                className="px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors">
                Browse All Products
              </button>
            </motion.div>
          ) : (
            <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-5 md:gap-6`}>
              {products.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                  <ProductCard product={p} onClick={setSelectedProduct} />
                </motion.div>
              ))}
            </div>
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
