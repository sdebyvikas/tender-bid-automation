import React, { useMemo } from "react";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tender, ComplianceItem } from "../../../types/tender";
import { CompanyProfile, StatutoryDocument } from "../../../types/company";

interface TenderWinBoosterCardProps {
  tender: Tender | null;
  companyProfile?: CompanyProfile | null;
}

export const TenderWinBoosterCard: React.FC<TenderWinBoosterCardProps> = ({
  tender,
  companyProfile,
}) => {
  const navigate = useNavigate();

  const vaultDocs: StatutoryDocument[] = companyProfile?.statutoryDocuments || [];
  const verifiedVaultDocs = vaultDocs.filter(
    (d) => d.tag === "Verified" || d.fileName,
  );

  // Helper to check if a compliance item is physically present in Vault
  const isPhysicallyInVault = (comp: ComplianceItem) => {
    const text =
      `${comp.category || ""} ${comp.requirement || ""} ${comp.evidenceDoc || ""}`.toLowerCase();
    return verifiedVaultDocs.some((d) => {
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
      if (
        (text.includes("incorporation") || text.includes("coi")) &&
        (dName.includes("incorporation") || d.category === "Corporate")
      )
        return true;
      return false;
    });
  };

  // Dynamically extract missing clauses that need physical upload in Vault
  const dynamicMissingItems = useMemo(() => {
    const items = tender?.complianceItems || [];
    return items
      .filter((c) => !isPhysicallyInVault(c))
      .slice(0, 3)
      .map((c, idx) => ({
        id: c.id || `gap-${idx}`,
        category: c.category || "Eligibility Requirement",
        title: c.evidenceDoc || c.requirement,
        desc: c.requirement,
        boost: `+5% Win Fit`,
      }));
  }, [tender?.complianceItems, verifiedVaultDocs]);

  const currentScore = 56; // Base score with currently verified PAN only
  const potentialScore = Math.min(
    95,
    currentScore + dynamicMissingItems.length * 8,
  );

  if (dynamicMissingItems.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/10 rounded-2xl border border-amber-300/60 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/60">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Win Probability Booster &amp; Actionable Gaps
              </h3>
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Current Win Fit:{" "}
              <strong className="text-slate-900">{currentScore}%</strong> ➔
              Potential with Missing Vault Docs:{" "}
              <strong className="text-emerald-700">{potentialScore}%</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/vault")}
          className="px-3 py-1.5 bg-[#082924] hover:bg-[#0C3B34] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Upload size={13} />
          <span>Upload Missing Docs to Vault</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Grid of Dynamic Missing Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {dynamicMissingItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 bg-white/90 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between hover:border-amber-400 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[9.5px] font-bold uppercase text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 truncate max-w-[150px]">
                  {item.category}
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {item.boost}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-start gap-1.5">
                <AlertCircle
                  size={14}
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <span className="line-clamp-2">{item.title}</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">
                {item.desc}
              </p>
            </div>

            <button
              onClick={() => navigate("/vault")}
              className="mt-3 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-100"
            >
              <span>Attach in Company Vault</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Verified in Vault Footer (Only lists actual physical documents in Vault) */}
      <div className="mt-3.5 pt-3 border-t border-amber-200/40 flex items-center gap-2 text-xs text-slate-600 flex-wrap">
        <span className="font-bold text-slate-800 flex items-center gap-1 text-[11.5px]">
          <CheckCircle2 size={14} className="text-emerald-600" /> Already
          Verified Physical Documents in Vault:
        </span>
        {verifiedVaultDocs.length > 0 ? (
          verifiedVaultDocs.map((doc) => (
            <span
              key={doc.id}
              className="bg-emerald-50 text-emerald-900 font-medium px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]"
            >
              ✓ {doc.name} ({doc.category || "Tax"})
            </span>
          ))
        ) : (
          <span className="text-slate-400 italic text-[11px]">
            No verified documents uploaded yet
          </span>
        )}
      </div>
    </div>
  );
};
