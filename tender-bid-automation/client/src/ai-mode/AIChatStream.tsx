import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  CreditCard, 
  FileText, 
  Send, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  Clock, 
  FileCheck2,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Paperclip,
  Zap,
  Building2,
  CalendarDays,
  PlusCircle,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  MOCK_TENDER_DATA, 
  SIGNATORIES_LIST, 
  MOCK_ELIGIBILITY_REPORT_PASS, 
  MOCK_ELIGIBILITY_REPORT_FAIL,
  Signatory
} from './mockData';

interface AIChatStreamProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  eligibilityMode: 'PASS' | 'FAIL';
  onSelectEligibilityMode: (mode: 'PASS' | 'FAIL') => void;
  selectedSignatory: Signatory;
  onSelectSignatory: (sig: Signatory) => void;
  signatoriesList: Signatory[];
  onAddSignatory: (sig: Signatory) => void;
  emdMode: 'msme' | 'paid';
  onSelectEmdMode: (mode: 'msme' | 'paid') => void;
  paymentData: any;
  onUpdatePaymentData: (data: any) => void;
  onSendMessage: (msg: string) => void;
  onResetFlow: () => void;
}

export default function AIChatStream({ 
  currentStep,
  onStepChange,
  eligibilityMode,
  onSelectEligibilityMode,
  selectedSignatory, 
  onSelectSignatory, 
  signatoriesList,
  onAddSignatory,
  emdMode, 
  onSelectEmdMode,
  paymentData,
  onUpdatePaymentData,
  onSendMessage,
  onResetFlow
}: AIChatStreamProps) {
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showAddSignatory, setShowAddSignatory] = useState(false);
  const [newSigName, setNewSigName] = useState('');
  const [newSigRole, setNewSigRole] = useState('');
  const [newSigDin, setNewSigDin] = useState('');

  const report = eligibilityMode === 'PASS' ? MOCK_ELIGIBILITY_REPORT_PASS : MOCK_ELIGIBILITY_REPORT_FAIL;

  // Step 0 triggers
  const handleUploadTender = (mode: 'PASS' | 'FAIL' = 'PASS') => {
    onSelectEligibilityMode(mode);
    setIsThinking(true);
    toast('Tender Document uploaded. Analyzing eligibility criteria against Company Vault...');

    setTimeout(() => {
      setIsThinking(false);
      onStepChange(1);
      toast.success(mode === 'PASS' ? 'Tender Ingested: 100% Eligible!' : 'Tender Ingested: Disqualification detected.');
    }, 1000);
  };

  const handleAddNewSignatory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSigName.trim()) return;

    const newSig: Signatory = {
      id: `sig-custom-${Date.now()}`,
      name: newSigName.trim(),
      designation: newSigRole.trim() || 'Director & Authorized Signatory',
      din: newSigDin.trim() || '09812450',
      email: `${newSigName.toLowerCase().replace(' ', '.')}@techsolutions.in`,
      phone: '+91 98100 12345',
      isDefault: false
    };

    onAddSignatory(newSig);
    onSelectSignatory(newSig);
    setShowAddSignatory(false);
    setNewSigName('');
    setNewSigRole('');
    setNewSigDin('');
    toast.success(`Added & Selected ${newSig.name} as Signatory!`);
  };

  const handleConfirmSignatory = () => {
    setIsThinking(true);
    toast(`Binding ${selectedSignatory.name} (DIN: ${selectedSignatory.din}) across Cover Page & Annexures...`);

    setTimeout(() => {
      setIsThinking(false);
      onStepChange(3);
      toast.success('Generated Master Cover Page & Legal Annexures!');
    }, 800);
  };

  const handleConfirmEMD = (chosenMode: 'msme' | 'paid') => {
    onSelectEmdMode(chosenMode);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      onStepChange(4);
      toast.success(chosenMode === 'msme' ? '100% MSME EMD Exemption Linked' : `Payment Proof attached (UTR: ${paymentData?.utr || 'HDFC99018231924'})`);
    }, 800);
  };

  const handleGenerateProposal = () => {
    setIsThinking(true);
    toast('Compiling Technical Blueprint, Table of Contents & Compliance Matrix...');

    setTimeout(() => {
      setIsThinking(false);
      onStepChange(5);
      toast.success('Master Bid Package compiled successfully!');
    }, 1000);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickPrompts = [
    'Add 5-Year Comprehensive Warranty',
    'Emphasize 99.99% Zero Downtime SLA',
    'Highlight ISO 27001 Security Gateway',
    'Include 24/7 Resident Engineers'
  ];

  return (
    <div className="aimode-chat-pane">
      {/* HEADER */}
      <div className="aimode-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#f8fafc', display: 'block' }}>
              Tender AI Copilot
            </strong>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Autonomous RFP Parser &amp; Bid Engine
            </span>
          </div>
        </div>

        <button
          type="button"
          className="aimode-btn-secondary"
          style={{ fontSize: '11px', padding: '5px 10px' }}
          onClick={onResetFlow}
          title="Restart flow from Step 1"
        >
          <RefreshCw size={12} />
          <span>Restart</span>
        </button>
      </div>

      {/* CHAT STREAM SCROLL AREA */}
      <div className="aimode-chat-scroll">

        {/* STEP 0: INITIAL UPLOAD HERO BOX */}
        {currentStep === 0 && !isThinking && (
          <div className="aimode-msg-ai">
            <div className="aimode-upload-hero-box">
              <div className="aimode-upload-icon-circle">
                <Upload size={24} />
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
                  Select Tender Notice to Begin
                </h3>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', maxWidth: '360px', lineHeight: 1.5 }}>
                  Click one of the realistic RFP notices below to experience how AI autonomously verifies credentials and drafts the entire bid dossier.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                
                {/* 1. ELIGIBLE CASE CARD */}
                <div 
                  className="aimode-sample-tender-card"
                  onClick={() => handleUploadTender('PASS')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileCheck2 size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#f1f5f9', fontSize: '13px' }}>
                        NIT-2026/099 (Smart City AI Surveillance)
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        Budget: ₹2.50 Cr • EMD: ₹5.0 Lakh • <strong style={{ color: '#34d399' }}>100% Eligible</strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ background: '#10b981', color: '#03261a', padding: '6px 12px', borderRadius: 8, fontSize: '11px', fontWeight: 800 }}>
                    Select &amp; Test ➔
                  </div>
                </div>

                {/* 2. DISQUALIFIED CASE CARD */}
                <div 
                  className="aimode-sample-tender-card fail-card"
                  onClick={() => handleUploadTender('FAIL')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#f1f5f9', fontSize: '13px' }}>
                        NIT-2026/088 (Expressway Toll VMS)
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        Budget: ₹10.0 Cr • Req: CMMI-5 • <strong style={{ color: '#f87171' }}>Disqualification Case</strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ background: '#1e2638', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: 8, fontSize: '11px', fontWeight: 700 }}>
                    Test Failure ➔
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* LIVE THINKING SPARK */}
        {isThinking && (
          <div className="aimode-thought-accordion">
            <div className="aimode-thought-header">
              <div className="aimode-thought-title">
                <div className="aimode-thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Autonomous AI Agent Executing...</span>
              </div>
            </div>
            <div className="aimode-thought-content">
              <div>› Ingested 48 pages of Tender Notice PDF into local sandbox...</div>
              <div>› Cross-referencing Company Vault (PAN, GSTIN, Turnover &amp; ISO certificates)...</div>
              <div>› Compiling Cover Page, Dynamic Index and Legal Annexures...</div>
            </div>
          </div>
        )}

        {/* STEP 1: USER MESSAGE + ELIGIBILITY AUDIT REPORT */}
        {currentStep >= 1 && (
          <>
            <div className="aimode-msg-user">
              <p>Uploaded Tender Document: <strong>{eligibilityMode === 'PASS' ? 'NIT-2026/099' : 'NIT-2026/088'}</strong>. Please audit eligibility, check deadlines, and assemble the bid package.</p>
            </div>

            <div className="aimode-msg-ai">
              {/* Verdict Card */}
              <div className={`aimode-verdict-card ${eligibilityMode === 'PASS' ? 'aimode-verdict-pass' : 'aimode-verdict-fail'}`}>
                <div className="aimode-verdict-header">
                  <span className="aimode-verdict-title">
                    {eligibilityMode === 'PASS' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <span>{report.title}</span>
                  </span>
                  <span className="aimode-score-pill">
                    Win Probability: {report.winProbability}%
                  </span>
                </div>

                <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.55 }}>
                  {report.summary}
                </p>

                {/* If Disqualified, list reasons */}
                {eligibilityMode === 'FAIL' && report.reasons && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <strong style={{ fontSize: '12px', color: '#fca5a5' }}>Exact Disqualification Reasons:</strong>
                    {report.reasons.map((r, i) => (
                      <div key={i} style={{ fontSize: '12px', color: '#f87171', display: 'flex', gap: 6 }}>
                        <span>•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Critical Dates & Payment Card */}
              <div className="aimode-dates-box">
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>📅 Submission Deadline:</span>
                  <strong>{MOCK_TENDER_DATA.submissionDeadline}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>🏛️ Pre-Bid Meeting:</span>
                  <strong>{MOCK_TENDER_DATA.preBidDate}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>💰 Tender Fee:</span>
                  <strong>₹{MOCK_TENDER_DATA.tenderFeeINR.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>🛡️ EMD Security:</span>
                  <strong style={{ color: '#34d399' }}>₹5,00,000 (MSME Exempt)</strong>
                </div>
              </div>

              {/* Document Verification Checklist */}
              <div className="aimode-checklist">
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Credential Verification Checklist:
                </span>
                {report.checklist.map((item, idx) => (
                  <div key={idx} className="aimode-checklist-row">
                    <div>
                      <strong style={{ display: 'block', color: '#f1f5f9' }}>{item.label}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>Req: {item.required} • Found: {item.found}</span>
                    </div>
                    {item.pass ? (
                      <span className="aimode-check-pass"><Check size={13} /> Pass</span>
                    ) : (
                      <span className="aimode-check-fail"><XCircle size={13} /> Missing</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Progression Action */}
              {currentStep === 1 && eligibilityMode === 'PASS' && (
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    className="aimode-btn-primary"
                    style={{ width: '100%', padding: '12px 18px', fontSize: '13px' }}
                    onClick={() => onStepChange(2)}
                  >
                    <span>Proceed to Step 2: Select Signatory (Power of Attorney)</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {currentStep === 1 && eligibilityMode === 'FAIL' && (
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    className="aimode-btn-secondary"
                    style={{ width: '100%', padding: '10px 16px' }}
                    onClick={onResetFlow}
                  >
                    <RefreshCw size={14} />
                    <span>Try with Eligible Tender (NIT-2026/099)</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* STEP 2: SIGNATORY SELECTION LIST WITH CUSTOM ADD MODAL */}
        {currentStep >= 2 && eligibilityMode === 'PASS' && (
          <div className="aimode-msg-ai">
            <div className="aimode-signatory-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserCheck size={18} color="#38bdf8" />
                  <strong style={{ fontSize: '13px', color: '#f8fafc' }}>
                    Step 2: Select Authorized Signatory (PoA)
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddSignatory(!showAddSignatory)}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <PlusCircle size={14} />
                  <span>{showAddSignatory ? 'Cancel' : '+ Add Custom'}</span>
                </button>
              </div>

              {/* Collapsible Add Custom Signatory Form */}
              {showAddSignatory && (
                <form onSubmit={handleAddNewSignatory} style={{ background: '#181e2b', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 10, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#38bdf8' }}>Add New Signatory / Director:</span>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Vikramaditya Rathore)"
                    value={newSigName}
                    onChange={(e) => setNewSigName(e.target.value)}
                    style={{ background: '#111520', border: '1px solid #273449', borderRadius: 6, padding: '6px 10px', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Designation (e.g. Director)"
                      value={newSigRole}
                      onChange={(e) => setNewSigRole(e.target.value)}
                      style={{ background: '#111520', border: '1px solid #273449', borderRadius: 6, padding: '6px 10px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      placeholder="DIN No. (e.g. 08192014)"
                      value={newSigDin}
                      onChange={(e) => setNewSigDin(e.target.value)}
                      style={{ background: '#111520', border: '1px solid #273449', borderRadius: 6, padding: '6px 10px', color: '#f8fafc', fontSize: '12px' }}
                    />
                  </div>
                  <button type="submit" className="aimode-btn-primary" style={{ padding: '6px 12px', fontSize: '11.5px' }}>
                    Save &amp; Select Signatory
                  </button>
                </form>
              )}

              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Select who will sign this bid. The Master Cover Page, PoA on ₹100 Stamp paper, and Form-1 will update automatically:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {signatoriesList.map((sig) => {
                  const isSelected = selectedSignatory.id === sig.id;
                  return (
                    <div
                      key={sig.id}
                      onClick={() => onSelectSignatory(sig)}
                      className={`aimode-sig-option ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="signatory"
                        checked={isSelected}
                        onChange={() => onSelectSignatory(sig)}
                        style={{ accentColor: '#38bdf8', width: 16, height: 16 }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', color: isSelected ? '#38bdf8' : '#f1f5f9', fontSize: '12.5px' }}>
                          {sig.name}
                        </strong>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {sig.designation} • DIN: {sig.din}
                        </span>
                      </div>
                      {isSelected && <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: 4 }}>Selected</span>}
                    </div>
                  );
                })}
              </div>

              {currentStep === 2 && (
                <button
                  type="button"
                  className="aimode-btn-primary"
                  style={{ marginTop: 6, padding: '11px 16px' }}
                  onClick={handleConfirmSignatory}
                >
                  <span>Confirm Signatory &amp; Generate Cover &amp; Annexures</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: EMD PAYMENT DESK & RECEIPT UPLOADER */}
        {currentStep >= 3 && eligibilityMode === 'PASS' && (
          <div className="aimode-msg-ai">
            <div style={{ background: '#111520', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={18} color="#10b981" />
                <strong style={{ fontSize: '13px', color: '#f8fafc' }}>
                  Step 3: EMD Security &amp; Payment Desk
                </strong>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                EMD amount is <strong>₹5,00,000</strong>. Choose whether to claim 100% MSME exemption or enter bank payment proof:
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => onSelectEmdMode('msme')}
                  className={emdMode === 'msme' ? 'aimode-btn-primary' : 'aimode-btn-secondary'}
                  style={{ flex: 1, padding: '10px 12px', fontSize: '12px' }}
                >
                  🛡️ Claim 100% MSME Exemption
                </button>
                <button
                  type="button"
                  onClick={() => onSelectEmdMode('paid')}
                  className={emdMode === 'paid' ? 'aimode-btn-primary' : 'aimode-btn-secondary'}
                  style={{ flex: 1, padding: '10px 12px', fontSize: '12px' }}
                >
                  💳 Enter NEFT / DD Payment Proof
                </button>
              </div>

              {/* If Paid Mode, Show UTR & Receipt Inputs */}
              {emdMode === 'paid' && (
                <div style={{ background: '#161c28', border: '1px solid #273449', borderRadius: 10, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Receipt size={14} /> Bank Payment &amp; Challan Details:
                  </span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: 2 }}>UTR / Transaction Ref No:</label>
                      <input
                        type="text"
                        value={paymentData?.utr || ''}
                        onChange={(e) => onUpdatePaymentData({ ...paymentData, utr: e.target.value })}
                        placeholder="e.g. HDFC99018231924"
                        style={{ width: '100%', background: '#0e111a', border: '1px solid #283347', borderRadius: 6, padding: '6px 8px', color: '#f1f5f9', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: 2 }}>Remitting Bank Name:</label>
                      <input
                        type="text"
                        value={paymentData?.bank || ''}
                        onChange={(e) => onUpdatePaymentData({ ...paymentData, bank: e.target.value })}
                        placeholder="e.g. HDFC Bank, Okhla"
                        style={{ width: '100%', background: '#0e111a', border: '1px solid #283347', borderRadius: 6, padding: '6px 8px', color: '#f1f5f9', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div style={{ border: '1px dashed #38bdf855', borderRadius: 8, padding: '8px 12px', background: 'rgba(56, 189, 248, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Paperclip size={14} color="#38bdf8" />
                      <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>{paymentData?.receiptFileName || 'EMD_Bank_Challan_Receipt.pdf'}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => toast.success('Payment receipt attached!')}
                      style={{ background: '#1e2638', border: '1px solid #33405c', borderRadius: 4, padding: '2px 8px', fontSize: '10.5px', color: '#38bdf8', cursor: 'pointer' }}
                    >
                      Browse
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  className="aimode-btn-primary"
                  style={{ marginTop: 6, padding: '11px 16px' }}
                  onClick={() => handleConfirmEMD(emdMode)}
                >
                  <span>Proceed to Step 4: Generate Proposal &amp; Compliance</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: PROPOSAL DRAFT & DRAG-DROP READY */}
        {currentStep >= 4 && eligibilityMode === 'PASS' && (
          <div className="aimode-msg-ai">
            <div style={{ background: '#111726', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 14, padding: '18px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 4px 20px rgba(56, 189, 248, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCheck2 size={18} color="#38bdf8" />
                <strong style={{ fontSize: '13.5px', color: '#f8fafc' }}>
                  Step 4: Master Bid Dossier Live &amp; Reorderable!
                </strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.55 }}>
                All <strong>8 document sections</strong> (Cover Page, Index, PoA, EMD Proof, Proposal &amp; Compliance) are active on the right sheet.
                <br />
                🖐️ <strong>Drag &amp; Drop:</strong> Grab any section's <code style={{ background: '#1e2638', padding: '2px 5px', borderRadius: 4, color: '#38bdf8' }}>⠿</code> handle to reorder pages. Notice how the <strong>Table of Contents (Page 2)</strong> automatically updates page numbers live!
                <br />
                ✏️ <strong>Click to Edit:</strong> Click anywhere on the sheet to modify text directly.
              </p>

              {currentStep === 4 && (
                <button
                  type="button"
                  className="aimode-btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0284c7)', color: '#fff', fontWeight: 800, padding: '12px 18px', fontSize: '13px' }}
                  onClick={handleGenerateProposal}
                >
                  <Layers size={15} />
                  <span>Final Step: Assemble &amp; Finalize Master Bid PDF</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: FINAL CELEBRATION */}
        {currentStep >= 5 && eligibilityMode === 'PASS' && (
          <div className="aimode-msg-ai">
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08))', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 8px 30px rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '24px' }}>🎉</span>
                <div>
                  <strong style={{ fontSize: '14.5px', color: '#34d399', display: 'block' }}>
                    Master Bid Package is 100% Ready!
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    Compiled in your custom drag-and-drop page sequence with Dynamic Index.
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.5 }}>
                Click the green <strong>"Download Master Bid PDF"</strong> button at the top right to download your print-ready submission package.
              </p>

              <button
                type="button"
                className="aimode-btn-secondary"
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
                onClick={onResetFlow}
              >
                <RefreshCw size={13} />
                <span>Test Flow Again from Beginning</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* QUICK SUGGESTION CHIPS */}
      <div style={{ padding: '0 20px 6px 20px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            className="aimode-btn-secondary"
            style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
            onClick={() => onSendMessage(p)}
          >
            <Zap size={11} color="#38bdf8" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* BOTTOM PROMPT INPUT */}
      <div className="aimode-chat-input-area">
        <div className="aimode-prompt-box">
          <textarea
            className="aimode-textarea"
            rows={1}
            placeholder="Instruct AI to edit any clause, change bidder details, add warranty, or adjust index..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Step {currentStep + 1} of 6 • Live Interactive Bid Engine
            </span>
            <button
              type="button"
              className="aimode-btn-primary"
              style={{ padding: '6px 14px', fontSize: '11.5px' }}
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
            >
              <Send size={12} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
