import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBlogPost } from '@/utils/api';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  tags: string[] | null;
  author: string;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

// Simple markdown-like renderer
function renderContent(content: string) {
  return content
    .split('\n')
    .map(line => {
      if (line.startsWith('#### ')) return `<h4>${line.slice(5)}</h4>`;
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
      if (line.startsWith('| ')) return ''; // skip table rows for now
      if (line.startsWith('---')) return '<hr />';
      if (line.startsWith('❌') || line.startsWith('✅') || line.startsWith('✓')) return `<p>${line}</p>`;
      if (line.trim() === '') return '<br />';
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Links
      processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      return `<p>${processed}</p>`;
    })
    .join('\n');
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getBlogPost(slug)
      .then(data => {
        setPost(data);
        document.title = data?.meta_title || data?.title || 'Blog — Stone World';
        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && data?.meta_description) metaDesc.setAttribute('content', data.meta_description);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-[44px] apple-section">
          <div className="container-sw">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-sw-offwhite rounded w-1/4" />
              <div className="h-8 bg-sw-offwhite rounded w-3/4" />
              <div className="h-4 bg-sw-offwhite rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-[44px] apple-section">
          <div className="container-sw text-center py-20">
            <h1 className="font-semibold text-2xl mb-3">Post not found.</h1>
            <Link to="/blog" className="link-blue text-sm">
              <ArrowLeft size={14} /> Back to blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" data-testid="blog-post-page">
      <Navbar />

      <article className="pt-[44px]">
        {/* Hero */}
        {post.cover_image && (
          <div className="relative" style={{ aspectRatio: '3/1', maxHeight: '400px' }}>
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        )}

        <div className="container-sw px-6 py-12 md:py-16">
          <Link to="/blog" className="link-blue text-sm mb-6 inline-flex items-center gap-1">
            <ArrowLeft size={14} /> All posts
          </Link>

          <header className="mb-10">
            <span className="text-[11px] text-sw-gray uppercase tracking-wider">{post.category}</span>
            <h1 className="font-semibold tracking-tight mt-2 mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sw-gray text-[12px]">
              <span className="flex items-center gap-1.5"><User size={12} /> {post.author}</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </header>

          {/* Content */}
          <div
            className="blog-content max-w-[680px]"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-sw-border/30">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={12} className="text-sw-gray" />
                {post.tags.map(tag => (
                  <span key={tag} className="text-[11px] text-sw-gray bg-sw-offwhite px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 p-8 bg-sw-offwhite rounded-2xl text-center">
            <h3 className="font-semibold text-lg tracking-tight mb-2">Need expert advice?</h3>
            <p className="text-sw-gray text-sm mb-4">Our team can help you choose the perfect materials for your project.</p>
            <Link to="/contact" className="btn-blue text-sm">Get a Free Quote</Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
