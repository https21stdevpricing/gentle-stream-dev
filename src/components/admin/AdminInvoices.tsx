import { useState, useEffect, useRef } from 'react';
import {
  Plus, Upload, Search, Edit3, Trash2, Save, X, FileText, Loader2, Download,
  Copy, Eye, Printer, ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvoiceItem {
  id?: string;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  discount_percent: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  sort_order: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_gstin: string | null;
  company_gstin: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  subtotal: number | null;
  discount_percent: number | null;
  discount_amount: number | null;
  taxable_amount: number | null;
  cgst_rate: number | null;
  cgst_amount: number | null;
  sgst_rate: number | null;
  sgst_amount: number | null;
  igst_rate: number | null;
  igst_amount: number | null;
  total_tax: number | null;
  grand_total: number | null;
  amount_in_words: string | null;
  status: string | null;
  due_date: string | null;
  notes: string | null;
  terms: string | null;
  payment_terms: string | null;
  tally_exported: boolean | null;
  tally_voucher_number: string | null;
  created_at: string | null;
}

const INVOICE_TYPES = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'proforma', label: 'Proforma Invoice' },
  { value: 'invoice', label: 'GST Invoice' },
  { value: 'credit_note', label: 'Credit Note' },
];

const COMPANY_INFO = {
  name: 'AB Stone World Pvt Ltd',
  gstin: '24AAKCA1234F1Z5',
  address: 'Near Dantali Gam, Dantali, Gujarat 382165',
  phone: '+91 9377521509',
  email: 'Stoneworld1947@gmail.com',
};

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result + ' Only';
}

