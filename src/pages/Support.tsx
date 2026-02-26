import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Phone, Mail, MapPin, Clock, MessageCircle, ChevronDown, ChevronRight, HelpCircle, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { submitInquiry, getSiteInfo } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { SiteInfo } from '@/utils/mockData';

const STEPS = [
  { id: 'purpose', question: "What are you looking for?", type: 'chips' as const, options: ['Flooring', 'Wall Cladding', 'Kitchen Countertop', 'Bathroom', 'Outdoor / Garden', 'Building Materials', 'Electrical / Wiring', 'General Inquiry'] },
  { id: 'product_category', question: 'Which product category?', type: 'chips' as const, options: ['Marble', 'Granite', 'Vitrified Tiles', 'Natural Stone', 'Quartz', 'Sanitaryware', 'Cement & Sand', 'TMT Bars', 'Polycab Wires', 'Ceramic', 'Sinks', 'Other'] },
  { id: 'project_type', question: 'Project type?', type: 'chips' as const, options: ['Residential', 'Office / Corporate', 'Hotel / Hospitality', 'Restaurant / Cafe', 'Retail / Mall', 'Industrial / Other'] },
  { id: 'area', question: 'Approximate area?', type: 'chips' as const, options: ['Under 200 sqft', '200 - 1,000 sqft', '1,000 - 5,000 sqft', '5,000+ sqft', 'Bulk Order', 'Not sure yet'] },
  { id: 'details', question: 'Your details.', type: 'form' as const, options: [] },
];

const FAQS = [
  { q: 'What is the minimum order quantity?', a: 'There is no strict minimum. However, for marble and granite slabs, we recommend ordering full slabs for consistent veining. For tiles, the minimum is typically one box (4-8 pieces).' },
  { q: 'Do you provide installation services?', a: 'We can recommend trusted installation partners in Gujarat. Our team also provides guidance on installation best practices for each material type.' },
  { q: 'How can I see the actual material before buying?', a: 'Visit our 30,000 sqft warehouse in Dantali, Gujarat to see all materials in person. You can also request sample pieces for select products.' },
  { q: 'What is your return policy?', a: 'Natural stone is a unique material — each piece has distinct patterns. We encourage warehouse visits before purchase. Custom-cut orders are non-returnable.' },
  { q: 'Do you deliver outside Gujarat?', a: 'Yes, we deliver pan-India. Delivery charges vary by location and order size. Contact us for a delivery estimate.' },
];

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.2 } }),
};

