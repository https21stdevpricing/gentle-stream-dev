import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Upload, Search, Edit3, Trash2, Save, X, FileText, Loader2, Download,
  Copy, Eye, Printer, ChevronDown, Palette, Layout, Info, HelpCircle,
  IndianRupee, Building2, Phone, Mail, MapPin, Hash, Calendar, Percent,
  Package, FileDown, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────
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
  metadata: any;
}

type TemplateStyle = 'minimal' | 'professional' | 'branded' | 'modern';

// ─── Constants ─────────────────────────────────────────
const INVOICE_TYPES = [
  { value: 'quotation', label: 'Quotation', icon: '📋', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'proforma', label: 'Proforma', icon: '📄', color: 'bg-amber-500/10 text-amber-600' },
  { value: 'invoice', label: 'GST Invoice', icon: '🧾', color: 'bg-emerald-500/10 text-emerald-600' },
  { value: 'credit_note', label: 'Credit Note', icon: '💳', color: 'bg-rose-500/10 text-rose-600' },
];

const UNITS = ['sqft', 'piece', 'bag', 'ton', 'meter', 'box', 'roll', 'nos', 'kg', 'ltr', 'bundle', 'set'];

const COMPANY_INFO = {
  name: 'AB Stone World Pvt Ltd',
  gstin: '24AAKCA1234F1Z5',
  address: 'Near Dantali Gam, Dantali, Gujarat 382165',
  phone: '+91 9377521509',
  email: 'Stoneworld1947@gmail.com',
};

const DEFAULT_TERMS = `1. Prices are subject to change without prior notice.
2. Payment due within 15 days from the date of invoice.
3. Goods once sold will not be taken back.
4. Subject to Ahmedabad jurisdiction.
5. E. & O.E.`;

const FIELD_HINTS: Record<string, string> = {
  customer_name: 'e.g. Rajesh Builders Pvt Ltd',
  customer_phone: 'e.g. +91 98765 43210',
  customer_email: 'e.g. accounts@rajeshbuilders.com',
  customer_address: 'e.g. 45, Industrial Area, Phase 2, Ahmedabad 380015',
  customer_gstin: 'e.g. 24AABCR1234F1Z5 (15 characters)',
  shipping_address: 'e.g. Site: Plot 67, Ring Road, Gandhinagar',
  hsn_code: 'e.g. 6802 (Natural Stone)',
  description: 'e.g. Italian Carrara White Marble 600x600mm',
};

const HSN_SUGGESTIONS = [
  { code: '6802', desc: 'Natural Stone (Marble, Granite)' },
  { code: '6907', desc: 'Ceramic/Vitrified Tiles' },
  { code: '6810', desc: 'Cement Products' },
  { code: '7214', desc: 'TMT Bars / Iron Rods' },
  { code: '8544', desc: 'Wires & Cables' },
  { code: '6910', desc: 'Sanitaryware' },
  { code: '6803', desc: 'Slate / Processed Stone' },
  { code: '2523', desc: 'Cement' },
];

const TEMPLATES: { id: TemplateStyle; name: string; desc: string }[] = [
  { id: 'minimal', name: 'Minimal', desc: 'Clean & simple' },
  { id: 'professional', name: 'Professional', desc: 'Corporate feel' },
  { id: 'branded', name: 'Stone World', desc: 'Full branding' },
  { id: 'modern', name: 'Modern', desc: 'Bold & sleek' },
];

// ─── Helpers ───────────────────────────────────────────
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

