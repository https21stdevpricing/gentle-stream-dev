import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Grid3X3, LayoutGrid } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductCard, ProductDetailPanel } from '@/components/ProductCard';
import { getProducts, getCategories } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Category } from '@/utils/mockData';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl bg-[#f5f5f7] mb-3" style={{ aspectRatio: '3/4' }} />
      <div className="h-2.5 bg-[#f5f5f7] rounded-full w-1/4 mb-2" />
      <div className="h-3.5 bg-[#f5f5f7] rounded-full w-3/4 mb-1" />
      <div className="h-2.5 bg-[#f5f5f7] rounded-full w-1/2" />
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
    <div className="bg-background min-h-screen" data-testid="products-page">
      <Navbar />

      <div className="pt-[48px]">
        {/* Hero — clean white Apple style */}
        <section className="text-center py-20 md:py-28 px-6 bg-background">
          <div className="container-sw">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="apple-headline mb-3" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
                Our Products.
              </h1>
              <p className="apple-subhead text-base md:text-lg max-w-md mx-auto">
                Explore our curated collection of premium surface materials.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters Bar */}
        <div className="sticky top-[48px] z-30 bg-background/80 backdrop-blur-xl border-y border-border/20">
          <div className="container-wide mx-auto px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..." data-testid="product-search"
                  className="w-full pl-10 pr-9 py-2 bg-[#f5f5f7] border-none rounded-lg text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1" data-testid="category-filters">
                <button onClick={() => setCategory('')} data-testid="filter-all"
                  className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    !selectedCategory ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-[#f5f5f7]'
                  }`}>
                  All
                </button>
                {categories.filter(c => c.active).slice(0, 8).map(c => (
                  <button key={c.id} onClick={() => setCategory(selectedCategory === c.name ? '' : c.name)}
                    data-testid={`filter-${c.slug}`}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      selectedCategory === c.name ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-[#f5f5f7]'
                    }`}>
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-1 ml-auto shrink-0">
                <button onClick={() => setGridCols(3)} className={`p-1.5 rounded-lg transition-colors ${gridCols === 3 ? 'bg-[#f5f5f7] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Grid3X3 size={15} />
                </button>
                <button onClick={() => setGridCols(4)} className={`p-1.5 rounded-lg transition-colors ${gridCols === 4 ? 'bg-[#f5f5f7] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <LayoutGrid size={15} />
                </button>
                <span className="text-[11px] text-muted-foreground ml-2">
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
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-xl tracking-tight mb-2">No products found</p>
              <p className="text-muted-foreground text-sm mb-6">Try a different category or clear your search.</p>
              <button onClick={() => { setSearch(''); setCategory(''); }} className="btn-primary text-sm">
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