const emptyItem: InvoiceItem = {
  description: '', hsn_code: '', quantity: 1, unit: 'sqft', rate: 0, amount: 0,
  discount_percent: 0, tax_rate: 18, tax_amount: 0, total: 0, sort_order: 0,
};

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Invoice> | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [search, setSearch] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to load invoices');
    else setInvoices((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadInvoices(); }, []);

  const generateNumber = (type: string) => {
    const prefix = type === 'quotation' ? 'QT' : type === 'proforma' ? 'PI' : type === 'credit_note' ? 'CN' : 'INV';
    return `${prefix}-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
  };

  const startNew = (type: string = 'quotation') => {
    setEditing({
      invoice_type: type,
      invoice_number: generateNumber(type),
      customer_name: '',
      status: 'draft',
      company_gstin: COMPANY_INFO.gstin,
      billing_address: COMPANY_INFO.address,
      cgst_rate: 9,
      sgst_rate: 9,
    });
    setItems([{ ...emptyItem }]);
    setPreviewMode(false);
  };

  const recalc = (updatedItems: InvoiceItem[], inv: Partial<Invoice>) => {
    const calculated = updatedItems.map((item, i) => {
      const amount = item.quantity * item.rate;
      const discountAmt = amount * (item.discount_percent / 100);
      const taxable = amount - discountAmt;
      const tax_amount = taxable * (item.tax_rate / 100);
      const total = taxable + tax_amount;
      return { ...item, amount, tax_amount, total, sort_order: i };
    });

    const subtotal = calculated.reduce((sum, i) => sum + i.amount, 0);
    const discountAmount = inv.discount_percent ? subtotal * ((inv.discount_percent || 0) / 100) : 0;
    const taxableAmount = subtotal - discountAmount;
    
    const isIGST = !!(inv.igst_rate && inv.igst_rate > 0);
    const cgstAmt = isIGST ? 0 : taxableAmount * ((inv.cgst_rate || 9) / 100);
    const sgstAmt = isIGST ? 0 : taxableAmount * ((inv.sgst_rate || 9) / 100);
    const igstAmt = isIGST ? taxableAmount * ((inv.igst_rate || 18) / 100) : 0;
    const totalTax = cgstAmt + sgstAmt + igstAmt;
    const grandTotal = taxableAmount + totalTax;

    setItems(calculated);
    setEditing(prev => ({
      ...prev,
      subtotal: Math.round(subtotal * 100) / 100,
      discount_amount: Math.round(discountAmount * 100) / 100,
      taxable_amount: Math.round(taxableAmount * 100) / 100,
      cgst_amount: Math.round(cgstAmt * 100) / 100,
      sgst_amount: Math.round(sgstAmt * 100) / 100,
      igst_amount: Math.round(igstAmt * 100) / 100,
      total_tax: Math.round(totalTax * 100) / 100,
      grand_total: Math.round(grandTotal * 100) / 100,
      amount_in_words: numberToWords(Math.round(grandTotal * 100) / 100),
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    recalc(updated, editing || {});
  };

  const addItem = () => {
    const updated = [...items, { ...emptyItem, sort_order: items.length }];
    recalc(updated, editing || {});
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    recalc(updated, editing || {});
  };

  const handleSave = async () => {
    if (!editing?.customer_name) { toast.error('Customer name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        invoice_number: editing.invoice_number || generateNumber(editing.invoice_type || 'quotation'),
        invoice_type: editing.invoice_type || 'quotation',
        customer_name: editing.customer_name,
        customer_email: editing.customer_email || null,
        customer_phone: editing.customer_phone || null,
        customer_address: editing.customer_address || null,
        customer_gstin: editing.customer_gstin || null,
        company_gstin: editing.company_gstin || COMPANY_INFO.gstin,
        billing_address: editing.billing_address || null,
        shipping_address: editing.shipping_address || null,
        subtotal: editing.subtotal || 0,
        discount_percent: editing.discount_percent || 0,
        discount_amount: editing.discount_amount || 0,
        taxable_amount: editing.taxable_amount || 0,
        cgst_rate: editing.cgst_rate || 0,
        cgst_amount: editing.cgst_amount || 0,
        sgst_rate: editing.sgst_rate || 0,
        sgst_amount: editing.sgst_amount || 0,
        igst_rate: editing.igst_rate || 0,
        igst_amount: editing.igst_amount || 0,
        total_tax: editing.total_tax || 0,
        grand_total: editing.grand_total || 0,
        amount_in_words: editing.amount_in_words || '',
        status: editing.status || 'draft',
        due_date: editing.due_date || null,
        notes: editing.notes || null,
        terms: editing.terms || null,
        payment_terms: editing.payment_terms || null,
      };

      let invoiceId: string;
      if (editing.id) {
        const { error } = await supabase.from('invoices').update(payload).eq('id', editing.id);
        if (error) throw error;
        invoiceId = editing.id;
        // Delete old items
        await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
      } else {
        const { data, error } = await supabase.from('invoices').insert(payload).select().single();
        if (error) throw error;
        invoiceId = (data as any).id;
      }

      // Insert items
      if (items.length > 0) {
        const itemPayload = items.map(item => ({
          invoice_id: invoiceId,
          description: item.description,
          hsn_code: item.hsn_code || null,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.rate,
          amount: item.amount,
          discount_percent: item.discount_percent,
          tax_rate: item.tax_rate,
          tax_amount: item.tax_amount,
          total: item.total,
          sort_order: item.sort_order,
        }));
        const { error } = await supabase.from('invoice_items').insert(itemPayload);
        if (error) throw error;
      }

      toast.success(editing.id ? 'Invoice updated' : 'Invoice created');
      setEditing(null);
      setItems([]);
      loadInvoices();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else { toast.success('Deleted'); loadInvoices(); }
  };

  const loadInvoiceForEdit = async (inv: Invoice) => {
    setEditing(inv);
    const { data } = await supabase.from('invoice_items').select('*').eq('invoice_id', inv.id).order('sort_order');
    setItems((data as any) || []);
    setPreviewMode(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'parse_invoice');

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
      const parsed = result.data;

      setEditing({
        invoice_number: parsed.invoice_number || generateNumber(parsed.invoice_type || 'invoice'),
        invoice_type: parsed.invoice_type || 'invoice',
        customer_name: parsed.customer_name || '',
        customer_address: parsed.customer_address || null,
        customer_gstin: parsed.customer_gstin || null,
        customer_phone: parsed.customer_phone || null,
        customer_email: parsed.customer_email || null,
        company_gstin: parsed.company_gstin || COMPANY_INFO.gstin,
        status: 'draft',
        subtotal: parsed.subtotal || 0,
        cgst_rate: parsed.cgst_rate || 9,
        cgst_amount: parsed.cgst_amount || 0,
        sgst_rate: parsed.sgst_rate || 9,
        sgst_amount: parsed.sgst_amount || 0,
        igst_rate: parsed.igst_rate || 0,
        igst_amount: parsed.igst_amount || 0,
        total_tax: parsed.total_tax || 0,
        grand_total: parsed.grand_total || 0,
        notes: parsed.notes || null,
        terms: parsed.terms || null,
        payment_terms: parsed.payment_terms || null,
      });

      const parsedItems = (parsed.items || []).map((item: any, i: number) => ({
        description: item.description || '',
        hsn_code: item.hsn_code || '',
        quantity: item.quantity || 1,
        unit: item.unit || 'sqft',
        rate: item.rate || 0,
        amount: item.amount || 0,
        discount_percent: 0,
        tax_rate: item.tax_rate || 18,
        tax_amount: 0,
        total: 0,
        sort_order: i,
      }));
      setItems(parsedItems);
      recalc(parsedItems, editing || {});
      toast.success('Invoice parsed! Review and save.');
    } catch (err: any) {
      toast.error(err.message || 'Parse failed');
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const exportTallyXML = (inv: Invoice) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${inv.invoice_type === 'invoice' ? 'Sales' : 'Quotation'}" ACTION="Create">
            <VOUCHERNUMBER>${inv.invoice_number}</VOUCHERNUMBER>
            <DATE>${inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10).replace(/-/g, '') : ''}</DATE>
            <PARTYNAME>${inv.customer_name}</PARTYNAME>
            <PARTYLEDGERNAME>${inv.customer_name}</PARTYLEDGERNAME>
            <GSTIN>${inv.customer_gstin || ''}</GSTIN>
            <AMOUNT>${inv.grand_total || 0}</AMOUNT>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoice_number}_tally.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tally XML exported');
  };

  const printInvoice = () => {
    setPreviewMode(true);
    setTimeout(() => window.print(), 500);
  };

  // Invoice Editor
  if (editing) {
    if (previewMode) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-4 print:hidden">
            <button onClick={() => setPreviewMode(false)} className="flex items-center gap-1.5 px-4 py-2 bg-muted rounded-lg text-sm"><X size={14} /> Back to Edit</button>
            <button onClick={printInvoice} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-lg text-sm"><Printer size={14} /> Print</button>
          </div>
          
          {/* Print Preview */}
          <div className="bg-white p-8 rounded-lg border border-border shadow-sm print:shadow-none print:border-none" id="invoice-print">
            <div className="flex justify-between items-start mb-8">
              <div>
                <img src="/images/sw-logo.png" alt="Stone World" className="h-10 mb-2" />
                <p className="text-xs text-muted-foreground">{COMPANY_INFO.address}</p>
                <p className="text-xs text-muted-foreground">{COMPANY_INFO.phone} | {COMPANY_INFO.email}</p>
                <p className="text-xs text-muted-foreground">GSTIN: {editing.company_gstin}</p>
              </div>
              <div className="text-right">
                <h1 className="text-xl font-bold uppercase tracking-wider">
                  {INVOICE_TYPES.find(t => t.value === editing.invoice_type)?.label || 'Quotation'}
                </h1>
                <p className="text-sm font-medium mt-1">{editing.invoice_number}</p>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Bill To</p>
                <p className="font-semibold text-sm">{editing.customer_name}</p>
                {editing.customer_address && <p className="text-xs text-muted-foreground">{editing.customer_address}</p>}
                {editing.customer_gstin && <p className="text-xs text-muted-foreground">GSTIN: {editing.customer_gstin}</p>}
                {editing.customer_phone && <p className="text-xs text-muted-foreground">{editing.customer_phone}</p>}
              </div>
              {editing.shipping_address && (
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Ship To</p>
                  <p className="text-xs text-muted-foreground">{editing.shipping_address}</p>
                </div>
              )}
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="text-left py-2 font-semibold">#</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                  <th className="text-left py-2 font-semibold">HSN</th>
                  <th className="text-right py-2 font-semibold">Qty</th>
                  <th className="text-right py-2 font-semibold">Rate</th>
                  <th className="text-right py-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-muted-foreground">{item.hsn_code}</td>
                    <td className="py-2 text-right">{item.quantity} {item.unit}</td>
                    <td className="py-2 text-right">₹{item.rate.toFixed(2)}</td>
                    <td className="py-2 text-right">₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-72 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{(editing.subtotal || 0).toFixed(2)}</span></div>
                {(editing.discount_amount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount ({editing.discount_percent}%)</span><span>-₹{(editing.discount_amount || 0).toFixed(2)}</span></div>}
                {(editing.cgst_amount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">CGST ({editing.cgst_rate}%)</span><span>₹{(editing.cgst_amount || 0).toFixed(2)}</span></div>}
                {(editing.sgst_amount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">SGST ({editing.sgst_rate}%)</span><span>₹{(editing.sgst_amount || 0).toFixed(2)}</span></div>}
                {(editing.igst_amount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">IGST ({editing.igst_rate}%)</span><span>₹{(editing.igst_amount || 0).toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-base pt-2 border-t-2 border-foreground">
                  <span>Grand Total</span><span>₹{(editing.grand_total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {editing.amount_in_words && (
              <p className="text-xs mt-4 italic text-muted-foreground">Amount in words: {editing.amount_in_words}</p>
            )}

            {editing.terms && <div className="mt-6 pt-4 border-t border-border/40"><p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Terms & Conditions</p><p className="text-xs text-muted-foreground whitespace-pre-wrap">{editing.terms}</p></div>}
            {editing.notes && <div className="mt-3"><p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Notes</p><p className="text-xs text-muted-foreground whitespace-pre-wrap">{editing.notes}</p></div>}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg">{editing.id ? 'Edit' : 'New'} {INVOICE_TYPES.find(t => t.value === editing.invoice_type)?.label || 'Document'}</h2>
          <div className="flex gap-2">
            <button onClick={() => setPreviewMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-[12px] font-medium"><Eye size={13} /> Preview</button>
            <button onClick={() => { setEditing(null); setItems([]); }} className="p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Doc Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Info</h3>
            <select value={editing.invoice_type || 'quotation'} onChange={e => setEditing({ ...editing, invoice_type: e.target.value, invoice_number: generateNumber(e.target.value) })}
              className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {INVOICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input value={editing.invoice_number || ''} onChange={e => setEditing({ ...editing, invoice_number: e.target.value })}
              placeholder="Document Number" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <select value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value })}
              className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {['draft', 'sent', 'paid', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          {/* Customer */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</h3>
            <input value={editing.customer_name || ''} onChange={e => setEditing({ ...editing, customer_name: e.target.value })}
              placeholder="Customer Name *" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <div className="grid grid-cols-2 gap-2">
              <input value={editing.customer_phone || ''} onChange={e => setEditing({ ...editing, customer_phone: e.target.value })}
                placeholder="Phone" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input value={editing.customer_email || ''} onChange={e => setEditing({ ...editing, customer_email: e.target.value })}
                placeholder="Email" className="px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <textarea value={editing.customer_address || ''} onChange={e => setEditing({ ...editing, customer_address: e.target.value })}
              placeholder="Customer Address" rows={2} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
            <input value={editing.customer_gstin || ''} onChange={e => setEditing({ ...editing, customer_gstin: e.target.value })}
              placeholder="Customer GSTIN" className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Line Items</h3>
            <button onClick={addItem} className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700"><Plus size={12} /> Add Item</button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-3">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-1 text-[10px] text-muted-foreground text-center">{i + 1}</span>
                  <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                    placeholder="Description" className="col-span-3 px-2 py-1.5 bg-background rounded text-sm focus:outline-none" />
                  <input value={item.hsn_code} onChange={e => updateItem(i, 'hsn_code', e.target.value)}
                    placeholder="HSN" className="col-span-1 px-2 py-1.5 bg-background rounded text-sm focus:outline-none" />
                  <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', +e.target.value)}
                    className="col-span-1 px-2 py-1.5 bg-background rounded text-sm text-right focus:outline-none" />
                  <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                    className="col-span-1 px-1 py-1.5 bg-background rounded text-[11px] focus:outline-none">
                    {['sqft', 'piece', 'bag', 'ton', 'meter', 'box'].map(u => <option key={u}>{u}</option>)}
                  </select>
                  <input type="number" value={item.rate} onChange={e => updateItem(i, 'rate', +e.target.value)}
                    placeholder="Rate" className="col-span-2 px-2 py-1.5 bg-background rounded text-sm text-right focus:outline-none" />
                  <span className="col-span-2 text-sm text-right font-medium">₹{item.amount.toFixed(2)}</span>
                  <button onClick={() => removeItem(i)} className="col-span-1 text-destructive hover:text-destructive/80"><X size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax & Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Config</h3>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={editing.cgst_rate || ''} onChange={e => { setEditing({ ...editing, cgst_rate: +e.target.value }); recalc(items, { ...editing, cgst_rate: +e.target.value }); }}
                placeholder="CGST %" className="px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none" />
              <input type="number" value={editing.sgst_rate || ''} onChange={e => { setEditing({ ...editing, sgst_rate: +e.target.value }); recalc(items, { ...editing, sgst_rate: +e.target.value }); }}
                placeholder="SGST %" className="px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none" />
              <input type="number" value={editing.igst_rate || ''} onChange={e => { setEditing({ ...editing, igst_rate: +e.target.value }); recalc(items, { ...editing, igst_rate: +e.target.value }); }}
                placeholder="IGST %" className="px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none" />
            </div>
            <input type="number" value={editing.discount_percent || ''} onChange={e => { setEditing({ ...editing, discount_percent: +e.target.value }); recalc(items, { ...editing, discount_percent: +e.target.value }); }}
              placeholder="Overall Discount %" className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none" />
          </div>

          <div className="bg-muted/30 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{(editing.subtotal || 0).toFixed(2)}</span></div>
            {(editing.discount_amount || 0) > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span>-₹{(editing.discount_amount || 0).toFixed(2)}</span></div>}
            {(editing.cgst_amount || 0) > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">CGST ({editing.cgst_rate}%)</span><span>₹{(editing.cgst_amount || 0).toFixed(2)}</span></div>}
            {(editing.sgst_amount || 0) > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">SGST ({editing.sgst_rate}%)</span><span>₹{(editing.sgst_amount || 0).toFixed(2)}</span></div>}
            {(editing.igst_amount || 0) > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">IGST ({editing.igst_rate}%)</span><span>₹{(editing.igst_amount || 0).toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Grand Total</span><span>₹{(editing.grand_total || 0).toFixed(2)}</span></div>
            {editing.amount_in_words && <p className="text-[10px] italic text-muted-foreground pt-1">{editing.amount_in_words}</p>}
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
            <textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })}
              rows={3} placeholder="Internal notes..." className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Terms & Conditions</h3>
            <textarea value={editing.terms || ''} onChange={e => setEditing({ ...editing, terms: e.target.value })}
              rows={3} placeholder="Payment terms, delivery conditions..." className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/40">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save {INVOICE_TYPES.find(t => t.value === editing.invoice_type)?.label}
          </button>
          <button onClick={() => { setEditing(null); setItems([]); }} className="px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  const filtered = invoices.filter(inv => {
    const s = search.toLowerCase();
    return !s || inv.customer_name.toLowerCase().includes(s) || inv.invoice_number.toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h2 className="font-semibold text-lg">Invoices & Quotations ({invoices.length})</h2>
        <div className="flex gap-2 flex-wrap">
          {INVOICE_TYPES.map(t => (
            <button key={t.value} onClick={() => startNew(t.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-accent rounded-lg text-[11px] font-medium transition-colors">
              <Plus size={12} /> {t.label}
            </button>
          ))}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-medium hover:bg-blue-600 cursor-pointer transition-colors">
            {parsing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {parsing ? 'Parsing...' : 'Import PDF'}
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handlePdfUpload} disabled={parsing} />
          </label>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..." className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-xl p-4"><div className="h-4 bg-muted rounded w-1/3 mb-1" /><div className="h-3 bg-muted rounded w-1/2" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No invoices yet.</p>
          <button onClick={() => startNew('quotation')} className="mt-3 text-blue-600 text-sm hover:underline">Create your first quotation</button>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(inv => (
            <div key={inv.id} className="flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-accent/50 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{inv.invoice_number}</p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                    inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    inv.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'
                  }`}>{inv.status}</span>
                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                    {INVOICE_TYPES.find(t => t.value === inv.invoice_type)?.label}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">{inv.customer_name} • {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : ''}</p>
              </div>
              <p className="font-semibold text-sm shrink-0">₹{(inv.grand_total || 0).toLocaleString('en-IN')}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => loadInvoiceForEdit(inv)} className="p-1.5 hover:bg-muted rounded-lg"><Edit3 size={13} /></button>
                <button onClick={() => exportTallyXML(inv)} className="p-1.5 hover:bg-muted rounded-lg" title="Export Tally XML"><Download size={13} /></button>
                <button onClick={() => handleDelete(inv.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
