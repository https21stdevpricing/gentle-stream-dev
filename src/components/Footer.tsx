import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
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
    ['/blog', 'Blog'], ['/support', 'Support'],
  ];

  return (
    <footer className="bg-[#f5f5f7] border-t border-border/30" data-testid="footer">
      <div className="max-w-[980px] mx-auto px-6 pt-10 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[12px]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/images/sw-logo.png" alt="Stone World" className="h-10 w-auto" />
              <span className="text-foreground font-semibold text-sm tracking-tight">{company_name}</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Gujarat's most trusted name in premium surfaces and building materials since 2003.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-foreground/70 mb-3 text-[11px] uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2">
              {productLinks.map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="text-muted-foreground hover:text-foreground transition-colors duration-200">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground/70 mb-3 text-[11px] uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {navLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-muted-foreground hover:text-foreground transition-colors duration-200">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground/70 mb-3 text-[11px] uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone size={11} className="mt-0.5 shrink-0" />
                <a href={`tel:${phone1}`} className="hover:text-foreground transition-colors">{phone1}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={11} className="mt-0.5 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-foreground transition-colors break-all">{email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={11} className="mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/20">
        <div className="max-w-[980px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-muted-foreground/50 text-[11px]">
            &copy; {new Date().getFullYear()} AB {company_name} Pvt Ltd. All rights reserved.
          </p>
          <Link to="/admin/login" className="text-muted-foreground/20 hover:text-muted-foreground/50 text-[11px] transition-colors" data-testid="footer-admin-link">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
