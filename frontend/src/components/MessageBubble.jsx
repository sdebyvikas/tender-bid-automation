import { useState } from "react";
import { useDispatch } from "react-redux";
import { setArtifacts } from "../redux/message.slice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiExternalLink, FiX } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Code2,
  ArrowUpRight,
  FileCode2
} from "lucide-react";

export default function MessageBubble({ role, content, images = [], artifacts = [] }) {
  const dispatch = useDispatch();
  const isUser = role === "user";

  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [copiedFull, setCopiedFull] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const copyFullMessage = async () => {
    await navigator.clipboard.writeText(content || "");
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const toggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = (content || "").replace(/```[\s\S]*?```/g, "Code block omitted.");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-US";
      utterance.rate = 1.05;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const markdown = (content || "")
    .replace(/```review/gi, "```")
    .replace(/```text/gi, "```")
    .replace(/```[a-zA-Z0-9_-]+\s+id="[^"]*"/g, "```");

  // User Message (Right-aligned Pill like ChatGPT)
  if (isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[80%] md:max-w-[70%] px-4 py-2.5 rounded-2xl bg-[#2a2b36] text-slate-100 text-[14px] leading-relaxed shadow-sm break-words">
          {content}
        </div>
      </div>
    );
  }

  // Assistant Message (Clean, Left-aligned, ChatGPT Style with Actions)
  return (
    <div className="flex flex-col gap-2.5 w-full text-left group">
      
      {/* 1. Generated Inline Artifact Card (Claude & v0 Style) */}
      {artifacts?.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/25 flex items-center justify-between gap-3 shadow-md shadow-indigo-500/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileCode2 size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-semibold text-slate-100 truncate">
                {artifacts[0]?.title || "Generated Project Artifact"}
              </h4>
              <p className="text-[11px] text-slate-400">
                {artifacts[0]?.files?.length || 1} project files • Ready to preview & export
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setArtifacts(artifacts))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-semibold shadow-md shadow-indigo-600/20 transition-all border-none cursor-pointer shrink-0"
          >
            <span>Open in Studio</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      )}

      {/* 2. Generated Images (If any) */}
      {images?.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="AI Output"
              loading="lazy"
              onClick={() => setLightboxSrc(img)}
              onError={(e) => e.currentTarget.remove()}
              className="w-48 h-36 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 hover:scale-[1.01] transition-all shadow-md"
            />
          ))}
        </div>
      )}

      {/* 3. Main Text & Code Content */}
      <div className="text-[14.5px] leading-relaxed text-slate-200 break-words font-normal">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2 pb-1 border-b border-white/[0.08]">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold text-slate-100 mt-3.5 mb-1.5">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold text-slate-200 mt-3 mb-1">{children}</h3>
            ),
            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 my-2.5 text-slate-300">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 my-2.5 text-slate-300">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            table: ({ children }) => (
              <div className="overflow-x-auto my-3.5 rounded-xl border border-white/[0.08]">
                <table className="min-w-full text-left text-xs">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-white/[0.06] px-3.5 py-2 font-semibold text-slate-200 border-b border-white/[0.08]">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3.5 py-2 border-b border-white/[0.04] text-slate-300">{children}</td>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1 font-medium"
              >
                {children}
                <FiExternalLink size={11} />
              </a>
            ),
            code({ className, children }) {
              const value = String(children)
                .replace(/^\s*```[^\n]*\n/, "")
                .replace(/\n```\s*$/, "")
                .trim();

              if (!className) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-white/[0.08] text-indigo-300 text-[12.5px] font-mono border border-white/[0.06]">
                    {value}
                  </code>
                );
              }

              const language = className.replace("language-", "");

              return (
                <div className="my-3.5 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0b0d13] shadow-lg shadow-black/40">
                  {/* Mac Window Header */}
                  <div className="flex items-center justify-between bg-[#131620] border-b border-white/[0.06] px-3.5 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono ml-2">
                        {language || "code"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCode(value)}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      {copiedCode === value ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    wrapLongLines
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "14px 16px",
                      background: "#0b0d13",
                      fontSize: "12.5px",
                      lineHeight: "1.6",
                    }}
                  >
                    {value}
                  </SyntaxHighlighter>
                </div>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {/* 4. Action Bar (ChatGPT Style below response) */}
      <div className="flex items-center gap-2 pt-1 text-slate-500">
        <button
          type="button"
          onClick={copyFullMessage}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] hover:text-slate-300 transition-colors cursor-pointer"
          title="Copy response"
        >
          {copiedFull ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>

        <button
          type="button"
          onClick={toggleSpeech}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isSpeaking ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-white/[0.06] hover:text-slate-300"
          }`}
          title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
        >
          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        <button
          type="button"
          onClick={() => setFeedback(feedback === "like" ? null : "like")}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            feedback === "like" ? "text-emerald-400 bg-emerald-500/10" : "hover:bg-white/[0.06] hover:text-slate-300"
          }`}
          title="Good response"
        >
          <ThumbsUp size={14} />
        </button>

        <button
          type="button"
          onClick={() => setFeedback(feedback === "dislike" ? null : "dislike")}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            feedback === "dislike" ? "text-red-400 bg-red-500/10" : "hover:bg-white/[0.06] hover:text-slate-300"
          }`}
          title="Bad response"
        >
          <ThumbsDown size={14} />
        </button>
      </div>

      {/* 5. Fullscreen Lightbox Modal */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
          <img
            src={lightboxSrc}
            alt="Expanded Output"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/15 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
