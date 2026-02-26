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

  const productLinks = ['Marble', 'Granite', 'Vitrified Tiles', 'Natural Stone', 'Quartz', 'Sanitaryware', 'Cement & Sand', 'TMT Bars'];
  const navLinks = [
    ['/', 'Home'], ['/products', 'Products'], ['/about', 'About'],
    ['/blog', 'Blog'], ['/contact', 'Contact'],
  ];

  return (
    <footer className="bg-sw-offwhite" data-testid="footer">
      <div className="max-w-[980px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[12px]">
          <div>
            <h4 className="font-semibold text-sw-black mb-3">Shop</h4>
            <ul className="space-y-2">
              {productLinks.map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="text-sw-gray hover:text-sw-black transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sw-black mb-3">Company</h4>
            <ul className="space-y-2">
              {navLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sw-gray hover:text-sw-black transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sw-black mb-3">Contact</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <Phone size={12} className="text-sw-gray mt-0.5 shrink-0" />
                <a href={`tel:${phone1}`} className="text-sw-gray hover:text-sw-black transition-colors">{phone1}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={12} className="text-sw-gray mt-0.5 shrink-0" />
                <a href={`mailto:${email}`} className="text-sw-gray hover:text-sw-black transition-colors break-all">{email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={12} className="text-sw-gray mt-0.5 shrink-0" />
                <span className="text-sw-gray">{address}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sw-black mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-sw-gray hover:text-sw-black transition-colors">Blog & Guides</Link></li>
              <li><a href="https://wa.me/919377521509" target="_blank" rel="noreferrer" className="text-sw-gray hover:text-sw-black transition-colors">WhatsApp</a></li>
              <li><Link to="/contact" className="text-sw-gray hover:text-sw-black transition-colors">Request a Quote</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-sw-border/40">
        <div className="max-w-[980px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-sw-gray text-[11px]">
            &copy; {new Date().getFullYear()} AB {company_name} Pvt Ltd. All rights reserved.
          </p>
          <Link to="/admin/login" className="text-sw-gray/30 hover:text-sw-gray/60 text-[11px] transition-colors" data-testid="footer-admin-link">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
