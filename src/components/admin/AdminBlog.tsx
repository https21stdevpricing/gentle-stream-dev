import { useState, useEffect } from 'react';
import {
  Plus, Edit3, Trash2, Save, X, Loader2, Eye, EyeOff, FileText, Calendar, Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  tags: string[] | null;
  author: string;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['Guides', 'Industry', 'Projects', 'Materials', 'Tips', 'News', 'General'];

const emptyPost: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '', category: 'General',
  author: 'Stone World Team', published: false, tags: [],
};

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to load blog posts');
    else setPosts((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSave = async () => {
    if (!editing?.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const slug = editing.slug || generateSlug(editing.title);
      const payload = {
        title: editing.title,
        slug,
        excerpt: editing.excerpt || '',
        content: editing.content || '',
        cover_image: editing.cover_image || null,
        category: editing.category || 'General',
        tags: editing.tags || [],
        author: editing.author || 'Stone World Team',
        published: editing.published ?? false,
        meta_title: editing.meta_title || editing.title,
        meta_description: editing.meta_description || editing.excerpt || '',
      };

      if (editing.id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Post updated');
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
        toast.success('Post created');
      }
      setEditing(null);
      loadPosts();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else { toast.success('Deleted'); loadPosts(); }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id);
    if (error) toast.error('Failed');
    else { toast.success(post.published ? 'Unpublished' : 'Published'); loadPosts(); }
  };

  const handleImageUpload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `blog/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file);
    if (error) { toast.error('Upload failed'); return null; }
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  };

  if (editing) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg">{editing.id ? 'Edit Post' : 'New Post'}</h2>
          <button onClick={() => setEditing(null)} className="p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value, slug: generateSlug(e.target.value) })}
            placeholder="Post Title *" className="w-full px-4 py-3 bg-muted rounded-xl text-lg font-medium focus:outline-none focus:ring-1 focus:ring-ring" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })}
              placeholder="url-slug" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <select value={editing.category || 'General'} onChange={e => setEditing({ ...editing, category: e.target.value })}
              className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={editing.author || ''} onChange={e => setEditing({ ...editing, author: e.target.value })}
              placeholder="Author" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>

          <textarea value={editing.excerpt || ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
            placeholder="Short excerpt / description" rows={2}
            className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content (Markdown supported)</h3>
            </div>
            <textarea value={editing.content || ''} onChange={e => setEditing({ ...editing, content: e.target.value })}
              placeholder="Write your blog content here... Use ## for headings, **bold**, *italic*, - for lists"
              rows={16}
              className="w-full px-4 py-3 bg-muted rounded-xl text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed" />
          </div>

          {/* Cover Image */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cover Image</h3>
            <div className="flex gap-3 items-center">
              {editing.cover_image && (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={editing.cover_image} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setEditing({ ...editing, cover_image: null })}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"><X size={10} /></button>
                </div>
              )}
              <input value={editing.cover_image || ''} onChange={e => setEditing({ ...editing, cover_image: e.target.value })}
                placeholder="Image URL or upload" className="flex-1 px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <label className="px-3 py-2.5 bg-muted rounded-lg text-sm cursor-pointer hover:bg-accent transition-colors">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await handleImageUpload(f);
                  if (url) setEditing({ ...editing, cover_image: url });
                }} />
              </label>
            </div>
          </div>

          {/* SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">SEO Title</h3>
              <input value={editing.meta_title || ''} onChange={e => setEditing({ ...editing, meta_title: e.target.value })}
                placeholder="SEO Title (max 60 chars)" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Meta Description</h3>
              <input value={editing.meta_description || ''} onChange={e => setEditing({ ...editing, meta_description: e.target.value })}
                placeholder="Meta description (max 160 chars)" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>

          <input value={(editing.tags || []).join(', ')} onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
            placeholder="Tags (comma separated)" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />

          <div className="flex gap-3 pt-4 border-t border-border/40">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {editing.id ? 'Update' : 'Create'} Post
            </button>
            <button onClick={() => { setEditing({ ...editing, published: true }); handleSave(); }}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all">
              <Eye size={14} /> Publish
            </button>
            <button onClick={() => setEditing(null)} className="px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const filtered = posts.filter(p => {
    const s = search.toLowerCase();
    return !s || p.title.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h2 className="font-semibold text-lg">Blog Posts ({posts.length})</h2>
        <button onClick={() => setEditing({ ...emptyPost })}
          className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-lg text-[12px] font-medium hover:opacity-90 transition-all">
          <Plus size={14} /> New Post
        </button>
      </div>

      <div className="relative mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search posts..." className="w-full pl-3 pr-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-xl p-4"><div className="h-4 bg-muted rounded w-1/3 mb-1" /><div className="h-3 bg-muted rounded w-2/3" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No blog posts yet.</p>
          <button onClick={() => setEditing({ ...emptyPost })} className="mt-3 text-blue-600 text-sm hover:underline">Write your first post</button>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(post => (
            <div key={post.id} className="flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-accent/50 transition-colors group">
              {post.cover_image ? (
                <div className="w-16 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{post.title}</p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  {post.category} • {post.author} • {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => togglePublish(post)} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title={post.published ? 'Unpublish' : 'Publish'}>
                  {post.published ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => setEditing(post)} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><Edit3 size={13} /></button>
                <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
