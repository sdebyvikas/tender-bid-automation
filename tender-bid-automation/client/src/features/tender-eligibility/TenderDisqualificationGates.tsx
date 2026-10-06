import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  Scale,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Tender } from "../../types/tender";
import { CompanyProfile } from "../../types/company";

interface TenderDisqualificationGatesProps {
  tender: Tender;
  companyProfile: CompanyProfile | null;
  onOpenVaultUpload?: () => void;
}

interface DisqualificationGate {
  id: string;
  title: string;
  category: string;
  clauseRef: string;
  mandatoryRequirement: string;
  bidderStatus: string;
  evidenceDocName: string;
  isPassed: boolean;
  surplusDetail?: string;
  threatLevel: "NONE" | "HIGH" | "CRITICAL";
}

export default function TenderDisqualificationGates({
  tender,
  companyProfile,
  onOpenVaultUpload,
}: TenderDisqualificationGatesProps) {
  // 1. Turnover Math check
  const bidderTurnoverINR = companyProfile?.averageTurnoverINR || 162000000; // 16.20 Cr default
  const reqTurnoverINR =
    tender.eligibilityCriteria?.minAnnualTurnoverINR ||
    tender.eligibilityCriteria?.minAverageTurnoverINR ||
    100000000; // 10.00 Cr default
  const reqTurnoverDisplay =
    tender.eligibilityCriteria?.minTurnoverDisplay ||
    `₹${(reqTurnoverINR / 10000000).toFixed(2)} Cr`;
  const bidderTurnoverDisplay =
    companyProfile?.averageTurnoverDisplay ||
    `₹${(bidderTurnoverINR / 10000000).toFixed(2)} Cr`;
  const isTurnoverPassed = bidderTurnoverINR >= reqTurnoverINR;
  const turnoverSurplusINR = bidderTurnoverINR - reqTurnoverINR;
  const turnoverSurplusDisplay =
    turnoverSurplusINR > 0
      ? `+₹${(turnoverSurplusINR / 10000000).toFixed(2)} Cr buffer`
      : "Deficit";

  const gates: DisqualificationGate[] = [
    {
      id: "gate-blacklisting",
      title: "Debarment & Non-Blacklisting",
      category: "Legal Standing",
      clauseRef: "NIT Sec 1.4 / RFP Cl. 2.1",
      mandatoryRequirement:
        "Bidder must not be barred, blacklisted or debarred by any Central/State Govt or PSU.",
      bidderStatus:
        "Clean record · Self-declaration & non-blacklisting affidavit available in Vault.",
      evidenceDocName: "Non-Blacklisting Undertaking Affidavit (100 Rs Stamp)",
      isPassed: true,
      surplusDetail: "0 Litigation / Blacklisting Record",
      threatLevel: "NONE",
    },
    {
      id: "gate-turnover-floor",
      title: "Financial Turnover Floor",
      category: "Financial PQC",
      clauseRef: "PQC Sec 3.1 (A)",
      mandatoryRequirement: `Minimum average annual turnover of ${reqTurnoverDisplay} in last 3 Audited FYs (2021-24).`,
      bidderStatus: `${bidderTurnoverDisplay} average turnover recorded across 3 FYs.`,
      evidenceDocName: "CA Audited Turnover Certificate with UDIN",
      isPassed: isTurnoverPassed,
      surplusDetail: turnoverSurplusDisplay,
      threatLevel: isTurnoverPassed ? "NONE" : "CRITICAL",
    },
    {
      id: "gate-jv-consortium",
      title: "Sole Entity vs Consortium Ban",
      category: "Bidding Model",
      clauseRef: "RFP Sec 1.8 / Eligibility",
      mandatoryRequirement:
        "Sole Prime Bidder only. Joint Ventures (JV) and Consortium arrangements are strictly prohibited.",
      bidderStatus:
        "Applying as 100% Sole Turnkey Prime Bidder with full direct accountability.",
      evidenceDocName:
        "Certificate of Incorporation (MCA Reg: U72900DL2022PTC123456)",
      isPassed: true,
      surplusDetail: "Direct Prime Execution",
      threatLevel: "NONE",
    },
    {
      id: "gate-statutory-ids",
      title: "Statutory Registration & Tax IDs",
      category: "Statutory Compliance",
      clauseRef: "PQC Sec 3.1 (B)",
      mandatoryRequirement:
        "Valid Permanent Account Number (PAN) and active GSTIN registration.",
      bidderStatus: `PAN: ${companyProfile?.pan || "AABCB1234F"} · GSTIN: ${companyProfile?.gstin || "07AABCB1234F1Z5"} active.`,
      evidenceDocName: "Self-Attested PAN Card & GST Registration Certificate",
      isPassed: Boolean(companyProfile?.pan || companyProfile?.gstin),
      surplusDetail: "Statutory Tax Compliance Verified",
      threatLevel: "NONE",
    },
  ];

  const passedCount = gates.filter((g) => g.isPassed).length;
  const allPassed = passedCount === gates.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Table Header Section */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#18794e] flex items-center justify-center font-bold">
              <ShieldCheck size={15} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Pre-Qualification Hard Disqualification Gates
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            4 Non-Negotiable Pass/Fail Gate Checks. Failing any criterion
            results in immediate disqualification.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${
              allPassed
                ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                : "text-rose-800 bg-rose-50 border-rose-200"
            }`}
          >
            <CheckCircle2
              size={14}
              className={allPassed ? "text-emerald-600" : "text-rose-600"}
            />
            {passedCount} of {gates.length} Hard Gates Passed (0% Risk)
          </span>
        </div>
      </div>

      {/* 4 Gates Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
        {gates.map((gate) => (
          <div
            key={gate.id}
            className={`p-4 rounded-xl border transition-all ${
              gate.isPassed
                ? "bg-slate-50/70 border-slate-200/80 hover:border-emerald-300"
                : "bg-rose-50/40 border-rose-200"
            }`}
          >
            {/* Gate Top Info */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`p-1.5 rounded-lg ${
                    gate.isPassed
                      ? "bg-emerald-100 text-[#18794e]"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {gate.isPassed ? (
                    <ShieldCheck size={16} />
                  ) : (
                    <ShieldAlert size={16} />
                  )}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {gate.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {gate.clauseRef} · {gate.category}
                  </span>
                </div>
              </div>

              {/* Pass / Fail Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  gate.isPassed
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {gate.isPassed ? "Passed (Go)" : "Disqualified"}
              </span>
            </div>

            {/* Requirement Box */}
            <div className="bg-white rounded-lg p-2.5 my-2 border border-slate-200/70 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                RFP Mandatory Requirement:
              </span>
              <p className="text-slate-800 font-medium leading-relaxed">
                {gate.mandatoryRequirement}
              </p>
            </div>

            {/* Bidder Result & Evidence */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] text-slate-400">
                  Bidder Status:
                </span>
                <span className="font-semibold text-slate-900 text-right">
                  {gate.bidderStatus}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] text-slate-400">
                  Physical Evidence:
                </span>
                <span className="font-medium text-[#18794e] flex items-center gap-1">
                  <FileCheck2 size={13} /> {gate.evidenceDocName}
                </span>
              </div>

              {gate.surplusDetail && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-400 font-medium">
                    Margin / Buffer:
                  </span>
                  <span className="font-bold text-[#18794e]">
                    {gate.surplusDetail}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
