import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail, Award, Users, Gem, Building2, Truck, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteInfo } from '@/utils/api';
import { motion } from 'framer-motion';
import type { SiteInfo } from '@/utils/mockData';

const CLIENTS = ['IIM Ahmedabad', 'Motera Stadium', 'Zydus', 'Adani Group', 'Volkswagen', 'Taco Bell', 'HDFC Bank', 'Sun Pharma'];

const VALUES = [
  { icon: Gem, title: 'Premium Quality', desc: 'Every material is hand-selected and quality-tested before it reaches our warehouse.' },
  { icon: ShieldCheck, title: 'Trust & Transparency', desc: 'Honest pricing, genuine materials, and no hidden costs — ever.' },
  { icon: Users, title: 'Customer First', desc: 'From selection to installation guidance, our experts walk with you at every step.' },
  { icon: Truck, title: 'Reliable Supply Chain', desc: 'Direct sourcing from quarries across India, Italy, and Spain ensures consistent availability.' },
];

const TIMELINE = [
  { year: '2003', title: 'Founded', desc: 'AB Stone World Pvt Ltd. started as a small marble trading firm in Gujarat.' },
  { year: '2008', title: 'Expanded Product Line', desc: 'Added granite, tiles, sanitaryware, and construction materials.' },
  { year: '2013', title: '10,000 sqft Warehouse', desc: 'Built our first dedicated warehouse facility in Dantali.' },
  { year: '2018', title: '30,000 sqft Expansion', desc: 'Tripled capacity with a modern warehouse stocking ₹5 Crore+ inventory.' },
  { year: '2023', title: '20 Years & Growing', desc: 'Two decades of trust — now serving residential, commercial, and institutional projects across India.' },
];

