import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  Check 
} from 'lucide-react';
import { chatAPI } from '../services/api';
import { Tender } from '../types';

export interface TenderAIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tender?: Tender | null;
  activeTender?: Tender | null;
  tenders?: Tender[];
  companyProfile?: any;
}

interface MessageItem {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

export default function TenderAIChatDrawer({
  isOpen,
  onClose,
  tender,
  activeTender,
  tenders = [],
  companyProfile
}: TenderAIChatDrawerProps) {
  const currentTender = tender || activeTender;
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      role: 'assistant',
      content: currentTender 
        ? `Hello! I am your AI Tender & RFP Specialist for **"${currentTender.title}"** (\`${currentTender.tenderNumber || ''}\`). Ask me anything about clauses, eligibility, penalties, or compliance matrix requirements!`
        : `Hello! I am your AI Tender Specialist. Ask any question regarding tender eligibility, EMD rules, or proposal drafting.`
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tender) {
      setMessages([
        {
          role: 'assistant',
          content: `Loaded **"${tender.title}"** (Issued by: *${tender.organization || 'Authority'}*).\n\nEstimated Value: **${tender.estimatedValueDisplay || ''}** | EMD: **${tender.emdDisplay || ''}**\n\nHow can I help your bid team?`
        }
      ]);
    }
  }, [tender?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickQuestions = [
    'What is the EMD requirement?',
    'What are the Liquidated Damages (LD) penalties?',
    'Check our turnover eligibility match',
    'Summarize core deliverables and SLA'
  ];

  const handleSend = async (questionText: string | null = null) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const currentTender = tender || (tenders.length > 0 ? tenders[0] : null);
    if (!currentTender) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: textToSend },
        { role: 'assistant', content: 'Please select or upload a tender first to query specific clauses.' }
      ]);
      setInput('');
      return;
    }

    const newMessages: MessageItem[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newMessages.map(m => ({ sender: m.role as "user" | "assistant" | "system", text: m.content }));
      const res = await chatAPI.sendQuery(currentTender.id, textToSend, historyPayload);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.data.answer }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${err.response?.data?.error || err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0D3B36] text-white flex items-center justify-center font-bold text-sm">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              Tender Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h3>
            <p className="text-[11px] text-slate-500 truncate max-w-[250px]">
              {tender ? tender.title : 'General Bid Advisor'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 hover:text-[#0D5C52] text-slate-600 border border-slate-200 transition-all shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-[#0D3B36] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                T
              </div>
            )}

            <div
              className={`relative group max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                m.role === 'user'
                  ? 'bg-[#0D3B36] text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {m.role === 'assistant' && (
                <button
                  onClick={() => handleCopy(m.content, idx)}
                  className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 bg-slate-100 rounded transition-all cursor-pointer"
                  title="Copy"
                >
                  {copiedIdx === idx ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                </button>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                <User size={13} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start items-center text-xs text-[#0D5C52]">
            <Loader2 size={14} className="animate-spin" />
            <span>Analyzing tender clauses...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={tender ? `Ask about ${tender.tenderNumber || 'this tender'}...` : 'Ask question...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 custom-input text-xs py-2 px-3 bg-slate-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#092B27] text-white disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}
