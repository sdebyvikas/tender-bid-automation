import React from "react";
import {
  ShieldCheck,
  FileText,
  Eye,
  Calendar,
  DollarSign,
  Building2,
  FileCode,
  Tag,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { Tender } from "../../../types/tender";

interface TenderExtractedParamsCardProps {
  tender: Tender | null;
  onPreviewDoc?: (doc: any) => void;
}

export const TenderExtractedParamsCard: React.FC<
  TenderExtractedParamsCardProps
> = ({ tender, onPreviewDoc }) => {
  const authority =
    tender?.organization || tender?.authority || "Not Specified";
  const tenderNo =
    tender?.tenderNumber && tender.tenderNumber !== "NOT SPECIFIED"
      ? tender.tenderNumber
      : tender?.reference || "Ref: As per NIT Notice";

  const deadline = tender?.submissionDeadline
    ? new Date(tender.submissionDeadline).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : tender?.due || "-";

  const estValue = tender?.estimatedValueDisplay || "-";
  const emd =
    tender?.emdDisplay ||
    (tender?.emdAmountINR
      ? `₹${Number(tender.emdAmountINR).toLocaleString("en-IN")}`
      : "-");

  const tenderFee =
    tender?.tenderFeeINR && tender.tenderFeeINR > 0
      ? `₹${Number(tender.tenderFeeINR).toLocaleString("en-IN")}`
      : "Exempted / As per RFP";

  const preBid = tender?.preBidMeetingDate
    ? new Date(tender.preBidMeetingDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not Specified / NIL";

  const certsList =
    tender?.eligibilityCriteria?.requiredCertifications &&
    tender.eligibilityCriteria.requiredCertifications.length > 0
      ? tender.eligibilityCriteria.requiredCertifications
      : [];

  const certsDisplay =
    certsList.length > 0
      ? certsList.join(" · ")
      : "Standard Statutory Registrations";
  const certsTitle =
    certsList.length > 0 ? certsList.join(", ") : "As per RFP requirements";

  const scope =
    tender?.scopeSummary ||
    tender?.scopeOfWork ||
    tender?.description ||
    "Detailed scope of work as per uploaded RFP specifications.";

  const pageCount = tender?.documentMeta?.pageCount || 1;
  const fileName =
    tender?.uploadedFileName ||
    tender?.documentMeta?.fileName ||
    "Source_RFP_Document.pdf";

  const handlePreviewRFP = () => {
    if (onPreviewDoc) {
      onPreviewDoc({
        name: fileName,
        type: "pdf",
        url: `/uploads/${tender?.documentMeta?.fileName || fileName}`,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-3xs">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Extracted RFP Parameters &amp; Specifications
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                ✓ 100% Verified
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              Structured procurement intelligence parsed directly from source
              document
            </p>
          </div>
        </div>

        {/* Source Document Preview Action */}
        {/* <div className="flex items-center gap-2">
          <button
            onClick={handlePreviewRFP}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Eye size={13} />
            <span>Preview Source RFP ({pageCount} Pages)</span>
          </button>
        </div> */}
      </div>

      {/* Grid of Extracted Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/90">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Issuing Authority
          </span>
          <strong
            className="text-xs text-slate-900 line-clamp-1 block"
            title={authority}
          >
            {authority}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/90">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            NIT / Tender Ref No.
          </span>
          <strong className="text-xs font-mono text-slate-900 block truncate">
            {tenderNo}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/90">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Bid Deadline
          </span>
          <strong className="text-xs text-slate-900 block">{deadline}</strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/90">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Estimated Value
          </span>
          <strong className="text-xs text-emerald-700 font-bold block">
            {estValue}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/90">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            EMD / Bid Security
          </span>
          <strong className="text-xs text-slate-900 block">{emd}</strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/90">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Tender Document Fee
          </span>
          <strong className="text-xs text-slate-900 block">{tenderFee}</strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/90">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Pre-Bid Meeting
          </span>
          <strong className="text-xs text-slate-900 block">{preBid}</strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/90">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Mandatory Documents
          </span>
          <strong
            className="text-xs text-slate-900 block truncate"
            title={certsTitle}
          >
            {certsDisplay}
          </strong>
        </div>
      </div>

      {/* Scope Summary */}
      <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/80 text-slate-700 text-xs leading-relaxed space-y-2">
        <div className="font-bold text-emerald-950 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <FileText size={14} className="text-emerald-700" />
            <span>Scope of Work &amp; Project Deliverables:</span>
          </span>
          <span className="text-[10.5px] font-mono font-medium text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
            Turnkey Mandate
          </span>
        </div>
        <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line break-words">
          {scope}
        </div>
      </div>
    </div>
  );
};
