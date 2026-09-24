import React, { useState } from 'react';
import { 
  Plus, 
  Share2, 
  Briefcase, 
  Folder, 
  Zap, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  Edit3, 
  BookOpen, 
  MoreHorizontal,
  Building,
  Clock,
  Search,
  LayoutGrid,
  List,
  Trash2
} from 'lucide-react';

export default function Dashboard({ 
  tenders = [], 
  onSelectTender, 
  onOpenUpload, 
  onOpenChatWithTender, 
  onDeleteTender 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const totalTenders = tenders.length;
  const totalPipelineINR = tenders.reduce((acc, t) => acc + (Number(t.estimatedValueINR) || 0), 0);
  const featuredTender = tenders[0] || null;

  const filteredTenders = tenders.filter(t => 
    (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.tenderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.organization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysRemaining = (deadlineStr) => {
    if (!deadlineStr) return null;
    const diff = new Date(deadlineStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-7 animate-in fade-in duration-200">
      
      {/* ── Top Hero Greeting & Action Buttons ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11.5px] font-mono text-slate-400">
            Workspace <span className="text-slate-300">&gt;</span> <strong className="text-slate-600 font-semibold">Overview</strong>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning, Arjun</span>
            <span className="text-amber-400 text-xl font-serif select-none">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Here's the pulse of your bid workspace. One tender is ready for your decision.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Workspace invite link copied to clipboard!')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Share2 size={14} className="text-slate-500" />
            <span>Share workspace</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0D3B36] hover:bg-[#092B27] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>New tender</span>
          </button>
        </div>
      </div>

      {/* ── 4 Metric Cards Row (Exact TenderFlow layout) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Tenders (Dark Petrol Card) */}
        <div className="bg-[#102D36] text-white p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8BB7BA]">Active tenders</span>
            <div className="w-8 h-8 rounded-full bg-[#1C424C] flex items-center justify-center text-[#48A9A6]">
              <Briefcase size={15} />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold tracking-tight text-white">{totalTenders || 12}</div>
            <div className="text-[11.5px] font-semibold text-[#48A9A6] mt-1 flex items-center gap-1">
              <span>↗ 18.2%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>

          {/* Mini Teal Bar Chart */}
          <div className="flex items-end gap-1.5 h-6 pt-1">
            {[40, 65, 30, 80, 55, 90, 75].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-xs bg-[#24525C]" 
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Card 2: Vault Readiness (White Card) */}
        <div className="tf-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Vault readiness</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Folder size={15} />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">96<span className="text-xl font-bold text-slate-500">%</span></div>
            <div className="text-[11.5px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↗ 4.8%</span>
              <span className="text-slate-400 font-normal">this quarter</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }}></div>
          </div>
        </div>

        {/* Card 3: Avg Preparation Time (White Card) */}
        <div className="tf-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg. preparation time</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <Zap size={15} />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">34<span className="text-xl font-bold text-slate-500">m</span></div>
            <div className="text-[11.5px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↘ 41.5%</span>
              <span className="text-slate-400 font-normal">vs manual process</span>
            </div>
          </div>

          {/* Mini Purple Bar Chart */}
          <div className="flex items-end gap-1.5 h-6 pt-1">
            {[70, 55, 60, 45, 40, 35, 30].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-xs bg-purple-200" 
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Card 4: Potential Bid Value (White Card) */}
        <div className="tf-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Potential bid value</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <Coins size={15} />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{(totalPipelineINR / 10000000).toFixed(1)}<span className="text-xl font-bold text-slate-500">Cr</span>
            </div>
            <div className="text-[11.5px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↗ 12.8%</span>
              <span className="text-slate-400 font-normal">across open bids</span>
            </div>
          </div>

          {/* Mini Amber Bar Chart */}
          <div className="flex items-end gap-1.5 h-6 pt-1">
            {[30, 45, 60, 50, 75, 80, 95].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-xs bg-amber-200" 
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>

      </div>

      {/* ── BID COMMAND CENTER • LIVE WORKFLOW (Hero Featured Card) ── */}
      {featuredTender && (
        <div className="tf-command-card p-6 sm:p-7 shadow-xl">
          
          {/* Card Top Label & Badge */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-extrabold tracking-widest text-[#34D399] uppercase">
                BID COMMAND CENTER
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[10.5px] font-bold tracking-widest text-slate-400 uppercase">
                LIVE WORKFLOW
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3B2A14] text-[#FBBF24] border border-[#FBBF24]/30 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]"></span>
                <span>In review</span>
              </span>
              <button className="text-slate-400 hover:text-white p-1">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Featured Title & Metadata */}
          <div className="py-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {featuredTender.tenderNumber} • {featuredTender.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>{featuredTender.organization}</span>
              <span>•</span>
              <span className="text-slate-300">
                Due {new Date(featuredTender.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Workflow Stepper Flow with Dial */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-4 border-t border-b border-white/[0.08]">
            
            {/* Left Circular Dial */}
            <div className="lg:col-span-4 flex items-center gap-4">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-[#103D37] border-t-[#34D399] border-r-[#34D399] shrink-0">
                <div className="text-center">
                  <div className="text-base font-extrabold text-white leading-none">
                    {featuredTender.goNoGoAnalysis?.overallScore || 82.5}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">/ 100</div>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Readiness score</div>
                <div className="text-sm font-extrabold text-white">Good to proceed</div>
                <div className="text-xs text-slate-400">2 checkpoints need your attention</div>
              </div>
            </div>

            {/* Stepper Nodes */}
            <div className="lg:col-span-8 grid grid-cols-3 sm:grid-cols-6 gap-2">
              
              {/* Step 1: Company Vault */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-full bg-[#134E48] text-[#34D399] border border-[#34D399]/40 flex items-center justify-center text-xs font-extrabold shadow-sm">
                  ✓
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Company Vault</div>
                  <div className="text-[9.5px] text-slate-400">Profile &amp; documents</div>
                </div>
              </div>

              {/* Step 2: Tender Intake */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-full bg-[#134E48] text-[#34D399] border border-[#34D399]/40 flex items-center justify-center text-xs font-extrabold shadow-sm">
                  ✓
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Tender Intake</div>
                  <div className="text-[9.5px] text-slate-400">Upload &amp; extract</div>
                </div>
              </div>

              {/* Step 3: Eligibility (Active) */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-full bg-[#3B2A14] text-[#FBBF24] border border-[#FBBF24]/50 flex items-center justify-center text-xs shadow-md">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#FBBF24]">Eligibility</div>
                  <div className="text-[9.5px] text-slate-400">Rules &amp; score</div>
                </div>
              </div>

              {/* Step 4: Payment Proof */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.1] flex items-center justify-center text-xs">
                  <CreditCard size={13} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-300">Payment Proof</div>
                  <div className="text-[9.5px] text-slate-400">Fee &amp; EMD</div>
                </div>
              </div>

              {/* Step 5: Proposal Desk */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.1] flex items-center justify-center text-xs">
                  <Edit3 size={13} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-300">Proposal Desk</div>
                  <div className="text-[9.5px] text-slate-400">Draft &amp; review</div>
                </div>
              </div>

              {/* Step 6: PDF Binder */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.1] flex items-center justify-center text-xs">
                  <BookOpen size={13} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-300">PDF Binder</div>
                  <div className="text-[9.5px] text-slate-400">Assemble &amp; export</div>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>
                Next best action: <strong className="text-white font-semibold">review the missing ISO 27001 certificate</strong>
              </span>
            </div>

            <button
              onClick={() => onSelectTender(featuredTender)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#34D399] hover:underline cursor-pointer"
            >
              <span>Open bid workflow</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

        </div>
      )}

      {/* ── Active Tenders Pipeline Grid ── */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Active Bid Pipelines</h2>
            <p className="text-xs text-slate-500">Select any tender to review the compliance matrix and generate bid annexures.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter bids..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-700 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenders.map((tender) => {
            const daysLeft = getDaysRemaining(tender.submissionDeadline);
            const decision = tender.goNoGoAnalysis?.decision || 'GO';
            const winProb = tender.goNoGoAnalysis?.winProbability || 75;

            return (
              <div
                key={tender.id}
                onClick={() => onSelectTender(tender)}
                className="tf-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#0D5C52] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {tender.tenderNumber}
                    </span>
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      decision === 'GO' ? 'badge-go' : decision === 'CONDITIONAL GO' ? 'badge-conditional' : 'badge-nogo'
                    }`}>
                      {decision} ({winProb}%)
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#0D5C52] transition-colors line-clamp-2">
                    {tender.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                    <Building size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{tender.organization}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Est. Value</span>
                      <span className="text-xs font-bold text-slate-800">{tender.estimatedValueDisplay}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">EMD</span>
                      <span className="text-xs font-bold text-slate-800">{tender.emdDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={13} />
                    <span>{daysLeft !== null ? `${daysLeft} days left` : 'Active'}</span>
                  </div>

                  <span className="text-xs font-bold text-[#0D5C52] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
