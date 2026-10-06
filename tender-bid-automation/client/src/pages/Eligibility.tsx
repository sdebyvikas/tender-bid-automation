import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileSearch, ShieldCheck } from 'lucide-react';
import { Tender, CompanyProfile } from '../types';
import { TenderEligibilityStep } from '../features/tender-eligibility';

export interface EligibilityProps {
  activeTender?: Tender | null;
  companyProfile?: CompanyProfile | null;
  setActive?: (tab: string) => void;
  isEmbedded?: boolean;
  onNextStep?: () => void;
  onOpenProfileModal?: () => void;
  onOpenSignatoriesModal?: () => void;
  onOpenVaultUpload?: (suggestedDocName?: string) => void;
  onTenderUpdated?: (updatedTender: Tender) => void;
}

export default function Eligibility({
  activeTender,
  companyProfile,
  setActive,
  isEmbedded = false,
  onNextStep,
  onOpenProfileModal,
  onOpenSignatoriesModal,
  onOpenVaultUpload,
  onTenderUpdated,
}: EligibilityProps) {
  const navigate = useNavigate();

  if (!activeTender) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <FileSearch size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          No Active Tender Selected
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Please select a tender from the repository to run the eligibility verification and compliance audit.
        </p>
        <button
          type="button"
          onClick={() => navigate('/intake')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <span>Go to Tenders Repository</span>
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  const handleNavigateStep = (stepNumber: number) => {
    if (onNextStep) {
      onNextStep();
    } else if (setActive) {
      if (stepNumber === 3) setActive('Payment Proof');
      else if (stepNumber === 4) setActive('Proposal Desk');
      else if (stepNumber === 5) setActive('PDF Binder');
    }
  };

  return (
    <div className="space-y-6">
      {/* Standalone Page Header if accessed directly via /eligibility */}
      {!isEmbedded && (
        <div className="page-heading fade-up">
          <div>
            <div className="breadcrumb flex items-center gap-1 text-xs text-slate-500 mb-1">
              <span>Bid Workspace</span>
              <ChevronRight size={13} />
              <strong className="text-indigo-600 font-bold">Step 2: Eligibility &amp; Gates</strong>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Pre-Qualification &amp; Technical Compliance Audit
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Deterministic verification against your verified Master Company Vault for{' '}
              <strong>{activeTender.title}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Tender Eligibility Step Engine */}
      <TenderEligibilityStep
        tender={activeTender}
        companyProfile={companyProfile || null}
        onNavigateStep={handleNavigateStep}
        onOpenProfileModal={onOpenProfileModal}
        onOpenSignatoriesModal={onOpenSignatoriesModal}
        onOpenVaultUpload={onOpenVaultUpload}
        onTenderUpdated={onTenderUpdated}
      />
    </div>
  );
}
