import { useState, useEffect, useRef } from 'react';
import {
  Plus, FileText, Download, Trash2, Edit3, X, Save, Loader2,
  Upload, Printer, Send, ChevronDown, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchInvoices, fetchInvoiceItems, saveInvoice, deleteInvoice,
  parseInvoicePDF, fetchProducts, generateTallyXML, numberToWords,
  type Invoice, type InvoiceItem, type Product
} from '@/utils/adminApi';

const INVOICE_TYPES = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'proforma', label: 'Proforma Invoice' },
  { value: 'gst_invoice', label: 'GST Invoice' },
];

const COMPANY_INFO = {
  name: 'Stone World',
  address: 'Dantali, Gandhinagar, Gujarat 382721',
  gstin: '',
  phone: '+91 98765 43210',
  email: 'info@stoneworld.in',
};

const emptyItem: InvoiceItem = {
  description: '', hsn_code: null, quantity: 1, unit: 'sqft',
  rate: 0, amount: 0, discount_percent: 0, tax_rate: 18,
  tax_amount: 0, total: 0, sort_order: 0,
};

export default function InvoiceMaker() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<'list' | 'editor' | 'preview'>('list');
  const [invoice, setInvoice] = useState<Partial<Invoice>>({});
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([fetchInvoices(), fetchProducts()])
      .then(([inv, prod]) => { setInvoices(inv); setProducts(prod); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const newInvoice = (type = 'quotation') => {
    const prefix = type === 'gst_invoice' ? 'INV' : type === 'proforma' ? 'PI' : 'QT';
    const num = `${prefix}-${Date.now().toString().slice(-6)}`;
    setInvoice({
      invoice_number: num,
      invoice_type: type,
      customer_name: '',
      customer_email: null,
      customer_phone: null,
      customer_address: null,
      customer_gstin: null,
      company_gstin: COMPANY_INFO.gstin,
      billing_address: null,
      shipping_address: null,
      subtotal: 0, discount_percent: 0, discount_amount: 0,
      taxable_amount: 0, cgst_rate: 9, cgst_amount: 0, sgst_rate: 9, sgst_amount: 0,
      igst_rate: 0, igst_amount: 0, total_tax: 0, grand_total: 0,
      notes: null, terms: 'Payment due within 30 days.\nPrices are subject to change without notice.',
      payment_terms: 'Net 30', status: 'draft',
    });
    setItems([{ ...emptyItem }]);
    setView('editor');
  };

  const editInvoice = async (inv: Invoice) => {
    setInvoice(inv);
    try {
      const loadedItems = await fetchInvoiceItems(inv.id);
      setItems(loadedItems.length > 0 ? loadedItems : [{ ...emptyItem }]);
    } catch { setItems([{ ...emptyItem }]); }
    setView('editor');
  };

  const calcItem = (item: InvoiceItem): InvoiceItem => {
    const amount = item.quantity * item.rate;
    const discountedAmount = amount * (1 - item.discount_percent / 100);
    const taxAmount = discountedAmount * item.tax_rate / 100;
    return { ...item, amount: discountedAmount, tax_amount: taxAmount, total: discountedAmount + taxAmount };
  };

  const recalcTotals = (updatedItems: InvoiceItem[]) => {
    const calced = updatedItems.map(calcItem);
    setItems(calced);
    const subtotal = calced.reduce((s, i) => s + i.amount, 0);
    const discountAmt = subtotal * (invoice.discount_percent || 0) / 100;
    const taxable = subtotal - discountAmt;
    const useIGST = (invoice.igst_rate || 0) > 0;
    const totalTax = useIGST
      ? taxable * (invoice.igst_rate || 0) / 100
      : taxable * ((invoice.cgst_rate || 0) + (invoice.sgst_rate || 0)) / 100;
    const grand = taxable + totalTax;

    setInvoice(prev => ({
      ...prev,
      subtotal, discount_amount: discountAmt, taxable_amount: taxable,
      cgst_amount: useIGST ? 0 : taxable * (prev?.cgst_rate || 0) / 100,
      sgst_amount: useIGST ? 0 : taxable * (prev?.sgst_rate || 0) / 100,
      igst_amount: useIGST ? taxable * (prev?.igst_rate || 0) / 100 : 0,
      total_tax: totalTax, grand_total: grand,
      amount_in_words: numberToWords(grand),
    }));
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    recalcTotals(updated);
  };

  const addItem = () => {
    const updated = [...items, { ...emptyItem, sort_order: items.length }];
    recalcTotals(updated);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== idx);
    recalcTotals(updated);
  };

  const addProductToItems = (product: Product) => {
    const newItem: InvoiceItem = {
      ...emptyItem,
      product_id: product.id,
      description: product.name,
      hsn_code: product.hsn_code,
      unit: product.unit,
      rate: product.price,
      quantity: 1,
      sort_order: items.length,
    };
    const updated = [...items, newItem];
    recalcTotals(updated);
  };

  const handleSave = async () => {
    if (!invoice.customer_name) return toast.error('Customer name required');
    setSaving(true);
    try {
      await saveInvoice(invoice, items);
      toast.success('Saved!');
      setView('list');
      loadAll();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try { await deleteInvoice(id); toast.success('Deleted'); loadAll(); }
    catch { toast.error('Failed'); }
  };

  const handlePDFImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const result = await parseInvoicePDF(file);
      const d = result.data;
      if (d) {
        setInvoice(prev => ({
          ...prev,
          invoice_number: d.invoice_number || prev?.invoice_number,
          invoice_type: d.invoice_type || 'quotation',
          customer_name: d.customer?.name || '',
          customer_email: d.customer?.email,
          customer_phone: d.customer?.phone,
          customer_address: d.customer?.address,
          customer_gstin: d.customer?.gstin,
          company_gstin: d.seller?.gstin || COMPANY_INFO.gstin,
          notes: d.notes,
          terms: d.terms,
        }));
        if (d.items?.length > 0) {
          const parsedItems: InvoiceItem[] = d.items.map((item: any, i: number) => calcItem({
            description: item.description || '',
            hsn_code: item.hsn_code || null,
            quantity: item.quantity || 1,
            unit: item.unit || 'sqft',
            rate: item.rate || 0,
            amount: 0, discount_percent: item.discount_percent || 0,
            tax_rate: item.tax_rate || 18, tax_amount: 0, total: 0,
            sort_order: i,
          }));
          recalcTotals(parsedItems);
        }
        toast.success('Invoice data imported');
      }
    } catch { toast.error('Failed to parse invoice'); }
    finally { setParsing(false); }
  };

  const exportTally = (inv: Invoice) => {
    fetchInvoiceItems(inv.id).then(invItems => {
      const xml = generateTallyXML(inv, invItems);
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `tally-${inv.invoice_number}.xml`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Tally XML exported');
    });
  };

  const handlePrint = () => {
    setView('preview');
    setTimeout(() => window.print(), 500);
  };

  // ===== PREVIEW =====
  if (view === 'preview') {
    return (
      <div>
        <div className="flex gap-2 mb-4 print:hidden">
          <button onClick={() => setView('editor')} className="px-4 py-2 text-xs border border-border rounded-lg">← Back to Editor</button>
          <button onClick={() => window.print()} className="px-4 py-2 text-xs bg-foreground text-background rounded-lg flex items-center gap-1.5">
            <Printer size={12} /> Print / PDF
          </button>
        </div>
        <div ref={printRef} className="bg-white max-w-[800px] mx-auto p-8 print:p-6 shadow-sm rounded-xl print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-border pb-6 mb-6">
            <div>
              <img src="/sw-logo.png" alt="Stone World" className="h-10 mb-2" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">{COMPANY_INFO.address}</p>
              <p className="text-[11px] text-muted-foreground">{COMPANY_INFO.phone} · {COMPANY_INFO.email}</p>
              {invoice.company_gstin && <p className="text-[11px] text-muted-foreground">GSTIN: {invoice.company_gstin}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold uppercase tracking-wide">{invoice.invoice_type === 'gst_invoice' ? 'Tax Invoice' : invoice.invoice_type === 'proforma' ? 'Proforma Invoice' : 'Quotation'}</h2>
              <p className="text-sm font-medium mt-1"># {invoice.invoice_number}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Date: {new Date(invoice.created_at || Date.now()).toLocaleDateString('en-IN')}</p>
              {invoice.due_date && <p className="text-[11px] text-muted-foreground">Due: {new Date(invoice.due_date).toLocaleDateString('en-IN')}</p>}
            </div>
          </div>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Bill To</p>
              <p className="font-medium text-sm">{invoice.customer_name}</p>
              {invoice.customer_address && <p className="text-[11px] text-muted-foreground whitespace-pre-line">{invoice.customer_address}</p>}
              {invoice.customer_gstin && <p className="text-[11px] text-muted-foreground">GSTIN: {invoice.customer_gstin}</p>}
              {invoice.customer_phone && <p className="text-[11px] text-muted-foreground">{invoice.customer_phone}</p>}
            </div>
            {invoice.shipping_address && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Ship To</p>
                <p className="text-[11px] text-muted-foreground whitespace-pre-line">{invoice.shipping_address}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">#</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Description</th>
                {invoice.invoice_type === 'gst_invoice' && <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">HSN</th>}
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Qty</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Rate</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 text-muted-foreground">{i + 1}</td>
                  <td className="py-2.5">{item.description}</td>
                  {invoice.invoice_type === 'gst_invoice' && <td className="py-2.5 text-muted-foreground">{item.hsn_code || '-'}</td>}
                  <td className="py-2.5 text-right">{item.quantity} {item.unit}</td>
                  <td className="py-2.5 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right font-medium">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              {(invoice.discount_amount || 0) > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Discount ({invoice.discount_percent}%)</span><span>-₹{(invoice.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              )}
              {invoice.invoice_type === 'gst_invoice' && (
                <>
                  {(invoice.igst_amount || 0) > 0 ? (
                    <div className="flex justify-between"><span className="text-muted-foreground">IGST ({invoice.igst_rate}%)</span><span>₹{(invoice.igst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">CGST ({invoice.cgst_rate}%)</span><span>₹{(invoice.cgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">SGST ({invoice.sgst_rate}%)</span><span>₹{(invoice.sgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                    </>
                  )}
                </>
              )}
              <div className="flex justify-between font-semibold text-base border-t border-foreground/10 pt-2 mt-2">
                <span>Total</span><span>₹{(invoice.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {invoice.amount_in_words && (
                <p className="text-[10px] text-muted-foreground italic pt-1">{invoice.amount_in_words}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          {(invoice.terms || invoice.notes) && (
            <div className="mt-8 pt-4 border-t border-border">
              {invoice.notes && <div className="mb-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</p><p className="text-[11px] text-muted-foreground whitespace-pre-line">{invoice.notes}</p></div>}
              {invoice.terms && <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Terms & Conditions</p><p className="text-[11px] text-muted-foreground whitespace-pre-line">{invoice.terms}</p></div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== EDITOR =====
  if (view === 'editor') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            {invoice.id ? 'Edit' : 'New'} {INVOICE_TYPES.find(t => t.value === invoice.invoice_type)?.label || 'Invoice'}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => { setView('list'); }} className="px-4 py-2 text-xs text-muted-foreground border border-border rounded-lg">Cancel</button>
            <button onClick={() => pdfRef.current?.click()} disabled={parsing}
              className="px-4 py-2 text-xs border border-border rounded-lg flex items-center gap-1.5 disabled:opacity-50">
              {parsing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Import PDF
            </button>
            <button onClick={() => setView('preview')} className="px-4 py-2 text-xs border border-border rounded-lg flex items-center gap-1.5">
              <FileText size={12} /> Preview
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-xs bg-foreground text-background rounded-lg flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
            </button>
          </div>
        </div>
        <input ref={pdfRef} type="file" accept=".pdf" hidden onChange={handlePDFImport} />

        {/* Type & Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Invoice Type</label>
            <select value={invoice.invoice_type || 'quotation'} onChange={e => setInvoice({...invoice, invoice_type: e.target.value})}
              className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none">
              {INVOICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Invoice Number</label>
            <input value={invoice.invoice_number || ''} onChange={e => setInvoice({...invoice, invoice_number: e.target.value})}
              className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Status</label>
            <select value={invoice.status || 'draft'} onChange={e => setInvoice({...invoice, status: e.target.value})}
              className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none">
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Customer Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Name *</label>
              <input value={invoice.customer_name || ''} onChange={e => setInvoice({...invoice, customer_name: e.target.value})}
                className="w-full px-3 py-2.5 bg-background rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">GSTIN</label>
              <input value={invoice.customer_gstin || ''} onChange={e => setInvoice({...invoice, customer_gstin: e.target.value})}
                className="w-full px-3 py-2.5 bg-background rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Phone</label>
              <input value={invoice.customer_phone || ''} onChange={e => setInvoice({...invoice, customer_phone: e.target.value})}
                className="w-full px-3 py-2.5 bg-background rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Email</label>
              <input value={invoice.customer_email || ''} onChange={e => setInvoice({...invoice, customer_email: e.target.value})}
                className="w-full px-3 py-2.5 bg-background rounded-lg text-sm focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Billing Address</label>
              <textarea value={invoice.billing_address || invoice.customer_address || ''} onChange={e => setInvoice({...invoice, billing_address: e.target.value, customer_address: e.target.value})}
                rows={2} className="w-full px-3 py-2.5 bg-background rounded-lg text-sm resize-none focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Shipping Address</label>
              <textarea value={invoice.shipping_address || ''} onChange={e => setInvoice({...invoice, shipping_address: e.target.value})}
                rows={2} className="w-full px-3 py-2.5 bg-background rounded-lg text-sm resize-none focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Line Items</p>
            <div className="flex gap-2">
              {products.length > 0 && (
                <div className="relative group">
                  <button className="px-3 py-1.5 text-[10px] border border-border rounded-lg flex items-center gap-1 hover:bg-muted transition-colors">
                    <Package size={10} /> From Products <ChevronDown size={10} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-64 max-h-48 overflow-y-auto bg-background border border-border rounded-xl shadow-lg z-10 hidden group-hover:block">
                    {products.slice(0, 20).map(p => (
                      <button key={p.id} onClick={() => addProductToItems(p)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex justify-between">
                        <span className="truncate">{p.name}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">₹{p.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={addItem} className="px-3 py-1.5 text-[10px] bg-foreground text-background rounded-lg flex items-center gap-1">
                <Plus size={10} /> Add Row
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-[10px] uppercase text-muted-foreground font-medium w-[30%]">Description</th>
                  <th className="text-left py-2 text-[10px] uppercase text-muted-foreground font-medium w-[10%]">HSN</th>
                  <th className="text-right py-2 text-[10px] uppercase text-muted-foreground font-medium w-[10%]">Qty</th>
                  <th className="text-center py-2 text-[10px] uppercase text-muted-foreground font-medium w-[8%]">Unit</th>
                  <th className="text-right py-2 text-[10px] uppercase text-muted-foreground font-medium w-[12%]">Rate</th>
                  <th className="text-right py-2 text-[10px] uppercase text-muted-foreground font-medium w-[8%]">Tax%</th>
                  <th className="text-right py-2 text-[10px] uppercase text-muted-foreground font-medium w-[14%]">Total</th>
                  <th className="w-[8%]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5">
                      <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 bg-muted rounded text-xs focus:outline-none" placeholder="Item description" />
                    </td>
                    <td className="py-1.5">
                      <input value={item.hsn_code || ''} onChange={e => updateItem(i, 'hsn_code', e.target.value)}
                        className="w-full px-2 py-1.5 bg-muted rounded text-xs focus:outline-none" />
                    </td>
                    <td className="py-1.5">
                      <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-muted rounded text-xs text-right focus:outline-none" />
                    </td>
                    <td className="py-1.5">
                      <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                        className="w-full px-1 py-1.5 bg-muted rounded text-xs focus:outline-none">
                        <option>sqft</option><option>sqm</option><option>piece</option><option>box</option><option>slab</option>
                      </select>
                    </td>
                    <td className="py-1.5">
                      <input type="number" value={item.rate} onChange={e => updateItem(i, 'rate', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-muted rounded text-xs text-right focus:outline-none" />
                    </td>
                    <td className="py-1.5">
                      <input type="number" value={item.tax_rate} onChange={e => updateItem(i, 'tax_rate', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-muted rounded text-xs text-right focus:outline-none" />
                    </td>
                    <td className="py-1.5 text-right text-xs font-medium pr-2">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-1.5">
                      <button onClick={() => removeItem(i)} className="p-1 text-muted-foreground hover:text-destructive"><X size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax & Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Notes</label>
              <textarea value={invoice.notes || ''} onChange={e => setInvoice({...invoice, notes: e.target.value})}
                rows={3} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Terms & Conditions</label>
              <textarea value={invoice.terms || ''} onChange={e => setInvoice({...invoice, terms: e.target.value})}
                rows={3} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none" />
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex-1">Discount</span>
              <input type="number" value={invoice.discount_percent || 0} onChange={e => { setInvoice({...invoice, discount_percent: Number(e.target.value)}); setTimeout(() => recalcTotals(items), 0); }}
                className="w-16 px-2 py-1 bg-muted rounded text-xs text-right focus:outline-none" />
              <span className="text-xs text-muted-foreground">%</span>
              <span className="text-sm w-28 text-right">-₹{(invoice.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {invoice.invoice_type === 'gst_invoice' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1">CGST</span>
                  <input type="number" value={invoice.cgst_rate || 0} onChange={e => { setInvoice({...invoice, cgst_rate: Number(e.target.value)}); setTimeout(() => recalcTotals(items), 0); }}
                    className="w-16 px-2 py-1 bg-muted rounded text-xs text-right focus:outline-none" />
                  <span className="text-xs text-muted-foreground">%</span>
                  <span className="text-sm w-28 text-right">₹{(invoice.cgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1">SGST</span>
                  <input type="number" value={invoice.sgst_rate || 0} onChange={e => { setInvoice({...invoice, sgst_rate: Number(e.target.value)}); setTimeout(() => recalcTotals(items), 0); }}
                    className="w-16 px-2 py-1 bg-muted rounded text-xs text-right focus:outline-none" />
                  <span className="text-xs text-muted-foreground">%</span>
                  <span className="text-sm w-28 text-right">₹{(invoice.sgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1">IGST</span>
                  <input type="number" value={invoice.igst_rate || 0} onChange={e => { setInvoice({...invoice, igst_rate: Number(e.target.value)}); setTimeout(() => recalcTotals(items), 0); }}
                    className="w-16 px-2 py-1 bg-muted rounded text-xs text-right focus:outline-none" />
                  <span className="text-xs text-muted-foreground">%</span>
                  <span className="text-sm w-28 text-right">₹{(invoice.igst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-semibold text-base border-t border-border pt-3 mt-3">
              <span>Grand Total</span><span>₹{(invoice.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {invoice.amount_in_words && <p className="text-[10px] text-muted-foreground italic">{invoice.amount_in_words}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ===== LIST =====
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg flex-1">Invoices & Quotations</h2>
        <div className="relative group">
          <button className="px-4 py-2.5 bg-foreground text-background rounded-lg text-xs flex items-center gap-1.5">
            <Plus size={12} /> New <ChevronDown size={10} />
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-xl shadow-lg z-10 hidden group-hover:block">
            {INVOICE_TYPES.map(t => (
              <button key={t.value} onClick={() => newInvoice(t.value)}
                className="w-full text-left px-4 py-2.5 text-xs hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl">
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-muted rounded-xl h-16" />)}</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No invoices yet</p>
          <button onClick={() => newInvoice()} className="mt-3 text-xs text-foreground underline">Create your first quotation</button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {invoices.map(inv => (
            <div key={inv.id} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4 hover:border-ring/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{inv.invoice_number}</p>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                    inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    inv.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-muted text-muted-foreground'
                  }`}>{inv.status}</span>
                  <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {INVOICE_TYPES.find(t => t.value === inv.invoice_type)?.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{inv.customer_name} · {new Date(inv.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <p className="font-medium text-sm shrink-0">₹{inv.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => editInvoice(inv)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit3 size={14} /></button>
                <button onClick={() => exportTally(inv)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Export Tally XML"><Download size={14} /></button>
                <button onClick={() => handleDelete(inv.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper
function Package(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  );
}
