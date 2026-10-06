import React from "react";
import {
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Users,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { Tender } from "../../types/tender";
import { CompanyProfile } from "../../types/company";

interface TenderQCBSScoringMatrixProps {
  tender: Tender;
  companyProfile: CompanyProfile | null;
}

interface ScoringPillar {
  id: string;
  title: string;
  category: string;
  icon: any;
  maxScore: number;
  awardedScore: number;
  benchmarkRule: string;
  bidderStatus: string;
  recommendation: string;
}

export default function TenderQCBSScoringMatrix({
  tender,
  companyProfile,
}: TenderQCBSScoringMatrixProps) {
  const overallScore =
    tender.goNoGoAnalysis?.overallScore || tender.score || 76;
  const qualifyingThreshold = 70; // Standard 70% threshold for technical bid opening

  const pillars: ScoringPillar[] = [
    {
      id: "pillar-financial",
      title: "Financial Standing & Turnover",
      category: "PQC Financials",
      icon: Coins,
      maxScore: 25,
      awardedScore: 25.0,
      benchmarkRule: "Full marks for 3-Yr Avg Turnover > ₹15.00 Cr",
      bidderStatus: `${companyProfile?.averageTurnoverDisplay || "₹16.20 Cr"} verified across 3 FYs`,
      recommendation: "Maximum points secured in CA Audited turnover.",
    },
    {
      id: "pillar-experience",
      title: "Past Project Credentials & Scale",
      category: "Relevant Experience",
      icon: Briefcase,
      maxScore: 25,
      awardedScore: 20.0,
      benchmarkRule: "3+ Government / PSU turnkey projects completed",
      bidderStatus: "3 Major government references verified",
      recommendation: "Attach client completion certificates to lock in 25/25.",
    },
    {
      id: "pillar-personnel",
      title: "Key Personnel & Team CVs",
      category: "Technical Manpower",
      icon: Users,
      maxScore: 25,
      awardedScore: 18.5,
      benchmarkRule: "Project Manager (PMP), Solution Architect, Sr Developers",
      bidderStatus: "Team CVs mapped from Master Vault",
      recommendation: "Link certified PMP and Lead Architect CVs in Step 4.",
    },
    {
      id: "pillar-methodology",
      title: "Methodology & ISO Certifications",
      category: "Technical Solution",
      icon: ShieldCheck,
      maxScore: 25,
      awardedScore: 12.5,
      benchmarkRule: "ISO 9001 + ISO 27001 + Implementation Architecture",
      bidderStatus: "ISO 9001 & 27001 verified; AI architecture ready",
      recommendation: "Generate complete Work Plan & SLA chart in Step 4.",
    },
  ];

  const totalAwarded = pillars.reduce((sum, p) => sum + p.awardedScore, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header Section */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#18794e] flex items-center justify-center font-bold">
              <Award size={15} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              QCBS 100-Point Technical Evaluation &amp; Marking Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Government tender committee evaluation criteria. Minimum{" "}
            {qualifyingThreshold} marks required to qualify for Commercial Bid
            opening.
          </p>
        </div>

        {/* Overall Score Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Estimated Score: {totalAwarded.toFixed(1)} / 100 Marks
          </span>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const percentage = (pillar.awardedScore / pillar.maxScore) * 100;

          return (
            <div
              key={pillar.id}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Pillar Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-[#18794e]">
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {pillar.awardedScore.toFixed(1)} / {pillar.maxScore} pts
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {pillar.title}
                </h4>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  {pillar.category}
                </span>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="bg-[#18794e] h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Status & Recommendation */}
              <div className="pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                <div className="text-slate-800 font-medium truncate">
                  {pillar.bidderStatus}
                </div>
                <div className="text-[10px] text-[#18794e] font-medium">
                  💡 {pillar.recommendation}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Score Booster Tip Banner */}
      <div className="mx-5 mb-5 p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-start gap-3">
        <Sparkles size={16} className="text-[#18794e] shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="text-emerald-950 font-bold block">
            AI Winning Probability Optimization:
          </strong>
          <p className="text-emerald-900/90 mt-0.5 leading-relaxed">
            Your current baseline score is{" "}
            <strong>{totalAwarded.toFixed(1)}/100</strong>, which safely exceeds
            the mandatory <strong>70%</strong> pre-qualification threshold.
            Complete the Step 4 Technical Proposal Desk to unlock an additional{" "}
            <strong>+14.0 marks</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
