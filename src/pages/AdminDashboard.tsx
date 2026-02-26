import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Mail, MessageCircle, Send, X, ArrowRight,
  ChevronRight, Menu, LogOut, ExternalLink, Clock, CheckCircle2,
  Phone as PhoneIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInquiries, getInquiryReplies, sendReply, updateInquiryStatus } from '@/utils/api';
import { toast } from 'sonner';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  product_interest: string | null;
  purpose: string | null;
  material: string | null;
  project_type: string | null;
  area: string | null;
  status: string;
  created_at: string;
}

interface Reply {
  id: string;
  inquiry_id: string;
  reply_text: string;
  reply_type: string;
  sent_at: string;
  sent_by: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<'overview' | 'inquiries'>('overview');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyType, setReplyType] = useState<'email' | 'whatsapp'>('email');
  const [sending, setSending] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const { adminUser, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const loadInquiries = () => {
    setLoadingInquiries(true);
    getInquiries()
      .then(data => setInquiries(data || []))
      .catch(() => toast.error('Failed to load inquiries'))
      .finally(() => setLoadingInquiries(false));
  };

  useEffect(() => { loadInquiries(); }, []);

  const selectInquiry = async (inq: Inquiry) => {
    setSelectedInquiry(inq);
    if (inq.status === 'new') {
      await updateInquiryStatus(inq.id, 'read').catch(() => {});
      setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: 'read' } : i));
    }
    getInquiryReplies(inq.id).then(data => setReplies(data || [])).catch(() => {});
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedInquiry) return;
    setSending(true);

    try {
      if (replyType === 'whatsapp' && selectedInquiry.phone) {
        const waNum = selectedInquiry.phone.replace(/[^0-9]/g, '');
        const waText = encodeURIComponent(replyText);
        window.open(`https://wa.me/${waNum}?text=${waText}`, '_blank');
      }

      const reply = await sendReply(selectedInquiry.id, replyText, replyType);
      setReplies(prev => [...prev, reply]);
      setReplyText('');
      setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? { ...i, status: 'replied' } : i));
      toast.success(`Reply ${replyType === 'whatsapp' ? 'opened in WhatsApp &' : ''} saved!`);
    } catch {
      toast.error('Failed to send reply');
    } finally { setSending(false); }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const REPLY_TEMPLATES = [
    { label: '👋 Greeting', text: `Hi {name}, thank you for reaching out to Stone World! We've received your inquiry and our team is reviewing it.` },
    { label: '💰 Quote Ready', text: `Hi {name}, great news! We've prepared a quotation for your {material} requirement. Let us know a convenient time to discuss the details.` },
    { label: '📋 More Info', text: `Hi {name}, thanks for your interest! To provide an accurate quote, could you share:\n1. Exact area/dimensions needed\n2. Preferred finish\n3. Installation timeline\n4. Delivery location` },
    { label: '🏭 Visit Invite', text: `Hi {name}, we'd love to show you our collection in person! Visit our 30,000 sqft warehouse at Dantali, Gujarat. We're open Mon-Sat, 9 AM - 7 PM.` },
    { label: '✅ Follow Up', text: `Hi {name}, just checking in on your {material} inquiry. Have you had a chance to review our options? Happy to answer any questions!` },
  ];

  const applyTemplate = (template: string) => {
    let text = template;
    if (selectedInquiry) {
      text = text.replace('{name}', selectedInquiry.name);
      text = text.replace('{material}', selectedInquiry.material || selectedInquiry.product_interest || 'material');
    }
    setReplyText(text);
  };

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const repliedCount = inquiries.filter(i => i.status === 'replied').length;

  return (
    <div className="flex min-h-screen bg-sw-offwhite" data-testid="admin-dashboard">
      {/* Sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside
        className={`admin-sidebar flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ boxShadow: '1px 0 10px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-sm">Stone World</span>
          <span className="text-sw-gray text-[11px]">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden p-1 text-sw-gray"><X size={16} /></button>
        </div>

        <nav className="flex-1 py-3">
          {[
            { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
            { id: 'inquiries' as const, label: 'Inquiries', icon: Mail, badge: newCount > 0 ? newCount : undefined },
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => { setView(id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full px-5 py-2.5 text-sm transition-all ${
                view === id ? 'bg-sw-offwhite font-medium text-sw-black' : 'text-sw-gray hover:bg-sw-offwhite/50'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
              {badge && <span className="ml-auto bg-blue-500 text-white text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>}
              {view === id && <ChevronRight size={12} className="ml-auto text-sw-gray" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-sw-black rounded-full flex items-center justify-center text-white text-[10px] font-semibold uppercase">
              {adminUser?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium capitalize">{adminUser}</p>
              <p className="text-sw-gray text-[10px]">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-[280px] min-h-screen">
        <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-20 flex items-center gap-4 px-5 py-3 border-b border-sw-border/20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1 text-sw-gray"><Menu size={18} /></button>
          <p className="font-medium text-sm">{view === 'overview' ? 'Dashboard' : 'Inquiries'}</p>
          <Link to="/" className="ml-auto text-[11px] text-sw-gray hover:text-sw-black transition-colors flex items-center gap-1" target="_blank">
            View Site <ExternalLink size={10} />
          </Link>
        </div>

        <div className="p-5 md:p-6">
          {view === 'overview' && (
            <div>
              <h2 className="font-semibold text-xl tracking-tight mb-5">Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Inquiries', value: inquiries.length, color: 'bg-blue-50' },
                  { label: 'New', value: newCount, color: 'bg-orange-50' },
                  { label: 'Replied', value: repliedCount, color: 'bg-green-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.color} rounded-2xl p-5`}>
                    <p className="text-sw-gray text-[11px] uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="font-semibold text-2xl tracking-tight">{s.value}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setView('inquiries')}
                className="btn-blue text-sm mt-6"
              >
                View All Inquiries <ArrowRight size={14} />
              </button>
            </div>
          )}

          {view === 'inquiries' && (
            <div className="flex gap-5 h-[calc(100vh-100px)]">
              {/* List */}
              <div className={`${selectedInquiry ? 'hidden md:block' : ''} w-full md:w-[340px] shrink-0 overflow-y-auto`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">Inquiries</h2>
                  <button onClick={loadInquiries} className="text-[11px] text-sw-gray hover:text-sw-black">Refresh</button>
                </div>

                {loadingInquiries ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white rounded-xl p-4">
                        <div className="h-3 bg-sw-offwhite rounded w-1/3 mb-2" />
                        <div className="h-4 bg-sw-offwhite rounded w-2/3 mb-1" />
                        <div className="h-3 bg-sw-offwhite rounded w-full" />
                      </div>
                    ))}
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sw-gray text-sm">No inquiries yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inquiries.map(inq => (
                      <button
                        key={inq.id}
                        onClick={() => selectInquiry(inq)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedInquiry?.id === inq.id ? 'bg-blue-50 border border-blue-200' : 'bg-white hover:bg-sw-offwhite border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[inq.status] || STATUS_COLORS.new}`}>
                            {inq.status}
                          </span>
                          <span className="text-[10px] text-sw-gray ml-auto">
                            {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="font-medium text-sm truncate">{inq.name}</p>
                        <p className="text-sw-gray text-[11px] truncate">{inq.message}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Detail */}
              {selectedInquiry ? (
                <div className="flex-1 bg-white rounded-2xl overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-5 border-b border-sw-border/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedInquiry.name}</h3>
                        <p className="text-sw-gray text-[12px]">{selectedInquiry.email}</p>
                        {selectedInquiry.phone && (
                          <p className="text-sw-gray text-[12px] flex items-center gap-1 mt-0.5">
                            <PhoneIcon size={10} /> {selectedInquiry.phone}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedInquiry(null)}
                        className="md:hidden p-1 text-sw-gray hover:text-sw-black"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedInquiry.purpose && <span className="text-[10px] bg-sw-offwhite px-2.5 py-1 rounded-full">📍 {selectedInquiry.purpose}</span>}
                      {selectedInquiry.material && <span className="text-[10px] bg-sw-offwhite px-2.5 py-1 rounded-full">🪨 {selectedInquiry.material}</span>}
                      {selectedInquiry.project_type && <span className="text-[10px] bg-sw-offwhite px-2.5 py-1 rounded-full">🏗 {selectedInquiry.project_type}</span>}
                      {selectedInquiry.area && <span className="text-[10px] bg-sw-offwhite px-2.5 py-1 rounded-full">📐 {selectedInquiry.area}</span>}
                      {selectedInquiry.product_interest && <span className="text-[10px] bg-sw-offwhite px-2.5 py-1 rounded-full">⭐ {selectedInquiry.product_interest}</span>}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Original message */}
                    <div className="bg-sw-offwhite rounded-xl p-4 max-w-[80%]">
                      <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                      <p className="text-[10px] text-sw-gray mt-2 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(selectedInquiry.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Replies */}
                    {replies.map(reply => (
                      <div key={reply.id} className="ml-auto max-w-[80%]">
                        <div className={`rounded-xl p-4 ${reply.reply_type === 'whatsapp' ? 'bg-[#dcf8c6]' : 'bg-blue-50'}`}>
                          <p className="text-sm whitespace-pre-wrap">{reply.reply_text}</p>
                          <p className="text-[10px] text-sw-gray mt-2 flex items-center gap-1 justify-end">
                            <CheckCircle2 size={10} />
                            {reply.reply_type === 'whatsapp' ? 'WhatsApp' : 'Email'} •{' '}
                            {new Date(reply.sent_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply area */}
                  <div className="border-t border-sw-border/20 p-4">
                    {/* Templates */}
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-3">
                      {REPLY_TEMPLATES.map(t => (
                        <button
                          key={t.label}
                          onClick={() => applyTemplate(t.text)}
                          className="shrink-0 text-[10px] font-medium bg-sw-offwhite hover:bg-sw-border/30 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          rows={2}
                          className="w-full px-4 py-3 bg-sw-offwhite rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => { setReplyType('email'); handleReply(); }}
                          disabled={!replyText.trim() || sending}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-[11px] font-medium rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors"
                        >
                          <Mail size={12} /> Email
                        </button>
                        <button
                          onClick={() => { setReplyType('whatsapp'); handleReply(); }}
                          disabled={!replyText.trim() || !selectedInquiry.phone || sending}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-[11px] font-medium rounded-lg hover:bg-[#20bd5a] disabled:opacity-40 transition-colors"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-white rounded-2xl">
                  <p className="text-sw-gray text-sm">Select an inquiry to view details and reply.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
