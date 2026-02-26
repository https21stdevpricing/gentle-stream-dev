import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Mail, Package, FileText, X, ChevronRight, LogOut, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export type AdminView = 'overview' | 'inquiries' | 'products' | 'invoices';

interface AdminSidebarProps {
  view: AdminView;
  setView: (v: AdminView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  newInquiryCount: number;
  onLogout: () => void;
}

const NAV_ITEMS: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'inquiries', label: 'Inquiries', icon: Mail },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'invoices', label: 'Invoices', icon: FileText },
];

export default function AdminSidebar({ view, setView, sidebarOpen, setSidebarOpen, newInquiryCount, onLogout }: AdminSidebarProps) {
  const { adminUser } = useAuth();

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside
        className={`admin-sidebar flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ boxShadow: '1px 0 10px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
          <img src="/images/sw-logo.png" alt="Stone World" className="h-7 w-auto" />
          <span className="font-semibold text-sm tracking-tight">Stone World</span>
          <span className="text-muted-foreground text-[11px]">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden p-1 text-muted-foreground"><X size={16} /></button>
        </div>

        <nav className="flex-1 py-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setView(id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full px-5 py-2.5 text-sm transition-all ${
                view === id ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
              {id === 'inquiries' && newInquiryCount > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">{newInquiryCount}</span>
              )}
              {view === id && <ChevronRight size={12} className="ml-auto text-muted-foreground" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-border/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-foreground rounded-full flex items-center justify-center text-background text-[10px] font-semibold uppercase">
              {adminUser?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium capitalize">{adminUser}</p>
              <p className="text-muted-foreground text-[10px]">Administrator</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
