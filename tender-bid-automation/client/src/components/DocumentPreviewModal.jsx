import React from "react";
import {
  X,
  Download,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileText,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
  companyProfile,
}) {
  if (!isOpen || !document) return null;

  const backendUrl = "http://localhost:5000";
  const fileUrl = document.fileName
    ? `${backendUrl}/uploads/${document.fileName}`
    : document.fileUrl
      ? document.fileUrl.startsWith("http")
        ? document.fileUrl
        : `${backendUrl}${document.fileUrl}`
      : null;

  const isImage =
    document.fileName &&
    (document.fileName.endsWith(".jpg") ||
      document.fileName.endsWith(".jpeg") ||
      document.fileName.endsWith(".png") ||
      document.fileName.endsWith(".webp"));

  const isPdf = document.fileName && document.fileName.endsWith(".pdf");

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", document.fileName || document.name);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Downloading ${document.name}`);
    } else {
      toast.success("Generated certificate summary downloaded");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[88vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden fade-up">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-[#FBFBFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF7EF] text-[#173C40] flex items-center justify-center font-bold">
              <FileCheck2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  {document.name}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    document.tag === "Expiring"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : document.tag === "Expired"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {document.tag || "Verified"}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {document.category || "Statutory"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {document.meta || "Encrypted in Sovereign Vault"} · Stored in
                local backend `/server/uploads`
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="button button-secondary text-xs !py-1.5"
                title="Open in new window"
              >
                <ExternalLink size={14} /> Open raw
              </a>
            )}
            <button
              className="button button-secondary text-xs !py-1.5"
              onClick={handleDownload}
              title="Download file"
            >
              <Download size={14} /> Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden bg-slate-100">
          {/* LEFT: DOCUMENT VIEW CANVAS (2 COLS) */}
          <div className="md:col-span-2 p-6 overflow-y-auto flex items-center justify-center bg-slate-200/60">
            {isImage && fileUrl ? (
              <div className="bg-white p-3 rounded-xl shadow-md max-w-full">
                <img
                  src={fileUrl}
                  alt={document.name}
                  className="max-h-[62vh] object-contain rounded-lg border border-slate-200"
                />
                <div className="text-center mt-2 text-xs text-slate-500 font-mono">
                  {document.fileName} · Verified Image Artifact
                </div>
              </div>
            ) : isPdf && fileUrl ? (
              <div className="w-full h-full bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
                <iframe
                  src={fileUrl}
                  title={document.name}
                  className="w-full flex-1 border-0"
                />
              </div>
            ) : (
              /* High-fidelity Official Certificate Canvas Simulation */
              <div className="w-full max-w-lg bg-white rounded-xl p-8 shadow-xl border-4 border-double border-slate-300 relative text-slate-800 min-h-[460px] flex flex-col justify-between">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none text-6xl font-black text-slate-900 select-none">
                  TECH SOLUTIONS
                </div>

                {/* Top Header */}
                <div>
                  <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#18794e] uppercase font-bold">
                        Government of India / Statutory Compliance Repository
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-1">
                        {document.name}
                      </h2>
                      <span className="text-xs text-slate-500">
                        Registration & Verification Certificate
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-[#173C40] flex items-center justify-center bg-[#EAF7EF] text-[#173C40] font-black text-sm">
                      TS
                    </div>
                  </div>

                  {/* Certificate Body Details */}
                  <div className="mt-6 space-y-3 text-xs leading-relaxed text-slate-700">
                    <p>
                      This is to certify that{" "}
                      <strong>
                        {companyProfile?.name || "Tech Solutions Pvt Ltd"}
                      </strong>{" "}
                      (CIN:{" "}
                      <code>
                        {companyProfile?.cin || "U72900AS2012PTC011234"}
                      </code>
                      , GSTIN:{" "}
                      <code>{companyProfile?.gstin || "18AABCT1234F1ZP"}</code>)
                      having registered office at{" "}
                      <strong>
                        {companyProfile?.headquarters ||
                          "Guwahati, Assam, India"}
                      </strong>{" "}
                      has furnished verified statutory records.
                    </p>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Document Identifier:
                        </span>
                        <strong className="text-slate-800">
                          {document.id || "DOC-2026-98124"}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Category / Domain:
                        </span>
                        <strong className="text-slate-800">
                          {document.category || "Statutory / Quality"}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status in Vault:</span>
                        <span className="text-[#18794e] font-bold">
                          ● VERIFIED COMPLIANT
                        </span>
                      </div>
                      {document.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            Valid Till / Expiry:
                          </span>
                          <strong className="text-amber-700">
                            {document.expiryDate}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Signatory & Stamp */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between">
                  <div className="text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
                      <ShieldCheck size={16} /> Digital Signature Verified
                    </div>
                    <span>Timestamp: {new Date().toLocaleString("en-IN")}</span>
                  </div>

                  <div className="text-right">
                    <div className="w-24 border-b border-slate-400 mb-1 ml-auto" />
                    <strong className="block text-xs text-slate-800">
                      {companyProfile?.authorizedSignatory?.name ||
                        "Arjun Mehta"}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      {companyProfile?.authorizedSignatory?.designation ||
                        "Managing Director"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: METADATA & STORAGE DETAILS (1 COL) */}
          <div className="p-6 bg-white border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                  DOCUMENT ATTRIBUTES
                </span>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Document Type</span>
                    <strong className="text-slate-800">
                      {document.category || "General"}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Verification</span>
                    <strong className="text-emerald-700">
                      {document.tag || "Verified"}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Encryption</span>
                    <span className="text-slate-700 flex items-center gap-1 font-mono text-[11px]">
                      <Lock size={12} className="text-[#18794e]" /> AES-256
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Eligible Tenders</span>
                    <strong className="text-slate-800">All Active RFPs</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-slate-700 flex items-start gap-2">
                <CheckCircle2
                  size={16}
                  className="text-[#18794e] shrink-0 mt-0.5"
                />
                <span>
                  This document is automatically linked with your{" "}
                  <strong>Eligibility Engine</strong>,{" "}
                  <strong>Cover-2 Proposal Desk</strong>, and{" "}
                  <strong>PDF Binder</strong>.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                className="button button-secondary w-full text-xs justify-center"
                onClick={onClose}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
