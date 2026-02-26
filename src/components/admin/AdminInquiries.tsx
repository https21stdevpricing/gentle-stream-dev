import { useState } from 'react';
import {
  Mail, MessageCircle, X, Clock, CheckCircle2, Phone as PhoneIcon
} from 'lucide-react';
import { getInquiryReplies, sendReply, updateInquiryStatus } from '@/utils/api';
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
  closed: 'bg-muted text-muted-foreground',
};

const REPLY_TEMPLATES = [
  { label: '👋 Greeting', text: `Hi {name}, thank you for reaching out to Stone World! We've received your inquiry and our team is reviewing it.` },
  { label: '💰 Quote Ready', text: `Hi {name}, great news! We've prepared a quotation for your {material} requirement. Let us know a convenient time to discuss the details.` },
  { label: '📋 More Info', text: `Hi {name}, thanks for your interest! To provide an accurate quote, could you share:\n1. Exact area/dimensions needed\n2. Preferred finish\n3. Installation timeline\n4. Delivery location` },
  { label: '🏭 Visit Invite', text: `Hi {name}, we'd love to show you our collection in person! Visit our 30,000 sqft warehouse at Dantali, Gujarat. We're open Mon-Sat, 9 AM - 7 PM.` },
  { label: '✅ Follow Up', text: `Hi {name}, just checking in on your {material} inquiry. Have you had a chance to review our options? Happy to answer any questions!` },
];

interface Props {
  inquiries: Inquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
  loadingInquiries: boolean;
  loadInquiries: () => void;
}

export default function AdminInquiries({ inquiries, setInquiries, loadingInquiries, loadInquiries }: Props) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const selectInquiry = async (inq: Inquiry) => {
    setSelectedInquiry(inq);
    if (inq.status === 'new') {
      await updateInquiryStatus(inq.id, 'read').catch(() => {});
      setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: 'read' } : i));
    }
    getInquiryReplies(inq.id).then(data => setReplies(data || [])).catch(() => {});
  };

  const handleReply = async (type: 'email' | 'whatsapp') => {
    if (!replyText.trim() || !selectedInquiry) return;
    setSending(true);
    try {
      if (type === 'whatsapp' && selectedInquiry.phone) {
        const waNum = selectedInquiry.phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(replyText)}`, '_blank');
      }
      const reply = await sendReply(selectedInquiry.id, replyText, type);
      setReplies(prev => [...prev, reply]);
      setReplyText('');
      setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? { ...i, status: 'replied' } : i));
      toast.success(`Reply ${type === 'whatsapp' ? 'opened in WhatsApp &' : ''} saved!`);
    } catch {
      toast.error('Failed to send reply');
    } finally { setSending(false); }
  };

  const applyTemplate = (template: string) => {
    if (!selectedInquiry) return;
    setReplyText(template
      .replace('{name}', selectedInquiry.name)
      .replace('{material}', selectedInquiry.material || selectedInquiry.product_interest || 'material'));
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-100px)]">
      {/* List */}
      <div className={`${selectedInquiry ? 'hidden md:block' : ''} w-full md:w-[340px] shrink-0 overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Inquiries</h2>
          <button onClick={loadInquiries} className="text-[11px] text-muted-foreground hover:text-foreground">Refresh</button>
        </div>

        {loadingInquiries ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-xl p-4">
                <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-1" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No inquiries yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inquiries.map(inq => (
              <button
                key={inq.id}
                onClick={() => selectInquiry(inq)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedInquiry?.id === inq.id ? 'bg-blue-50 border border-blue-200' : 'bg-card hover:bg-accent border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[inq.status] || STATUS_COLORS.new}`}>
                    {inq.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="font-medium text-sm truncate">{inq.name}</p>
                <p className="text-muted-foreground text-[11px] truncate">{inq.message}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      {selectedInquiry ? (
        <div className="flex-1 bg-card rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border/20">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{selectedInquiry.name}</h3>
                <p className="text-muted-foreground text-[12px]">{selectedInquiry.email}</p>
                {selectedInquiry.phone && (
                  <p className="text-muted-foreground text-[12px] flex items-center gap-1 mt-0.5">
                    <PhoneIcon size={10} /> {selectedInquiry.phone}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="md:hidden p-1 text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedInquiry.purpose && <span className="text-[10px] bg-muted px-2.5 py-1 rounded-full">📍 {selectedInquiry.purpose}</span>}
              {selectedInquiry.material && <span className="text-[10px] bg-muted px-2.5 py-1 rounded-full">🪨 {selectedInquiry.material}</span>}
              {selectedInquiry.project_type && <span className="text-[10px] bg-muted px-2.5 py-1 rounded-full">🏗 {selectedInquiry.project_type}</span>}
              {selectedInquiry.area && <span className="text-[10px] bg-muted px-2.5 py-1 rounded-full">📐 {selectedInquiry.area}</span>}
              {selectedInquiry.product_interest && <span className="text-[10px] bg-muted px-2.5 py-1 rounded-full">⭐ {selectedInquiry.product_interest}</span>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="bg-muted rounded-xl p-4 max-w-[80%]">
              <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <Clock size={10} />
                {new Date(selectedInquiry.created_at).toLocaleString('en-IN')}
              </p>
            </div>
            {replies.map(reply => (
              <div key={reply.id} className="ml-auto max-w-[80%]">
                <div className={`rounded-xl p-4 ${reply.reply_type === 'whatsapp' ? 'bg-[#dcf8c6]' : 'bg-blue-50'}`}>
                  <p className="text-sm whitespace-pre-wrap">{reply.reply_text}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 justify-end">
                    <CheckCircle2 size={10} />
                    {reply.reply_type === 'whatsapp' ? 'WhatsApp' : 'Email'} • {new Date(reply.sent_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/20 p-4">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-3">
              {REPLY_TEMPLATES.map(t => (
                <button key={t.label} onClick={() => applyTemplate(t.text)}
                  className="shrink-0 text-[10px] font-medium bg-muted hover:bg-accent px-3 py-1.5 rounded-full transition-colors">
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Type your reply..." rows={2}
                className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring transition-all" />
              <div className="flex flex-col gap-1.5">
                <button onClick={() => handleReply('email')} disabled={!replyText.trim() || sending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-[11px] font-medium rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors">
                  <Mail size={12} /> Email
                </button>
                <button onClick={() => handleReply('whatsapp')} disabled={!replyText.trim() || !selectedInquiry.phone || sending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-[11px] font-medium rounded-lg hover:bg-[#20bd5a] disabled:opacity-40 transition-colors">
                  <MessageCircle size={12} /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-card rounded-2xl">
          <p className="text-muted-foreground text-sm">Select an inquiry to view details and reply.</p>
        </div>
      )}
    </div>
  );
}
