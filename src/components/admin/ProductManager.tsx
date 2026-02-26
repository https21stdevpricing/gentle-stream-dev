import { useState, useEffect, useRef } from 'react';
import {
  Plus, Upload, Search, Edit3, Trash2, X, Save, Image as ImageIcon,
  FileText, Package, ChevronDown, Check, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchProducts, upsertProduct, deleteProduct, uploadFile, parsePDF,
  type Product
} from '@/utils/adminApi';

const CATEGORIES = ['Marble', 'Granite', 'Tiles', 'Cement', 'Sanitaryware', 'Quartz', 'Slate', 'Sandstone', 'Limestone', 'Onyx', 'Other'];
const FINISHES = ['Polished', 'Honed', 'Brushed', 'Flamed', 'Bush-Hammered', 'Leather', 'Tumbled', 'Sand-Blasted', 'Natural', 'Glossy', 'Matt'];
const UNITS = ['sqft', 'sqm', 'piece', 'box', 'bundle', 'slab', 'ton', 'kg', 'running ft'];

const emptyProduct: Partial<Product> = {
  name: '', description: '', category: 'General', subcategory: null,
  material: null, finish: null, color: null, origin: null,
  length_mm: null, width_mm: null, thickness_mm: null, weight_kg: null,
  unit: 'sqft', price: 0, cost_price: 0, margin_percent: 0,
  hsn_code: null, stock_quantity: 0, min_stock_level: 0,
  supplier: null, supplier_code: null, images: [], thumbnail: null,
  tags: [], variants: [], specs: {}, active: true, featured: false,
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<any[]>([]);
  const [tab, setTab] = useState<'details' | 'specs' | 'inventory' | 'images'>('details');
  const [tagInput, setTagInput] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetchProducts().then(setProducts).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.material || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!editing?.name) return toast.error('Product name required');
    setSaving(true);
    try {
      await upsertProduct(editing);
      toast.success(editing.id ? 'Product updated' : 'Product created');
      setEditing(null);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await deleteProduct(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editing) return;
    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile(file, `products/${Date.now()}-${file.name}`);
        setEditing(prev => ({
          ...prev!,
          images: [...(prev!.images || []), url],
          thumbnail: prev!.thumbnail || url,
        }));
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParsedProducts([]);
    try {
      const result = await parsePDF(file);
      if (result.products?.length > 0) {
        setParsedProducts(result.products);
        toast.success(`Found ${result.products.length} products`);
      } else {
        toast.error('No products found in PDF');
      }
    } catch { toast.error('PDF parsing failed'); }
    finally { setParsing(false); }
  };

  const importParsedProduct = (p: any) => {
    setEditing({
      ...emptyProduct,
      name: p.name || '',
      description: p.description || '',
      category: p.category || 'General',
      subcategory: p.subcategory,
      material: p.material,
      finish: p.finish,
      color: p.color,
      origin: p.origin,
      length_mm: p.length_mm,
      width_mm: p.width_mm,
      thickness_mm: p.thickness_mm,
      weight_kg: p.weight_kg,
      unit: p.unit || 'sqft',
      price: p.price || 0,
      hsn_code: p.hsn_code,
      supplier: p.supplier,
      supplier_code: p.supplier_code,
      tags: p.tags || [],
    });
    setParsedProducts([]);
  };

  const importAllParsed = async () => {
    setSaving(true);
    let count = 0;
    for (const p of parsedProducts) {
      try {
        await upsertProduct({
          ...emptyProduct,
          name: p.name || 'Unnamed',
          description: p.description || '',
          category: p.category || 'General',
          material: p.material, finish: p.finish, color: p.color, origin: p.origin,
          price: p.price || 0, unit: p.unit || 'sqft', hsn_code: p.hsn_code,
          supplier: p.supplier, supplier_code: p.supplier_code, tags: p.tags || [],
        });
        count++;
      } catch {}
    }
    toast.success(`Imported ${count} of ${parsedProducts.length} products`);
    setParsedProducts([]);
    setSaving(false);
    load();
  };

  const addTag = () => {
    if (!tagInput.trim() || !editing) return;
    setEditing({ ...editing, tags: [...(editing.tags || []), tagInput.trim()] });
    setTagInput('');
  };

  const addSpec = () => {
    if (!specKey.trim() || !editing) return;
    setEditing({ ...editing, specs: { ...(editing.specs || {}), [specKey.trim()]: specVal.trim() } });
    setSpecKey(''); setSpecVal('');
  };

  // ===== EDITOR VIEW =====
  if (editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">{editing.id ? 'Edit Product' : 'New Product'}</h2>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['details', 'specs', 'inventory', 'images'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 text-xs py-2 rounded-md transition-colors capitalize ${tab === t ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Product Name *</label>
                <input value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Category</label>
                <select value={editing.category || 'General'} onChange={e => setEditing({...editing, category: e.target.value})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Description</label>
              <textarea value={editing.description || ''} onChange={e => setEditing({...editing, description: e.target.value})}
                rows={3} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Material</label>
                <input value={editing.material || ''} onChange={e => setEditing({...editing, material: e.target.value})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Finish</label>
                <select value={editing.finish || ''} onChange={e => setEditing({...editing, finish: e.target.value || null})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none">
                  <option value="">Select</option>
                  {FINISHES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Color</label>
                <input value={editing.color || ''} onChange={e => setEditing({...editing, color: e.target.value})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Origin</label>
                <input value={editing.origin || ''} onChange={e => setEditing({...editing, origin: e.target.value})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Length (mm)</label>
                <input type="number" value={editing.length_mm ?? ''} onChange={e => setEditing({...editing, length_mm: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</label>
                <input type="number" value={editing.width_mm ?? ''} onChange={e => setEditing({...editing, width_mm: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Thickness (mm)</label>
                <input type="number" value={editing.thickness_mm ?? ''} onChange={e => setEditing({...editing, thickness_mm: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Weight (kg)</label>
                <input type="number" value={editing.weight_kg ?? ''} onChange={e => setEditing({...editing, weight_kg: e.target.value ? Number(e.target.value) : null})}
                  className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
              </div>
            </div>
            {/* Tags */}
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(editing.tags || []).map((t, i) => (
                  <span key={i} className="text-[10px] bg-muted px-2.5 py-1 rounded-full flex items-center gap-1">
                    {t}
                    <button onClick={() => setEditing({...editing, tags: (editing.tags || []).filter((_, j) => j !== i)})} className="text-muted-foreground hover:text-foreground"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..." className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none" />
                <button onClick={addTag} className="px-3 py-2 bg-muted rounded-lg text-xs hover:bg-accent transition-colors">Add</button>
              </div>
            </div>
            {/* Toggles */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.active ?? true} onChange={e => setEditing({...editing, active: e.target.checked})}
                  className="rounded" /> Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.featured ?? false} onChange={e => setEditing({...editing, featured: e.target.checked})}
                  className="rounded" /> Featured
              </label>
            </div>
          </div>
        )}

        {tab === 'specs' && (
          <div className="space-y-4">
            <div className="grid gap-2">
              {Object.entries(editing.specs || {}).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <span className="text-xs font-medium flex-1">{k}</span>
                  <span className="text-xs text-muted-foreground flex-1">{String(v)}</span>
                  <button onClick={() => {
                    const s = {...(editing.specs || {})};
                    delete s[k];
                    setEditing({...editing, specs: s});
                  }} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="Key" className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none" />
              <input value={specVal} onChange={e => setSpecVal(e.target.value)} placeholder="Value" className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none" />
              <button onClick={addSpec} className="px-3 py-2 bg-muted rounded-lg text-xs hover:bg-accent transition-colors">Add</button>
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Price (₹)</label>
              <input type="number" value={editing.price ?? 0} onChange={e => setEditing({...editing, price: Number(e.target.value)})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Cost Price (₹)</label>
              <input type="number" value={editing.cost_price ?? 0} onChange={e => setEditing({...editing, cost_price: Number(e.target.value)})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Margin %</label>
              <input type="number" value={editing.margin_percent ?? 0} onChange={e => setEditing({...editing, margin_percent: Number(e.target.value)})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Unit</label>
              <select value={editing.unit || 'sqft'} onChange={e => setEditing({...editing, unit: e.target.value})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">HSN Code</label>
              <input value={editing.hsn_code || ''} onChange={e => setEditing({...editing, hsn_code: e.target.value})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Stock Qty</label>
              <input type="number" value={editing.stock_quantity ?? 0} onChange={e => setEditing({...editing, stock_quantity: Number(e.target.value)})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Min Stock Level</label>
              <input type="number" value={editing.min_stock_level ?? 0} onChange={e => setEditing({...editing, min_stock_level: Number(e.target.value)})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Supplier</label>
              <input value={editing.supplier || ''} onChange={e => setEditing({...editing, supplier: e.target.value})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Supplier Code</label>
              <input value={editing.supplier_code || ''} onChange={e => setEditing({...editing, supplier_code: e.target.value})}
                className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
          </div>
        )}

        {tab === 'images' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(editing.images || []).map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => setEditing({...editing, thumbnail: img})}
                      className={`p-1.5 rounded-full ${editing.thumbnail === img ? 'bg-green-500' : 'bg-white/80'}`}>
                      <Check size={12} />
                    </button>
                    <button onClick={() => setEditing({...editing, images: (editing.images || []).filter((_, j) => j !== i)})}
                      className="p-1.5 rounded-full bg-white/80 text-destructive"><Trash2 size={12} /></button>
                  </div>
                  {editing.thumbnail === img && (
                    <span className="absolute top-1.5 left-1.5 text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-semibold">THUMB</span>
                  )}
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                <ImageIcon size={20} />
                <span className="text-[10px]">Upload</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
          </div>
        )}
      </div>
    );
  }

  // ===== PARSED PRODUCTS VIEW =====
  if (parsedProducts.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Parsed Products ({parsedProducts.length})</h2>
          <div className="flex gap-2">
            <button onClick={() => setParsedProducts([])} className="px-4 py-2 text-xs text-muted-foreground border border-border rounded-lg">Cancel</button>
            <button onClick={importAllParsed} disabled={saving} className="px-4 py-2 text-xs bg-foreground text-background rounded-lg flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Package size={12} />} Import All
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          {parsedProducts.map((p, i) => (
            <div key={i} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.name || 'Unnamed'}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {[p.category, p.material, p.finish, p.origin].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="text-sm font-medium shrink-0">₹{p.price || 0}/{p.unit || 'sqft'}</span>
              <button onClick={() => importParsedProduct(p)} className="shrink-0 px-3 py-1.5 text-[10px] bg-muted rounded-lg hover:bg-accent transition-colors flex items-center gap-1">
                <Edit3 size={10} /> Edit & Save
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== LIST VIEW =====
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <button onClick={() => pdfRef.current?.click()} disabled={parsing}
          className="px-4 py-2.5 border border-border rounded-lg text-xs flex items-center gap-1.5 hover:bg-muted transition-colors disabled:opacity-50">
          {parsing ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />} Parse PDF
        </button>
        <button onClick={() => setEditing({...emptyProduct})}
          className="px-4 py-2.5 bg-foreground text-background rounded-lg text-xs flex items-center gap-1.5 hover:opacity-90 transition-colors">
          <Plus size={12} /> Add Product
        </button>
        <input ref={pdfRef} type="file" accept=".pdf" hidden onChange={handlePDFUpload} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl p-4 h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No products found</p>
          <button onClick={() => setEditing({...emptyProduct})} className="mt-3 text-xs text-foreground underline">Add your first product</button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(p => (
            <div key={p.id} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4 hover:border-ring/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                {p.thumbnail ? <img src={p.thumbnail} alt="" className="w-full h-full object-cover" /> : <Package size={20} className="w-full h-full p-3 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  {!p.active && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">Inactive</span>}
                  {p.featured && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Featured</span>}
                  {p.stock_quantity <= p.min_stock_level && p.min_stock_level > 0 && (
                    <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><AlertCircle size={8} /> Low Stock</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {[p.category, p.material, p.finish, p.origin].filter(Boolean).join(' · ')} {p.hsn_code && `· HSN: ${p.hsn_code}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium text-sm">₹{p.price}/{p.unit}</p>
                <p className="text-[10px] text-muted-foreground">Stock: {p.stock_quantity}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditing({...p}); setTab('details'); }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
