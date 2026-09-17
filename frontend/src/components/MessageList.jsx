import MessageBubble from "./MessageBubble";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Code2, Presentation, FileText, Globe, ArrowUpRight } from "lucide-react";

function NeuralPulse() {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      {[0, 0.45, 0.9].map((delay, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-indigo-400/30"
          initial={{ scale: 0.3, opacity: 0.55 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.span
        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500"
        style={{ boxShadow: "0 0 14px rgba(129,140,248,0.75)" }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const THINKING_LABELS = ["Analyzing prompt", "Reasoning with Agents", "Generating solution", "Structuring artifacts"];

function GeneratingIndicator() {
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % THINKING_LABELS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const label = THINKING_LABELS[labelIndex];

  return (
    <div className="flex items-center gap-3.5 max-w-[72%] py-2 px-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] w-fit">
      <NeuralPulse />
      <div className="flex overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            className="flex items-center gap-1"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <span className="text-[13px] font-medium tracking-wide text-slate-300">
              {label}
            </span>
            <span className="inline-flex gap-0.5 ml-1">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="w-1 h-1 rounded-full bg-indigo-400"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: dot * 0.2,
                  }}
                />
              ))}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const STARTER_PROMPTS = [
  {
    icon: Code2,
    agent: "coding",
    title: "Build a SaaS Dashboard in React",
    prompt: "Create a modern Analytics SaaS Dashboard in React with Tailwind CSS.",
    color: "from-blue-500/20 to-indigo-500/20",
    textColor: "text-blue-400",
  },
  {
    icon: Presentation,
    agent: "ppt",
    title: "Generate AI Startup Pitch Deck",
    prompt: "Create a 5-slide startup pitch deck presentation for an AI Autonomous Agent platform.",
    color: "from-amber-500/20 to-orange-500/20",
    textColor: "text-amber-400",
  },
  {
    icon: FileText,
    agent: "pdf",
    title: "Create AI Whitepaper PDF Report",
    prompt: "Generate a comprehensive executive summary PDF document about Large Language Models and AI Agents.",
    color: "from-rose-500/20 to-pink-500/20",
    textColor: "text-rose-400",
  },
  {
    icon: Globe,
    agent: "search",
    title: "Search Latest AI Tech News 2026",
    prompt: "Search the web for the latest artificial intelligence breakthroughs and model releases in 2026.",
    color: "from-emerald-500/20 to-teal-500/20",
    textColor: "text-emerald-400",
  },
];

export default function MessageList() {
  const bottomRef = useRef(null);
  const { messages, isLoading } = useSelector((state) => state.message);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (!selectedConversation?._id || selectedConversation?.title === "New Chat") return;
    const fetchChatMessages = async () => {
      const data = await getMessages(selectedConversation?._id);
      dispatch(setMessages(data));
      const latestArtifactMessage = [...data]
        .reverse()
        .find((msg) => msg.artifacts && msg.artifacts.length > 0);

      if (latestArtifactMessage) {
        dispatch(setArtifacts(latestArtifactMessage.artifacts));
      }
    };
    fetchChatMessages();
  }, [selectedConversation?._id]);

  const handleStarterClick = (starter) => {
    window.dispatchEvent(
      new CustomEvent("apply-starter-prompt", {
        detail: { prompt: starter.prompt, agent: starter.agent },
      })
    );
  };

  const userName = userData?.name?.split(" ")?.[0] || "there";

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Centered Column matching bottom Input width */}
      <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col justify-between space-y-6">
        {messages.length === 0 && !isLoading ? (
          <div className="my-auto flex flex-col items-center justify-center max-w-xl mx-auto py-12 select-none animate-in fade-in zoom-in-95 duration-200">
            {/* Greeting */}
            <div className="flex flex-col items-center text-center gap-1.5 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
                Hello, Vikas 👋
                 {/* {userName}  */}
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                How can I help you today?
              </p>
            </div>

            {/* Compact 1-Line Starter Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {STARTER_PROMPTS.map((starter, index) => {
                const Icon = starter.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleStarterClick(starter)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.065] border border-white/[0.08] hover:border-indigo-500/40 text-left transition-all duration-150 cursor-pointer hover:shadow-md hover:shadow-indigo-500/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${starter.color} ${starter.textColor} shrink-0`}>
                        <Icon size={15} />
                      </div>
                      <span className="text-[12.5px] font-medium text-slate-200 group-hover:text-white truncate">
                        {starter.title}
                      </span>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 shrink-0 ml-2" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
              <MessageBubble
  role={msg.role}
  content={msg.content}
  images={msg?.images || []}
  artifacts={msg?.artifacts || []}
/>

              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <GeneratingIndicator />
              </motion.div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
