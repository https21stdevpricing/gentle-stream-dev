import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { submitInquiry, getSiteInfo } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { SiteInfo } from '@/utils/mockData';

const STEPS = [
  {
    id: 'purpose',
    question: "What are you looking for?",
    type: 'chips' as const,
    options: [
      'Flooring', 'Wall Cladding', 'Kitchen Countertop', 'Bathroom',
      'Outdoor / Garden', 'Building Materials', 'Electrical / Wiring', 'General Inquiry',
    ],
  },
  {
    id: 'product_category',
    question: 'Which product category?',
    type: 'chips' as const,
    options: [
      'Marble', 'Granite', 'Vitrified Tiles', 'Natural Stone',
      'Quartz', 'Sanitaryware', 'Cement & Sand', 'TMT Bars',
      'Polycab Wires', 'Ceramic', 'Sinks', 'Other',
    ],
  },
  {
    id: 'project_type',
    question: 'Project type?',
    type: 'chips' as const,
    options: [
      'Residential', 'Office / Corporate', 'Hotel / Hospitality',
      'Restaurant / Cafe', 'Retail / Mall', 'Industrial / Other',
    ],
  },
  {
    id: 'area',
    question: 'Approximate area or quantity?',
    type: 'chips' as const,
    options: [
      'Under 200 sqft', '200 - 1,000 sqft', '1,000 - 5,000 sqft',
      '5,000+ sqft', 'Bulk Order', 'Not sure yet',
    ],
  },
  {
    id: 'finish',
    question: 'Preferred finish?',
    type: 'chips' as const,
    options: [
      'Polished', 'Honed / Matt', 'Brushed', 'Natural Cleft',
      'Book-matched', 'Open to Suggestions',
    ],
  },
  {
    id: 'details',
    question: 'Your details.',
    type: 'form' as const,
    options: [],
  },
];

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.2 } }),
};

