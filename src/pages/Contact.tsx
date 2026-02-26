import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Phone } from 'lucide-react';
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
      { label: 'Flooring' },
      { label: 'Wall Cladding' },
      { label: 'Kitchen Counter' },
      { label: 'Bathroom' },
      { label: 'Outdoor / Garden' },
      { label: 'General Inquiry' },
    ],
  },
  {
    id: 'material',
    question: 'Preferred material?',
    type: 'chips' as const,
    options: [
      { label: 'Marble' },
      { label: 'Granite' },
      { label: 'Vitrified Tiles' },
      { label: 'Natural Stone' },
      { label: 'Quartz' },
      { label: 'Open to Suggestions' },
    ],
  },
  {
    id: 'project_type',
    question: 'Project type?',
    type: 'chips' as const,
    options: [
      { label: 'Residential' },
      { label: 'Office / Corporate' },
      { label: 'Hotel / Hospitality' },
      { label: 'Restaurant / Cafe' },
      { label: 'Retail / Mall' },
      { label: 'Industrial / Other' },
    ],
  },
  {
    id: 'area',
    question: 'Approximate area?',
    type: 'chips' as const,
    options: [
      { label: 'Under 200 sqft' },
      { label: '200 - 1,000 sqft' },
      { label: '1,000 - 5,000 sqft' },
      { label: '5,000+ sqft' },
      { label: 'Not sure yet' },
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
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -50 : 50, transition: { duration: 0.25 } }),
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
    document.title = 'Contact — Stone World';
    const productParam = searchParams.get('product');
    if (productParam) {
      setForm(f => ({ ...f, message: `Interested in: ${productParam}` }));
    }
  }, [searchParams]);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const progress = ((stepIdx + (submitted ? 1 : 0)) / STEPS.length) * 100;

  const selectChip = (stepId: string, value: string) => {
    setAnswers(a => ({ ...a, [stepId]: value }));
    if (stepIdx < STEPS.length - 1) {
      setTimeout(() => goNext(), 300);
    }
  };

  const goNext = () => { setDirection(1); setStepIdx(i => Math.min(i + 1, STEPS.length - 1)); };
  const goPrev = () => { setDirection(-1); setStepIdx(i => Math.max(i - 1, 0)); };

  const handleSubmit = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    setLoading(true);
    const message = [
      answers.purpose && `Looking for: ${answers.purpose}`,
      answers.material && `Material: ${answers.material}`,
      answers.project_type && `Project type: ${answers.project_type}`,
      answers.area && `Area: ${answers.area}`,
      form.message && `Notes: ${form.message}`,
    ].filter(Boolean).join('\n');

    try {
      await submitInquiry({
        name: form.name, email: form.email, phone: form.phone,
        message: message || 'General inquiry',
        product_interest: answers.material || '',
      });
      setSubmitted(true);
    } catch {
      toast.error('Failed to send. Please call us directly.');
    } finally { setLoading(false); }
  };

  const { phone1 = '+91 9377521509', whatsapp = '+91 9377521509' } = siteInfo;
  const waNum = (whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-white page-enter" data-testid="contact-page">
      <Navbar />

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="pt-20 bg-sw-black">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-14">
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-3">Get in Touch</p>
            <h1 className="font-bold text-white tracking-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Let's Talk Stone.
            </h1>
          </div>
          <div className="h-[2px] bg-white/5">
            <motion.div className="h-full bg-white" animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center py-16 px-6">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait" custom={direction}>
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                  data-testid="form-success"
                >
                  <div className="w-16 h-16 bg-sw-black rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={28} className="text-white" strokeWidth={2} />
                  </div>
                  <h2 className="font-bold text-sw-black text-3xl tracking-tight mb-3">Inquiry Sent!</h2>
                  <p className="text-sw-gray text-base mb-2">Hi {form.name}, we'll reach out within 24 hours.</p>
                  <p className="text-sw-gray text-sm mb-10">
                    {answers.material && `We noted your interest in ${answers.material}.`}
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Link to="/products" className="btn-primary text-sm">Browse Products <ArrowRight size={14} /></Link>
                    <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#20bd5a] transition-colors">
                      WhatsApp
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={`step-${stepIdx}`} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-8">
                    {STEPS.map((_, i) => (
                      <div key={i} className={`transition-all duration-300 rounded-full ${
                        i === stepIdx ? 'w-6 h-1.5 bg-sw-black' : i < stepIdx ? 'w-1.5 h-1.5 bg-sw-black/40' : 'w-1.5 h-1.5 bg-sw-border'
                      }`} />
                    ))}
                    <span className="text-xs text-sw-gray ml-2">{stepIdx + 1}/{STEPS.length}</span>
                  </div>

                  {/* Question */}
                  <h2 className="font-bold text-sw-black mb-10 tracking-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
                    {step.question}
                  </h2>

                  {/* Chips */}
                  {step.type === 'chips' && (
                    <div className="grid grid-cols-2 gap-3" data-testid={`step-${step.id}`}>
                      {step.options.map(opt => {
                        const isSelected = answers[step.id] === opt.label;
                        return (
                          <motion.button
                            key={opt.label}
                            onClick={() => selectChip(step.id, opt.label)}
                            whileTap={{ scale: 0.97 }}
                            data-testid={`chip-${opt.label.replace(/\s+/g, '-').toLowerCase()}`}
                            className={`relative px-5 py-4 rounded-xl text-left transition-all duration-200 border ${
                              isSelected
                                ? 'bg-sw-black border-sw-black text-white'
                                : 'bg-white border-sw-border text-sw-black hover:border-sw-black/30'
                            }`}
                          >
                            <span className="font-medium text-sm">{opt.label}</span>
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                <Check size={11} className="text-white" strokeWidth={3} />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Form */}
                  {step.type === 'form' && (
                    <div className="space-y-5" data-testid="details-form">
                      {[
                        { key: 'name' as const, label: 'Your Name', placeholder: 'Full name', required: true },
                        { key: 'email' as const, label: 'Email', placeholder: 'you@email.com', required: true, type: 'email' },
                        { key: 'phone' as const, label: 'Phone', placeholder: '+91 XXXXX XXXXX', type: 'tel' },
                      ].map(({ key, label, placeholder, required, type }) => (
                        <div key={key}>
                          <label className="text-xs text-sw-gray uppercase tracking-[0.1em] block mb-2">{label}{required && ' *'}</label>
                          <input
                            type={type || 'text'}
                            value={form[key]}
                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            data-testid={`contact-${key}`}
                            className="w-full px-4 py-3.5 bg-sw-offwhite border border-transparent rounded-xl text-sm text-sw-black focus:outline-none focus:border-sw-black/20 transition-colors"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-sw-gray uppercase tracking-[0.1em] block mb-2">Additional Notes</label>
                        <textarea
                          value={form.message}
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          rows={3}
                          placeholder="Project details, timeline..."
                          data-testid="contact-message"
                          className="w-full px-4 py-3.5 bg-sw-offwhite border border-transparent rounded-xl text-sm text-sw-black focus:outline-none focus:border-sw-black/20 transition-colors resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Nav */}
                  <div className="flex items-center justify-between mt-10">
                    {stepIdx > 0 ? (
                      <button onClick={goPrev} className="flex items-center gap-2 text-sm text-sw-gray hover:text-sw-black transition-colors">
                        <ArrowLeft size={14} strokeWidth={1.5} /> Back
                      </button>
                    ) : <div />}

                    {step.type === 'chips' && answers[step.id] && !isLast && (
                      <button onClick={goNext} className="btn-primary text-sm px-7" data-testid="step-next">
                        Continue <ArrowRight size={14} />
                      </button>
                    )}
                    {step.type === 'chips' && !answers[step.id] && (
                      <button onClick={goNext} className="text-sm text-sw-gray hover:text-sw-black transition-colors">Skip</button>
                    )}
                    {isLast && (
                      <button onClick={handleSubmit} disabled={loading} data-testid="contact-submit" className="btn-primary text-sm px-8 py-3.5 disabled:opacity-50">
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Inquiry <ArrowRight size={14} /></>}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom contact */}
        {!submitted && (
          <div className="border-t border-sw-border/30 py-4 px-6">
            <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-6">
              <a href={`tel:${phone1}`} className="flex items-center gap-2 text-sw-gray text-sm hover:text-sw-black transition-colors">
                <Phone size={14} strokeWidth={1.5} /> {phone1}
              </a>
              <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sw-gray text-sm hover:text-[#25D366] transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      <Footer siteInfo={siteInfo} />
    </div>
  );
}
