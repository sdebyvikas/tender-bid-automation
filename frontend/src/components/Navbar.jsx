import { MessageSquare, Zap, Sparkles, Crown } from "lucide-react";
import { useSelector } from "react-redux";
import { useState } from "react";
import BillingDrawer from "./BillingDrawer";

export default function Navbar() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);
  const { userData } = useSelector((state) => state.user);
  const [showBilling, setShowBilling] = useState(false);

  const credits = userData?.credits ?? 0;
  const title = selectedConversation?.title || "New Chat";

  return (
    <>
      <div className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] bg-[#0c0e14]/80 backdrop-blur-md shrink-0">
        
        {/* Left — Chat Title & Message Count */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shrink-0">
            <MessageSquare size={13} className="text-indigo-400" />
          </div>
          <h2 className="text-[14px] font-semibold text-slate-100 tracking-tight truncate max-w-[220px] sm:max-w-[340px]">
            {title}
          </h2>
          {messages?.length > 0 && (
            <span className="hidden sm:inline-flex text-[10.5px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full shrink-0">
              {messages.length} {messages.length === 1 ? "msg" : "msgs"}
            </span>
          )}
        </div>

        {/* Right — AI Status & Live Credits Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Active Model Indicator */}
<div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-medium">
  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
  <span>Smart AI</span>
</div>

          {/* Credits & Plan Pill (Click opens Billing Drawer) */}
          <button
            onClick={() => setShowBilling(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/15 to-purple-500/15 hover:from-indigo-500/25 hover:to-purple-500/25 border border-indigo-500/30 text-indigo-300 text-[12px] font-semibold transition-all duration-150 cursor-pointer shadow-sm shadow-indigo-500/10"
            title="View Plans & Credits"
          >
            <Zap size={13} className="text-amber-400 fill-amber-400/20" />
            <span className="font-mono">{credits}</span>
            <span className="text-[10.5px] text-slate-400 hidden xs:inline">Credits</span>
          </button>
        </div>
      </div>

      {/* Billing Drawer */}
      <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
    </>
  );
}
