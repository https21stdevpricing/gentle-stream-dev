import { ArrowRight } from 'lucide-react';
import type { AdminView } from './AdminSidebar';

interface OverviewProps {
  totalInquiries: number;
  newCount: number;
  repliedCount: number;
  totalProducts: number;
  totalInvoices: number;
  setView: (v: AdminView) => void;
}

export default function AdminOverview({ totalInquiries, newCount, repliedCount, totalProducts, totalInvoices, setView }: OverviewProps) {
  const stats = [
    { label: 'Total Inquiries', value: totalInquiries, color: 'bg-blue-50', onClick: () => setView('inquiries') },
    { label: 'New Inquiries', value: newCount, color: 'bg-orange-50', onClick: () => setView('inquiries') },
    { label: 'Replied', value: repliedCount, color: 'bg-green-50', onClick: () => setView('inquiries') },
    { label: 'Products', value: totalProducts, color: 'bg-purple-50', onClick: () => setView('products') },
    { label: 'Invoices', value: totalInvoices, color: 'bg-amber-50', onClick: () => setView('invoices') },
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl tracking-tight mb-5">Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <button key={s.label} onClick={s.onClick} className={`${s.color} rounded-2xl p-5 text-left hover:ring-2 hover:ring-foreground/10 transition-all`}>
            <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-semibold text-2xl tracking-tight">{s.value}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
