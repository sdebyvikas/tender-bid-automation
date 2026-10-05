import React from 'react';
import { 
  LayoutGrid, 
  Search, 
  HelpCircle, 
  Bell, 
  Menu,
  Bot
} from 'lucide-react';
import { Tender } from '../types';

interface NavbarProps {
  selectedTender?: Tender | null;
  onBackToDashboard?: () => void;
  onToggleChat?: () => void;
  onOpenMobileSidebar?: () => void;
  activeTab?: string;
}

export default function Navbar({ 
  selectedTender, 
  onBackToDashboard, 
  onToggleChat, 
  onOpenMobileSidebar,
  activeTab 
}: NavbarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white sticky top-0 z-30">
      
      {/* Left — Breadcrumb & Mobile Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
          <LayoutGrid size={15} className="text-slate-400" />
          <span>
            {selectedTender && activeTab === 'details'
              ? `${selectedTender.tenderNumber || ''} • ${selectedTender.title}`
              : activeTab === 'company'
              ? 'Company Vault'
              : activeTab === 'analytics'
              ? 'Portfolio Analytics'
              : 'Overview'}
          </span>
        </div>
      </div>

      {/* Right — Search with ⌘K, Help, Bell, Avatar */}
      <div className="flex items-center gap-3.5">
        
        {/* Search Bar */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tenders, documents..."
            className="w-72 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl pl-9 pr-10 py-1.5 text-xs text-slate-700 placeholder-slate-400 outline-none transition-all shadow-inner"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-400 shadow-xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* AI Copilot Quick Button */}
        <button
          onClick={onToggleChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#0D5C52] text-xs font-bold transition-colors cursor-pointer"
          title="Open AI Tender Copilot"
        >
          <Bot size={14} className="text-[#0D5C52]" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Help Circle */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          title="Help & Support"
        >
          <HelpCircle size={17} />
        </button>

        {/* Notifications */}
        <button
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
        </button>

        {/* User Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#0D5C52] border border-[#A7F3D0] flex items-center justify-center text-xs font-extrabold cursor-pointer select-none"
          title="Arjun / Vikas (Admin)"
        >
          AM
        </div>

      </div>
    </header>
  );
}