// ─── Reusable Field Component ──────────────────────────
function Field({ label, hint, icon: Icon, children, className = '' }: {
  label: string; hint?: string; icon?: any; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {Icon && <Icon size={11} />}
        {label}
        {hint && (
          <span className="relative group cursor-help">
            <HelpCircle size={10} className="text-muted-foreground/50" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {hint}
            </span>
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 bg-muted/60 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/40";
const selectCls = "w-full px-3 py-2.5 bg-muted/60 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Invoice> | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [search, setSearch] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [template, setTemplate] = useState<TemplateStyle>('branded');
  const [showTemplateBar, setShowTemplateBar] = useState(false);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [showHsnSuggestions, setShowHsnSuggestions] = useState<number | null>(null);
  const [tab, setTab] = useState<'details' | 'items' | 'tax' | 'notes'>('details');
  const fileRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  // ─── Data Loading ───────────────────────────────────
  const loadInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices((data as any) || []);
    } catch (err: any) {
      toast.error('Failed to load invoices: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  // ─── Number Generation ──────────────────────────────
  const generateNumber = (type: string) => {
    const prefix = type === 'quotation' ? 'QT' : type === 'proforma' ? 'PI' : type === 'credit_note' ? 'CN' : 'INV';
    const d = new Date();
    return `SW/${prefix}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(invoices.length + 1).padStart(4, '0')}`;
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
      terms: DEFAULT_TERMS,
      payment_terms: 'Payment due within 15 days',
      metadata: { template, customBg: null },
    });
    setItems([{ ...emptyItem }]);
    setPreviewMode(false);
    setTab('details');
  };

  // ─── Recalculation ──────────────────────────────────
  const recalc = useCallback((updatedItems: InvoiceItem[], inv: Partial<Invoice>) => {
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
  }, []);

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    recalc(updated, editing || {});
  };

  const addItem = () => recalc([...items, { ...emptyItem, sort_order: items.length }], editing || {});
  const removeItem = (index: number) => recalc(items.filter((_, i) => i !== index), editing || {});
  const duplicateItem = (index: number) => {
    const dup = { ...items[index], id: undefined };
    recalc([...items.slice(0, index + 1), dup, ...items.slice(index + 1)], editing || {});
  };

  // ─── Save ───────────────────────────────────────────
  const handleSave = async () => {
    if (!editing?.customer_name?.trim()) { toast.error('Customer name is required'); return; }
    if (items.length === 0 || !items.some(i => i.description.trim())) { toast.error('Add at least one line item'); return; }
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
        metadata: { template, customBg },
      };

      let invoiceId: string;
      if (editing.id) {
        const { error } = await supabase.from('invoices').update(payload).eq('id', editing.id);
        if (error) throw error;
        invoiceId = editing.id;
        await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
      } else {
        const { data, error } = await supabase.from('invoices').insert(payload).select().single();
        if (error) throw error;
        invoiceId = (data as any).id;
      }

      if (items.filter(i => i.description.trim()).length > 0) {
        const itemPayload = items.filter(i => i.description.trim()).map(item => ({
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

      toast.success(editing.id ? 'Updated successfully!' : 'Created successfully!');
      setEditing(null);
      setItems([]);
      loadInvoices();
    } catch (e: any) {
      toast.error('Save failed: ' + (e.message || 'Unknown error'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice permanently?')) return;
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else { toast.success('Deleted'); loadInvoices(); }
  };

  const loadInvoiceForEdit = async (inv: Invoice) => {
    const meta = inv.metadata as any;
    if (meta?.template) setTemplate(meta.template);
    if (meta?.customBg) setCustomBg(meta.customBg);
    setEditing(inv);
    const { data } = await supabase.from('invoice_items').select('*').eq('invoice_id', inv.id).order('sort_order');
    setItems((data as any) || []);
    setPreviewMode(false);
    setTab('details');
  };

  // ─── PDF Import ─────────────────────────────────────
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'parse_invoice');

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-pdf`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
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
        terms: parsed.terms || DEFAULT_TERMS,
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
      setTab('items');
      toast.success(`Parsed! Found ${parsedItems.length} items. Review and save.`);
    } catch (err: any) {
      toast.error(err.message || 'PDF parsing failed');
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ─── Custom Background ─────────────────────────────
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split('.').pop();
      const path = `invoice-templates/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(path);
      setCustomBg(data.publicUrl);
      toast.success('Background uploaded!');
    } catch {
      toast.error('Upload failed');
    }
    if (bgRef.current) bgRef.current.value = '';
  };

  // ─── Tally Export ───────────────────────────────────
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
    a.href = url; a.download = `${inv.invoice_number}_tally.xml`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Tally XML exported');
  };

  const downloadPDF = async () => {
    const el = document.getElementById('invoice-print');
    if (!el) return;
    toast.info('Generating PDF...');
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = Math.min(pdfW / imgW, pdfH / imgH);
      const w = imgW * ratio;
      const h = imgH * ratio;
      const x = (pdfW - w) / 2;
      pdf.addImage(imgData, 'PNG', x, 0, w, h);
      pdf.save(`${editing?.invoice_number || 'invoice'}.pdf`);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF generation failed');
    }
  };

  const printInvoice = () => {
    setPreviewMode(true);
    setTimeout(() => window.print(), 400);
  };

  // ═══════════════════════════════════════════════════
  // PREVIEW RENDER
  // ═══════════════════════════════════════════════════
  const BRAND_PARTNERS = [
    'Astral Pipes', 'Finolex', 'Anchor', 'Hindware', 'CERA', 'Simpolo', 'Somany',
    'Hi-Fi', 'Roff', 'TruFlo', 'UltraTech', 'Jaquar', 'AGL', 'Kohler', 'Kajaria'
  ];

  const renderPreview = () => {
    const t = template;
    const useBrandedLayout = t === 'branded';
    const borderColor = t === 'modern' ? 'border-primary' : t === 'branded' ? 'border-[#00bcd4]' : 'border-border';
    const headerBg = t === 'branded' ? '' :
                     t === 'modern' ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white' :
                     t === 'professional' ? 'bg-muted' : '';

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-4 print:hidden">
          <button onClick={() => setPreviewMode(false)} className="flex items-center gap-1.5 px-4 py-2 bg-muted rounded-xl text-sm hover:bg-accent transition-colors"><X size={14} /> Edit</button>
          <button onClick={downloadPDF} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-all"><Download size={14} /> Download PDF</button>
          <button onClick={printInvoice} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-xl text-sm hover:opacity-90 transition-all"><Printer size={14} /> Print</button>
          <button onClick={() => setShowTemplateBar(!showTemplateBar)} className="flex items-center gap-1.5 px-4 py-2 bg-muted rounded-xl text-sm hover:bg-accent transition-colors"><Palette size={14} /> Template</button>
        </div>

        {showTemplateBar && (
          <div className="flex flex-wrap gap-2 mb-4 print:hidden p-3 bg-muted/50 rounded-xl">
            {TEMPLATES.map(tmpl => (
              <button key={tmpl.id} onClick={() => setTemplate(tmpl.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${template === tmpl.id ? 'bg-foreground text-background shadow-lg' : 'bg-background hover:bg-accent border border-border/40'}`}>
                {tmpl.name}
                <span className="block text-[10px] opacity-70">{tmpl.desc}</span>
              </button>
            ))}
            <label className="px-4 py-2 rounded-xl text-sm bg-background hover:bg-accent border border-dashed border-border cursor-pointer flex items-center gap-1.5 transition-colors">
              <Upload size={12} /> Custom BG
              <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
            </label>
            {customBg && <button onClick={() => setCustomBg(null)} className="text-[11px] text-destructive hover:underline self-center">Remove BG</button>}
          </div>
        )}

        {/* Invoice Preview */}
        <div
          className={`bg-white rounded-2xl shadow-xl border-2 ${borderColor} overflow-hidden print:shadow-none print:border-none print:rounded-none relative`}
          id="invoice-print"
        >
          {/* Custom background at full visibility */}
          {customBg && (
            <div className="absolute inset-0 z-0">
              <img src={customBg} alt="" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Watermark for branded (if no custom bg) */}
          {useBrandedLayout && !customBg && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.04]">
              <img src="/images/sw-logo.png" alt="" className="w-[280px] h-auto" />
            </div>
          )}

          <div className="relative z-10 flex flex-col" style={{ minHeight: '1122px', aspectRatio: '794/1122' }}>
            {/* ─── HEADER ─── */}
            {useBrandedLayout ? (
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-none">STONE</h2>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-none">WORLD</h2>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <img src="/images/sw-logo.png" alt="Stone World" className="h-12 sm:h-14" />
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide">STONE-WORLD.IN</p>
                  </div>
                </div>
                {/* Document type & number below header */}
                <div className="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b-2 border-[#00bcd4]/30">
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-widest text-[#00bcd4]">
                      {INVOICE_TYPES.find(x => x.value === editing?.invoice_type)?.label || 'Quotation'}
                    </h1>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{editing?.invoice_number}</p>
                  </div>
                  <div className="text-left sm:text-right text-[11px] text-slate-500">
                    <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                    {editing?.due_date && <p>Due: {new Date(editing.due_date).toLocaleDateString('en-IN')}</p>}
                    <p>GSTIN: {editing?.company_gstin}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-6 sm:p-8 ${headerBg}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    {t === 'professional' && <img src="/images/sw-logo.png" alt="Stone World" className="h-12 sm:h-14" />}
                    <div>
                      <h2 className={`text-lg sm:text-xl font-bold ${t === 'minimal' ? 'text-foreground' : ''}`}>{COMPANY_INFO.name}</h2>
                      <p className={`text-[11px] ${t === 'minimal' || t === 'professional' ? 'text-muted-foreground' : 'text-white/70'}`}>{COMPANY_INFO.address}</p>
                      <p className={`text-[11px] ${t === 'minimal' || t === 'professional' ? 'text-muted-foreground' : 'text-white/70'}`}>{COMPANY_INFO.phone} | {COMPANY_INFO.email}</p>
                      <p className={`text-[11px] ${t === 'minimal' || t === 'professional' ? 'text-muted-foreground' : 'text-white/70'}`}>GSTIN: {editing?.company_gstin}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-widest ${t === 'minimal' ? 'text-foreground' : ''}`}>
                      {INVOICE_TYPES.find(x => x.value === editing?.invoice_type)?.label || 'Quotation'}
                    </h1>
                    <p className={`text-sm font-semibold mt-1 ${t === 'minimal' || t === 'professional' ? 'text-foreground' : ''}`}>{editing?.invoice_number}</p>
                    <p className={`text-[11px] ${t === 'minimal' || t === 'professional' ? 'text-muted-foreground' : 'text-white/60'}`}>Date: {new Date().toLocaleDateString('en-IN')}</p>
                    {editing?.due_date && <p className={`text-[11px] ${t === 'minimal' || t === 'professional' ? 'text-muted-foreground' : 'text-white/60'}`}>Due: {new Date(editing.due_date).toLocaleDateString('en-IN')}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ─── CONTENT ZONE (middle) ─── */}
            <div className="flex-1 px-6 sm:px-8">
              {/* Customer Info */}
              <div className="py-4">
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl ${customBg ? '' : 'bg-slate-50/80'}`}>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Bill To</p>
                    <p className="font-bold text-sm text-slate-800">{editing?.customer_name}</p>
                    {editing?.customer_address && <p className="text-xs text-slate-500 mt-0.5">{editing.customer_address}</p>}
                    {editing?.customer_gstin && <p className="text-xs text-slate-500">GSTIN: {editing.customer_gstin}</p>}
                    {editing?.customer_phone && <p className="text-xs text-slate-500">{editing.customer_phone}</p>}
                    {editing?.customer_email && <p className="text-xs text-slate-500">{editing.customer_email}</p>}
                  </div>
                  <div>
                    {editing?.shipping_address ? (
                      <>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Ship To</p>
                        <p className="text-xs text-slate-500">{editing.shipping_address}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">From</p>
                        <p className="font-bold text-xs text-slate-700">{COMPANY_INFO.name}</p>
                        <p className="text-xs text-slate-500">{COMPANY_INFO.address}</p>
                        <p className="text-xs text-slate-500">{COMPANY_INFO.phone}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="pb-4 overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className={`${useBrandedLayout ? (customBg ? 'text-[#00838f]' : 'bg-[#00bcd4]/10 text-[#00838f]') : t === 'modern' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <th className="text-left py-2.5 px-3 font-semibold rounded-l-lg text-[11px]">#</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-[11px]">Description</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-[11px]">HSN</th>
                      <th className="text-right py-2.5 px-3 font-semibold text-[11px]">Qty</th>
                      <th className="text-right py-2.5 px-3 font-semibold text-[11px]">Rate (₹)</th>
                      <th className="text-right py-2.5 px-3 font-semibold rounded-r-lg text-[11px]">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="py-2.5 px-3 text-slate-400 text-xs">{i + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 text-xs">{item.description}</td>
                        <td className="py-2.5 px-3 text-slate-400 text-xs">{item.hsn_code}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 text-xs">{item.quantity} {item.unit}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 text-xs">{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800 text-xs">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pb-4">
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-medium text-slate-700">₹{(editing?.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                    {(editing?.discount_amount || 0) > 0 && <div className="flex justify-between text-rose-500"><span>Discount ({editing?.discount_percent}%)</span><span>-₹{(editing?.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                    {(editing?.cgst_amount || 0) > 0 && <div className="flex justify-between text-slate-500"><span>CGST ({editing?.cgst_rate}%)</span><span>₹{(editing?.cgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                    {(editing?.sgst_amount || 0) > 0 && <div className="flex justify-between text-slate-500"><span>SGST ({editing?.sgst_rate}%)</span><span>₹{(editing?.sgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                    {(editing?.igst_amount || 0) > 0 && <div className="flex justify-between text-slate-500"><span>IGST ({editing?.igst_rate}%)</span><span>₹{(editing?.igst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                    <div className={`flex justify-between font-bold text-lg pt-2 mt-1 border-t-2 ${useBrandedLayout ? 'border-[#00bcd4] text-slate-900' : t === 'modern' ? 'border-slate-800 text-slate-900' : 'border-slate-300 text-slate-800'}`}>
                      <span>Grand Total</span><span>₹{(editing?.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
                {editing?.amount_in_words && <p className="text-[11px] mt-3 italic text-slate-400">Amount in words: {editing.amount_in_words}</p>}
              </div>

              {/* Terms & Notes */}
              {(editing?.terms || editing?.notes || editing?.payment_terms) && (
                <div className="py-4 border-t border-slate-100">
                  {editing?.payment_terms && <p className="text-[11px] text-slate-500 mb-2"><span className="font-semibold uppercase text-slate-400">Payment: </span>{editing.payment_terms}</p>}
                  {editing?.terms && <div className="mb-2"><p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Terms & Conditions</p><p className="text-[11px] text-slate-500 whitespace-pre-wrap">{editing.terms}</p></div>}
                  {editing?.notes && <div><p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Notes</p><p className="text-[11px] text-slate-500 whitespace-pre-wrap">{editing.notes}</p></div>}
                </div>
              )}
            </div>

            {/* ─── FOOTER (fixed at bottom) ─── */}
            {useBrandedLayout ? (
              <div className="mt-auto">
                <div className="text-center py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-700">One Stop Solution!</p>
                </div>
                <div className="border-t-2 border-dashed border-slate-300 mx-6" />
                <div className="px-6 py-3">
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                    {BRAND_PARTNERS.map(bp => (
                      <span key={bp} className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{bp}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-auto px-6 sm:px-8 py-3 text-center text-[10px] text-slate-400 border-t border-slate-100">
                Thank you for choosing Stone World — Quality Matters the MOST!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // EDITOR
  // ═══════════════════════════════════════════════════
  if (editing) {
    if (previewMode) return renderPreview();

    const tabs = [
      { id: 'details' as const, label: 'Details', icon: Building2 },
      { id: 'items' as const, label: 'Items', icon: Package },
      { id: 'tax' as const, label: 'Tax & Totals', icon: Percent },
      { id: 'notes' as const, label: 'Notes', icon: FileText },
    ];

    return (
      <div className="max-w-5xl mx-auto">
        {/* Editor Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${INVOICE_TYPES.find(t => t.value === editing.invoice_type)?.color || 'bg-muted'}`}>
              {INVOICE_TYPES.find(t => t.value === editing.invoice_type)?.icon || '📋'}
            </div>
            <div>
              <h2 className="font-semibold text-base">{editing.id ? 'Edit' : 'New'} {INVOICE_TYPES.find(t => t.value === editing.invoice_type)?.label}</h2>
              <p className="text-[11px] text-muted-foreground">{editing.invoice_number}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPreviewMode(true)} className="flex items-center gap-1.5 px-4 py-2 bg-muted rounded-xl text-[12px] font-medium hover:bg-accent transition-colors"><Eye size={13} /> Preview</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-foreground text-background rounded-xl text-[12px] font-medium hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
            <button onClick={() => { setEditing(null); setItems([]); }} className="p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-5 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                tab === t.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <t.icon size={13} /> <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Details */}
        {tab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/30">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><FileText size={12} /> Document</h3>
              <Field label="Type" icon={Layout}>
                <select value={editing.invoice_type || 'quotation'} onChange={e => setEditing({ ...editing, invoice_type: e.target.value, invoice_number: generateNumber(e.target.value) })} className={selectCls}>
                  {INVOICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Number" icon={Hash}>
                <input value={editing.invoice_number || ''} onChange={e => setEditing({ ...editing, invoice_number: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <select value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value })} className={selectCls}>
                    {['draft', 'sent', 'paid', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Due Date" icon={Calendar}>
                  <input type="date" value={editing.due_date || ''} onChange={e => setEditing({ ...editing, due_date: e.target.value })} className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/30">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Building2 size={12} /> Customer</h3>
              <Field label="Customer Name *" icon={Building2} hint={FIELD_HINTS.customer_name}>
                <input value={editing.customer_name || ''} onChange={e => setEditing({ ...editing, customer_name: e.target.value })} placeholder={FIELD_HINTS.customer_name} className={inputCls} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Phone" icon={Phone} hint={FIELD_HINTS.customer_phone}>
                  <input value={editing.customer_phone || ''} onChange={e => setEditing({ ...editing, customer_phone: e.target.value })} placeholder={FIELD_HINTS.customer_phone} className={inputCls} />
                </Field>
                <Field label="Email" icon={Mail} hint={FIELD_HINTS.customer_email}>
                  <input value={editing.customer_email || ''} onChange={e => setEditing({ ...editing, customer_email: e.target.value })} placeholder={FIELD_HINTS.customer_email} className={inputCls} />
                </Field>
              </div>
              <Field label="Address" icon={MapPin} hint={FIELD_HINTS.customer_address}>
                <textarea value={editing.customer_address || ''} onChange={e => setEditing({ ...editing, customer_address: e.target.value })} placeholder={FIELD_HINTS.customer_address} rows={2} className={inputCls + ' resize-none'} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="GSTIN" hint={FIELD_HINTS.customer_gstin}>
                  <input value={editing.customer_gstin || ''} onChange={e => setEditing({ ...editing, customer_gstin: e.target.value })} placeholder={FIELD_HINTS.customer_gstin} className={inputCls} maxLength={15} />
                </Field>
                <Field label="Shipping Address" hint={FIELD_HINTS.shipping_address}>
                  <input value={editing.shipping_address || ''} onChange={e => setEditing({ ...editing, shipping_address: e.target.value })} placeholder={FIELD_HINTS.shipping_address} className={inputCls} />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Items */}
        {tab === 'items' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Package size={12} /> Line Items ({items.length})</h3>
              <button onClick={addItem} className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"><Plus size={14} /> Add Item</button>
            </div>

            {items.map((item, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground/60">ITEM {i + 1}</span>
                  <div className="flex gap-1">
                    <button onClick={() => duplicateItem(i)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors" title="Duplicate"><Copy size={12} /></button>
                    <button onClick={() => removeItem(i)} className="p-1.5 text-destructive/60 hover:text-destructive rounded-lg hover:bg-destructive/5 transition-colors" title="Remove"><Trash2 size={12} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Description" className="sm:col-span-2" hint={FIELD_HINTS.description}>
                    <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder={FIELD_HINTS.description} className={inputCls} />
                  </Field>
                  <Field label="HSN Code" hint={FIELD_HINTS.hsn_code}>
                    <div className="relative">
                      <input value={item.hsn_code} onChange={e => updateItem(i, 'hsn_code', e.target.value)}
                        onFocus={() => setShowHsnSuggestions(i)} onBlur={() => setTimeout(() => setShowHsnSuggestions(null), 200)}
                        placeholder="e.g. 6802" className={inputCls} />
                      {showHsnSuggestions === i && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                          {HSN_SUGGESTIONS.map(h => (
                            <button key={h.code} onMouseDown={() => updateItem(i, 'hsn_code', h.code)}
                              className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex justify-between transition-colors">
                              <span className="font-mono font-medium">{h.code}</span>
                              <span className="text-[11px] text-muted-foreground">{h.desc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>
                  <Field label="Unit">
                    <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className={selectCls}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="Quantity">
                    <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', +e.target.value || 0)} min={0} className={inputCls} />
                  </Field>
                  <Field label="Rate (₹)">
                    <input type="number" value={item.rate} onChange={e => updateItem(i, 'rate', +e.target.value || 0)} min={0} className={inputCls} />
                  </Field>
                  <Field label="Tax %">
                    <select value={item.tax_rate} onChange={e => updateItem(i, 'tax_rate', +e.target.value)} className={selectCls}>
                      {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </Field>
                  <Field label="Amount">
                    <div className="flex items-center h-[42px] px-3 bg-muted/30 rounded-xl text-sm font-semibold text-foreground">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </Field>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border/40">
                <Package size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No items yet</p>
                <button onClick={addItem} className="mt-2 text-primary text-sm hover:underline">Add your first item</button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Tax & Totals */}
        {tab === 'tax' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/30">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tax Configuration</h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Info size={11} /> Use CGST+SGST for intra-state, or IGST for inter-state sales.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="CGST %">
                  <input type="number" value={editing.cgst_rate || ''} onChange={e => { const v = +e.target.value; setEditing(p => ({ ...p, cgst_rate: v })); recalc(items, { ...editing, cgst_rate: v }); }}
                    placeholder="9" className={inputCls} />
                </Field>
                <Field label="SGST %">
                  <input type="number" value={editing.sgst_rate || ''} onChange={e => { const v = +e.target.value; setEditing(p => ({ ...p, sgst_rate: v })); recalc(items, { ...editing, sgst_rate: v }); }}
                    placeholder="9" className={inputCls} />
                </Field>
                <Field label="IGST % (interstate)">
                  <input type="number" value={editing.igst_rate || ''} onChange={e => { const v = +e.target.value; setEditing(p => ({ ...p, igst_rate: v })); recalc(items, { ...editing, igst_rate: v }); }}
                    placeholder="0" className={inputCls} />
                </Field>
              </div>
              <Field label="Overall Discount %">
                <input type="number" value={editing.discount_percent || ''} onChange={e => { const v = +e.target.value; setEditing(p => ({ ...p, discount_percent: v })); recalc(items, { ...editing, discount_percent: v }); }}
                  placeholder="0" className={inputCls} />
              </Field>
            </div>

            <div className="p-5 bg-gradient-to-br from-card to-muted/20 rounded-2xl border border-border/30">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₹{(editing.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                {(editing.discount_amount || 0) > 0 && <div className="flex justify-between text-rose-500"><span>Discount ({editing.discount_percent}%)</span><span>-₹{(editing.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                {(editing.cgst_amount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">CGST ({editing.cgst_rate}%)</span><span>₹{(editing.cgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                {(editing.sgst_amount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">SGST ({editing.sgst_rate}%)</span><span>₹{(editing.sgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                {(editing.igst_amount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">IGST ({editing.igst_rate}%)</span><span>₹{(editing.igst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
                <div className="flex justify-between font-bold text-lg pt-3 mt-2 border-t-2 border-primary/20">
                  <span>Grand Total</span><span className="text-primary">₹{(editing.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {editing.amount_in_words && <p className="text-[11px] italic text-muted-foreground pt-1">{editing.amount_in_words}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Notes */}
        {tab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/30">
              <Field label="Payment Terms">
                <input value={editing.payment_terms || ''} onChange={e => setEditing({ ...editing, payment_terms: e.target.value })}
                  placeholder="e.g. Payment due within 15 days" className={inputCls} />
              </Field>
              <Field label="Terms & Conditions">
                <textarea value={editing.terms || ''} onChange={e => setEditing({ ...editing, terms: e.target.value })}
                  rows={6} placeholder="Enter terms and conditions..." className={inputCls + ' resize-none'} />
              </Field>
              <button onClick={() => setEditing({ ...editing, terms: DEFAULT_TERMS })} className="text-[11px] text-primary hover:underline flex items-center gap-1"><Sparkles size={11} /> Load default terms</button>
            </div>
            <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/30">
              <Field label="Internal Notes">
                <textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })}
                  rows={4} placeholder="Internal notes (won't show on printed invoice unless you want)..." className={inputCls + ' resize-none'} />
              </Field>
              <div className="p-4 bg-muted/30 rounded-xl">
                <h4 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5"><Palette size={12} /> Template</h4>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(tmpl => (
                    <button key={tmpl.id} onClick={() => setTemplate(tmpl.id)}
                      className={`p-3 rounded-xl text-left text-sm transition-all ${template === tmpl.id ? 'bg-foreground text-background ring-2 ring-primary' : 'bg-background hover:bg-accent border border-border/40'}`}>
                      <span className="font-medium">{tmpl.name}</span>
                      <span className="block text-[10px] opacity-60">{tmpl.desc}</span>
                    </button>
                  ))}
                </div>
                <label className="mt-2 flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-dashed border-border cursor-pointer hover:bg-accent text-sm transition-colors">
                  <Upload size={13} /> Custom background image
                  <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                </label>
                {customBg && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={customBg} alt="" className="w-16 h-10 rounded object-cover border" />
                    <button onClick={() => setCustomBg(null)} className="text-[11px] text-destructive hover:underline">Remove</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions (Mobile) */}
        <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-border/30 sm:hidden">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
          </button>
          <button onClick={() => setPreviewMode(true)} className="flex items-center gap-1.5 px-5 py-3 bg-muted rounded-xl text-sm"><Eye size={14} /> Preview</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // INVOICE LIST
  // ═══════════════════════════════════════════════════
  const filtered = invoices.filter(inv => {
    const s = search.toLowerCase();
    return !s || inv.customer_name.toLowerCase().includes(s) || inv.invoice_number.toLowerCase().includes(s);
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">Invoices & Quotations <span className="text-muted-foreground font-normal text-sm">({invoices.length})</span></h2>
          <label className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[12px] font-medium hover:bg-primary/20 cursor-pointer transition-colors">
            {parsing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {parsing ? 'Parsing...' : 'Import PDF'}
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handlePdfUpload} disabled={parsing} />
          </label>
        </div>

        {/* Quick Create Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INVOICE_TYPES.map(t => (
            <button key={t.value} onClick={() => startNew(t.value)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[12px] font-medium transition-all hover:shadow-md ${t.color} border border-transparent hover:border-current/10`}>
              <span className="text-base">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer or invoice number..." className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-2xl p-4 border border-border/20"><div className="h-4 bg-muted rounded-lg w-1/3 mb-2" /><div className="h-3 bg-muted rounded-lg w-1/2" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/30">
          <FileText size={36} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground text-sm mb-1">No invoices yet</p>
          <p className="text-muted-foreground/60 text-[12px] mb-4">Create your first quotation or invoice</p>
          <button onClick={() => startNew('quotation')} className="px-5 py-2 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-all">
            <Plus size={14} className="inline mr-1.5" /> New Quotation
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => {
            const typeInfo = INVOICE_TYPES.find(t => t.value === inv.invoice_type);
            return (
              <div key={inv.id} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/20 hover:border-border/40 hover:shadow-sm transition-all group">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${typeInfo?.color || 'bg-muted'}`}>
                  {typeInfo?.icon || '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-medium text-sm truncate">{inv.invoice_number}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      inv.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'
                    }`}>{inv.status}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] truncate">{inv.customer_name} • {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : ''}</p>
                </div>
                <p className="font-bold text-sm shrink-0">₹{(inv.grand_total || 0).toLocaleString('en-IN')}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => loadInvoiceForEdit(inv)} className="p-2 hover:bg-muted rounded-xl transition-colors" title="Edit"><Edit3 size={13} /></button>
                  <button onClick={() => exportTallyXML(inv)} className="p-2 hover:bg-muted rounded-xl transition-colors" title="Tally XML"><FileDown size={13} /></button>
                  <button onClick={() => handleDelete(inv.id)} className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors" title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
