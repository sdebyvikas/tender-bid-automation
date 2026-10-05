import React from "react";
import { ShieldCheck, FileText } from "lucide-react";
import { Tender } from "../../../types/tender";

interface TenderExtractedParamsCardProps {
  tender: Tender | null;
}

export const TenderExtractedParamsCard: React.FC<
  TenderExtractedParamsCardProps
> = ({ tender }) => {
  const authority = tender?.organization || tender?.authority || "-";
  const deadline = tender?.submissionDeadline
    ? new Date(tender.submissionDeadline).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : tender?.due || "-";

  const estValue = tender?.estimatedValueDisplay || "-";
  const emd =
    tender?.emdDisplay ||
    (tender?.emdAmountINR
      ? `₹${Number(tender.emdAmountINR).toLocaleString("en-IN")}`
      : "-");

  const preBid = tender?.preBidMeetingDate
    ? new Date(tender.preBidMeetingDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not Specified / NIL";

  const certsList =
    tender?.eligibilityCriteria?.requiredCertifications &&
    tender.eligibilityCriteria.requiredCertifications.length > 0
      ? tender.eligibilityCriteria.requiredCertifications
      : [];

  const certsDisplay =
    certsList.length > 0 ? certsList.join(" · ") : "As per RFP";
  const certsTitle =
    certsList.length > 0 ? certsList.join(", ") : "As per RFP requirements";

  const scope =
    tender?.scopeSummary ||
    tender?.scopeOfWork ||
    tender?.description ||
    "-";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#173C40] flex items-center justify-center font-bold">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Extracted RFP Parameters
            </h3>
            <p className="text-[11px] text-slate-500">
              Live structured intelligence parsed from document
            </p>
          </div>
        </div>
        <span className="text-[10.5px] font-mono text-[#18794e] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
          ✓ Verified
        </span>
      </div>

      {/* Grid of Extracted Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Authority
          </span>
          <strong className="text-xs text-slate-800" title={authority}>
            {authority}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Bid Deadline
          </span>
          <strong className="text-xs text-slate-800 block">{deadline}</strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Estimated Value
          </span>
          <strong className="text-xs text-emerald-700 font-bold block">
            {estValue}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            EMD Security
          </span>
          <strong className="text-xs text-slate-800 block">{emd}</strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Pre-Bid Meeting
          </span>
          <strong className="text-xs text-slate-800 block">{preBid}</strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Mandatory Certs
          </span>
          <strong className="text-xs text-slate-800 block" title={certsTitle}>
            {certsDisplay}
          </strong>
        </div>
      </div>

      {/* Scope Summary */}
      <div className="mt-3.5 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-slate-700 text-xs leading-relaxed space-y-2">
        <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
          <FileText size={14} className="text-[#18794e]" /> Scope of Work &amp; Execution Summary:
        </div>
        <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line break-words">
          {scope}
        </div>
      </div>
    </div>
  );
};
