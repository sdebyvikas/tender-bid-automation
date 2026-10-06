import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Settings2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { Tender, ComplianceItem } from "../../types/tender";
import { CompanyProfile } from "../../types/company";

// Sub-components
import TenderBidderIdentityHero from "./TenderBidderIdentityHero";
import TenderDisqualificationGates from "./TenderDisqualificationGates";
import TenderQCBSScoringMatrix from "./TenderQCBSScoringMatrix";
import TenderInteractiveComplianceMatrix from "./TenderInteractiveComplianceMatrix";
import TenderRiskRadarCard from "./TenderRiskRadarCard";

export interface TenderEligibilityStepProps {
  tender: Tender;
  companyProfile: CompanyProfile | null;
  onNavigateStep: (step: number) => void;
  onOpenProfileModal?: () => void;
  onOpenSignatoriesModal?: () => void;
  onOpenVaultUpload?: (suggestedDocName?: string) => void;
  onTenderUpdated?: (updatedTender: Tender) => void;
}

export default function TenderEligibilityStep({
  tender,
  companyProfile,
  onNavigateStep,
  onOpenProfileModal,
  onOpenSignatoriesModal,
  onOpenVaultUpload,
  onTenderUpdated,
}: TenderEligibilityStepProps) {
  const [complianceList, setComplianceList] = useState<ComplianceItem[]>(
    tender.complianceItems || [],
  );

  // Sync state if tender changes
  useEffect(() => {
    if (tender.complianceItems && tender.complianceItems.length > 0) {
      setComplianceList(tender.complianceItems);
    }
  }, [tender.id, tender.complianceItems]);

  const handleComplianceUpdated = (updatedList: ComplianceItem[]) => {
    setComplianceList(updatedList);
    if (onTenderUpdated) {
      onTenderUpdated({ ...tender, complianceItems: updatedList });
    }
  };

  return (
    <div className="space-y-6 fade-up">
      {/* 1. TOP BIDDER IDENTITY & SIGNATORY HERO BANNER */}
      <TenderBidderIdentityHero
        tender={tender}
        companyProfile={companyProfile}
        complianceList={complianceList}
        onOpenProfileModal={onOpenProfileModal}
        onOpenSignatoriesModal={onOpenSignatoriesModal}
      />

      {/* 2. HARD DISQUALIFICATION GATES (4 PASS/FAIL RED LINES) */}
      <TenderDisqualificationGates
        tender={tender}
        companyProfile={companyProfile}
        onOpenVaultUpload={() =>
          onOpenVaultUpload && onOpenVaultUpload("Non-Blacklisting Affidavit")
        }
      />

      {/* 3. QCBS 100-POINT TECHNICAL SCORING MATRIX */}
      <TenderQCBSScoringMatrix
        tender={tender}
        companyProfile={companyProfile}
      />

      {/* 4. INTERACTIVE CLAUSE COMPLIANCE & 1-CLICK VAULT ATTACHER */}
      <TenderInteractiveComplianceMatrix
        tender={tender}
        companyProfile={companyProfile}
        complianceList={complianceList}
        onComplianceUpdated={handleComplianceUpdated}
        onOpenVaultUpload={onOpenVaultUpload}
      />

      {/* 5. CONTRACTUAL RISK RADAR (LD, PBG, LOCAL OFFICE, SLA) */}
      <TenderRiskRadarCard tender={tender} />

      {/* 6. BOTTOM STEP 2 COMPLETION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <CheckCircle2 size={16} className="text-[#18794e]" />
            <strong className="text-sm font-bold text-slate-900">
              Eligibility &amp; Technical Compliance Audit Completed
            </strong>
          </div>
          <p className="text-xs text-slate-500">
            All 4 Hard Gates are verified (0% Disqualification Risk) and{" "}
            {complianceList.length} clauses are mapped with Master Vault.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onNavigateStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#18794e] hover:bg-[#156a45] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Continue to Step 3: Payment Proof (EMD &amp; Fee)</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
