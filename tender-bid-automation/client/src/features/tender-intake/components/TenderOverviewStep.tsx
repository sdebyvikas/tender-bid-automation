import React from "react";
import { Tender } from "../../../types/tender";
import { CompanyProfile } from "../../../types/company";
import { TenderVerdictHero } from "./TenderVerdictHero";
import { TenderEligibilityMatrixTable } from "./TenderEligibilityMatrixTable";
import { TenderExtractedParamsCard } from "./TenderExtractedParamsCard";
import { TenderGeneratedArtifactsCard } from "./TenderGeneratedArtifactsCard";

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
  onNavigateStep,
}) => {
  return (
    <div className="space-y-6 fade-up">
      {/* 1. Top Verdict Hero Banner */}
      <TenderVerdictHero tender={tender} companyProfile={companyProfile} />

      {/* 2. Side-by-side 3-Column Verification Table */}
      <TenderEligibilityMatrixTable
        tender={tender}
        companyProfile={companyProfile}
      />

      {/* 3. Bottom Grid: Extracted Parameters (Left) & Generated Files (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <TenderExtractedParamsCard tender={tender} />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <TenderGeneratedArtifactsCard
            tender={tender}
            onPreviewDoc={onPreviewDoc}
            onNavigateStep={onNavigateStep}
          />
        </div>
      </div>
    </div>
  );
};
