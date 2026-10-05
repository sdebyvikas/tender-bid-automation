import React from "react";
import { Tender } from "../../../types/tender";
import { CompanyProfile } from "../../../types/company";
import { TenderVerdictHero } from "./TenderVerdictHero";
import { TenderAIAdvisoryCard } from "./TenderAIAdvisoryCard";
import { TenderWinBoosterCard } from "./TenderWinBoosterCard";
import { TenderEligibilityMatrixTable } from "./TenderEligibilityMatrixTable";
import { TenderExtractedParamsCard } from "./TenderExtractedParamsCard";

interface TenderOverviewStepProps {
  tender: Tender | null;
  companyProfile?: CompanyProfile | null;
  onPreviewDoc: (doc: any) => void;
  onNavigateStep: (step: number) => void;
}

export const TenderOverviewStep: React.FC<TenderOverviewStepProps> = ({
  tender,
  companyProfile,
  onPreviewDoc,
}) => {
  return (
    <div className="space-y-6 fade-up">
      {/* 1. Top Verdict Hero Banner */}
      <TenderVerdictHero tender={tender} companyProfile={companyProfile} />

      {/* 2. AI Executive Recommendation & Suitability Box */}
      <TenderAIAdvisoryCard tender={tender} companyProfile={companyProfile} />

      {/* 3. Win Probability Booster & Missing Vault Gaps */}
      <TenderWinBoosterCard tender={tender} companyProfile={companyProfile} />

      {/* 4. Side-by-side 3-Column Verification Table (Including Manpower & PQC Clauses) */}
      <TenderEligibilityMatrixTable
        tender={tender}
        companyProfile={companyProfile}
      />

      {/* 5. Full-Width Extracted Parameters & Scope Specifications with Source RFP Preview */}
      <TenderExtractedParamsCard
        tender={tender}
        onPreviewDoc={onPreviewDoc}
      />
    </div>
  );
};
