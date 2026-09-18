import { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Zap,
  MessageSquare,
  Code2,
  Presentation,
  Image as ImageIcon,
  Globe,
  FileText,
  X,
  Mic,
  MicOff,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setIsLoading } from "../redux/message.slice";
import { deductUserCredits } from "../redux/user.slice";
import { sendPrompt } from "../features/agent.api";
import {
  createConversation,
  updateConversations,
} from "../features/conversation.api";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversation.slice";

const AGENTS = [
  {
    id: "auto",
    icon: Zap,
    label: "Auto",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "chat",
    icon: MessageSquare,
    label: "Chat",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "coding",
    icon: Code2,
    label: "Coding",
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  },
  {
    id: "search",
    icon: Globe,
    label: "Search",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "pdf",
    icon: FileText,
    label: "PDF",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
  {
    id: "ppt",
    icon: Presentation,
    label: "PPT",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "image",
    icon: ImageIcon,
    label: "Image",
    color: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  },
];

const PLACEHOLDERS = {
  auto: "Ask Bearly anything, or choose a specialized agent below...",
  chat: "Chat with Bearly AI...",
  coding: "Describe the software, component, or algorithm you want...",
  search: "Search the web for live facts, papers, or news...",
  pdf: "Describe the document you want to generate as a PDF...",
  ppt: "Describe the presentation topic and slide count...",
  image: "Describe the image you want to generate in detail...",
};

export default function ChatInput({ setBanner }) {
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef(""); // 👈 Speech Pause Bug Fix: Stores finalized words permanently

  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading } = useSelector((state) => state.message);

  // Auto resize textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  // Listen for Starter Prompt Clicks from MessageList
  useEffect(() => {
    const handleStarterPrompt = (e) => {
      const { prompt, agent } = e.detail;
      setValue(prompt);
      if (agent) setSelectedAgent(agent);
      textareaRef.current?.focus();
    };

    window.addEventListener("apply-starter-prompt", handleStarterPrompt);
    return () =>
      window.removeEventListener("apply-starter-prompt", handleStarterPrompt);
  }, []);

  // Voice Recognition Setup with Pause Persistence
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let currentFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          currentFinal += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (currentFinal) {
        baseTextRef.current += currentFinal;
      }

      setValue(baseTextRef.current + interimTranscript);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Set existing input as base text so previous words are never lost
      baseTextRef.current = value ? value.trim() + " " : "";
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const prompt = value.trim();
    if (!prompt && !selectedFile) return;
    if (isLoading) return;

    dispatch(setIsLoading(true));

    try {
      let conversation = selectedConversation;

      if (!conversation) {
        const newConversation = await createConversation();
        dispatch(addConversation(newConversation));
        dispatch(setSelectedConversation(newConversation));
        conversation = newConversation;
      }

      if (conversation.title === "New Chat" && prompt) {
        const titleSnippet = prompt.slice(0, 32);
        await updateConversations(conversation._id, titleSnippet);
        dispatch(
          setConvTitle({
            conversationId: conversation._id,
            title: titleSnippet,
          }),
        );
      }

      dispatch(addMessage({ role: "user", content: prompt }));
      setValue("");

      const formData = new FormData();
      formData.append("conversationId", conversation._id);
      formData.append("prompt", prompt);
      formData.append("agent", selectedAgent);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      setSelectedFile(null);

      const data = await sendPrompt(formData);

      const COST_MAP = {
        chat: 1,
        search: 5,
        coding: 10,
        pdf: 10,
        ppt: 10,
        image: 10,
        auto: 1,
      };

      dispatch(deductUserCredits(COST_MAP[selectedAgent] || 1));
      
      dispatch(
        addMessage({
          role: "assistant",
          content: data.answer,
          images: data.images || [],
        }),
      );

      if (data.artifacts && data.artifacts.length > 0) {
        dispatch(setArtifacts(data.artifacts));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      if (setBanner) {
        setBanner({
          open: true,
          title: error.response?.data?.title || "Agent Execution Warning",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to get AI response. Please try again.",
        });
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="w-full px-3 md:px-6 pb-4 pt-2 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/90 to-transparent">
      <div className="max-w-3xl mx-auto flex flex-col gap-2.5 p-3 rounded-2xl bg-[#13151f]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/60 focus-within:border-indigo-500/40 focus-within:shadow-indigo-500/10 transition-all duration-200">
        {/* Attached File Preview Tag */}
        {selectedFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 w-fit text-indigo-300 text-[12px] animate-in fade-in">
            <FileSpreadsheet size={14} className="text-indigo-400" />
            <span className="max-w-[200px] truncate font-medium">
              {selectedFile.name}
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-0.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Text Input Area */}
        <div className="flex items-end gap-2 px-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDERS[selectedAgent] || "Ask anything..."}
            className="flex-1 bg-transparent text-[14px] text-slate-100 placeholder:text-slate-500 resize-none outline-none leading-relaxed max-h-[180px] py-1"
          />

          {/* Action Buttons: Mic, File, Send */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Attach Image or PDF"
            >
              <Paperclip size={16} />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
              }`}
              title={
                isListening ? "Listening... Click to stop" : "Voice Typing"
              }
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Submit Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={(!value.trim() && !selectedFile) || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 active:from-indigo-600 active:to-violet-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
              title="Send Message (Enter)"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Agent Selector Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.04] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[11px] font-medium text-slate-500 mr-1 select-none hidden sm:inline">
            Agent:
          </span>
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isActive = selectedAgent === agent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all duration-150 cursor-pointer shrink-0 border ${
                  isActive
                    ? `${agent.color} shadow-sm shadow-indigo-500/10 font-semibold`
                    : "text-slate-400 bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:text-slate-200"
                }`}
              >
                <Icon size={12} />
                <span>{agent.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
