import React from "react";
import { Sparkles, X } from "lucide-react";
import TenderIntakeAIChat from "../../../components/TenderIntakeAIChat";
import { Tender } from "../../../types/tender";
import { CompanyProfile } from "../../../types/company";

interface TenderCopilotDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isHubMode: boolean;
  currentTender: Tender | null;
  companyProfile?: CompanyProfile | null;
}

export const TenderCopilotDrawer: React.FC<TenderCopilotDrawerProps> = ({
  isOpen,
  onOpen,
  onClose,
  isHubMode,
  currentTender,
  companyProfile,
}) => {
  return (
    <>
      {/* Floating small 'Ask' Copilot button */}
      {isHubMode && currentTender && !isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-5 right-6 z-40 px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400/40 backdrop-blur-xs group"
          title="Ask Tender Copilot AI"
        >
          <Sparkles
            size={14}
            className="text-emerald-300 group-hover:rotate-12 transition-transform"
          />
          <span className="text-xs font-bold tracking-wide">Ask</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
        </button>
      )}

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={onClose}
          />

          {/* Drawer Container */}
          <div className="relative w-full sm:w-[500px] md:w-[560px] max-w-full h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Top Bar */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#0C3B34] via-[#0E473F] to-[#173C40] text-white flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
                  <Sparkles size={17} className="text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                      Tender Copilot AI
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10.5px] text-emerald-100/80 truncate font-mono">
                    {currentTender?.tenderNumber || "Active RFP Intelligence"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* AI Chatbot Component Embedded */}
            <div className="flex-1 overflow-hidden p-0 flex flex-col">
              <TenderIntakeAIChat
                tender={currentTender}
                companyProfile={companyProfile}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
