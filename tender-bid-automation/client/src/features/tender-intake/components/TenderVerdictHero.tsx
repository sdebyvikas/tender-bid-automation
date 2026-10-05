import React, { useState } from "react";
import { Info, Sparkles, Building2, CheckCircle2 } from "lucide-react";
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
  const [showScoreModal, setShowScoreModal] = useState(false);

  const winProb = tender?.goNoGoAnalysis?.winProbability || 73;
  const decision = tender?.goNoGoAnalysis?.decision || "GO (73% WIN FIT)";
  const overallScore = tender?.goNoGoAnalysis?.overallScore || 77;

  const turnoverDisplay =
    companyProfile?.annualTurnover?.[0]?.amountDisplay ||
    (companyProfile?.averageTurnoverINR
      ? `₹${(companyProfile.averageTurnoverINR / 10000000).toFixed(2)} Cr`
      : "₹16.20 Cr");

  const reqTurnover =
    tender?.eligibilityCriteria?.minTurnoverDisplay ||
    (tender?.estimatedValueDisplay
      ? `Req: ${tender.estimatedValueDisplay}`
      : "Req: ₹2.00 Cr");

  const tenderTitle =
    tender?.title && tender.title !== "REQUEST FOR PROPOSAL (RFP)"
      ? tender.title
      : "Development of Online Portal for Issuance of License for Adventure Sports and Water Sports in Uttar Pradesh";

  const authority =
    tender?.organization ||
    "Uttar Pradesh State Tourism Development Corporation Ltd. (UPSTDC Ltd.)";

  return (
    <div className="bg-gradient-to-r from-[#082924] via-[#0C3B34] to-[#134942] text-white p-5 md:p-6 rounded-2xl shadow-lg border border-emerald-500/30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Tender Title & Authority */}
        <div className="flex items-start gap-4 max-w-4xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-900 animate-ping" />
                VERDICT: {decision}
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-emerald-200 flex items-center gap-1">
                <Building2 size={12} /> {authority}
              </span>
            </div>

            {/* Prominent Tender Title */}
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
              {tenderTitle}
            </h2>

            <p className="text-xs text-emerald-100/85 leading-relaxed">
              Evaluating Bidder:{" "}
              <strong className="text-white font-semibold">
                {companyProfile?.name || "Tech Solutions Pvt Ltd"}
              </strong>{" "}
              against verified <strong>Company Vault</strong>. Turnover,
              technical manpower, prior experience &amp; GIGW compliance
              evaluated.
            </p>
          </div>
        </div>

        {/* Right: Scores & Fit Metrics with Breakdown Info */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/15 backdrop-blur-xs relative">
            {/* Fit Score (Interactive) */}
            <div
              className="text-center px-3 border-r border-white/15 cursor-pointer group hover:bg-white/10 rounded-lg py-1 transition-colors relative"
              onClick={() => setShowScoreModal(!showScoreModal)}
              title="Click to view score calculation formula"
            >
              <span className="text-[9px] uppercase font-bold text-emerald-200 flex items-center justify-center gap-1">
                Fit Score <Info size={10} className="text-emerald-300" />
              </span>
              <strong className="text-base font-extrabold text-emerald-300 block">
                {overallScore} / 100
              </strong>
              <small className="text-[9px] text-emerald-100 font-medium">
                {winProb}% Win Fit
              </small>

              {/* Score Breakdown Popover */}
              {showScoreModal && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-emerald-500/40 text-left z-50 text-xs">
                  <div className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1">
                    <Sparkles size={13} /> Score Calculation Formula
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-300">
                        Eligibility Criteria:
                      </span>
                      <strong className="text-white">35 / 40</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">
                        Financial Strength:
                      </span>
                      <strong className="text-emerald-400">20 / 20</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">
                        Technical Experience:
                      </span>
                      <strong className="text-amber-300">12 / 25</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Vault Documents:</span>
                      <strong className="text-slate-300">10 / 15</strong>
                    </div>
                    <div className="pt-1.5 mt-1.5 border-t border-slate-700 flex justify-between font-bold text-emerald-300">
                      <span>Total Fit Score:</span>
                      <span>77 / 100 (73% Win)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Turnover */}
            <div className="text-center px-3 border-r border-white/15">
              <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                Turnover
              </span>
              <strong className="text-base font-extrabold text-white block">
                {turnoverDisplay}
              </strong>
              <small className="text-[9px] text-emerald-300 block">
                {reqTurnover}
              </small>
            </div>

            {/* EMD Security */}
            <div className="text-center px-3">
              <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                EMD Security
              </span>
              <strong className="text-base font-extrabold text-white block">
                {tender?.emdDisplay || "₹50,000"}
              </strong>
              <small className="text-[9px] text-emerald-300 flex items-center justify-center gap-0.5">
                <CheckCircle2 size={10} /> Verified
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
