import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck2,
  FileX2,
  UploadCloud,
  ArrowRight,
  AlertTriangle,
  Info,
  ShieldQuestion,
} from "lucide-react";
import { Tender } from "../../types/tender";
import { CompanyProfile } from "../../types/company";

interface TenderDisqualificationGatesProps {
  tender: Tender;
  companyProfile: CompanyProfile | null;
  onOpenVaultUpload?: (docName?: string) => void;
}

interface DisqualificationGate {
  id: string;
  title: string;
  category: string;
  clauseRef?: string;
  mandatoryRequirement: string;
  requiredDocName: string;
  matchedDocName?: string;
  isPassed: boolean;
  surplusDetail?: string;
  threatLevel: "NONE" | "HIGH" | "CRITICAL";
  hasVaultDoc: boolean;
  disqualificationReason?: string;
}

export default function TenderDisqualificationGates({
  tender,
  companyProfile,
  onOpenVaultUpload,
}: TenderDisqualificationGatesProps) {
  const vaultDocs = Array.isArray(companyProfile?.statutoryDocuments)
    ? companyProfile.statutoryDocuments
    : [];

  // Helper function to search matching document in Company Vault using keywords
  const findInVault = (keywords: string[]) => {
    const cleanKeywords = keywords
      .filter(Boolean)
      .map((k) => k.toLowerCase().trim())
      .filter((k) => k.length > 2);

    if (cleanKeywords.length === 0) return undefined;

    return vaultDocs.find((doc) => {
      const text =
        `${doc.name || ""} ${doc.category || ""} ${doc.fileName || ""} ${doc.originalName || ""}`.toLowerCase();
      return cleanKeywords.some((kw) => text.includes(kw));
    });
  };

  // Bidder Turnover metrics for turnover math comparison
  const bidderTurnoverINR = companyProfile?.averageTurnoverINR || 0;
  const reqTurnoverINR =
    tender.eligibilityCriteria?.minAnnualTurnoverINR ||
    tender.eligibilityCriteria?.minAverageTurnoverINR ||
    0;

  // STRICTLY DYNAMIC: Read only AI-extracted gates from the uploaded Tender PDF
  const rawGates = Array.isArray(tender.disqualificationGates)
    ? tender.disqualificationGates
    : [];

  const gates: DisqualificationGate[] = rawGates.map(
    (gate: any, idx: number) => {
      const title = gate.title || "Disqualification Gate";
      const category = gate.category || "Eligibility Requirement";
      const clauseRef = gate.clauseRef;
      const mandatoryRequirement =
        gate.mandatoryRequirement || "Mandatory requirement as per RFP.";
      const requiredDocName =
        gate.evidenceDocName || gate.evidenceDoc || "Document as per RFP";
      const threatLevel = gate.threatLevel || "CRITICAL";

      // 1. Identify if this gate is a financial turnover check
      const titleKey =
        `${title} ${category} ${mandatoryRequirement}`.toLowerCase();
      const isTurnoverGate =
        titleKey.includes("turnover") ||
        titleKey.includes("revenue") ||
        titleKey.includes("financial floor");

      if (isTurnoverGate) {
        const auditDoc = findInVault([
          "turnover",
          "audit",
          "balance sheet",
          "ca cert",
          "financial",
        ]);
        const isPassed =
          reqTurnoverINR > 0
            ? bidderTurnoverINR >= reqTurnoverINR
            : Boolean(bidderTurnoverINR > 0 || auditDoc);
        const diffINR = bidderTurnoverINR - reqTurnoverINR;

        let surplusDetail: string | undefined;
        let disqualificationReason: string | undefined;

        if (reqTurnoverINR > 0) {
          if (diffINR >= 0) {
            surplusDetail = `+₹${(diffINR / 10000000).toFixed(2)} Cr Buffer`;
          } else {
            surplusDetail = `Deficit of ₹${(Math.abs(diffINR) / 10000000).toFixed(2)} Cr`;
            disqualificationReason = `Turnover Deficit: Bidder has ₹${(bidderTurnoverINR / 10000000).toFixed(2)} Cr vs required ₹${(reqTurnoverINR / 10000000).toFixed(2)} Cr`;
          }
        } else if (!isPassed) {
          disqualificationReason =
            "Financial Turnover data not configured in Company Profile";
        }

        return {
          id: gate.id || `gate-${idx}`,
          title,
          category,
          clauseRef,
          mandatoryRequirement,
          requiredDocName: auditDoc
            ? auditDoc.name || auditDoc.fileName
            : requiredDocName,
          matchedDocName: auditDoc?.name || auditDoc?.fileName,
          isPassed,
          surplusDetail,
          threatLevel: isPassed ? "NONE" : threatLevel,
          hasVaultDoc: Boolean(auditDoc),
          disqualificationReason,
        };
      }

      // 2. Physical Document Vault Search for all other gates
      const matchedVaultDoc = findInVault([title, category, requiredDocName]);
      const hasVaultDoc = Boolean(matchedVaultDoc);
      const isPassed = hasVaultDoc;

      return {
        id: gate.id || `gate-${idx}`,
        title,
        category,
        clauseRef,
        mandatoryRequirement,
        requiredDocName,
        matchedDocName: matchedVaultDoc?.name || matchedVaultDoc?.fileName,
        isPassed,
        surplusDetail: hasVaultDoc ? "Document Verified" : undefined,
        threatLevel: isPassed ? "NONE" : threatLevel,
        hasVaultDoc,
        disqualificationReason: !hasVaultDoc
          ? `${requiredDocName} Not Found in Vault`
          : undefined,
      };
    },
  );

  const passedCount = gates.filter((g) => g.isPassed).length;
  const failedCount = gates.length - passedCount;
  const isOverallQualified = gates.length > 0 && failedCount === 0;

  // Failing gates for the "Why Am I Disqualified?" section
  const failedGates = gates.filter((g) => !g.isPassed);

  // Empty state if PDF has no disqualification gates extracted
  if (gates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <ShieldQuestion size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Pre-Qualification Hard Disqualification Gates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              No hard disqualification gates specified in this RFP document.
              Proceed with standard technical compliance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-0">
      {/* 1. TOP SUMMARY BAR */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                isOverallQualified
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isOverallQualified ? (
                <ShieldCheck size={17} />
              ) : (
                <ShieldAlert size={17} />
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Hard Disqualification Check
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Non-negotiable Pass/Fail gate checks extracted from RFP. Failing any
            gate results in immediate disqualification.
          </p>
        </div>

        {/* Counter Pills + Overall Status Banner */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
            📋 {gates.length} Gates Identified
          </span>

          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Passed: {passedCount}
          </span>

          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Failed: {failedCount}
          </span>

          <div
            className={`text-xs font-extrabold px-3.5 py-1.5 rounded-lg border uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
              isOverallQualified
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-rose-600 text-white border-rose-700"
            }`}
          >
            {isOverallQualified
              ? "Overall: GO (QUALIFIED)"
              : "Overall: DISQUALIFIED"}
          </div>
        </div>
      </div>

      {/* 2. GATE CARDS (GRID) */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white">
        {gates.map((gate) => {
          const isPassed = gate.isPassed;

          return (
            <div
              key={gate.id}
              className={`rounded-xl border p-4.5 flex flex-col justify-between transition-all ${
                isPassed
                  ? "bg-emerald-50/20 border-emerald-200/90 hover:border-emerald-300"
                  : "bg-rose-50/25 border-rose-200 hover:border-rose-300"
              }`}
            >
              <div>
                {/* Header: Status Dot & Title & Clause */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isPassed
                          ? "bg-emerald-500 ring-4 ring-emerald-100"
                          : "bg-rose-500 ring-4 ring-rose-100"
                      }`}
                    />
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {gate.title}
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                      isPassed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isPassed ? "Passed" : "Failed"}
                  </span>
                </div>

                {/* Clause Ref */}
                {gate.clauseRef && (
                  <div className="mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {gate.clauseRef}
                    </span>
                  </div>
                )}

                {/* Requirement Box */}
                <div className="bg-white rounded-lg p-3 my-2.5 border border-slate-200/80 text-xs shadow-2xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Mandatory Requirement:
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {gate.mandatoryRequirement}
                  </p>
                </div>
              </div>

              {/* Evidence Status & Action Button */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                    Evidence Status:
                  </span>
                  <span
                    className={`font-semibold text-right flex items-center gap-1 text-[11px] ${
                      isPassed ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {isPassed ? (
                      <>
                        <FileCheck2 size={13} className="shrink-0" />
                        Evidence Found
                      </>
                    ) : (
                      <>
                        <FileX2 size={13} className="shrink-0" />
                        Evidence Missing
                      </>
                    )}
                  </span>
                </div>

                {/* Physical File / Detail Name */}
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200/60 truncate">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">
                    {isPassed ? "Verified Document" : "Required Document"}:
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {isPassed
                      ? gate.matchedDocName || gate.requiredDocName
                      : gate.requiredDocName}
                  </span>
                </div>

                {/* Buffer detail if available */}
                {gate.surplusDetail && isPassed && (
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-slate-400">Margin / Buffer:</span>
                    <span className="font-bold text-emerald-700">
                      {gate.surplusDetail}
                    </span>
                  </div>
                )}

                {/* Upload Button for Failed Gate */}
                {!isPassed && onOpenVaultUpload && (
                  <button
                    type="button"
                    onClick={() => onOpenVaultUpload(gate.requiredDocName)}
                    className="w-full mt-1.5 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <UploadCloud size={14} />
                    Upload{" "}
                    {gate.requiredDocName.length > 22
                      ? `${gate.requiredDocName.slice(0, 20)}...`
                      : gate.requiredDocName}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. "WHY AM I DISQUALIFIED?" ROOT CAUSE BREAKDOWN (VISIBLE WHEN FAILED) */}
      {!isOverallQualified && failedGates.length > 0 && (
        <div className="p-5 bg-rose-50/50 border-t border-rose-200">
          <div className="bg-white rounded-xl border border-rose-200 p-4.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle size={15} />
                </div>
                <h4 className="text-sm font-bold text-rose-900">
                  Why Am I Disqualified?
                </h4>
              </div>

              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                {failedGates.length} Critical{" "}
                {failedGates.length === 1 ? "Blocker" : "Blockers"}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              The bid proposal cannot proceed to evaluation because the
              following mandatory conditions are not fulfilled in your Company
              Vault:
            </p>

            {/* List of exact disqualification bullet points */}
            <div className="space-y-2 pt-1">
              {failedGates.map((gate, i) => (
                <div
                  key={gate.id || i}
                  className="flex items-start gap-2.5 text-xs text-rose-800 bg-rose-50/80 p-2.5 rounded-lg border border-rose-100"
                >
                  <span className="text-rose-600 font-bold shrink-0 mt-0.5">
                    ❌
                  </span>
                  <div className="space-y-0.5">
                    <strong className="font-bold text-rose-900 block">
                      {gate.title} ({gate.clauseRef || "RFP Mandatory Clause"}):
                    </strong>
                    <span className="text-slate-700">
                      {gate.disqualificationReason ||
                        `${gate.requiredDocName} not found in Company Vault.`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Button */}
            {onOpenVaultUpload && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onOpenVaultUpload(failedGates[0]?.requiredDocName)
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <span>Fix Issues / Upload Missing Documents</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
