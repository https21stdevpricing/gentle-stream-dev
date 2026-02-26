import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Target, Heart, Globe, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteInfo } from '@/utils/api';
import { motion } from 'framer-motion';
import type { SiteInfo } from '@/utils/mockData';

const VALUES = [
  { icon: Award, title: 'Quality First', desc: 'Every product passes our rigorous quality standards from quarry to installation.' },
  { icon: Target, title: 'Precision', desc: 'Exact dimensions, perfect finishes, and on-time delivery — every single time.' },
  { icon: Heart, title: 'Customer Care', desc: 'Personalized support from selection to installation by our expert team.' },
  { icon: Globe, title: 'Sustainability', desc: 'Responsible sourcing that respects the earth while delivering enduring beauty.' },
];

const DEFAULT_CLIENTS = ['IIM Ahmedabad', 'Motera Stadium', 'Zydus', 'Adani Group', 'Volkswagen', 'Taco Bell', 'HDFC Bank', 'Sun Pharma'];

export default function About() {
  const [siteInfo, setSiteInfo] = useState<Partial<SiteInfo>>({});

  useEffect(() => {
    getSiteInfo().then(r => setSiteInfo(r.data)).catch(() => {});
    document.title = 'About Us — Stone World';
  }, []);

  const clients = siteInfo.notable_clients?.length ? siteInfo.notable_clients : DEFAULT_CLIENTS;

  return (
    <div className="bg-white page-enter" data-testid="about-page">
      <Navbar />

      {/* Hero */}
      <div className="relative bg-sw-black pt-32 pb-24 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1600&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">Our Story</p>
          <h1 className="font-bold text-white leading-[0.95] tracking-tight max-w-2xl mb-6" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
            Two Decades of Stone Excellence
          </h1>
          <p className="font-display italic text-white/50 text-xl md:text-2xl">
            "Quality Matters the MOST!"
          </p>
        </div>
      </div>

      {/* About content */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="font-bold text-sw-black text-2xl md:text-3xl tracking-tight mb-6">About Stone World</h2>
              <p className="text-sw-gray text-base leading-relaxed mb-5">
                {siteInfo.about_short || 'AB Stone World Pvt Ltd. has been delivering premium surface solutions since 2003. We specialize in marble, granite, tiles, and natural stones, serving residential, commercial, and industrial projects across India.'}
              </p>
              <p className="text-sw-gray text-base leading-relaxed mb-5">
                {siteInfo.about_full || "Stone World was founded in 2003 with a single vision: to bring the world's finest surface materials to Indian homes and businesses. From the quarries of Rajasthan to Italian marble halls, we source only the best. Our 30,000 sq.ft. warehouse stocks over 5 Crores worth of premium inventory, ready for your project."}
              </p>
              <p className="text-sw-gray text-base leading-relaxed">
                From our headquarters in Gujarat, we serve architects, interior designers, contractors and homeowners across India with transparent pricing, timely delivery and uncompromising quality.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/6568675/pexels-photo-6568675.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Stone samples"
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
              <div className="absolute -bottom-6 -right-4 md:-right-6 bg-sw-black text-white p-6 rounded-xl">
                <p className="font-bold text-3xl tracking-tight">20+</p>
                <p className="text-white/60 text-sm mt-0.5">Years of Trust</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-sw-offwhite">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: siteInfo.stat_years || '20+', label: 'Years Experience' },
            { val: siteInfo.stat_inventory || '5 Cr+', label: 'Inventory Value' },
            { val: (siteInfo.stat_warehouse || '30,000') + ' sqft', label: 'Warehouse' },
            { val: siteInfo.stat_team || '25+', label: 'Team Members' },
          ].map(({ val, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <div className="font-bold text-sw-black text-3xl md:text-4xl tracking-tight mb-1">{val}</div>
              <div className="text-sw-gray text-xs tracking-[0.1em] uppercase">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-28 px-6 md:px-10" data-testid="values-section">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-sw-gray text-xs tracking-[0.2em] uppercase mb-3">What We Stand For</p>
          <h2 className="font-bold text-sw-black text-2xl md:text-3xl tracking-tight mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group bg-sw-offwhite p-8 rounded-2xl hover:bg-sw-black transition-all duration-500"
              >
                <v.icon size={24} strokeWidth={1.5} className="text-sw-black group-hover:text-white mb-6 transition-colors" />
                <h3 className="font-semibold text-sw-black group-hover:text-white text-base mb-2 transition-colors">{v.title}</h3>
                <p className="text-sw-gray group-hover:text-white/60 text-sm leading-relaxed transition-colors">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-24 md:py-28 bg-sw-black px-6 md:px-10" data-testid="clients-section">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-3 text-center">Trusted Partners</p>
          <h2 className="font-bold text-white text-2xl md:text-3xl tracking-tight mb-12 text-center">Trusted by India's Finest</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {clients.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="px-5 py-2.5 border border-white/10 rounded-full text-white/50 text-sm hover:border-white/30 hover:text-white/80 transition-all duration-300 cursor-default"
              >
                {c}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-28 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="font-bold text-sw-black text-2xl md:text-3xl tracking-tight mb-4">Ready to Work Together?</h2>
          <p className="text-sw-gray text-base mb-10 max-w-md mx-auto">Let our experts help you select the perfect surface solution for your project.</p>
          <Link to="/contact" className="btn-primary text-sm px-10 py-4" data-testid="about-contact-btn">
            Get in Touch <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <Footer siteInfo={siteInfo} />
    </div>
  );
}
