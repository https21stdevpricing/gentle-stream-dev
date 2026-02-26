import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit3, Trash2, Save, X, Loader2, Package, Warehouse,
  AlertTriangle, TrendingDown, MapPin, Phone, Mail, Star, Truck,
  ChevronRight, BarChart3, ArrowDownUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────
interface StockItem {
  id: string;
  product_id: string | null;
  zone_id: string | null;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock_level: number;
  cost_price: number;
  last_restocked_at: string | null;
  notes: string | null;
}

interface Zone {
  id: string;
  name: string;
  description: string | null;
  capacity_sqft: number;
  used_sqft: number;
  zone_type: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  category: string;
  rating: number;
  status: string;
  notes: string | null;
}

type SubView = 'stock' | 'zones' | 'suppliers';

const inputCls = "w-full px-3 py-2.5 bg-muted/60 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";
const CATEGORIES = ['Marble', 'Granite', 'Tiles', 'Quartz', 'Natural Stone', 'Sanitaryware', 'Cement', 'TMT Bars', 'Wires', 'Other'];

export default function AdminInventory() {
  const [subView, setSubView] = useState<SubView>('stock');
  const [stock, setStock] = useState<StockItem[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingStock, setEditingStock] = useState<Partial<StockItem> | null>(null);
  const [editingZone, setEditingZone] = useState<Partial<Zone> | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);
  const [saving, setSaving] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'low_stock'>('name');

  const loadAll = async () => {
    setLoading(true);
    const [s, z, sup] = await Promise.all([
      supabase.from('inventory_stock').select('*').order('product_name'),
      supabase.from('warehouse_zones').select('*').order('name'),
      supabase.from('suppliers').select('*').order('name'),
    ]);
    setStock((s.data as any) || []);
    setZones((z.data as any) || []);
    setSuppliers((sup.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // ─── Stock CRUD ────────────────────────────────────
  const saveStock = async () => {
    if (!editingStock?.product_name?.trim()) { toast.error('Product name required'); return; }
    setSaving(true);
    try {
      const payload = {
        product_name: editingStock.product_name,
        category: editingStock.category || 'Other',
        quantity: editingStock.quantity || 0,
        unit: editingStock.unit || 'sqft',
        min_stock_level: editingStock.min_stock_level || 0,
        cost_price: editingStock.cost_price || 0,
        zone_id: editingStock.zone_id || null,
        notes: editingStock.notes || null,
      };
      if (editingStock.id) {
        const { error } = await supabase.from('inventory_stock').update(payload).eq('id', editingStock.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('inventory_stock').insert(payload);
        if (error) throw error;
      }
      toast.success('Saved!');
      setEditingStock(null);
      loadAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteStock = async (id: string) => {
    if (!confirm('Remove this stock item?')) return;
    await supabase.from('inventory_stock').delete().eq('id', id);
    toast.success('Removed'); loadAll();
  };

  // ─── Zone CRUD ─────────────────────────────────────
  const saveZone = async () => {
    if (!editingZone?.name?.trim()) { toast.error('Zone name required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: editingZone.name,
        description: editingZone.description || null,
        capacity_sqft: editingZone.capacity_sqft || 0,
        used_sqft: editingZone.used_sqft || 0,
        zone_type: editingZone.zone_type || 'storage',
      };
      if (editingZone.id) {
        await supabase.from('warehouse_zones').update(payload).eq('id', editingZone.id);
      } else {
        await supabase.from('warehouse_zones').insert(payload);
      }
      toast.success('Saved!'); setEditingZone(null); loadAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Delete this zone?')) return;
    await supabase.from('warehouse_zones').delete().eq('id', id);
    toast.success('Deleted'); loadAll();
  };

  // ─── Supplier CRUD ─────────────────────────────────
  const saveSupplier = async () => {
    if (!editingSupplier?.name?.trim()) { toast.error('Supplier name required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: editingSupplier.name,
        contact_person: editingSupplier.contact_person || null,
        phone: editingSupplier.phone || null,
        email: editingSupplier.email || null,
        address: editingSupplier.address || null,
        gstin: editingSupplier.gstin || null,
        category: editingSupplier.category || 'General',
        rating: editingSupplier.rating || 3,
        status: editingSupplier.status || 'active',
        notes: editingSupplier.notes || null,
      };
      if (editingSupplier.id) {
        await supabase.from('suppliers').update(payload).eq('id', editingSupplier.id);
      } else {
        await supabase.from('suppliers').insert(payload);
      }
      toast.success('Saved!'); setEditingSupplier(null); loadAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm('Remove this supplier?')) return;
    await supabase.from('suppliers').delete().eq('id', id);
    toast.success('Removed'); loadAll();
  };

  // ─── Stats ─────────────────────────────────────────
  const lowStockItems = stock.filter(s => s.quantity <= s.min_stock_level && s.min_stock_level > 0);
  const totalValue = stock.reduce((s, i) => s + (i.quantity * i.cost_price), 0);
  const totalZoneCapacity = zones.reduce((s, z) => s + z.capacity_sqft, 0);
  const totalZoneUsed = zones.reduce((s, z) => s + z.used_sqft, 0);

  // ─── Sorted/Filtered Stock ─────────────────────────
  let filteredStock = stock.filter(s => {
    const q = search.toLowerCase();
    return !q || s.product_name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });
  if (sortBy === 'quantity') filteredStock.sort((a, b) => b.quantity - a.quantity);
  else if (sortBy === 'low_stock') filteredStock = filteredStock.filter(s => s.quantity <= s.min_stock_level && s.min_stock_level > 0);

  const tabs = [
    { id: 'stock' as const, label: 'Stock', icon: Package, count: stock.length },
    { id: 'zones' as const, label: 'Zones', icon: Warehouse, count: zones.length },
    { id: 'suppliers' as const, label: 'Suppliers', icon: Truck, count: suppliers.length },
  ];

  // ═══════════════════════════════════════════════════
  // EDIT FORMS
  // ═══════════════════════════════════════════════════
  if (editingStock) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base">{editingStock.id ? 'Edit' : 'Add'} Stock Item</h2>
          <div className="flex gap-2">
            <button onClick={saveStock} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-foreground text-background rounded-xl text-[12px] font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
            <button onClick={() => setEditingStock(null)} className="p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
        </div>
        <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Product Name *</label>
              <input value={editingStock.product_name || ''} onChange={e => setEditingStock({ ...editingStock, product_name: e.target.value })} placeholder="e.g. Statuario White Marble" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Category</label>
              <select value={editingStock.category || 'Other'} onChange={e => setEditingStock({ ...editingStock, category: e.target.value })} className={inputCls}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Quantity</label>
              <input type="number" value={editingStock.quantity || ''} onChange={e => setEditingStock({ ...editingStock, quantity: +e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Unit</label>
              <select value={editingStock.unit || 'sqft'} onChange={e => setEditingStock({ ...editingStock, unit: e.target.value })} className={inputCls}>
                {['sqft', 'piece', 'bag', 'ton', 'meter', 'box', 'kg', 'bundle'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Min Level</label>
              <input type="number" value={editingStock.min_stock_level || ''} onChange={e => setEditingStock({ ...editingStock, min_stock_level: +e.target.value })} placeholder="Alert threshold" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Cost (₹)</label>
              <input type="number" value={editingStock.cost_price || ''} onChange={e => setEditingStock({ ...editingStock, cost_price: +e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Zone</label>
            <select value={editingStock.zone_id || ''} onChange={e => setEditingStock({ ...editingStock, zone_id: e.target.value || null })} className={inputCls}>
              <option value="">No zone</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
            <input value={editingStock.notes || ''} onChange={e => setEditingStock({ ...editingStock, notes: e.target.value })} className={inputCls} placeholder="Supplier, batch, etc." />
          </div>
        </div>
      </div>
    );
  }

  if (editingZone) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base">{editingZone.id ? 'Edit' : 'Add'} Zone</h2>
          <div className="flex gap-2">
            <button onClick={saveZone} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-foreground text-background rounded-xl text-[12px] font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
            <button onClick={() => setEditingZone(null)} className="p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
        </div>
        <div className="space-y-3 p-5 bg-card rounded-2xl border border-border/30">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Zone Name *</label>
            <input value={editingZone.name || ''} onChange={e => setEditingZone({ ...editingZone, name: e.target.value })} placeholder="e.g. Zone A - Marble" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <input value={editingZone.description || ''} onChange={e => setEditingZone({ ...editingZone, description: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Capacity (sqft)</label>
              <input type="number" value={editingZone.capacity_sqft || ''} onChange={e => setEditingZone({ ...editingZone, capacity_sqft: +e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Used (sqft)</label>
              <input type="number" value={editingZone.used_sqft || ''} onChange={e => setEditingZone({ ...editingZone, used_sqft: +e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Type</label>
            <select value={editingZone.zone_type || 'storage'} onChange={e => setEditingZone({ ...editingZone, zone_type: e.target.value })} className={inputCls}>
              {['storage', 'display', 'loading', 'processing', 'waste'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (editingSupplier) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base">{editingSupplier.id ? 'Edit' : 'Add'} Supplier</h2>
          <div className="flex gap-2">
            <button onClick={saveSupplier} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-foreground text-background rounded-xl text-[12px] font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
            <button onClick={() => setEditingSupplier(null)} className="p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
        </div>
        <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Company Name *</label>
              <input value={editingSupplier.name || ''} onChange={e => setEditingSupplier({ ...editingSupplier, name: e.target.value })} placeholder="e.g. Rajasthan Marble Corp" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Contact Person</label>
              <input value={editingSupplier.contact_person || ''} onChange={e => setEditingSupplier({ ...editingSupplier, contact_person: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
              <input value={editingSupplier.phone || ''} onChange={e => setEditingSupplier({ ...editingSupplier, phone: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <input value={editingSupplier.email || ''} onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Address</label>
            <input value={editingSupplier.address || ''} onChange={e => setEditingSupplier({ ...editingSupplier, address: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">GSTIN</label>
              <input value={editingSupplier.gstin || ''} onChange={e => setEditingSupplier({ ...editingSupplier, gstin: e.target.value })} className={inputCls} maxLength={15} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Category</label>
              <select value={editingSupplier.category || 'General'} onChange={e => setEditingSupplier({ ...editingSupplier, category: e.target.value })} className={inputCls}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Rating</label>
              <select value={editingSupplier.rating || 3} onChange={e => setEditingSupplier({ ...editingSupplier, rating: +e.target.value })} className={inputCls}>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} ★</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // MAIN VIEW
  // ═══════════════════════════════════════════════════
  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-4 bg-card rounded-2xl border border-border/20">
          <Package size={16} className="text-muted-foreground mb-2" />
          <p className="text-xl font-bold">{stock.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Items</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/20">
          <AlertTriangle size={16} className={`mb-2 ${lowStockItems.length > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          <p className={`text-xl font-bold ${lowStockItems.length > 0 ? 'text-amber-600' : ''}`}>{lowStockItems.length}</p>
          <p className="text-[10px] text-muted-foreground">Low Stock Alerts</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/20">
          <BarChart3 size={16} className="text-muted-foreground mb-2" />
          <p className="text-xl font-bold">₹{(totalValue / 100000).toFixed(1)}L</p>
          <p className="text-[10px] text-muted-foreground">Stock Value</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/20">
          <Warehouse size={16} className="text-muted-foreground mb-2" />
          <p className="text-xl font-bold">{totalZoneCapacity > 0 ? Math.round((totalZoneUsed / totalZoneCapacity) * 100) : 0}%</p>
          <p className="text-[10px] text-muted-foreground">Warehouse Used</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2"><AlertTriangle size={13} /> Low Stock Alerts</p>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <span key={item.id} className="text-[11px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                {item.product_name}: {item.quantity} {item.unit} (min: {item.min_stock_level})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSubView(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium flex-1 justify-center transition-all ${
              subView === t.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon size={13} /> {t.label} <span className="text-muted-foreground/60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        {subView === 'stock' && (
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-3 py-2 bg-muted/60 border border-border/30 rounded-xl text-xs">
            <option value="name">By Name</option>
            <option value="quantity">By Quantity</option>
            <option value="low_stock">Low Stock Only</option>
          </select>
        )}
        <button onClick={() => {
          if (subView === 'stock') setEditingStock({ category: 'Other', unit: 'sqft', quantity: 0, min_stock_level: 0, cost_price: 0 });
          else if (subView === 'zones') setEditingZone({ zone_type: 'storage', capacity_sqft: 0, used_sqft: 0 });
          else setEditingSupplier({ category: 'General', rating: 3, status: 'active' });
        }} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-xl text-[12px] font-medium hover:opacity-90 shrink-0">
          <Plus size={13} /> Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-card rounded-2xl p-4 border border-border/20"><div className="h-4 bg-muted rounded w-1/3 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>)}</div>
      ) : (
        <>
          {/* STOCK TAB */}
          {subView === 'stock' && (
            filteredStock.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border/30">
                <Package size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">{search ? 'No matching items' : 'No inventory items yet'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStock.map(item => {
                  const isLow = item.min_stock_level > 0 && item.quantity <= item.min_stock_level;
                  const zone = zones.find(z => z.id === item.zone_id);
                  return (
                    <div key={item.id} className={`flex items-center gap-3 p-4 bg-card rounded-2xl border ${isLow ? 'border-amber-300 bg-amber-50/30' : 'border-border/20'} hover:shadow-sm transition-all group`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isLow ? 'bg-amber-100' : 'bg-muted'}`}>
                        {isLow ? <AlertTriangle size={16} className="text-amber-600" /> : <Package size={16} className="text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product_name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.category}{zone ? ` • ${zone.name}` : ''}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-bold text-sm ${isLow ? 'text-amber-600' : ''}`}>{item.quantity} {item.unit}</p>
                        <p className="text-[10px] text-muted-foreground">₹{item.cost_price}/{item.unit}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => setEditingStock(item)} className="p-2 hover:bg-muted rounded-xl"><Edit3 size={13} /></button>
                        <button onClick={() => deleteStock(item.id)} className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/5 rounded-xl"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ZONES TAB */}
          {subView === 'zones' && (
            zones.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border/30">
                <Warehouse size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No warehouse zones defined yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {zones.map(zone => {
                  const usage = zone.capacity_sqft > 0 ? Math.round((zone.used_sqft / zone.capacity_sqft) * 100) : 0;
                  return (
                    <div key={zone.id} className="p-4 bg-card rounded-2xl border border-border/20 hover:shadow-sm transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{zone.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingZone(zone)} className="p-1.5 hover:bg-muted rounded-lg"><Edit3 size={12} /></button>
                          <button onClick={() => deleteZone(zone.id)} className="p-1.5 text-destructive/60 hover:text-destructive rounded-lg"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      {zone.description && <p className="text-[11px] text-muted-foreground mb-2">{zone.description}</p>}
                      <div className="w-full bg-muted rounded-full h-2 mb-1.5">
                        <div className={`h-2 rounded-full transition-all ${usage > 80 ? 'bg-red-500' : usage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(usage, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{zone.used_sqft.toLocaleString()} / {zone.capacity_sqft.toLocaleString()} sqft ({usage}%)</p>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* SUPPLIERS TAB */}
          {subView === 'suppliers' && (
            suppliers.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border/30">
                <Truck size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No suppliers added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {suppliers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase())).map(sup => (
                  <div key={sup.id} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/20 hover:shadow-sm transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {sup.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{sup.name}</p>
                        <div className="flex gap-0.5">
                          {[...Array(sup.rating)].map((_, i) => <Star key={i} size={9} className="fill-amber-400 text-amber-400" />)}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{sup.category} • {sup.contact_person || 'No contact'} • {sup.phone || ''}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${sup.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {sup.status}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingSupplier(sup)} className="p-2 hover:bg-muted rounded-xl"><Edit3 size={13} /></button>
                      <button onClick={() => deleteSupplier(sup.id)} className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/5 rounded-xl"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
