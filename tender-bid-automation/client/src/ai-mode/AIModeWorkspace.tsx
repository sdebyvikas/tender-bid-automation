import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  ShieldCheck, 
  UserCheck, 
  CreditCard, 
  FileText, 
  Download, 
  CheckCircle2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';

import AIChatStream from './AIChatStream';
import AICanvasPreview from './AICanvasPreview';
import { 
  MOCK_TENDER_DATA, 
  SIGNATORIES_LIST, 
  INITIAL_DOCUMENT_SECTIONS,
  Signatory,
  DocumentSection
} from './mockData';
import './aiMode.css';

interface AIModeWorkspaceProps {
  activeTender?: any;
  companyProfile?: any;
  onBackToClassic?: () => void;
}

export default function AIModeWorkspace({ activeTender, companyProfile, onBackToClassic }: AIModeWorkspaceProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Upload, 1: Eligibility, 2: Signatory, 3: EMD, 4: Proposal/Drag-Drop, 5: Done
  const [eligibilityMode, setEligibilityMode] = useState<'PASS' | 'FAIL'>('PASS'); // 'PASS' | 'FAIL'
  const [signatoriesList, setSignatoriesList] = useState<Signatory[]>(SIGNATORIES_LIST);
  const [selectedSignatory, setSelectedSignatory] = useState<Signatory>(SIGNATORIES_LIST[0]);
  const [emdMode, setEmdMode] = useState<'msme' | 'paid'>('msme'); // 'msme' | 'paid'
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [paymentData, setPaymentData] = useState({
    utr: 'HDFC99018231924',
    bank: 'HDFC Bank, Okhla Industrial Branch',
    date: '22nd September 2026',
    receiptFileName: 'EMD_Bank_Challan_Receipt_HDFC_990182.pdf'
  });
  const [sections, setSections] = useState<any[]>(INITIAL_DOCUMENT_SECTIONS);

  // Stepper items
  const stepsList = [
    { id: 0, label: '1. Ingest RFP' },
    { id: 1, label: '2. Eligibility Check' },
    { id: 2, label: '3. Signatory (PoA)' },
    { id: 3, label: '4. EMD Security' },
    { id: 4, label: '5. Proposal & Drag-Drop' },
    { id: 5, label: '6. Master PDF' }
  ];

  const handleResetFlow = () => {
    setCurrentStep(0);
    setEligibilityMode('PASS');
    setSelectedSignatory(signatoriesList[0]);
    setEmdMode('msme');
    setSections(INITIAL_DOCUMENT_SECTIONS);
    setIsFocusMode(false);
    toast('Flow reset to Step 1: Ingest RFP');
  };

  const handleAddSignatory = (newSig: Signatory) => {
    setSignatoriesList((prev) => [newSig, ...prev]);
  };

  const handleSendMessage = (text: string) => {
    toast.success('AI updated live bid document', {
      description: `Applied instruction: "${text.slice(0, 35)}..."`
    });

    const newSection = {
      id: `sec-custom-${Date.now()}`,
      title: `Custom Addendum: ${text.slice(0, 25)}`,
      type: 'custom',
      badge: 'AI Drafted',
      pageCount: 1,
      isDeletable: true,
      content: `ADDITIONAL CLAUSE ADDENDUM\n\nIn accordance with bidder instructions: "${text}"\n\nTech Solutions Private Limited affirms that all deliverables strictly adhere to the defined specifications.`
    };

    setSections((prev) => [...prev, newSection]);
  };

  return (
    <div className="aimode-root">
      {/* TOP HEADER */}
      <header className="aimode-topbar">
        <div className="aimode-topbar-left">
          <span className="aimode-brand-pill">
            <span className="aimode-pulsing-dot" />
            AI RFP Studio
          </span>

          {/* Stepper Progress Bar */}
          <div className="aimode-stepper-track">
            {stepsList.map((st, idx) => {
              const isCompleted = currentStep > st.id;
              const isCurrent = currentStep === st.id;
              return (
                <React.Fragment key={st.id}>
                  <div
                    className={`aimode-step-node ${
                      isCurrent ? 'active' : isCompleted ? 'completed' : 'pending'
                    }`}
                  >
                    <span className="aimode-step-num">
                      {isCompleted ? '✓' : st.id + 1}
                    </span>
                    <span>{st.label.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                  {idx < stepsList.length - 1 && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: '10px' }}>›</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="aimode-topbar-right">
          <div className="aimode-vault-badge">
            🏢 <strong style={{ color: '#f1f5f9' }}>{companyProfile?.companyName || companyProfile?.name || 'Tech Solutions Pvt Ltd'}</strong>
          </div>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
          <span style={{ fontSize: '11.5px', color: currentStep >= 1 ? (eligibilityMode === 'PASS' ? '#34d399' : '#f87171') : '#64748b', fontWeight: 700 }}>
            {currentStep === 0 ? 'Awaiting Upload' : eligibilityMode === 'PASS' ? '● 100% Eligible (88% Win Rate)' : '● Disqualified'}
          </span>

          {isFocusMode && (
            <button
              type="button"
              className="aimode-btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px', marginLeft: 8 }}
              onClick={() => setIsFocusMode(false)}
            >
              <Minimize2 size={12} />
              <span>Restore Chat View</span>
            </button>
          )}
        </div>
      </header>

      {/* DUAL PANE BODY */}
      <div className="aimode-body">
        {/* Left Chat Pane (Collapses when in Focus Mode) */}
        {!isFocusMode && (
          <AIChatStream
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            eligibilityMode={eligibilityMode}
            onSelectEligibilityMode={setEligibilityMode}
            selectedSignatory={selectedSignatory}
            onSelectSignatory={setSelectedSignatory}
            signatoriesList={signatoriesList}
            onAddSignatory={handleAddSignatory}
            emdMode={emdMode}
            onSelectEmdMode={setEmdMode}
            paymentData={paymentData}
            onUpdatePaymentData={setPaymentData}
            onSendMessage={handleSendMessage}
            onResetFlow={handleResetFlow}
          />
        )}

        {/* Right MS Word Studio Canvas */}
        <AICanvasPreview
          currentStep={currentStep}
          sections={sections}
          onSectionsChange={setSections}
          selectedSignatory={selectedSignatory}
          emdMode={emdMode}
          paymentData={paymentData}
          activeTender={activeTender || MOCK_TENDER_DATA}
          eligibilityMode={eligibilityMode}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          onStartProcess={() => setCurrentStep(1)}
        />
      </div>
    </div>
  );
}
