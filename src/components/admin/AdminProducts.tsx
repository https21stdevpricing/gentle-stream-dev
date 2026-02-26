import { useState, useEffect, useRef } from 'react';
import {
  Plus, Upload, Search, Edit3, Trash2, Save, X, FileText, Loader2, 
  Image as ImageIcon, Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  material: string | null;
  finish: string | null;
  color: string | null;
  price: number;
  cost_price: number | null;
  unit: string | null;
  hsn_code: string | null;
  origin: string | null;
  description: string | null;
  thumbnail: string | null;
  images: string[];
  stock_quantity: number | null;
  min_stock_level: number | null;
  supplier: string | null;
  supplier_code: string | null;
  margin_percent: number | null;
  tags: string[];
  featured: boolean | null;
  active: boolean | null;
  length_mm: number | null;
  width_mm: number | null;
  thickness_mm: number | null;
  weight_kg: number | null;
}

const CATEGORIES = ['Marble', 'Granite', 'Vitrified Tiles', 'Natural Stone', 'Quartz', 'Sanitaryware', 'Cement & Sand', 'TMT Bars', 'Polycab Wires', 'Ceramic', 'Sinks', 'General'];

const emptyProduct: Partial<Product> = {
  name: '', category: 'General', price: 0, unit: 'sqft', description: '',
  tags: [], images: [], active: true, featured: false, stock_quantity: 0,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load products'); console.error(error); }
    else setProducts((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = !s || p.name.toLowerCase().includes(s) || (p.material || '').toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = async () => {
    if (!editing?.name) { toast.error('Product name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        category: editing.category || 'General',
        subcategory: editing.subcategory || null,
        material: editing.material || null,
        finish: editing.finish || null,
        color: editing.color || null,
        price: editing.price || 0,
        cost_price: editing.cost_price || null,
        unit: editing.unit || 'sqft',
        hsn_code: editing.hsn_code || null,
        origin: editing.origin || null,
        description: editing.description || '',
        thumbnail: editing.thumbnail || null,
        images: editing.images || [],
        stock_quantity: editing.stock_quantity ?? 0,
        min_stock_level: editing.min_stock_level ?? 0,
        supplier: editing.supplier || null,
        supplier_code: editing.supplier_code || null,
        margin_percent: editing.margin_percent || null,
        tags: editing.tags || [],
        featured: editing.featured ?? false,
        active: editing.active ?? true,
        length_mm: editing.length_mm || null,
        width_mm: editing.width_mm || null,
        thickness_mm: editing.thickness_mm || null,
        weight_kg: editing.weight_kg || null,
      };

      if (editing.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('Product created');
      }
      setEditing(null);
      loadProducts();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else { toast.success('Deleted'); loadProducts(); }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParsedPreview(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'parse_products');

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Parse failed');
      }

      const result = await res.json();
      const parsed = Array.isArray(result.data) ? result.data : [result.data];
      setParsedPreview(parsed);
      toast.success(`Found ${parsed.length} products!`);
    } catch (err: any) {
      toast.error(err.message || 'PDF parsing failed');
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const importParsed = async (parsedItems: any[]) => {
    let imported = 0;
    for (const item of parsedItems) {
      const { error } = await supabase.from('products').insert({
        name: item.name || 'Untitled',
        category: item.category || 'General',
        subcategory: item.subcategory || null,
        material: item.material || null,
        finish: item.finish || null,
        color: item.color || null,
        price: item.price || 0,
        unit: item.unit || 'sqft',
        hsn_code: item.hsn_code || null,
        origin: item.origin || null,
        description: item.description || '',
        tags: item.tags || [],
        active: true,
      });
      if (!error) imported++;
    }
    toast.success(`Imported ${imported}/${parsedItems.length} products`);
    setParsedPreview(null);
    loadProducts();
  };

  const handleImageUpload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file);
    if (error) { toast.error('Upload failed'); return null; }
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  };

  if (editing) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg">{editing.id ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={() => setEditing(null)} className="p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basic Info</h3>
            <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })}
              placeholder="Product Name *" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <select value={editing.category || 'General'} onChange={e => setEditing({ ...editing, category: e.target.value })}
              className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={editing.subcategory || ''} onChange={e => setEditing({ ...editing, subcategory: e.target.value })}
              placeholder="Subcategory" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })}
              placeholder="Description" rows={3} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Material & Specs</h3>
            <input value={editing.material || ''} onChange={e => setEditing({ ...editing, material: e.target.value })}
              placeholder="Material" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <div className="grid grid-cols-2 gap-2">
              <input value={editing.finish || ''} onChange={e => setEditing({ ...editing, finish: e.target.value })}
                placeholder="Finish" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input value={editing.color || ''} onChange={e => setEditing({ ...editing, color: e.target.value })}
                placeholder="Color" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={editing.origin || ''} onChange={e => setEditing({ ...editing, origin: e.target.value })}
                placeholder="Origin" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input value={editing.hsn_code || ''} onChange={e => setEditing({ ...editing, hsn_code: e.target.value })}
                placeholder="HSN Code" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={editing.length_mm || ''} onChange={e => setEditing({ ...editing, length_mm: +e.target.value || null })}
                placeholder="L mm" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input type="number" value={editing.width_mm || ''} onChange={e => setEditing({ ...editing, width_mm: +e.target.value || null })}
                placeholder="W mm" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input type="number" value={editing.thickness_mm || ''} onChange={e => setEditing({ ...editing, thickness_mm: +e.target.value || null })}
                placeholder="T mm" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <input type="number" value={editing.weight_kg || ''} onChange={e => setEditing({ ...editing, weight_kg: +e.target.value || null })}
              placeholder="Weight (kg)" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing & Inventory</h3>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={editing.price || ''} onChange={e => setEditing({ ...editing, price: +e.target.value })}
                placeholder="Sell Price *" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input type="number" value={editing.cost_price || ''} onChange={e => setEditing({ ...editing, cost_price: +e.target.value || null })}
                placeholder="Cost Price" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={editing.unit || 'sqft'} onChange={e => setEditing({ ...editing, unit: e.target.value })}
                className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {['sqft', 'piece', 'bag', 'ton', 'meter', 'box', 'roll'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input type="number" value={editing.margin_percent || ''} onChange={e => setEditing({ ...editing, margin_percent: +e.target.value || null })}
                placeholder="Margin %" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={editing.stock_quantity ?? ''} onChange={e => setEditing({ ...editing, stock_quantity: +e.target.value })}
                placeholder="Stock Qty" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input type="number" value={editing.min_stock_level ?? ''} onChange={e => setEditing({ ...editing, min_stock_level: +e.target.value })}
                placeholder="Min Stock" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier & Tags</h3>
            <input value={editing.supplier || ''} onChange={e => setEditing({ ...editing, supplier: e.target.value })}
              placeholder="Supplier" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <input value={editing.supplier_code || ''} onChange={e => setEditing({ ...editing, supplier_code: e.target.value })}
              placeholder="Supplier Code" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <input value={(editing.tags || []).join(', ')} onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              placeholder="Tags (comma separated)" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.featured ?? false} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="rounded" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active ?? true} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="rounded" /> Active
              </label>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Images</h3>
            <div className="flex gap-2 flex-wrap">
              {(editing.images || []).map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setEditing({ ...editing, images: (editing.images || []).filter((_, j) => j !== i) })}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/30 transition-colors">
                <ImageIcon size={18} className="text-muted-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={async (ev) => {
                  const f = ev.target.files?.[0];
                  if (!f) return;
                  const url = await handleImageUpload(f);
                  if (url) setEditing({ ...editing, images: [...(editing.images || []), url] });
                }} />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-border/40">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {editing.id ? 'Update' : 'Create'} Product
          </button>
          <button onClick={() => setEditing(null)} className="px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h2 className="font-semibold text-lg">Products ({products.length})</h2>
        <div className="flex gap-2">
          <button onClick={() => setEditing({ ...emptyProduct })}
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-lg text-[12px] font-medium hover:opacity-90 transition-all">
            <Plus size={14} /> Add Product
          </button>
          <label className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg text-[12px] font-medium hover:bg-blue-600 cursor-pointer transition-colors">
            {parsing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {parsing ? 'Parsing...' : 'Upload PDF'}
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePdfUpload} disabled={parsing} />
          </label>
        </div>
      </div>

      {parsedPreview && (
        <div className="mb-5 p-4 bg-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-green-800">
              <FileText size={14} className="inline mr-1" /> {parsedPreview.length} Products Found
            </h3>
            <div className="flex gap-2">
              <button onClick={() => importParsed(parsedPreview)}
                className="px-4 py-1.5 bg-green-600 text-white text-[11px] font-medium rounded-lg hover:bg-green-700 transition-colors">
                Import All
              </button>
              <button onClick={() => setParsedPreview(null)} className="px-3 py-1.5 text-[11px] text-green-700 hover:text-green-900">Dismiss</button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {parsedPreview.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg text-sm">
                <span className="text-muted-foreground text-[10px] w-5">{i + 1}</span>
                <span className="font-medium flex-1 truncate">{item.name}</span>
                <span className="text-muted-foreground text-[11px]">{item.category}</span>
                <span className="text-muted-foreground text-[11px]">₹{item.price || 0}/{item.unit || 'sqft'}</span>
                <button onClick={() => { setEditing({ ...emptyProduct, ...item }); setParsedPreview(null); }}
                  className="text-blue-600 text-[11px] hover:underline">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..." className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-xl p-4 flex gap-3">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="flex-1"><div className="h-4 bg-muted rounded w-1/3 mb-1" /><div className="h-3 bg-muted rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No products found.</p>
          <button onClick={() => setEditing({ ...emptyProduct })} className="mt-3 text-blue-600 text-sm hover:underline">Add your first product</button>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-accent/50 transition-colors group">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                {p.thumbnail || (p.images && p.images[0]) ? (
                  <img src={p.thumbnail || p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon size={16} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  {p.featured && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Featured</span>}
                  {!p.active && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Inactive</span>}
                </div>
                <p className="text-muted-foreground text-[11px]">{p.category} {p.material ? `• ${p.material}` : ''} {p.hsn_code ? `• HSN: ${p.hsn_code}` : ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium">₹{p.price}/{p.unit || 'sqft'}</p>
                <p className="text-[10px] text-muted-foreground">Stock: {p.stock_quantity ?? 0}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><Edit3 size={13} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
