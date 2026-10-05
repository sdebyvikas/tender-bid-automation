import React from "react";
import {
  Library,
  FileText,
  Eye,
  PenLine,
  FileCheck2,
  Check,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { Tender } from "../../../types/tender";

interface TenderGeneratedArtifactsCardProps {
  tender: Tender | null;
  onPreviewDoc: (doc: any) => void;
  onNavigateStep: (step: number) => void;
}

export const TenderGeneratedArtifactsCard: React.FC<
  TenderGeneratedArtifactsCardProps
> = ({ tender, onPreviewDoc, onNavigateStep }) => {
  const tenderRefFormatted =
    tender?.tenderNumber?.replace(/\//g, "_") || "Doc";

  const originalFileName =
    tender?.uploadedFileName ||
    tender?.documentMeta?.fileName ||
    "Tender_Document.pdf";

  const pageCount = tender?.documentMeta?.pageCount || 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Library size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Associated &amp; Generated Bid Files
            </h3>
            <p className="text-[11px] text-slate-500">
              RFP source document and auto-generated response artifacts
            </p>
          </div>
        </div>
        <span className="text-[10.5px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
          4 Artifacts Linked
        </span>
      </div>

      <div className="space-y-2.5">
        {/* File 1: Original RFP PDF */}
        <div className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-800 truncate block">
                  {originalFileName}
                </strong>
                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                  Source RFP
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500">
                {pageCount} Pages · Extracted &amp; Analyzed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                onPreviewDoc({
                  name: originalFileName,
                  fileName: originalFileName,
                  category: "RFP Document",
                  tag: "Original RFP",
                  issueDate: tender?.publishDate || "2026-05-10",
                  fileUrl: tender?.uploadedFileName
                    ? `/uploads/${tender.uploadedFileName}`
                    : null,
                })
              }
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Eye size={13} /> Preview
            </button>
          </div>
        </div>

        {/* File 2: Technical Proposal Draft */}
        <div className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#18794e] flex items-center justify-center shrink-0">
              <PenLine size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-800 truncate block">
                  Technical_Proposal_{tenderRefFormatted}.docx
                </strong>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                  AI Drafted
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500">
                Executive Summary, Architecture &amp; SLA Methodology
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateStep(4)}
            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <PenLine size={13} /> Step 4: Edit
          </button>
        </div>

        {/* File 3: Compliance Matrix Sheet */}
        <div className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <FileCheck2 size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-800 truncate block">
                  Compliance_Matrix_{tenderRefFormatted}.xlsx
                </strong>
                <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                  Evaluated
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500">
                9-Rule Verification Matrix &amp; QCBS Evaluation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateStep(2)}
            className="px-2.5 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Check size={13} /> Step 2: Review
          </button>
        </div>

        {/* File 4: Statutory Annexures */}
        <div className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-800 truncate block">
                  Statutory_Undertakings_Package.pdf
                </strong>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                  Auto-Filled
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500">
                Non-Blacklisting Affidavit, Form-1 &amp; Undertakings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateStep(5)}
            className="px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Layers size={13} /> Step 5: Binder
          </button>
        </div>
      </div>
    </div>
  );
};
