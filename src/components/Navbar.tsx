import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isHome = location.pathname === '/';
  const isDark = isHome && !scrolled;

  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isDark ? 'nav-glass-dark' : 'nav-glass shadow-[0_0.5px_0_rgba(0,0,0,0.08)]'
      }`}
      style={{ height: 48 }}
    >
      <div className="max-w-[980px] mx-auto flex items-center justify-between h-full px-5">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2">
          <img src="/images/sw-logo.png" alt="Stone World" className="h-6 w-auto" />
          <span className={`text-[13px] font-semibold tracking-tight hidden sm:inline transition-colors duration-300 ${isDark ? 'text-white' : 'text-foreground'}`}>
            Stone World
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={`text-[12px] font-normal transition-all duration-200 hover:opacity-100 ${
                location.pathname === l.to ? 'opacity-100' : 'opacity-60'
              } ${isDark ? 'text-white' : 'text-foreground'}`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin/dashboard" className={`text-[12px] font-normal opacity-60 hover:opacity-100 transition-opacity ${isDark ? 'text-white' : 'text-foreground'}`}>
              Dashboard
            </Link>
          )}
        </div>

        <Link
          to="/contact"
          data-testid="nav-quote-btn"
          className={`hidden md:inline-flex items-center gap-1.5 text-[12px] font-medium transition-all duration-200 px-4 py-1.5 rounded-full ${
            isDark 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-primary/10 text-foreground hover:bg-primary/20'
          }`}
        >
          Get Quote
        </Link>

        <button
          data-testid="nav-mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-1 transition-colors ${isDark ? 'text-white' : 'text-foreground'}`}
        >
          {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-background border-t border-border/30 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === l.to ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && <Link to="/admin/dashboard" className="text-sm font-medium text-foreground">Dashboard</Link>}
              <Link to="/contact" className="btn-gold self-start text-xs px-6 py-2.5 mt-2">
                Get Quote <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