export default function About() {
  const [siteInfo, setSiteInfo] = useState<Partial<SiteInfo>>({});

  useEffect(() => {
    getSiteInfo().then(r => setSiteInfo(r.data)).catch(() => {});
    document.title = 'About Us — Stone World | 20+ Years of Surface Excellence';
  }, []);

  const clients = siteInfo.notable_clients?.length ? siteInfo.notable_clients : CLIENTS;

  return (
    <div className="bg-background" data-testid="about-page">
      <Navbar />

      <div className="pt-[48px]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-sw-dark text-center py-24 md:py-36 px-6 mandala-pattern-dark">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(184,134,11,0.2) 0%, transparent 50%)'
          }} />
          <div className="container-sw relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-sw-gold/60 text-[11px] uppercase tracking-[0.3em] font-semibold mb-6">Our Story</p>
              <h1 className="font-semibold text-white leading-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em' }}>
                About <span className="text-gradient-gold">Stone World.</span>
              </h1>
              <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Two decades of surface excellence. Gujarat's most trusted name in premium marble, granite, tiles, and building materials.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 md:py-28 px-6 mandala-pattern">
          <div className="container-wide mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="text-sw-gold text-[11px] uppercase tracking-[0.3em] font-semibold mb-4">Our Beginning</p>
              <h2 className="apple-headline text-2xl md:text-3xl mb-6">From a humble beginning to Gujarat's finest.</h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-5">
                {siteInfo.about_short || "AB Stone World Pvt Ltd. has been delivering premium surface solutions since 2003. We specialize in marble, granite, tiles, natural stone, quartz, sanitaryware, and essential building materials."}
              </p>
              <p className="text-muted-foreground text-base leading-relaxed mb-5">
                {siteInfo.about_full || "From the quarries of Rajasthan to Italian marble halls, we source only the best. Our 30,000 sq.ft. warehouse stocks over ₹5 Crores worth of premium inventory, ready for your project."}
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                We also supply cement, sand, TMT bars, Polycab wires, ceramic products, sinks, and sanitaryware — making us a one-stop destination for all construction and interior needs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            >
              <img
                src="https://images.pexels.com/photos/6568675/pexels-photo-6568675.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Stone World warehouse showing premium marble and granite slabs"
                loading="lazy"
                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 md:py-24 px-6 bg-sw-offwhite">
          <div className="container-sw">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: siteInfo.stat_years || '20+', label: 'Years of Trust' },
                { val: siteInfo.stat_inventory || '₹5 Cr+', label: 'Inventory Value' },
                { val: (siteInfo.stat_warehouse || '30,000') + ' sqft', label: 'Warehouse Space' },
                { val: siteInfo.stat_team || '25+', label: 'Team Members' },
              ].map(({ val, label }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="font-semibold text-3xl md:text-4xl tracking-tight mb-1 text-foreground">{val}</div>
                  <div className="text-muted-foreground text-xs">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28 px-6 bg-background mandala-pattern">
          <div className="container-wide">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <p className="text-sw-gold text-[11px] uppercase tracking-[0.3em] font-semibold mb-4">What We Stand For</p>
              <h2 className="apple-headline text-2xl md:text-3xl">Our Values.</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VALUES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="glass-card rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-sw-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-sm tracking-tight mb-2">{title}</h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 md:py-28 px-6 bg-sw-offwhite">
          <div className="container-sw">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <p className="text-sw-gold text-[11px] uppercase tracking-[0.3em] font-semibold mb-4">Our Journey</p>
              <h2 className="apple-headline text-2xl md:text-3xl">Milestones.</h2>
            </motion.div>
            <div className="space-y-0 relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />
              {TIMELINE.map((t, i) => (
                <motion.div key={t.year} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                  className={`relative flex items-start gap-6 md:gap-12 py-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : ''}`}>
                    <p className="text-sw-gold font-semibold text-lg tracking-tight">{t.year}</p>
                    <h3 className="font-semibold text-base mt-1">{t.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{t.desc}</p>
                  </div>
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-sw-gold border-4 border-sw-offwhite" />
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Warehouse Image */}
        <section className="py-20 md:py-28 px-6 bg-background">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="rounded-3xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80" alt="Modern warehouse with marble slabs" loading="lazy"
                  className="w-full h-full object-cover" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="rounded-3xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80" alt="Luxury marble interior" loading="lazy"
                  className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Clients */}
        <section className="py-16 md:py-24 px-6 bg-sw-dark text-center mandala-pattern-dark" data-testid="clients-section">
          <div className="container-sw">
            <p className="text-sw-gold/60 text-[11px] uppercase tracking-[0.3em] font-semibold mb-6">Trusted Partners</p>
            <h2 className="font-semibold text-white text-2xl tracking-tight mb-8">Trusted by India's Finest.</h2>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {clients.map((c, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="px-4 py-2 glass-dark rounded-full text-white/50 text-sm hover:text-white/80 transition-colors cursor-default"
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Info + CTA */}
        <section className="py-20 md:py-28 px-6 bg-background mandala-pattern">
          <div className="container-sw text-center">
            <h2 className="apple-headline text-2xl md:text-3xl mb-3">Ready to work together?</h2>
            <p className="apple-subhead text-base mb-10 max-w-md mx-auto">Let our experts help you select the perfect surface solution.</p>
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              <Link to="/contact" className="btn-gold text-sm" data-testid="about-contact-btn">
                Get in Touch <ArrowRight size={14} />
              </Link>
              <a href="https://wa.me/919377521509" target="_blank" rel="noreferrer" className="btn-secondary text-sm">
                WhatsApp Us
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
              <span className="flex items-center gap-2"><Phone size={14} className="text-sw-gold" /> {siteInfo.phone1 || '+91 9377521509'}</span>
              <span className="flex items-center gap-2"><Mail size={14} className="text-sw-gold" /> {siteInfo.email || 'Stoneworld1947@gmail.com'}</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-sw-gold" /> {siteInfo.address || 'Near Dantali Gam, Dantali, Gujarat 382165'}</span>
            </div>
          </div>
        </section>
      </div>

      <Footer siteInfo={siteInfo} />
    </div>
  );
}
