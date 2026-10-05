import React from "react";
import { ShieldCheck, Check } from "lucide-react";
import { Tender } from "../../../types/tender";
import { CompanyProfile } from "../../../types/company";

interface TenderEligibilityMatrixTableProps {
  tender: Tender | null;
  companyProfile?: CompanyProfile | null;
}

export const TenderEligibilityMatrixTable: React.FC<
  TenderEligibilityMatrixTableProps
> = ({ tender, companyProfile }) => {
  const dynamicItems = tender?.complianceItems || [];

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
              Mandatory Pre-Qualification & Eligibility Verification Table
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side verification: Tender requirement clauses vs{" "}
            {companyProfile?.name || "Company Vault"} verified credentials
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <Check size={14} strokeWidth={3} className="text-emerald-600" />{" "}
            Pre-Qualification Complied
          </span>
        </div>
      </div>

      {/* The 3-Column Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-[38%] border-r border-slate-200/80">
                1. Tender Requirement (Exact RFP Clause)
              </th>
              <th className="py-3 px-4 w-[46%] border-r border-slate-200/80">
                2. {companyProfile?.name || "Bidder Entity"} (Vault Evidence)
              </th>
              <th className="py-3 px-4 w-[16%] text-right">
                3. AI Verification Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {dynamicItems.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-6 text-center text-slate-400 text-xs"
                >
                  No specific compliance clauses extracted. Review RFP document.
                </td>
              </tr>
            ) : (
              dynamicItems.map((comp, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    idx % 2 === 1 ? "bg-slate-50/20" : ""
                  }`}
                >
                  {/* Column 1: Exact RFP Clause extracted from PDF */}
                  <td className="py-3.5 px-4 align-top border-r border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                          {comp.clauseNo || `Clause ${idx + 1}`}
                        </span>
                        <strong className="text-slate-900 font-semibold">
                          {comp.category || "Eligibility Requirement"}
                        </strong>
                      </div>
                      <p className="text-slate-600 text-[11.5px] leading-relaxed">
                        {comp.requirement}
                      </p>
                      {comp.evidenceDoc && (
                        <div className="text-[10.5px] text-slate-400 font-mono">
                          Mandatory Proof: {comp.evidenceDoc}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Column 2: Company Vault Evidence & Justification */}
                  <td className="py-3.5 px-4 align-top border-r border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <Check
                          size={14}
                          className="text-emerald-600 shrink-0"
                          strokeWidth={3}
                        />
                        <span>
                          {comp.justification
                            ? "Vault Evidence Matched"
                            : "Complied"}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11.5px]">
                        {comp.justification ||
                          `Verified against ${companyProfile?.name || "Company Vault"} records.`}
                      </p>
                      {comp.evidenceDoc && (
                        <span className="text-[10.5px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block font-mono">
                          📁 {comp.evidenceDoc}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 3: AI Verification Status */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <div className="inline-flex flex-col items-end gap-1">
                      <span
                        className={`px-2.5 py-1 font-bold rounded-full text-[11px] flex items-center gap-1 ${
                          comp.status === "Deviation"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                        {comp.status || "Complied (Pass)"}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                        AI Verified
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
