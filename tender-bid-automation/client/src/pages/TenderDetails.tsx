import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Bot, 
  RefreshCw, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sliders, 
  Calendar, 
  Clock,
} from 'lucide-react';
import { 
  complianceAPI, 
  proposalAPI, 
  boqAPI, 
  annexureAPI, 
  analysisAPI 
} from '../services/api';
import { Tender, ComplianceItem, BOQItem, ProposalSections } from '../types';

export interface TenderDetailsProps {
  tender: Tender;
  onBack: () => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
  onTenderUpdated: (tender: Tender) => void;
}

interface AnnexureItem {
  id: string;
  formNumber: string;
  title: string;
  description?: string;
  content: string;
}

export default function TenderDetails({ 
  tender, 
  onBack, 
  onOpenChat, 
  onOpenExport, 
  onTenderUpdated 
}: TenderDetailsProps) {
  const [currentTab, setCurrentTab] = useState<'overview' | 'compliance' | 'proposals' | 'boq' | 'annexures'>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeProposalSection, setActiveProposalSection] = useState<string>('executiveSummary');
  const [proposalInstructions, setProposalInstructions] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [complianceList, setComplianceList] = useState<ComplianceItem[]>(tender.complianceItems || []);
  const [proposals, setProposals] = useState<ProposalSections>(tender.proposals || {});
  const [boqList, setBoqList] = useState<BOQItem[]>(tender.boqItems || []);
  const [annexuresList, setAnnexuresList] = useState<AnnexureItem[]>([]);
  const [activeAnnexure, setActiveAnnexure] = useState<AnnexureItem | null>(null);

  // Commercial Margin Slider
  const [profitMargin, setProfitMargin] = useState<number>(18);
  const [taxRate, setTaxRate] = useState<number>(18);

  const [showAddClauseModal, setShowAddClauseModal] = useState<boolean>(false);
  const [newClause, setNewClause] = useState({
    clauseNo: 'Sec 3.0',
    requirement: '',
    category: 'Technical',
    status: 'Complied',
    justification: '',
    isMandatory: true,
    evidenceDoc: 'Technical Proposal'
  });

  useEffect(() => {
    async function loadAnnexures() {
      try {
        const res = await annexureAPI.getForTender(tender.id);
        setAnnexuresList(res.data.annexures || []);
        if (res.data.annexures?.length > 0) {
          setActiveAnnexure(res.data.annexures[0]);
        }
      } catch (err) {
        console.warn('Error loading annexures:', err);
      }
    }
    loadAnnexures();
  }, [tender.id]);

  const handleRecalculateGoNoGo = async () => {
    setLoading(true);
    try {
      const res = await analysisAPI.recalculateGoNoGo(tender.id);
      const updatedTender = { ...tender, goNoGoAnalysis: res.data.goNoGoAnalysis };
      onTenderUpdated(updatedTender);
    } catch (err: any) {
      alert(`Recalculation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateCompliance = async () => {
    if (!confirm('Extract and regenerate compliance checklist from document with AI?')) return;
    setLoading(true);
    try {
      const res = await complianceAPI.autoGenerate(tender.id);
      setComplianceList(res.data.complianceItems);
      onTenderUpdated({ ...tender, complianceItems: res.data.complianceItems });
    } catch (err: any) {
      alert(`Auto-compliance error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComplianceStatus = async (item: ComplianceItem, newStatus: string) => {
    const updated = complianceList.map(c => c.id === item.id ? { ...c, status: newStatus } : c);
    setComplianceList(updated);
    try {
      await complianceAPI.updateItem(tender.id, item.id, { status: newStatus });
      onTenderUpdated({ ...tender, complianceItems: updated });
    } catch (err) {
      console.error('Error updating compliance status:', err);
    }
  };

  const handleAddClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClause.requirement.trim()) return;
    try {
      const res = await complianceAPI.addItem(tender.id, newClause);
      setComplianceList(res.data.complianceItems);
      setShowAddClauseModal(false);
      setNewClause({
        clauseNo: `Sec ${complianceList.length + 1}.0`,
        requirement: '',
        category: 'Technical',
        status: 'Complied',
        justification: '',
        isMandatory: true,
        evidenceDoc: 'Technical Proposal'
      });
      onTenderUpdated({ ...tender, complianceItems: res.data.complianceItems });
    } catch (err: any) {
      alert(`Failed to add clause: ${err.message}`);
    }
  };

  const handleDeleteClause = async (itemId: string) => {
    try {
      const res = await complianceAPI.deleteItem(tender.id, itemId);
      setComplianceList(res.data.complianceItems);
      onTenderUpdated({ ...tender, complianceItems: res.data.complianceItems });
    } catch (err: any) {
      alert(`Failed to delete clause: ${err.message}`);
    }
  };

  const handleGenerateProposal = async (sectionKey: string) => {
    setLoading(true);
    try {
      const res = await proposalAPI.generateSection(tender.id, sectionKey, proposalInstructions);
      const updatedProposals = { ...proposals, [sectionKey]: res.data.content };
      setProposals(updatedProposals);
      setProposalInstructions('');
      onTenderUpdated({ ...tender, proposals: updatedProposals });
    } catch (err: any) {
      alert(`Proposal generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProposalText = async (sectionKey: string, text: string) => {
    const updated = { ...proposals, [sectionKey]: text };
    setProposals(updated);
    try {
      await proposalAPI.update(tender.id, { [sectionKey]: text });
      onTenderUpdated({ ...tender, proposals: updated });
    } catch (err) {
      console.error('Error saving proposal:', err);
    }
  };

  // BOQ Calculations
  const baseBOQTotal = boqList.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const marginAmount = Math.round((baseBOQTotal * profitMargin) / 100);
  const totalBeforeTax = baseBOQTotal + marginAmount;
  const taxAmount = Math.round((totalBeforeTax * taxRate) / 100);
  const finalBidPrice = totalBeforeTax + taxAmount;

  const handleAddBOQItem = async () => {
    const newItem = {
      item: 'New Deliverable Item / Service',
      category: 'Services',
      unit: 'Nos',
      quantity: 1,
      unitPrice: 100000,
      total: 100000
    };
    try {
      const res = await boqAPI.addItem(tender.id, newItem);
      setBoqList(res.data.boqItems);
      onTenderUpdated({ ...tender, boqItems: res.data.boqItems });
    } catch (err: any) {
      alert(`Failed to add BOQ item: ${err.message}`);
    }
  };

  const handleDeleteBOQItem = async (itemId: string) => {
    try {
      const res = await boqAPI.deleteItem(tender.id, itemId);
      setBoqList(res.data.boqItems);
      onTenderUpdated({ ...tender, boqItems: res.data.boqItems });
    } catch (err: any) {
      alert(`Failed to delete BOQ item: ${err.message}`);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const goNoGo = tender.goNoGoAnalysis || {};
  const decision = (goNoGo as any).decision || (goNoGo as any).recommendation || 'GO';

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="tf-card p-6 rounded-2xl bg-white border border-slate-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0D5C52] transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Overview</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{tender.title}</h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                decision === 'GO' || decision === 'BID' ? 'badge-go' : decision === 'CONDITIONAL GO' || decision === 'BID WITH CONDITIONS' ? 'badge-conditional' : 'badge-nogo'
              }`}>
                {decision} ({(goNoGo as any).winProbability || 75}% Win Probability)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-mono text-[#0D5C52] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                {tender.tenderNumber}
              </span>
              <span>•</span>
              <span className="text-slate-700 font-medium">{tender.organization}</span>
              <span>•</span>
              <span>Est. Value: <strong className="text-slate-900">{tender.estimatedValueDisplay}</strong></span>
              <span>•</span>
              <span>EMD: <strong className="text-slate-900">{tender.emdDisplay}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
            >
              <Bot size={15} className="text-[#0D5C52]" />
              <span>Ask Copilot</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D3B36] hover:bg-[#092B27] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Export Package</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 pt-5 mt-4 border-t border-slate-100 scrollbar-none">
          {[
            { id: 'overview' as const, label: '📊 Qualification & Score' },
            { id: 'compliance' as const, label: `✅ Compliance Matrix (${complianceList.length})` },
            { id: 'proposals' as const, label: '✍️ Proposal Desk' },
            { id: 'boq' as const, label: '💰 Commercial BOQ' },
            { id: 'annexures' as const, label: `📝 PDF Binder & Undertakings (${annexuresList.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === tab.id
                  ? 'bg-[#0D3B36] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Qualification Scorecard */}
            <div className="tf-card p-6 rounded-2xl space-y-4 lg:col-span-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Readiness Scorecard</span>
                <button
                  onClick={handleRecalculateGoNoGo}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Recalculate with Profile"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin text-[#0D5C52]' : ''} />
                </button>
              </div>

              <div className="text-center py-2">
                <div className="text-4xl font-extrabold text-slate-900">
                  {(goNoGo as any).winProbability || 80}%
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1 uppercase">
                  Qualification Decision: <strong className="text-slate-900">{decision}</strong>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Turnover Match</span>
                    <span className="font-bold text-slate-900">{(goNoGo as any).financialFitScore || 90}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0D5C52] rounded-full" style={{ width: `${(goNoGo as any).financialFitScore || 90}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Certifications & ISO</span>
                    <span className="font-bold text-slate-900">{(goNoGo as any).technicalFitScore || 85}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(goNoGo as any).technicalFitScore || 85}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Past Project Experience</span>
                    <span className="font-bold text-slate-900">{(goNoGo as any).experienceScore || 88}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(goNoGo as any).experienceScore || 88}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Summary */}
            <div className="tf-card p-6 rounded-2xl space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 text-[#0D5C52]">
                <Sparkles size={16} />
                <h3 className="font-bold text-sm text-slate-900">AI Qualification & Scope Assessment</h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {(goNoGo as any).recommendationSummary || 'Company profile exhibits high synergy with tender qualification criteria.'}
              </div>

              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Scope of Work Summary</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {tender.scopeSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Calendar size={18} className="text-[#0D5C52] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Submission Deadline</span>
                    <span className="text-xs font-bold text-slate-800">
                      {tender.due || (tender.submissionDeadline ? new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Clock size={18} className="text-slate-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pre-Bid Meeting</span>
                    <span className="text-xs font-bold text-slate-800">
                      {tender.preBidMeetingDate ? new Date(tender.preBidMeetingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SWOT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="tf-card p-4 rounded-xl space-y-2 border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Strengths</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                {((goNoGo as any).swot?.strengths || (goNoGo as any).strengths || ['Turnover satisfies criteria', 'Relevant past project references']).map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="tf-card p-4 rounded-xl space-y-2 border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase">
                <AlertTriangle size={14} className="text-amber-600" />
                <span>Weaknesses / Gaps</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                {((goNoGo as any).swot?.weaknesses || ['OEM hardware quote lock required']).map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="tf-card p-4 rounded-xl space-y-2 border-teal-200 bg-teal-50/50">
              <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs uppercase">
                <Sparkles size={14} className="text-teal-600" />
                <span>Opportunities</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                {((goNoGo as any).swot?.opportunities || ['High margin long-term AMC']).map((o: string, i: number) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>

            <div className="tf-card p-4 rounded-xl space-y-2 border-red-200 bg-red-50/50">
              <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs uppercase">
                <ShieldCheck size={14} className="text-red-600" />
                <span>Risks & Penalties</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                {((goNoGo as any).swot?.threats || (goNoGo as any).riskFactors || ['Liquidated damages for delivery lag']).map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: COMPLIANCE MATRIX */}
      {currentTab === 'compliance' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Clause-by-Clause Compliance Matrix</h3>
              <p className="text-xs text-slate-500">Track and respond to mandatory technical and SLA clauses</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoGenerateCompliance}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0D3B36] hover:bg-[#092B27] text-white shadow-xs cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Auto-Extract with AI</span>
              </button>

              <button
                onClick={() => setShowAddClauseModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Clause</span>
              </button>
            </div>
          </div>

          <div className="tf-card rounded-2xl overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-28">Clause No.</th>
                    <th className="py-3 px-4 min-w-[220px]">RFP Requirement</th>
                    <th className="py-3 px-4 w-28">Category</th>
                    <th className="py-3 px-4 w-36">Status</th>
                    <th className="py-3 px-4 min-w-[240px]">Justification & Evidence</th>
                    <th className="py-3 px-4 text-right w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complianceList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0D5C52]">{item.clauseNo}</td>
                      <td className="py-3.5 px-4 text-slate-900">
                        <p className="leading-snug">{item.requirement}</p>
                        {item.isMandatory && (
                          <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-100 text-red-700 border border-red-200">
                            Mandatory
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">{item.category}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateComplianceStatus(item, e.target.value)}
                          className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-800"
                        >
                          <option value="Complied">Complied</option>
                          <option value="Partially Complied">Partially Complied</option>
                          <option value="Deviation">Deviation</option>
                          <option value="Not Applicable">Not Applicable</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-xs space-y-1">
                        <p className="text-slate-700">{item.justification}</p>
                        {item.evidenceDoc && (
                          <span className="text-[11px] text-[#0D5C52] font-mono block">Ref: {item.evidenceDoc}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteClause(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROPOSAL DESK */}
      {currentTab === 'proposals' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex overflow-x-auto gap-1.5 p-1 bg-white rounded-xl border border-slate-200 scrollbar-none">
            {[
              { key: 'executiveSummary', label: '1. Executive Summary' },
              { key: 'technicalApproach', label: '2. Solution Architecture' },
              { key: 'implementationPlan', label: '3. Phased Rollout' },
              { key: 'slaGovernance', label: '4. SLA & Governance' },
              { key: 'riskMitigation', label: '5. Risk Mitigation' }
            ].map(sec => (
              <button
                key={sec.key}
                onClick={() => setActiveProposalSection(sec.key)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeProposalSection === sec.key
                    ? 'bg-[#0D3B36] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="tf-card p-5 rounded-2xl space-y-3 lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  {activeProposalSection.replace(/([A-Z])/g, ' $1')}
                </h3>
                <button
                  onClick={() => handleCopyText(proposals[activeProposalSection] || '', activeProposalSection)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  {copiedKey === activeProposalSection ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedKey === activeProposalSection ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <textarea
                rows={16}
                value={proposals[activeProposalSection] || ''}
                onChange={(e) => handleSaveProposalText(activeProposalSection, e.target.value)}
                placeholder="Click 'Draft with AI' on the right or write markdown proposal text..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0D5C52] rounded-xl p-4 text-xs sm:text-sm font-mono leading-relaxed text-slate-900 outline-none resize-y"
              ></textarea>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Markdown supported</span>
                <span>{(proposals[activeProposalSection] || '').split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            {/* AI Refiner */}
            <div className="tf-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-[#0D5C52] font-bold text-xs uppercase">
                <Sparkles size={14} />
                <span>AI Proposal Copilot</span>
              </div>

              <textarea
                rows={4}
                placeholder="e.g. Add focus on Indian Data Sovereignty, emphasize ISO 27001, add 99.5% uptime commitment..."
                value={proposalInstructions}
                onChange={(e) => setProposalInstructions(e.target.value)}
                className="w-full custom-input text-xs resize-none"
              ></textarea>

              <button
                onClick={() => handleGenerateProposal(activeProposalSection)}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#0D3B36] hover:bg-[#092B27] text-white shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Drafting Section with AI...' : proposals[activeProposalSection] ? 'Regenerate Section with AI' : 'Draft Section with AI'}
              </button>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">Presets:</span>
                {[
                  'Make it more assertive and formal',
                  'Add Indian data localization assurance',
                  'Expand on 24x7 SLA support tiers'
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setProposalInstructions(preset)}
                    className="w-full text-left text-[11px] text-slate-600 hover:text-[#0D5C52] p-1 rounded hover:bg-slate-50 cursor-pointer"
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMERCIAL BOQ */}
      {currentTab === 'boq' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Commercial Bill of Quantities (BOQ)</h3>
              <p className="text-xs text-slate-500">Line item costing, profit margin slider & tax calculator</p>
            </div>
            <button
              onClick={handleAddBOQItem}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0D3B36] text-white hover:bg-[#092B27] cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Item</span>
            </button>
          </div>

          {boqList.length === 0 ? (
            <div className="tf-card p-8 rounded-2xl border border-slate-200 text-center space-y-3 bg-slate-50/50">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <FileText size={18} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Itemized BOQ Mandated in RFP</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                This RFP is structured as a {tender.category || "Consultancy / Advisory Services"} contract with deliverable or milestone-based disbursements. No physical hardware or software line items were detected.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleAddBOQItem}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0D3B36] text-white hover:bg-[#092B27] cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Custom Cost Head / Milestone</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="tf-card rounded-2xl overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4 min-w-[220px]">Item Description</th>
                      <th className="py-3 px-4 w-28">Category</th>
                      <th className="py-3 px-4 w-20 text-right">Qty</th>
                      <th className="py-3 px-4 w-28 text-right">Unit Rate (₹)</th>
                      <th className="py-3 px-4 w-32 text-right">Total (₹)</th>
                      <th className="py-3 px-4 text-right w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boqList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) => {
                              const updated = [...boqList];
                              updated[idx].item = e.target.value;
                              setBoqList(updated);
                              boqAPI.saveBatch(tender.id, updated);
                            }}
                            className="w-full custom-input text-xs py-1 px-2"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={item.category}
                            onChange={(e) => {
                              const updated = [...boqList];
                              updated[idx].category = e.target.value;
                              setBoqList(updated);
                              boqAPI.saveBatch(tender.id, updated);
                            }}
                            className="w-full custom-input text-xs py-1"
                          >
                            <option value="Services">Services</option>
                            <option value="Manpower">Manpower / Advisory</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Software">Software</option>
                            <option value="Cloud">Cloud</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updated = [...boqList];
                              updated[idx].quantity = val;
                              updated[idx].total = val * (updated[idx].unitPrice || 0);
                              setBoqList(updated);
                              boqAPI.saveBatch(tender.id, updated);
                            }}
                            className="w-16 custom-input text-xs py-1 text-right"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updated = [...boqList];
                              updated[idx].unitPrice = val;
                              updated[idx].total = val * (updated[idx].quantity || 1);
                              setBoqList(updated);
                              boqAPI.saveBatch(tender.id, updated);
                            }}
                            className="w-24 custom-input text-xs py-1 text-right"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                          ₹{Number(item.total).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button onClick={() => handleDeleteBOQItem(item.id)} className="p-1 text-slate-400 hover:text-red-600 cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="tf-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-[#0D5C52] text-xs font-bold uppercase">
                <Sliders size={14} />
                <span>Margin & Tax Simulator</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Profit Margin ({profitMargin}%):</span>
                  <span className="font-bold text-[#0D5C52]">₹{marginAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  className="w-full accent-[#0D3B36]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Client Estimated Budget:</span>
                  <span className="font-bold text-slate-900">{tender.estimatedValueDisplay}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Your Commercial Offer:</span>
                  <span className={`font-bold ${finalBidPrice <= (tender.estimatedValueINR || 0) ? 'text-emerald-700' : 'text-red-600'}`}>
                    ₹{finalBidPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="tf-card p-5 rounded-2xl space-y-2 flex flex-col justify-between">
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Commercial Bid Total</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Items Total:</span>
                  <span className="font-mono text-slate-900">₹{baseBOQTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST {taxRate}%):</span>
                  <span className="font-mono text-slate-900">+₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D3B36] text-white flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold">TOTAL COMMERCIAL BID:</span>
                <span className="text-xl font-extrabold">₹{finalBidPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANNEXURES */}
      {currentTab === 'annexures' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="tf-card p-3 rounded-2xl space-y-1 lg:col-span-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                Standard Templates
              </span>
              {annexuresList.map((annex) => (
                <button
                  key={annex.id}
                  onClick={() => setActiveAnnexure(annex)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeAnnexure?.id === annex.id
                      ? 'bg-[#0D3B36] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold">{annex.formNumber}: {annex.title}</div>
                  <div className={`text-[10px] truncate ${activeAnnexure?.id === annex.id ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {annex.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="tf-card p-6 rounded-2xl space-y-3 lg:col-span-3">
              {activeAnnexure && (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{activeAnnexure.title}</h3>
                      <p className="text-[11px] text-slate-400">{activeAnnexure.formNumber}</p>
                    </div>

                    <button
                      onClick={() => handleCopyText(activeAnnexure.content, activeAnnexure.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {copiedKey === activeAnnexure.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedKey === activeAnnexure.id ? 'Copied' : 'Copy Form'}</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-serif leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[480px] overflow-y-auto">
                    {activeAnnexure.content}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showAddClauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Add Custom Compliance Clause</h3>
            <form onSubmit={handleAddClause} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Clause Number *</label>
                <input
                  type="text"
                  required
                  value={newClause.clauseNo}
                  onChange={e => setNewClause({ ...newClause, clauseNo: e.target.value })}
                  className="w-full custom-input"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Requirement *</label>
                <textarea
                  rows={2}
                  required
                  value={newClause.requirement}
                  onChange={e => setNewClause({ ...newClause, requirement: e.target.value })}
                  className="w-full custom-input resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClauseModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-bold bg-[#0D3B36] text-white cursor-pointer"
                >
                  Add Clause
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
