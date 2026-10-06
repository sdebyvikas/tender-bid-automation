import React, { useMemo } from "react";
import {
  AlertTriangle,
  Clock,
  Landmark,
  MapPin,
  Activity,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { Tender } from "../../types/tender";

interface TenderRiskRadarCardProps {
  tender: Tender;
}

interface TenderRisk {
  id: string;
  title: string;
  category: string;
  clauseRef: string;
  icon: any;
  riskDescription: string;
  financialImpact: string;
  mitigationStrategy: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export default function TenderRiskRadarCard({
  tender,
}: TenderRiskRadarCardProps) {
  const tenderValDisplay =
    tender.estimatedValueDisplay ||
    (tender.estimatedValueINR
      ? `₹${(tender.estimatedValueINR / 10000000).toFixed(2)} Cr`
      : "Contract Value");
  const authorityName =
    tender.organization || tender.authority || "State Authority";

  const risks: TenderRisk[] = useMemo(() => {
    return [
      {
        id: "risk-ld",
        title: "Liquidated Damages (LD Clause)",
        category: "Delay Penalty",
        clauseRef: "GCC Clause 5.4 / Penalties",
        icon: Clock,
        riskDescription: `0.5% penalty per week of delay on uncompleted milestones, capped at a maximum of 10% of ${tenderValDisplay}.`,
        financialImpact: `Up to 10% of ${tenderValDisplay}`,
        mitigationStrategy:
          "AI-generated Sprint Milestone schedule with a 2-week delivery buffer.",
        severity: "HIGH",
      },
      {
        id: "risk-pbg",
        title: "Performance Security (PBG)",
        category: "Financial Guarantee",
        clauseRef: "RFP Clause 2.12 / Security Deposit",
        icon: Landmark,
        riskDescription: `5% Performance Bank Guarantee required within 15 days of LoA, valid for entire contract period + 60 days.`,
        financialImpact: `5% of ${tenderValDisplay}`,
        mitigationStrategy:
          "Pre-arranged bank credit line and BG sanction letter ready with partner bank.",
        severity: "MEDIUM",
      },
      {
        id: "risk-office",
        title: "Local Deployment & Coordination",
        category: "Operational SLA",
        clauseRef: "Special Conditions / Project Office",
        icon: MapPin,
        riskDescription: `Selected bidder must establish project coordination liaison with ${authorityName} within 30 days of contract signing.`,
        financialImpact: "Local office lease & project logistics",
        mitigationStrategy:
          "Coworking space MoU or authorized local partner arrangement ready for deployment.",
        severity: "LOW",
      },
      {
        id: "risk-sla",
        title: "Uptime SLA & Availability Penalties",
        category: "SLA Governance",
        clauseRef: "Service Level Agreement Sch. 3",
        icon: Activity,
        riskDescription:
          "99.5% uptime required 24x7. Uptime below 98% incurs 2% monthly billing deduction.",
        financialImpact: "2% Monthly Recurring Billing",
        mitigationStrategy:
          "Multi-AZ Cloud infrastructure with automated failover and 99.9% SLA guarantees.",
        severity: "MEDIUM",
      },
    ];
  }, [tender, tenderValDisplay, authorityName]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header Section */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#18794e] flex items-center justify-center font-bold">
              <ShieldAlert size={15} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Penalties, Guarantees &amp; Contractual Exposure Radar
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Identified contractual liabilities and recommended mitigation
            safeguards for {tender.title?.substring(0, 45)}...
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 size={14} className="text-emerald-600" />
            All 4 Risks Mitigated in Proposal
          </span>
        </div>
      </div>

      {/* Risks Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
        {risks.map((risk) => {
          const Icon = risk.icon;

          return (
            <div
              key={risk.id}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3"
            >
              {/* Risk Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      risk.severity === "HIGH"
                        ? "bg-rose-100 text-rose-700"
                        : risk.severity === "MEDIUM"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {risk.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {risk.clauseRef} · {risk.category}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    risk.severity === "HIGH"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : risk.severity === "MEDIUM"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {risk.severity} RISK
                </span>
              </div>

              {/* Risk Description */}
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {risk.riskDescription}
              </p>

              {/* Financial Impact & Mitigation */}
              <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">
                    Potential Exposure:
                  </span>
                  <span className="font-bold text-slate-900">
                    {risk.financialImpact}
                  </span>
                </div>

                <div className="bg-emerald-50/80 rounded-lg p-2.5 border border-emerald-200/80 text-[11px] text-emerald-950 font-medium flex items-start gap-1.5">
                  <Sparkles
                    size={13}
                    className="shrink-0 mt-0.5 text-[#18794e]"
                  />
                  <span>
                    <strong>Mitigation:</strong> {risk.mitigationStrategy}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
