import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInquiries } from '@/utils/api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminSidebar, { type AdminView } from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminInquiries from '@/components/admin/AdminInquiries';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminInvoices from '@/components/admin/AdminInvoices';
import AdminBlog from '@/components/admin/AdminBlog';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminEmployees from '@/components/admin/AdminEmployees';
import AdminInventory from '@/components/admin/AdminInventory';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  product_interest: string | null;
  purpose: string | null;
  material: string | null;
  project_type: string | null;
  area: string | null;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<AdminView>('overview');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const loadInquiries = () => {
    setLoadingInquiries(true);
    getInquiries()
      .then(data => setInquiries(data || []))
      .catch(() => toast.error('Failed to load inquiries'))
      .finally(() => setLoadingInquiries(false));
  };

  const loadCounts = async () => {
    const [{ count: pc }, { count: ic }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('invoices').select('*', { count: 'exact', head: true }),
    ]);
    setProductCount(pc || 0);
    setInvoiceCount(ic || 0);
  };

  useEffect(() => { loadInquiries(); loadCounts(); }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const repliedCount = inquiries.filter(i => i.status === 'replied').length;

  const VIEW_LABELS: Record<AdminView, string> = {
    overview: 'Dashboard',
    inquiries: 'Inquiries',
    products: 'Products',
    invoices: 'Invoices',
    employees: 'Team',
    inventory: 'Inventory',
    blog: 'Blog',
    settings: 'Settings',
  };

  return (
    <div className="flex min-h-screen bg-muted/30" data-testid="admin-dashboard">
      <AdminSidebar
        view={view}
        setView={setView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        newInquiryCount={newCount}
        onLogout={handleLogout}
      />

      <main className="flex-1 md:ml-[280px] min-h-screen">
        <div className="bg-background/80 backdrop-blur-xl sticky top-0 z-20 flex items-center gap-4 px-5 py-3 border-b border-border/20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1 text-muted-foreground"><Menu size={18} /></button>
          <p className="font-medium text-sm">{VIEW_LABELS[view]}</p>
          <Link to="/" className="ml-auto text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1" target="_blank">
            View Site <ExternalLink size={10} />
          </Link>
        </div>

        <div className="p-5 md:p-6">
          {view === 'overview' && (
            <AdminOverview
              totalInquiries={inquiries.length}
              newCount={newCount}
              repliedCount={repliedCount}
              totalProducts={productCount}
              totalInvoices={invoiceCount}
              setView={setView}
            />
          )}
          {view === 'inquiries' && (
            <AdminInquiries
              inquiries={inquiries}
              setInquiries={setInquiries}
              loadingInquiries={loadingInquiries}
              loadInquiries={loadInquiries}
            />
          )}
          {view === 'products' && <AdminProducts />}
          {view === 'invoices' && <AdminInvoices />}
          {view === 'employees' && <AdminEmployees />}
          {view === 'inventory' && <AdminInventory />}
          {view === 'blog' && <AdminBlog />}
          {view === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}
