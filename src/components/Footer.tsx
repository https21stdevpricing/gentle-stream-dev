import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import type { SiteInfo } from '@/utils/mockData';

interface FooterProps {
  siteInfo?: Partial<SiteInfo>;
}

export default function Footer({ siteInfo = {} }: FooterProps) {
  const {
    company_name = 'Stone World',
    phone1 = '+91 9377521509',
    email = 'Stoneworld1947@gmail.com',
    address = 'Near Dantali Gam, Dantali, Gujarat 382165',
    tagline = 'Quality Matters the MOST!',
  } = siteInfo;

  return (
    <footer className="bg-sw-black text-white" data-testid="footer">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="font-bold text-lg text-white">SW</span>
            <span className="font-semibold text-[15px] tracking-tight text-white">{company_name}</span>
          </div>
          <p className="font-display italic text-white/40 text-sm leading-relaxed mb-6">
            "{tagline}"
          </p>
          <p className="text-white/30 text-xs leading-relaxed">
            AB Stone World Pvt Ltd.<br />
            Est. 2003, Ahmedabad, Gujarat
          </p>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.15em] uppercase text-white/50 mb-6">Navigate</h4>
          <ul className="space-y-3.5">
            {[['/', 'Home'], ['/products', 'Products'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-sm text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group">
                  {label}
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.15em] uppercase text-white/50 mb-6">Products</h4>
          <ul className="space-y-3.5">
            {['Marble', 'Granite', 'Vitrified Tiles', 'Natural Stone', 'Quartz', 'Sanitaryware'].map(cat => (
              <li key={cat}>
                <Link to={`/products?category=${cat}`} className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.15em] uppercase text-white/50 mb-6">Connect</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Phone size={14} className="text-white/40 mt-0.5 shrink-0" strokeWidth={1.5} />
              <a href={`tel:${phone1}`} className="text-sm text-white/60 hover:text-white transition-colors">{phone1}</a>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={14} className="text-white/40 mt-0.5 shrink-0" strokeWidth={1.5} />
              <a href={`mailto:${email}`} className="text-sm text-white/60 hover:text-white transition-colors break-all">{email}</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={14} className="text-white/40 mt-0.5 shrink-0" strokeWidth={1.5} />
              <span className="text-sm text-white/60">{address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} AB Stone World Pvt Ltd. All rights reserved.
          </p>
          <Link to="/admin/login" className="text-white/10 hover:text-white/30 text-xs transition-colors" data-testid="footer-admin-link">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