export default function Contact() {
  const [searchParams] = useSearchParams();
  const [siteInfo, setSiteInfo] = useState<Partial<SiteInfo>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSiteInfo().then(r => setSiteInfo(r.data)).catch(() => {});
    document.title = 'Get a Quote — Stone World';
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
    if (stepIdx < STEPS.length - 1) {
      setTimeout(() => goNext(), 250);
    }
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
      answers.finish && `Finish: ${answers.finish}`,
      form.message && `Notes: ${form.message}`,
    ].filter(Boolean).join('\n');

    try {
      await submitInquiry({
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
        message: message || 'General inquiry',
        product_interest: searchParams.get('product') || answers.product_category || '',
        purpose: answers.purpose,
        material: answers.product_category,
        project_type: answers.project_type,
        area: answers.area,
        product_category: answers.product_category,
      });
      setSubmitted(true);
    } catch {
      toast.error('Failed to send. Please call us directly.');
    } finally { setLoading(false); }
  };

  const { phone1 = '+91 9377521509', phone2 = '+91 9427459805', email = 'Stoneworld1947@gmail.com', address = 'Near Dantali Gam, Dantali, Gujarat 382165', whatsapp = '+91 9377521509' } = siteInfo;
  const waNum = (whatsapp || '').replace(/[^0-9]/g, '');

  const inputCls = "w-full px-4 py-3.5 bg-sw-offwhite border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all placeholder:text-muted-foreground/50";

  return (
    <div className="min-h-screen bg-background" data-testid="contact-page">
      <Navbar />

      <div className="pt-[48px]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-sw-dark text-center py-16 md:py-24 px-6 mandala-pattern-dark">
          <div className="container-sw relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-sw-gold/60 text-[11px] uppercase tracking-[0.3em] font-semibold mb-4">Get Started</p>
              <h1 className="font-semibold text-white leading-tight mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}>
                Get a Quote.
              </h1>
              <p className="text-white/40 text-base max-w-md mx-auto">Tell us about your project. We'll respond within 24 hours.</p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-[1100px] mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

            {/* Left — Form */}
            <div className="lg:col-span-3">
              {/* Progress bar */}
              <div className="h-[3px] bg-border/30 mb-8 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-foreground" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-12"
                    data-testid="form-success"
                  >
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={28} className="text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="font-semibold text-2xl tracking-tight mb-2">Inquiry Sent!</h2>
                    <p className="text-muted-foreground text-sm mb-2">Hi {form.name}, we'll reach out within 24 hours.</p>
                    <p className="text-muted-foreground text-xs mb-8">
                      {answers.product_category && `We noted your interest in ${answers.product_category}.`}
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Link to="/products" className="btn-primary text-sm">Browse Products <ArrowRight size={14} /></Link>
                      <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">WhatsApp Us</a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={`step-${stepIdx}`} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">
                    {/* Step dots */}
                    <div className="flex items-center gap-1.5 mb-6">
                      {STEPS.map((_, i) => (
                        <div key={i} className={`transition-all duration-300 rounded-full ${
                          i === stepIdx ? 'w-5 h-1.5 bg-foreground' : i < stepIdx ? 'w-1.5 h-1.5 bg-foreground/40' : 'w-1.5 h-1.5 bg-border'
                        }`} />
                      ))}
                      <span className="text-[11px] text-muted-foreground ml-2">{stepIdx + 1}/{STEPS.length}</span>
                    </div>

                    <h2 className="font-semibold tracking-tight mb-8" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                      {step.question}
                    </h2>

                    {step.type === 'chips' && (
                      <div className="grid grid-cols-2 gap-2.5" data-testid={`step-${step.id}`}>
                        {step.options.map(opt => {
                          const isSelected = answers[step.id] === opt;
                          return (
                            <motion.button
                              key={opt}
                              onClick={() => selectChip(step.id, opt)}
                              whileTap={{ scale: 0.98 }}
                              data-testid={`chip-${opt.replace(/\s+/g, '-').toLowerCase()}`}
                              className={`relative px-4 py-3.5 rounded-2xl text-left transition-all duration-200 border ${
                                isSelected
                                  ? 'bg-foreground border-foreground text-background'
                                  : 'bg-background border-border/60 text-foreground hover:border-foreground/20 hover:shadow-sm'
                              }`}
                            >
                              <span className="font-medium text-[13px]">{opt}</span>
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-4 h-4 bg-background/20 rounded-full flex items-center justify-center">
                                  <Check size={10} className="text-background" strokeWidth={3} />
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {step.type === 'form' && (
                      <div className="space-y-4" data-testid="details-form">
                        {[
                          { key: 'name' as const, label: 'Full Name', placeholder: 'Your name', required: true },
                          { key: 'email' as const, label: 'Email', placeholder: 'you@email.com', required: true, type: 'email' },
                          { key: 'phone' as const, label: 'Phone', placeholder: '+91 XXXXX XXXXX', type: 'tel' },
                        ].map(({ key, label, placeholder, required, type }) => (
                          <div key={key}>
                            <label className="text-[12px] text-muted-foreground block mb-1.5">{label}{required && ' *'}</label>
                            <input
                              type={type || 'text'}
                              value={form[key]}
                              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                              placeholder={placeholder}
                              data-testid={`contact-${key}`}
                              className={inputCls}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="text-[12px] text-muted-foreground block mb-1.5">Additional Notes</label>
                          <textarea
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            rows={3}
                            placeholder="Project details, timeline, specific requirements..."
                            data-testid="contact-message"
                            className={inputCls + ' resize-none'}
                          />
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                      {stepIdx > 0 ? (
                        <button onClick={goPrev} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <ArrowLeft size={14} /> Back
                        </button>
                      ) : <div />}

                      {step.type === 'chips' && answers[step.id] && !isLast && (
                        <button onClick={goNext} className="btn-primary text-sm px-6" data-testid="step-next">
                          Continue <ArrowRight size={14} />
                        </button>
                      )}
                      {step.type === 'chips' && !answers[step.id] && (
                        <button onClick={goNext} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Skip</button>
                      )}
                      {isLast && (
                        <button onClick={handleSubmit} disabled={loading} data-testid="contact-submit" className="btn-gold text-sm px-7 disabled:opacity-50">
                          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Inquiry <ArrowRight size={14} /></>}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right — Contact info */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-3xl p-6 md:p-8 sticky top-24">
                <h3 className="font-semibold text-base mb-6">Contact Information</h3>
                
                <div className="space-y-5">
                  <a href={`tel:${phone1}`} className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0 group-hover:bg-foreground/10 transition-colors">
                      <Phone size={15} className="text-sw-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-[13px]">{phone1}</p>
                      {phone2 && <p className="text-[12px]">{phone2}</p>}
                    </div>
                  </a>

                  <a href={`mailto:${email}`} className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0 group-hover:bg-foreground/10 transition-colors">
                      <Mail size={15} className="text-sw-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-[13px]">{email}</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                      <MapPin size={15} className="text-sw-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-[13px]">Visit Us</p>
                      <p className="text-[12px] leading-relaxed">{address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                      <Clock size={15} className="text-sw-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-[13px]">Business Hours</p>
                      <p className="text-[12px]">Mon - Sat: 9:00 AM - 7:00 PM</p>
                      <p className="text-[12px]">Sunday: By appointment</p>
                    </div>
                  </div>
                </div>

                <div className="gold-line my-6" />

                <a href={`https://wa.me/${waNum}?text=${encodeURIComponent('Hi, I am interested in Stone World products.')}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                  <MessageCircle size={16} /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer siteInfo={siteInfo} />
    </div>
  );
}