export default function Support() {
  const [searchParams] = useSearchParams();
  const [siteInfo, setSiteInfo] = useState<Partial<SiteInfo>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    getSiteInfo().then(r => setSiteInfo(r.data)).catch(() => {});
    document.title = 'Support — Stone World';
    const productParam = searchParams.get('product');
    const categoryParam = searchParams.get('category');
    if (productParam) setForm(f => ({ ...f, message: `Interested in: ${productParam}` }));
    if (categoryParam) setAnswers(a => ({ ...a, product_category: categoryParam }));
  }, [searchParams]);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const progress = ((stepIdx + (submitted ? 1 : 0)) / STEPS.length) * 100;

  const selectChip = (stepId: string, value: string) => {
    setAnswers(a => ({ ...a, [stepId]: value }));
    if (stepIdx < STEPS.length - 1) setTimeout(() => goNext(), 250);
  };

  const goNext = () => { setDirection(1); setStepIdx(i => Math.min(i + 1, STEPS.length - 1)); };
  const goPrev = () => { setDirection(-1); setStepIdx(i => Math.max(i - 1, 0)); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Please enter a valid email'); return; }
    setLoading(true);
    const message = [
      answers.purpose && `Looking for: ${answers.purpose}`,
      answers.product_category && `Category: ${answers.product_category}`,
      answers.project_type && `Project: ${answers.project_type}`,
      answers.area && `Area: ${answers.area}`,
      form.message && `Notes: ${form.message}`,
    ].filter(Boolean).join('\n');
    try {
      await submitInquiry({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: message || 'General inquiry', product_interest: searchParams.get('product') || answers.product_category || '', purpose: answers.purpose, material: answers.product_category, project_type: answers.project_type, area: answers.area, product_category: answers.product_category });
      setSubmitted(true);
    } catch { toast.error('Failed to send. Please call us directly.'); }
    finally { setLoading(false); }
  };

  const { phone1 = '+91 9377521509', phone2 = '+91 9427459805', email: siteEmail = 'Stoneworld1947@gmail.com', address = 'Near Dantali Gam, Dantali, Gujarat 382165', whatsapp = '+91 9377521509' } = siteInfo;
  const waNum = (whatsapp || '').replace(/[^0-9]/g, '');
  const inputCls = "w-full px-4 py-3 bg-[#f5f5f7] border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40";

  return (
    <div className="min-h-screen bg-background" data-testid="support-page">
      <Navbar />
      <div className="pt-[48px]">

        {/* Hero — clean white, Apple-style */}
        <section className="text-center py-20 md:py-28 px-6 bg-background">
          <div className="container-sw">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="apple-headline mb-3" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
                How can we help?
              </h1>
              <p className="apple-subhead text-base md:text-lg max-w-md mx-auto">
                Get a quote, ask questions, or visit our warehouse. We're here for you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="px-6 pb-16 bg-background">
          <div className="container-sw">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Phone, label: 'Call Us', desc: phone1, href: `tel:${phone1}` },
                { icon: MessageCircle, label: 'WhatsApp', desc: 'Quick response', href: `https://wa.me/${waNum}` },
                { icon: Mail, label: 'Email', desc: siteEmail, href: `mailto:${siteEmail}` },
              ].map(({ icon: Icon, label, desc, href }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors duration-200">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-muted-foreground text-[12px]">{desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Form + Info grid */}
        <section className="px-6 pb-20 bg-background">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

              {/* Left — Form */}
              <div className="lg:col-span-3">
                <h2 className="font-semibold text-xl tracking-tight mb-6">Request a Quote</h2>
                
                {/* Progress */}
                <div className="h-[2px] bg-border/20 mb-8 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-foreground" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                  {submitted ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }} className="text-center py-12" data-testid="form-success">
                      <div className="w-14 h-14 bg-[#34c759] rounded-full flex items-center justify-center mx-auto mb-5">
                        <Check size={24} className="text-white" strokeWidth={2.5} />
                      </div>
                      <h2 className="font-semibold text-2xl tracking-tight mb-2">Inquiry Sent!</h2>
                      <p className="text-muted-foreground text-sm mb-8">Hi {form.name}, we'll reach out within 24 hours.</p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Link to="/products" className="btn-primary text-sm">Browse Products <ArrowRight size={14} /></Link>
                        <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">WhatsApp Us</a>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key={`step-${stepIdx}`} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">
                      <div className="flex items-center gap-1.5 mb-5">
                        {STEPS.map((_, i) => (
                          <div key={i} className={`transition-all duration-300 rounded-full ${i === stepIdx ? 'w-5 h-1.5 bg-foreground' : i < stepIdx ? 'w-1.5 h-1.5 bg-foreground/40' : 'w-1.5 h-1.5 bg-border'}`} />
                        ))}
                        <span className="text-[11px] text-muted-foreground ml-2">{stepIdx + 1}/{STEPS.length}</span>
                      </div>

                      <h3 className="font-semibold tracking-tight mb-6" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)' }}>
                        {step.question}
                      </h3>

                      {step.type === 'chips' && (
                        <div className="grid grid-cols-2 gap-2" data-testid={`step-${step.id}`}>
                          {step.options.map(opt => {
                            const isSelected = answers[step.id] === opt;
                            return (
                              <motion.button key={opt} onClick={() => selectChip(step.id, opt)} whileTap={{ scale: 0.98 }}
                                className={`relative px-4 py-3 rounded-xl text-left transition-all duration-200 border ${isSelected ? 'bg-foreground border-foreground text-background' : 'bg-background border-border/50 text-foreground hover:border-foreground/20'}`}>
                                <span className="font-medium text-[13px]">{opt}</span>
                                {isSelected && <Check size={12} className="absolute top-3 right-3 text-background" strokeWidth={3} />}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}

                      {step.type === 'form' && (
                        <div className="space-y-3" data-testid="details-form">
                          {[
                            { key: 'name' as const, label: 'Full Name', placeholder: 'Your name', required: true },
                            { key: 'email' as const, label: 'Email', placeholder: 'you@email.com', required: true, type: 'email' },
                            { key: 'phone' as const, label: 'Phone', placeholder: '+91 XXXXX XXXXX', type: 'tel' },
                          ].map(({ key, label, placeholder, required, type }) => (
                            <div key={key}>
                              <label className="text-[12px] text-muted-foreground block mb-1">{label}{required && ' *'}</label>
                              <input type={type || 'text'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                placeholder={placeholder} data-testid={`contact-${key}`} className={inputCls} />
                            </div>
                          ))}
                          <div>
                            <label className="text-[12px] text-muted-foreground block mb-1">Additional Notes</label>
                            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                              rows={3} placeholder="Project details, timeline..." data-testid="contact-message"
                              className={inputCls + ' resize-none'} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-8">
                        {stepIdx > 0 ? (
                          <button onClick={goPrev} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft size={14} /> Back
                          </button>
                        ) : <div />}
                        {step.type === 'chips' && answers[step.id] && !isLast && (
                          <button onClick={goNext} className="btn-primary text-sm px-6">Continue <ArrowRight size={14} /></button>
                        )}
                        {step.type === 'chips' && !answers[step.id] && (
                          <button onClick={goNext} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Skip</button>
                        )}
                        {isLast && (
                          <button onClick={handleSubmit} disabled={loading} data-testid="contact-submit" className="btn-primary text-sm px-7 disabled:opacity-50">
                            {loading ? <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <>Send Inquiry <Send size={14} /></>}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right — Info */}
              <div className="lg:col-span-2">
                <div className="bg-[#f5f5f7] rounded-2xl p-6 sticky top-24">
                  <h3 className="font-semibold text-sm mb-5">Visit Us</h3>
                  <div className="space-y-4 text-[13px]">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Clock size={15} className="mt-0.5 shrink-0 text-foreground" />
                      <div>
                        <p className="text-foreground font-medium">Mon – Sat: 9 AM – 7 PM</p>
                        <p className="text-[12px]">Sunday by appointment</p>
                      </div>
                    </div>
                  </div>

                  {/* Minimal map embed */}
                  <div className="mt-5 rounded-xl overflow-hidden border border-border/20">
                    <iframe
                      title="Stone World Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.5!2d72.63!3d23.11!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDA2JzM2LjAiTiA3MsKwMzcnNDguMCJF!5e0!3m2!1sen!2sin!4v1700000000000"
                      width="100%" height="160" style={{ border: 0 }} allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="grayscale opacity-80"
                    />
                  </div>

                  <div className="border-t border-border/20 mt-5 pt-5">
                    <a href={`https://wa.me/${waNum}?text=${encodeURIComponent('Hi, I need help with Stone World products.')}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#34c759] text-white text-sm font-medium hover:bg-[#2db84e] transition-colors">
                      <MessageCircle size={16} /> Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-[#f5f5f7]">
          <div className="container-sw">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-12">
              <h2 className="apple-headline text-2xl md:text-3xl mb-2">Frequently Asked Questions</h2>
              <p className="apple-subhead text-sm">Quick answers to common queries.</p>
            </motion.div>

            <div className="max-w-[680px] mx-auto divide-y divide-border/30">
              {FAQS.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left group">
                    <span className="font-medium text-sm pr-4">{faq.q}</span>
                    <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden">
                        <p className="text-muted-foreground text-sm pb-4 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer siteInfo={siteInfo} />
    </div>
  );
}
