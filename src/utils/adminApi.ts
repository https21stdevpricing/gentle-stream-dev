import { supabase } from '@/integrations/supabase/client';

// ===== PRODUCTS =====
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  material: string | null;
  finish: string | null;
  color: string | null;
  origin: string | null;
  length_mm: number | null;
  width_mm: number | null;
  thickness_mm: number | null;
  weight_kg: number | null;
  unit: string;
  price: number;
  cost_price: number;
  margin_percent: number;
  hsn_code: string | null;
  stock_quantity: number;
  min_stock_level: number;
  supplier: string | null;
  supplier_code: string | null;
  images: string[];
  thumbnail: string | null;
  tags: string[];
  variants: any[];
  specs: Record<string, any>;
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Product[];
};

export const upsertProduct = async (product: Partial<Product>) => {
  if (product.id) {
    const { data, error } = await supabase.from('products').update(product as any).eq('id', product.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('products').insert(product as any).select().single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

export const uploadFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path);
  return urlData.publicUrl;
};

// ===== PDF PARSING =====
export const parsePDF = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/parse-pdf`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: formData,
  });
  if (!res.ok) throw new Error('PDF parsing failed');
  return res.json();
};

// ===== INVOICES =====
export interface Invoice {
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
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_tax: number;
  grand_total: number;
  amount_in_words: string | null;
  notes: string | null;
  terms: string | null;
  payment_terms: string | null;
  due_date: string | null;
  status: string;
  tally_exported: boolean;
  tally_voucher_number: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id?: string | null;
  description: string;
  hsn_code: string | null;
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

export const fetchInvoices = async () => {
  const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Invoice[];
};

export const fetchInvoiceItems = async (invoiceId: string) => {
  const { data, error } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order');
  if (error) throw error;
  return data as InvoiceItem[];
};

export const saveInvoice = async (invoice: Partial<Invoice>, items: InvoiceItem[]) => {
  let invoiceId = invoice.id;
  
  if (invoiceId) {
    const { error } = await supabase.from('invoices').update(invoice as any).eq('id', invoiceId);
    if (error) throw error;
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
  } else {
    const { data, error } = await supabase.from('invoices').insert(invoice as any).select().single();
    if (error) throw error;
    invoiceId = data.id;
  }

  if (items.length > 0) {
    const itemsWithInvoiceId = items.map((item, i) => ({
      ...item,
      invoice_id: invoiceId,
      sort_order: i,
      id: undefined,
    }));
    const { error } = await supabase.from('invoice_items').insert(itemsWithInvoiceId);
    if (error) throw error;
  }

  return invoiceId;
};

export const deleteInvoice = async (id: string) => {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw error;
};

export const parseInvoicePDF = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/parse-invoice`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Invoice parsing failed');
  return res.json();
};

// ===== TALLY EXPORT =====
export const generateTallyXML = (invoice: Invoice, items: InvoiceItem[]): string => {
  const date = new Date(invoice.created_at);
  const tallyDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  const ledgerEntries = items.map(item => `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${item.description}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${item.amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>`).join('');

  const taxEntry = invoice.total_tax > 0 ? `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${invoice.igst_amount > 0 ? 'IGST' : 'CGST'}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${invoice.igst_amount > 0 ? invoice.igst_amount : invoice.cgst_amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        ${invoice.sgst_amount > 0 ? `<ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>SGST</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${invoice.sgst_amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${invoice.invoice_type === 'gst_invoice' ? 'Sales' : 'Proforma'}" ACTION="Create">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>${invoice.invoice_type === 'gst_invoice' ? 'Sales' : 'Proforma'}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${invoice.invoice_number}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${invoice.customer_name}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${invoice.customer_name}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${invoice.grand_total}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>${ledgerEntries}${taxEntry}
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
};

// ===== NUMBER TO WORDS =====
export const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
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
};
