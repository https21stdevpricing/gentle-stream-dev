import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isHome = location.pathname === '/';
  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const textColor = scrolled || !isHome ? 'text-sw-black' : 'text-white';

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome ? 'nav-glass shadow-[0_1px_0_rgba(0,0,0,0.08)]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-14 px-6 md:px-10">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5 group">
          <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${textColor}`}>
            SW
          </span>
          <span className={`font-semibold text-[15px] tracking-tight transition-colors duration-300 ${textColor}`}>
            Stone World
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={`text-xs font-medium tracking-wide transition-opacity duration-200 hover:opacity-60 ${
                location.pathname === l.to ? 'opacity-100' : 'opacity-80'
              } ${textColor}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" data-testid="nav-admin" className={`text-xs font-medium ${textColor} opacity-70 hover:opacity-100 transition-opacity`}>
              Dashboard
            </Link>
          )}
          <Link
            to="/contact"
            data-testid="nav-quote-btn"
            className={`text-xs font-medium px-5 py-2 rounded-full transition-all duration-300 ${
              scrolled || !isHome
                ? 'bg-sw-black text-white hover:bg-black'
                : 'bg-white/15 text-white backdrop-blur-sm border border-white/20 hover:bg-white/25'
            }`}
          >
            Get Quote
          </Link>
        </div>

        <button
          data-testid="nav-mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-1.5 transition-colors ${textColor}`}
        >
          {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden nav-glass border-t border-black/5 px-6 py-6 flex flex-col gap-5">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === l.to ? 'text-sw-black' : 'text-sw-gray hover:text-sw-black'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && <Link to="/admin" className="text-sm font-medium text-sw-black">Dashboard</Link>}
          <Link to="/contact" className="btn-primary self-start text-xs px-6 py-2.5">
            Get Quote <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </nav>
  );
}
