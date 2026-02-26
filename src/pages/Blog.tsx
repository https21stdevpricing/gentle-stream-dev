import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
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

  return (
    <div className="bg-white min-h-screen" data-testid="blog-page">
      <Navbar />

      <div className="pt-[44px]">
        <div className="apple-section pb-6">
          <div className="container-sw">
            <h1 className="apple-headline mb-2" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
              Blog & Guides.
            </h1>
            <p className="apple-subhead text-lg max-w-lg mx-auto">
              Expert insights on stone, surfaces, and building materials.
            </p>
          </div>
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex justify-center gap-2 px-6 pb-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                !selectedCategory ? 'bg-sw-black text-white' : 'text-sw-gray hover:text-sw-black'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  selectedCategory === cat ? 'bg-sw-black text-white' : 'text-sw-gray hover:text-sw-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="pb-20 px-6">
        <div className="container-wide mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="rounded-2xl bg-sw-offwhite mb-4" style={{ aspectRatio: '16/9' }} />
                  <div className="h-3 bg-sw-offwhite rounded w-1/4 mb-2" />
                  <div className="h-5 bg-sw-offwhite rounded w-3/4 mb-2" />
                  <div className="h-3 bg-sw-offwhite rounded w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-semibold text-xl mb-2">No posts yet.</p>
              <p className="text-sw-gray text-sm">Check back soon for new articles.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-12"
                >
                  <Link to={`/blog/${featured.slug}`} className="group block">
                    <div className="relative rounded-2xl overflow-hidden mb-5" style={{ aspectRatio: '2/1' }}>
                      {featured.cover_image && (
                        <img
                          src={featured.cover_image}
                          alt={featured.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <span className="text-white/60 text-xs uppercase tracking-wider">{featured.category}</span>
                        <h2 className="text-white font-semibold text-2xl md:text-3xl tracking-tight mt-1">{featured.title}</h2>
                      </div>
                    </div>
                    <p className="text-sw-gray text-sm leading-relaxed max-w-2xl">{featured.excerpt}</p>
                    <span className="link-blue text-sm mt-3 inline-flex items-center gap-1">
                      Read more <ArrowRight size={14} />
                    </span>
                  </Link>
                </motion.div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                    >
                      <Link to={`/blog/${post.slug}`} className="group block">
                        {post.cover_image && (
                          <div className="rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '16/10' }}>
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <span className="text-[11px] text-sw-gray uppercase tracking-wider">{post.category}</span>
                        <h3 className="font-semibold text-lg tracking-tight mt-1 mb-2 group-hover:text-[#0066cc] transition-colors">{post.title}</h3>
                        <p className="text-sw-gray text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-2 mt-3 text-sw-gray text-[11px]">
                          <Calendar size={11} />
                          {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
