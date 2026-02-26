import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteInfo } from '@/utils/api';
import { motion } from 'framer-motion';
import type { SiteInfo } from '@/utils/mockData';

const DEFAULT_CLIENTS = ['IIM Ahmedabad', 'Motera Stadium', 'Zydus', 'Adani Group', 'Volkswagen', 'Taco Bell', 'HDFC Bank', 'Sun Pharma'];

export default function About() {
  const [siteInfo, setSiteInfo] = useState<Partial<SiteInfo>>({});

  useEffect(() => {
    getSiteInfo().then(r => setSiteInfo(r.data)).catch(() => {});
    document.title = 'About Us — Stone World | 20+ Years of Surface Excellence';
  }, []);

  const clients = siteInfo.notable_clients?.length ? siteInfo.notable_clients : DEFAULT_CLIENTS;

  return (
    <div className="bg-white" data-testid="about-page">
      <Navbar />

      <div className="pt-[44px]">
        {/* Hero */}
        <div className="apple-section">
          <div className="container-sw">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="apple-headline mb-3" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
                About Stone World.
              </h1>
              <p className="apple-subhead text-lg md:text-xl max-w-2xl mx-auto">
                Two decades of surface excellence. Gujarat's most trusted name in premium materials.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Story */}
        <section className="py-16 md:py-24 px-6">
          <div className="container-wide mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="text-sw-gray text-base leading-relaxed mb-5">
                {siteInfo.about_short || "AB Stone World Pvt Ltd. has been delivering premium surface solutions since 2003. We specialize in marble, granite, tiles, natural stone, quartz, sanitaryware, and essential building materials."}
              </p>
              <p className="text-sw-gray text-base leading-relaxed mb-5">
                {siteInfo.about_full || "From the quarries of Rajasthan to Italian marble halls, we source only the best. Our 30,000 sq.ft. warehouse stocks over 5 Crores worth of premium inventory."}
              </p>
              <p className="text-sw-gray text-base leading-relaxed">
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
                className="w-full aspect-[4/3] object-cover rounded-2xl"
              />
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="apple-section bg-sw-offwhite">
          <div className="container-sw">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: siteInfo.stat_years || '20+', label: 'Years' },
                { val: siteInfo.stat_inventory || '5 Cr+', label: 'Inventory' },
                { val: (siteInfo.stat_warehouse || '30,000') + ' sqft', label: 'Warehouse' },
                { val: siteInfo.stat_team || '25+', label: 'Team' },
              ].map(({ val, label }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="font-semibold text-3xl md:text-4xl tracking-tight mb-1">{val}</div>
                  <div className="text-sw-gray text-xs">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Clients */}
        <section className="py-16 md:py-24 px-6 bg-black text-center" data-testid="clients-section">
          <div className="container-sw">
            <h2 className="font-semibold text-white text-2xl tracking-tight mb-8">Trusted by India's Finest</h2>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {clients.map((c, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="px-4 py-2 border border-white/10 rounded-full text-white/50 text-sm hover:text-white/80 transition-colors cursor-default"
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="apple-section">
          <div className="container-sw">
            <h2 className="apple-headline text-2xl md:text-3xl mb-3">Ready to work together?</h2>
            <p className="apple-subhead text-base mb-8 max-w-md mx-auto">Let our experts help you select the perfect surface solution.</p>
            <Link to="/contact" className="btn-blue text-sm" data-testid="about-contact-btn">
              Get in Touch <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>

      <Footer siteInfo={siteInfo} />
    </div>
  );
}
