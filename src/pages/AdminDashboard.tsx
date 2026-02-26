import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, Image, Globe, Mail,
  Settings, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Layers },
  { to: '/admin/hero', label: 'Hero Slides', icon: Image },
  { to: '/admin/site-info', label: 'Site Info', icon: Globe },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { adminUser, logoutAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />}

      <aside
        className={`admin-sidebar z-40 flex flex-col transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        data-testid="admin-sidebar"
        style={{ boxShadow: '2px 0 20px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <span className="font-bold text-lg text-sw-black">SW</span>
          <div>
            <p className="font-semibold text-sw-black text-sm leading-none">Stone World</p>
            <p className="text-sw-gray text-xs mt-0.5">Admin Panel</p>
          </div>
          <button onClick={onClose} className="ml-auto md:hidden p-1 text-sw-gray hover:text-sw-black"><X size={18} /></button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname.startsWith(to) && to !== '/admin';
            const isActiveAdmin = to === '/admin' && location.pathname === '/admin';
            const isActive = active || isActiveAdmin;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                data-testid={`admin-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-5 py-2.5 mx-2 rounded-xl text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-sw-black text-white font-medium'
                    : 'text-sw-gray hover:bg-sw-offwhite hover:text-sw-black'
                }`}
              >
                <Icon size={16} strokeWidth={1.5} className={isActive ? 'text-white' : 'text-sw-gray group-hover:text-sw-black'} />
                {label}
                {isActive && <ChevronRight size={13} className="ml-auto text-white/60" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-sw-black rounded-full flex items-center justify-center text-white text-xs font-semibold uppercase">
              {adminUser?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sw-black text-sm font-medium capitalize">{adminUser}</p>
              <p className="text-sw-gray text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function OverviewPanel() {
  return (
    <div>
      <h2 className="font-bold text-sw-black text-2xl tracking-tight mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: '9', color: 'bg-blue-50 text-blue-600' },
          { label: 'Categories', value: '6', color: 'bg-green-50 text-green-600' },
          { label: 'Inquiries', value: '24', color: 'bg-orange-50 text-orange-600' },
          { label: 'This Month', value: '12', color: 'bg-purple-50 text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>
            <p className="text-sw-gray text-xs uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="font-bold text-sw-black text-3xl tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>
        <h3 className="font-semibold text-sw-black text-lg mb-4">Quick Actions</h3>
        <p className="text-sw-gray text-sm">
          This is a frontend-only demo. Connect a backend to manage products, categories, hero slides, and inquiries.
        </p>
      </div>
    </div>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>
      <h2 className="font-bold text-sw-black text-xl tracking-tight mb-3">{title}</h2>
      <p className="text-sw-gray text-sm">
        This panel requires a backend connection to manage data. Connect your API to enable full CRUD operations.
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getContent = () => {
    const path = location.pathname;
    if (path === '/admin') return <OverviewPanel />;
    if (path === '/admin/products') return <PlaceholderPanel title="Product Manager" />;
    if (path === '/admin/categories') return <PlaceholderPanel title="Category Manager" />;
    if (path === '/admin/hero') return <PlaceholderPanel title="Hero Slides Manager" />;
    if (path === '/admin/site-info') return <PlaceholderPanel title="Site Information" />;
    if (path === '/admin/inquiries') return <PlaceholderPanel title="Inquiries" />;
    if (path === '/admin/settings') return <PlaceholderPanel title="Admin Settings" />;
    return <OverviewPanel />;
  };

  return (
    <div className="flex min-h-screen bg-sw-offwhite" data-testid="admin-dashboard">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-[260px] min-h-screen">
        <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-20 flex items-center gap-4 px-5 py-3.5 border-b border-sw-border/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-sw-gray hover:text-sw-black transition-colors"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <p className="font-semibold text-sw-black text-sm">Admin Dashboard</p>
          <Link to="/" className="ml-auto text-xs text-sw-gray hover:text-sw-black transition-colors" target="_blank">
            View Site
          </Link>
        </div>

        <div className="p-5 md:p-8">
          {getContent()}
        </div>
      </main>
    </div>
  );
}
