import React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tender } from "../../../types/tender";
import { CompanyProfile } from "../../../types/company";

interface TenderAIAdvisoryCardProps {
  tender: Tender | null;
  companyProfile?: CompanyProfile | null;
}

export const TenderAIAdvisoryCard: React.FC<TenderAIAdvisoryCardProps> = ({
  tender,
  companyProfile,
}) => {
  const navigate = useNavigate();

  const docs = companyProfile?.statutoryDocuments || [];
  const verifiedDocs = docs.filter((d) => d.tag === "Verified" || d.fileName);

  // Helper to check if a compliance item is physically verified in Vault
  const isPhysicallyVerifiedInVault = (reqText: string) => {
    const text = reqText.toLowerCase();
    return verifiedDocs.some((d) => {
      const dName = (d.name || "").toLowerCase();
      const dOrig = (d.originalName || d.fileName || "").toLowerCase();
      if (text.includes("pan") && (dName.includes("pan") || dOrig.includes("pan")))
        return true;
      if (text.includes("gst") && (dName.includes("gst") || dOrig.includes("gst")))
        return true;
      if (text.includes("esi") && (dName.includes("esi") || dOrig.includes("esi")))
        return true;
      if (text.includes("epf") && (dName.includes("epf") || dOrig.includes("epf")))
        return true;
      if (
        (text.includes("turnover") || text.includes("ca cert")) &&
        (dName.includes("turnover") || d.category === "Financial")
      )
        return true;
      return false;
    });
  };

  // Dynamic Strengths extracted ONLY from physically verified items
  const dynamicStrengths = (tender?.complianceItems || [])
    .filter((c) =>
      isPhysicallyVerifiedInVault(
        `${c.category || ""} ${c.requirement || ""} ${c.evidenceDoc || ""}`,
      ),
    )
    .map((c) => `${c.category || "Eligibility"}: ${c.requirement}`);

  // Dynamic Gaps / Requirements pending physical upload in Vault
  const dynamicGaps = (tender?.complianceItems || [])
    .filter(
      (c) =>
        !isPhysicallyVerifiedInVault(
          `${c.category || ""} ${c.requirement || ""} ${c.evidenceDoc || ""}`,
        ),
    )
    .map(
      (c) =>
        `${c.category || "Requirement"}: ${c.requirement} (Proof: ${c.evidenceDoc || "Pending upload in Vault"})`,
    );

  const deadlineFormatted = tender?.submissionDeadline
    ? new Date(tender.submissionDeadline).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : tender?.due || "Submission Deadline";

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              AI Bidding Advisory &amp; Suitability Assessment
            </h3>
            <p className="text-xs text-slate-500">
              Live intelligence evaluated for:{" "}
              <strong>{tender?.title || "Uploaded RFP"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dynamicGaps.length > 3 ? (
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 shadow-2xs">
              <AlertTriangle size={14} className="text-amber-700" />
              Action Required ({dynamicGaps.length} Vault Uploads Pending)
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck size={14} className="text-emerald-700" />
              Tender Suitability: HIGH (Recommended to Bid)
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Grid: Strengths vs Risks (Strict Vault Matching) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Left: Physically Verified Strengths */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-700" /> Verified in
            Company Vault ({dynamicStrengths.length})
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {dynamicStrengths.length > 0 ? (
              dynamicStrengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">
                Only PAN Card currently verified in Vault.
              </li>
            )}
          </ul>
        </div>

        {/* Right: Critical Gaps / Physical Uploads Pending */}
        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100 space-y-2">
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-700" /> Physical
            Certificates Missing in Vault ({dynamicGaps.length})
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700 max-h-56 overflow-y-auto pr-1">
            {dynamicGaps.length > 0 ? (
              dynamicGaps.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">⚠</span>
                  <span className="leading-snug">{gap}</span>
                </li>
              ))
            ) : (
              <li className="text-emerald-700 font-medium">
                ✓ All mandatory eligibility documents uploaded in Vault!
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Recommended Action Plan Footer (Dynamic Deadline) */}
      <div className="mt-4 p-3 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-emerald-500 text-emerald-950 rounded-md font-bold text-[10px] uppercase shrink-0">
            Action Plan
          </span>
          <span className="text-slate-200">
            Upload the {dynamicGaps.length} pending physical certificate(s) in
            Company Vault before the submission deadline:{" "}
            <strong>{deadlineFormatted}</strong>.
          </span>
        </div>
        <button
          onClick={() => navigate("/vault")}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Open Vault &amp; Upload</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
