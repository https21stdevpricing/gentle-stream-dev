import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBlogPosts } from '@/utils/api';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  category: string;
  tags: string[] | null;
  author: string;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    document.title = 'Blog — Stone World | Guides, Tips & Industry Insights';
    getBlogPosts()
      .then(data => setPosts(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(posts.map(p => p.category))];
  const filtered = selectedCategory ? posts.filter(p => p.category === selectedCategory) : posts;
  const featured = filtered[0];
  const rest = filtered.slice(1);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const readTime = (excerpt: string) => Math.max(2, Math.ceil(excerpt.length / 200)) + ' min read';

  return (
    <div className="bg-white min-h-screen" data-testid="blog-page">
      <Navbar />

      <div className="pt-[44px]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-stone-950 text-center py-20 md:py-28 px-6">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(191,155,94,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(191,155,94,0.15) 0%, transparent 50%)'
          }} />
          <div className="container-sw relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-amber-400/80 text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Stories & Insights</p>
              <h1 className="font-semibold text-white leading-tight mb-3" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.03em' }}>
                Blog & Guides.
              </h1>
              <p className="text-stone-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                Expert insights on stone, surfaces, design trends and building materials.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="sticky top-[44px] z-30 bg-white/90 backdrop-blur-xl border-b border-stone-100">
            <div className="flex justify-center gap-1.5 px-6 py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('')}
                className={`shrink-0 px-5 py-2 rounded-full text-[12px] font-medium transition-all ${
                  !selectedCategory ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                All Posts
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`shrink-0 px-5 py-2 rounded-full text-[12px] font-medium transition-all ${
                    selectedCategory === cat ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="py-12 md:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="space-y-8">
              <div className="animate-pulse rounded-3xl bg-stone-50 h-72" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="rounded-2xl bg-stone-50 mb-4 h-48" />
                    <div className="h-3 bg-stone-50 rounded w-1/4 mb-2" />
                    <div className="h-5 bg-stone-50 rounded w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-28">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Tag size={24} className="text-stone-300" />
              </div>
              <p className="font-semibold text-xl mb-2 text-stone-800">No posts yet</p>
              <p className="text-stone-400 text-sm">Check back soon for new articles and guides.</p>
            </motion.div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
                  <Link to={`/blog/${featured.slug}`} className="group block">
                    <div className="relative rounded-3xl overflow-hidden bg-stone-100" style={{ aspectRatio: '21/9' }}>
                      {featured.cover_image ? (
                        <img src={featured.cover_image} alt={featured.title} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-100" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-amber-400 text-[11px] uppercase tracking-wider font-semibold">{featured.category}</span>
                          <span className="text-white/40 text-[11px]">•</span>
                          <span className="text-white/50 text-[11px] flex items-center gap-1"><Clock size={10} /> {readTime(featured.excerpt)}</span>
                        </div>
                        <h2 className="text-white font-semibold text-xl sm:text-2xl md:text-3xl tracking-tight leading-tight">{featured.title}</h2>
                        <p className="text-white/50 text-sm mt-2 max-w-xl hidden sm:block">{featured.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {rest.map((post, i) => (
                    <motion.div key={post.id}
                      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                      <Link to={`/blog/${post.slug}`} className="group block">
                        <div className="rounded-2xl overflow-hidden mb-4 bg-stone-100" style={{ aspectRatio: '16/10' }}>
                          {post.cover_image ? (
                            <img src={post.cover_image} alt={post.title} loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-100 flex items-center justify-center">
                              <Tag size={32} className="text-stone-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] text-amber-600 font-semibold uppercase tracking-wider">{post.category}</span>
                          <span className="text-stone-300 text-[11px]">•</span>
                          <span className="text-[11px] text-stone-400 flex items-center gap-1"><Clock size={10} /> {readTime(post.excerpt)}</span>
                        </div>
                        <h3 className="font-semibold text-lg tracking-tight mb-2 text-stone-900 group-hover:text-amber-800 transition-colors leading-snug">{post.title}</h3>
                        <p className="text-stone-400 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-3 mt-3 text-stone-400 text-[11px]">
                          <span className="flex items-center gap-1"><User size={10} /> {post.author}</span>
                          <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(post.created_at)}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
