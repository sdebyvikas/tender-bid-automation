import React from 'react';
import { 
  LayoutGrid, 
  Folder, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  Edit3, 
  BookOpen, 
  ChevronDown, 
  BarChart3,
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  tenders = [], 
  selectedTender, 
  onSelectTender, 
  onOpenUpload, 
  companyProfile,
  mobileOpen,
  setMobileOpen
}) {
  const navItems = [
    {
      group: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutGrid, badge: null },
        { id: 'company', label: 'Company Vault', icon: Folder, badge: '96%' },
      ]
    },
    {
      group: 'BID WORKSPACE',
      items: [
        { id: 'intake', label: 'Tender Intake', icon: FileText, badge: tenders.length.toString() },
        { id: 'eligibility', label: 'Eligibility', icon: ShieldCheck, badge: null },
        { id: 'payment', label: 'Payment Proof', icon: CreditCard, badge: null },
        { id: 'proposal', label: 'Proposal Desk', icon: Edit3, badge: null },
        { id: 'binder', label: 'PDF Binder', icon: BookOpen, badge: 'Draft' },
      ]
    }
  ];

  const handleNavClick = (itemId) => {
    if (itemId === 'intake') {
      onOpenUpload();
    } else if (itemId === 'dashboard') {
      setActiveTab('dashboard');
      onSelectTender(null);
    } else if (itemId === 'company') {
      setActiveTab('company');
    } else if (itemId === 'analytics') {
      setActiveTab('analytics');
    } else if (['eligibility', 'payment', 'proposal', 'binder'].includes(itemId)) {
      if (!selectedTender && tenders.length > 0) {
        onSelectTender(tenders[0]);
      }
      setActiveTab('details');
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 lg:static flex flex-col w-[260px] h-screen bg-[#0B1924] text-slate-300 select-none transition-transform duration-200 shrink-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D3B36] border border-[#14534B] flex items-center justify-center font-extrabold text-white text-base shadow-sm">
              T
            </div>
            <div>
              <div className="font-extrabold text-[17px] text-white tracking-tight leading-none">
                TenderFlow
              </div>
              <div className="text-[10px] font-bold tracking-wider text-[#48A9A6] uppercase mt-1">
                BID OPERATIONS OS
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Switcher Card */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08121B] border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1A3835] text-[#34D399] border border-[#34D399]/30 flex items-center justify-center text-xs font-extrabold shrink-0">
                TS
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{companyProfile?.name || 'Tech Solutions'}</div>
                <div className="text-[10.5px] text-slate-400 truncate">Admin workspace</div>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />
          </div>
        </div>

        {/* Nav Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 sidebar-scroll">
          {navItems.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold tracking-widest text-[#4A6072] uppercase mb-1.5">
                {sec.group}
              </div>

              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = 
                    (item.id === 'dashboard' && activeTab === 'dashboard' && !selectedTender) ||
                    (item.id === 'company' && activeTab === 'company') ||
                    (item.id === 'analytics' && activeTab === 'analytics') ||
                    (['eligibility', 'payment', 'proposal', 'binder'].includes(item.id) && activeTab === 'details');

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#102A33] text-white border border-[#1F464D] shadow-sm'
                          : 'text-[#8EA2B3] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          size={16} 
                          className={isActive ? 'text-[#34D399]' : 'text-[#64748B]'} 
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                          item.badge === '96%' 
                            ? 'bg-[#0E3B36] text-[#34D399] border border-[#34D399]/30 font-mono'
                            : item.badge === 'Draft'
                            ? 'bg-slate-800 text-slate-300 border border-slate-700 text-[9.5px]'
                            : 'bg-white/[0.08] text-slate-300 font-mono text-[10.5px]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom "30 min to bid-ready" Card (Exact match from screenshot) */}
        <div className="p-3.5 border-t border-white/[0.06] bg-[#08121B]">
          <div className="p-3 rounded-2xl bg-[#10252C] border border-[#1C424C] space-y-2">
            <div className="w-6 h-6 rounded-lg bg-[#144743] text-[#34D399] flex items-center justify-center">
              <Sparkles size={13} />
            </div>
            
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white leading-tight">30 min to bid-ready</div>
              <p className="text-[10.5px] text-slate-400 leading-snug">
                Your workflow is 41% faster than the team average.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('analytics')}
              className="text-[11px] font-bold text-[#34D399] hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
            >
              <span>See insights</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
