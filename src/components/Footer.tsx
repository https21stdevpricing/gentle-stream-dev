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
  } = siteInfo;

  const productLinks = ['Marble', 'Granite', 'Vitrified Tiles', 'Natural Stone', 'Quartz', 'Sanitaryware'];
  const navLinks: [string, string][] = [
    ['/', 'Home'], ['/products', 'Products'], ['/about', 'About'],
    ['/blog', 'Blog'], ['/contact', 'Contact'],
  ];

  return (
    <footer className="bg-sw-dark text-white/60" data-testid="footer">
      {/* Top border accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--sw-gold)]/30 to-transparent" />
      
      <div className="max-w-[1080px] mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-[12px]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/sw-logo.png" alt="Stone World" className="h-6 w-auto brightness-200" />
              <span className="text-white font-semibold text-sm tracking-tight">{company_name}</span>
            </div>
            <p className="text-white/30 text-[11px] leading-relaxed mb-4">
              Gujarat's most trusted name in premium surfaces and building materials since 2003.
            </p>
            <a href="https://wa.me/919377521509" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sw-gold hover:text-sw-gold-light transition-colors">
              WhatsApp Us <ArrowUpRight size={10} />
            </a>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white/80 mb-4 text-[11px] uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5">
              {productLinks.map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-white transition-colors duration-200">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white/80 mb-4 text-[11px] uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {navLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white transition-colors duration-200">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white/80 mb-4 text-[11px] uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={11} className="mt-0.5 shrink-0 text-white/30" />
                <a href={`tel:${phone1}`} className="hover:text-white transition-colors">{phone1}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={11} className="mt-0.5 shrink-0 text-white/30" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={11} className="mt-0.5 shrink-0 text-white/30" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-[1080px] mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/20 text-[11px]">
            &copy; {new Date().getFullYear()} AB {company_name} Pvt Ltd. All rights reserved.
          </p>
          <Link to="/admin/login" className="text-white/10 hover:text-white/30 text-[11px] transition-colors" data-testid="footer-admin-link">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
