import React from "react";
import { Tender } from "../../../types/tender";
import { CompanyProfile } from "../../../types/company";

interface TenderVerdictHeroProps {
  tender: Tender | null;
  companyProfile?: CompanyProfile | null;
}

export const TenderVerdictHero: React.FC<TenderVerdictHeroProps> = ({
  tender,
  companyProfile,
}) => {
  const winProb = tender?.goNoGoAnalysis?.winProbability || 85;
  const decision = tender?.goNoGoAnalysis?.decision || "GO DECISION";
  const overallScore = tender?.goNoGoAnalysis?.overallScore || 90;

  const turnoverDisplay =
    companyProfile?.annualTurnover?.[0]?.amountDisplay ||
    (companyProfile?.averageTurnoverINR
      ? `₹${(companyProfile.averageTurnoverINR / 10000000).toFixed(1)} Cr`
      : "-");

  const reqTurnover =
    tender?.eligibilityCriteria?.minTurnoverDisplay ||
    (tender?.estimatedValueDisplay
      ? `Req: ${tender.estimatedValueDisplay}`
      : "Turnover Verified");

  return (
    <div className="bg-gradient-to-r from-[#082924] via-[#0C3B34] to-[#134942] text-white p-5 md:p-6 rounded-2xl shadow-lg border border-emerald-500/30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Verdict & Summary */}
        <div className="flex items-start gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-900 animate-ping" />
                VERDICT: {decision} ({winProb}% WIN FIT)
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {companyProfile?.name || "Bidder Entity"} Pre-Qualification Assessment
            </h3>
            <p className="text-xs text-emerald-100/85 max-w-3xl leading-relaxed">
              AI evaluated this tender (
              {tender?.documentMeta?.pageCount
                ? `${tender.documentMeta.pageCount} pages`
                : "RFP Document"}
              ) against verified <strong>Company Vault</strong>. Financial turnover,
              operating track record, required certifications, technical manpower &
              statutory compliance evaluated.
            </p>
          </div>
        </div>

        {/* Right: Scores & Fit Metrics */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/15 backdrop-blur-xs">
            {/* Fit Score */}
            <div className="text-center px-2.5 border-r border-white/15">
              <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                Fit Score
              </span>
              <strong className="text-base font-extrabold text-emerald-300 block">
                {overallScore} / 100
              </strong>
              <small className="text-[9px] text-emerald-100">
                {winProb}% Win Fit
              </small>
            </div>

            {/* Turnover */}
            <div className="text-center px-2.5 border-r border-white/15">
              <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                Turnover
              </span>
              <strong className="text-base font-extrabold text-white block">
                {turnoverDisplay}
              </strong>
              <small className="text-[9px] text-emerald-300">
                {reqTurnover}
              </small>
            </div>

            {/* EMD Security */}
            <div className="text-center px-2.5">
              <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                EMD Security
              </span>
              <strong
                className="text-base font-extrabold text-white block max-w-[90px]"
                title={tender?.emdDisplay || "-"}
              >
                {tender?.emdDisplay || "-"}
              </strong>
              <small className="text-[9px] text-emerald-300">Verified</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
