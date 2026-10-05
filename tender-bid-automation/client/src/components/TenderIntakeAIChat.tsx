import React, { useState, useEffect, useRef } from "react";
import { Bot, Loader2, Send, Copy, Check, UserRound } from "lucide-react";
import { chatAPI } from "../services/api";
import { Tender, CompanyProfile } from "../types";

export interface TenderIntakeAIChatProps {
  tender: Tender | null;
  companyProfile?: CompanyProfile | null;
}

interface MessageItem {
  role: "assistant" | "user" | "system";
  content: string;
}

export default function TenderIntakeAIChat({ tender, companyProfile }: TenderIntakeAIChatProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      role: "assistant",
      content: `Hello! I am your AI Tender & RFP Specialist for **"${tender?.title || "this Tender"}"** (\`${tender?.tenderNumber || "RFP"}\`).\n\nAsk me anything about clauses, eligibility match, penalties, EMD exemptions, or scope of work!`,
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tender) {
      setMessages([
        {
          role: "assistant",
          content: `⚡ **Context Loaded: "${tender.title}"** (Ref: \`${tender.tenderNumber || ''}\`)\n\n• **Issuing Authority:** ${tender.organization || 'Government Authority'}\n• **Estimated Value:** ${tender.estimatedValueDisplay || "₹2.50 Cr"}\n• **EMD Security:** ${tender.emdDisplay || "₹50,000"}\n\nWhat specific clause, penalty, or requirement would you like me to inspect?`,
        },
      ]);
    }
  }, [tender?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const quickChips = [
    "What is the EMD & Exemption rule?",
    "What are the Liquidated Damages (LD) penalties?",
    "Check our turnover eligibility match",
    "Summarize scope of work & deliverables",
  ];

  const handleSend = async (queryText: string | null = null) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading || !tender) return;

    const newMessages: MessageItem[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = newMessages.map(m => ({ sender: m.role as "user" | "assistant" | "system", text: m.content }));
      const res = await chatAPI.sendQuery(tender.id, textToSend, historyPayload);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data?.answer || "Response generated.",
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error querying AI assistant: ${err.response?.data?.error || err.message}`,
        },
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-full min-h-[600px] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-[#0F2944] to-[#173C40] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Bot size={17} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">
                Tender Copilot AI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-emerald-200/70 truncate font-mono">
              Scoped: {tender?.tenderNumber || "Active RFP"}
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-200 border border-white/10 font-mono">
          Context Live
        </span>
      </div>

      {/* Suggested Quick Chips */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-1.5 shrink-0">
        {quickChips.map((chip, i) => (
          <button
            key={i}
            type="button"
            className="text-[10px] bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#173C40] px-2.5 py-1 rounded-full border border-slate-200 transition-colors shadow-2xs font-medium cursor-pointer"
            onClick={() => handleSend(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#fbfcfd]">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-md bg-[#173C40] text-emerald-300 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={13} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed relative group ${
                  isUser
                    ? "bg-[#173C40] text-white rounded-tr-none"
                    : "bg-white border border-slate-200/80 text-slate-800 shadow-2xs rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopy(m.content, idx)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-opacity cursor-pointer"
                    title="Copy response"
                  >
                    {copiedIdx === idx ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                )}
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-1">
                  <UserRound size={13} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-6 h-6 rounded-md bg-[#173C40] text-emerald-300 flex items-center justify-center shrink-0">
              <Bot size={13} />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-3 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
              <Loader2 size={13} className="animate-spin text-[#173C40]" />
              <span>Analyzing clauses for {tender?.tenderNumber}...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${tender?.tenderNumber || "this RFP"}...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173C40] focus:bg-white transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-[#173C40] hover:bg-[#20524F] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>
        <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
          <span>Press Enter to send</span>
          <span className="text-emerald-700 font-mono font-medium">
            ● Local Gemini/Groq LLM
          </span>
        </div>
      </div>
    </div>
  );
}
