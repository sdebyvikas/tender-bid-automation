import React, { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  FileCheck2,
  FileText,
  Layers,
  Library,
  Loader2,
  PenLine,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { StatusPill } from "../components/Common";
import { tenderAPI } from "../services/api";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import TenderIntakeAIChat from "../components/TenderIntakeAIChat";

export default function TenderIntake({
  tenders = [],
  activeTender,
  onSelectTender,
  setActive,
  setStage,
  onTenderCreated,
  onDeleteTender,
  companyProfile,
}) {
  const [view, setView] = useState(activeTender ? "hub" : "table");
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("All");
  const [previewDoc, setPreviewDoc] = useState(null);

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const fileInputRef = useRef(null);

  const steps = [
    "Reading PDF structure & 44+ pages...",
    "Extracting RFP scope, deadlines & EMD...",
    "Matching criteria with Company Vault...",
    "Building 4-Gate Decision Scorecard...",
  ];

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsUploading(true);
    setUploadStep(0);

    const stepInterval = setInterval(() => {
      setUploadStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1100);

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);

      const res = await tenderAPI.upload(formData);
      clearInterval(stepInterval);
      setUploadStep(steps.length - 1);

      setTimeout(() => {
        setIsUploading(false);
        if (res.data?.tender) {
          onTenderCreated(res.data.tender);
          setView("hub");
          toast.success("RFP Document analyzed successfully!", {
            description: `${selectedFile.name} parsed into structured fields.`,
          });
        }
      }, 500);
    } catch (err) {
      clearInterval(stepInterval);
      setIsUploading(false);
      toast.error("Failed to parse tender PDF", {
        description: err.response?.data?.error || err.message,
      });
    }
  };

  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const matchSearch =
        !tableSearch ||
        (t.title || "").toLowerCase().includes(tableSearch.toLowerCase()) ||
        (t.tenderNumber || t.reference || "")
          .toLowerCase()
          .includes(tableSearch.toLowerCase()) ||
        (t.organization || t.authority || "")
          .toLowerCase()
          .includes(tableSearch.toLowerCase());

      if (!matchSearch) return false;
      if (tableFilter === "All") return true;
      if (tableFilter === "Active") return t.id === activeTender?.id;
      if (tableFilter === "GO")
        return (
          (t.goNoGoAnalysis?.decision || t.status) === "GO" ||
          (t.score || 0) >= 80
        );
      if (tableFilter === "In Review")
        return (t.status || "In review").toLowerCase().includes("review");
      return true;
    });
  }, [tenders, tableSearch, tableFilter, activeTender?.id]);

  return (
    <>
      {/* TOP PAGE HEADER */}
      <div className="page-heading fade-up mb-6">
        <div>
          <div className="breadcrumb">
            <span>Bid workspace</span>
            <ChevronRight size={13} />
            {view === "hub" && activeTender ? (
              <>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
                  onClick={() => setView("table")}
                >
                  Tender Intake
                </button>
                <ChevronRight size={13} />
                <strong className="text-emerald-800 font-mono">
                  {activeTender.tenderNumber ||
                    activeTender.reference ||
                    "Active Hub"}
                </strong>
              </>
            ) : (
              <strong>Tender Intake Repository</strong>
            )}
          </div>
          <h1>
            {view === "hub" && activeTender
              ? "Tender Command Center"
              : `All Ingested Tenders (${tenders.length})`}
          </h1>
          <p>
            {view === "hub" && activeTender
              ? `Active focus on ${activeTender.title || "selected RFP"} — inspect extracted parameters, generated artifacts & consult Copilot AI.`
              : "Browse, search, and select any RFP from your repository or upload a new tender document."}
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="heading-actions flex items-center gap-2.5">
          {view === "hub" && activeTender ? (
            <button
              type="button"
              className="button button-secondary shadow-xs cursor-pointer"
              onClick={() => setView("table")}
              title="Browse all tenders in repository"
            >
              <FileText size={15} /> All Tenders ({tenders.length})
            </button>
          ) : activeTender ? (
            <button
              type="button"
              className="button button-secondary shadow-xs text-emerald-800 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 cursor-pointer"
              onClick={() => setView("hub")}
              title={`Return to active tender: ${activeTender.title || activeTender.tenderNumber}`}
            >
              <Sparkles size={15} className="text-[#18794e]" /> Back to Active
              Hub
            </button>
          ) : null}

          <button
            type="button"
            className="button button-primary shadow-sm cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={15} /> Upload New RFP
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            accept=".pdf,.docx,.doc,.txt,.xlsx"
            className="hidden"
          />
        </div>
      </div>

      {/* LIVE UPLOADING MODAL OVERLAY */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#173C40] flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-[#18794e]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ingesting RFP Document
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {file?.name || "Tender_Document.pdf"}
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#18794e] h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${((uploadStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-[#18794e] font-mono font-medium animate-pulse">
              {steps[uploadStep]}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW A: ACTIVE TENDER COMMAND CENTER (ONLY SHOWN IN HUB MODE)
          ========================================================================= */}
      {view === "hub" && activeTender ? (
        <div className="space-y-6 fade-up">
          {/* Top Banner Card for Active Tender */}
          <div className="bg-gradient-to-r from-[#0C2038] via-[#152D49] to-[#173C40] text-white p-6 rounded-2xl shadow-md border border-slate-700/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[11px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{" "}
                    Active RFP in Focus
                  </span>
                  <span className="text-xs text-slate-300 font-mono font-medium">
                    {activeTender?.tenderNumber ||
                      activeTender?.reference ||
                      "TENDER.REF"}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs text-slate-300">
                    {activeTender?.organization ||
                      activeTender?.authority ||
                      "Government Authority"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {activeTender?.title || "Tender Document"}
                </h2>
                <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>
                    Due:{" "}
                    <strong>
                      {activeTender?.submissionDeadline
                        ? new Date(
                            activeTender.submissionDeadline,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : activeTender?.due || "24 Sep 2026"}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    Estimated Value:{" "}
                    <strong>
                      {activeTender?.estimatedValueDisplay || "₹2.50 Cr"}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    EMD:{" "}
                    <strong>{activeTender?.emdDisplay || "₹50,000"}</strong>
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  onClick={() => setView("table")}
                >
                  <FileText size={14} /> Switch Tender ({tenders.length})
                </button>
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  onClick={() => {
                    setActive("AI Mode");
                    toast.success("Loaded active tender in AI RFP Studio 2.0");
                  }}
                >
                  <Sparkles size={14} /> Open in AI Studio 2.0
                </button>
              </div>
            </div>
          </div>

          {/* Dual Column Layout: Left (Parameters & Files) / Right (Dedicated AI Chatbot) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: PARAMETERS & GENERATED FILES (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. KEY PARAMETERS GRID */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
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
                        Live structured intelligence parsed by AI
                      </p>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono text-[#18794e] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    ✓ 24 Gates Evaluated
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Authority
                    </span>
                    <strong
                      className="text-xs text-slate-800 block truncate"
                      title={
                        activeTender?.organization || activeTender?.authority
                      }
                    >
                      {activeTender?.organization ||
                        activeTender?.authority ||
                        "Govt Department"}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Bid Deadline
                    </span>
                    <strong className="text-xs text-slate-800 block">
                      {activeTender?.submissionDeadline
                        ? new Date(
                            activeTender.submissionDeadline,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : activeTender?.due || "24 Sep 2026"}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Estimated Value
                    </span>
                    <strong className="text-xs text-emerald-700 font-bold block">
                      {activeTender?.estimatedValueDisplay || "₹2.50 Crore"}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      EMD Security
                    </span>
                    <strong className="text-xs text-slate-800 block">
                      {activeTender?.emdDisplay ||
                        (activeTender?.emdAmountINR
                          ? `₹${Number(activeTender.emdAmountINR).toLocaleString("en-IN")}`
                          : "₹50,000")}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Pre-Bid Meeting
                    </span>
                    <strong className="text-xs text-slate-800 block">
                      {activeTender?.preBidMeetingDate
                        ? new Date(
                            activeTender.preBidMeetingDate,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "18 Sep 2026 (Online)"}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Mandatory Certs
                    </span>
                    <strong
                      className="text-xs text-slate-800 block truncate"
                      title={(
                        activeTender?.eligibilityCriteria
                          ?.requiredCertifications || ["ISO 9001", "ISO 27001"]
                      ).join(", ")}
                    >
                      {(
                        activeTender?.eligibilityCriteria
                          ?.requiredCertifications || ["ISO 9001", "ISO 27001"]
                      ).join(" · ")}
                    </strong>
                  </div>
                </div>

                {/* Scope Summary */}
                <div className="mt-3.5 p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100 text-slate-700 text-xs leading-relaxed">
                  <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <FileText size={13} className="text-[#18794e]" /> Scope &
                    Execution Summary:
                  </div>
                  <p className="line-clamp-3 text-slate-600">
                    {activeTender?.scopeSummary ||
                      "Development, deployment, system integration and 3-year operations & maintenance with 99.5% uptime SLA and localized support."}
                  </p>
                </div>
              </div>

              {/* 2. GENERATED FILES & DELIVERABLES HUB */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Library size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Associated & Generated Bid Files
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        RFP source document and auto-generated response
                        artifacts
                      </p>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
                    5 Artifacts Linked
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
                            {activeTender?.uploadedFileName ||
                              activeTender?.documentMeta?.fileName ||
                              "Assam_DCS_RFP_2026.pdf"}
                          </strong>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                            Source RFP
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500">
                          {activeTender?.documentMeta?.pageCount || 44} Pages ·
                          Extracted & Analyzed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            name:
                              activeTender?.uploadedFileName ||
                              "Tender_RFP_Source.pdf",
                            fileName: activeTender?.uploadedFileName,
                            category: "RFP Document",
                            tag: "Original RFP",
                            issueDate:
                              activeTender?.publishDate || "2026-05-10",
                            fileUrl: activeTender?.uploadedFileName
                              ? `/uploads/${activeTender.uploadedFileName}`
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
                            Technical_Proposal_
                            {activeTender?.tenderNumber?.replace(/\//g, "_") ||
                              "Draft"}
                            .docx
                          </strong>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                            AI Drafted
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500">
                          Executive Summary, Technical Architecture & SLA
                          Methodology
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActive("Proposal Desk");
                        toast("Opening Proposal Desk for editing");
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <PenLine size={13} /> Edit Draft
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
                            Compliance_Matrix_
                            {activeTender?.tenderNumber?.replace(/\//g, "_") ||
                              "Sheet"}
                            .xlsx
                          </strong>
                          <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                            Evaluated
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500">
                          {activeTender?.complianceItems?.length || 24} RFP
                          clauses evaluated against Company Vault
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActive("Eligibility");
                        toast("Opening Compliance Matrix review");
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check size={13} /> Review
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
                          Form-1 Cover Letter, Non-Blacklisting, Make in India &
                          MAF Undertakings
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActive("PDF Binder");
                        toast("Opening Statutory Package in PDF Binder");
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Layers size={13} /> Binder
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  className="button button-secondary text-xs cursor-pointer"
                  onClick={() => setView("table")}
                >
                  <FileText size={14} /> Switch / View All Tenders (
                  {tenders.length})
                </button>

                <button
                  type="button"
                  className="button button-primary cursor-pointer"
                  onClick={() => {
                    setActive("Eligibility");
                    setStage(3);
                    toast.success(
                      "Confirmed! Evaluating against Tech Solutions Vault.",
                    );
                  }}
                >
                  Confirm & Check Eligibility <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: DEDICATED CONTEXTUAL AI CHATBOT (5 COLS) */}
            <div className="lg:col-span-5 flex flex-col">
              <TenderIntakeAIChat
                tender={activeTender}
                companyProfile={companyProfile}
              />
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW B: ALL TENDERS REPOSITORY TABLE (SHOWN IN LIST/SWITCH MODE OR IF NO TENDER)
            ========================================================================= */
        <div className="space-y-6 fade-up">
          {/* Active Tender Banner in Table View */}
          {activeTender && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold bg-[#18794e] text-white px-2 py-0.5 rounded-full tracking-wider">
                      Currently In Focus
                    </span>
                    <strong className="text-sm font-bold text-[#173C40] truncate block">
                      {activeTender.title || activeTender.tenderNumber}
                    </strong>
                  </div>
                  <p className="text-xs text-emerald-800 font-mono mt-0.5">
                    {activeTender.tenderNumber || activeTender.reference} ·{" "}
                    {activeTender.organization ||
                      activeTender.authority ||
                      "Govt Authority"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-[#173C40] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-colors"
                onClick={() => setView("hub")}
              >
                <Sparkles size={13} /> Open Active Hub{" "}
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Total Ingested
              </span>
              <strong className="text-xl font-bold text-slate-900">
                {tenders.length}
              </strong>
              <span className="text-[10.5px] text-slate-500 block mt-0.5">
                RFPs in repository
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Active Focus
              </span>
              <strong className="text-sm font-bold text-[#18794e] truncate block">
                {activeTender?.tenderNumber ||
                  activeTender?.reference ||
                  "None Selected"}
              </strong>
              <span className="text-[10.5px] text-slate-500 block mt-0.5">
                Primary workspace context
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Avg Readiness
              </span>
              <strong className="text-xl font-bold text-emerald-700">
                {tenders.length > 0
                  ? Math.round(
                      tenders.reduce(
                        (acc, t) =>
                          acc +
                          (t.goNoGoAnalysis?.overallScore || t.score || 80),
                        0,
                      ) / tenders.length,
                    )
                  : 0}
                %
              </strong>
              <span className="text-[10.5px] text-emerald-600 block mt-0.5">
                High eligibility match
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Total Pipeline Value
              </span>
              <strong className="text-xl font-bold text-slate-900">
                ₹18.4 Cr
              </strong>
              <span className="text-[10.5px] text-slate-500 block mt-0.5">
                Across active bids
              </span>
            </div>
          </div>

          {/* Table Container Panel */}
          <section className="panel tenders-panel bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="search-box">
                  <Search size={15} />
                  <input
                    placeholder="Search tender title, authority, reference..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                  />
                  {tableSearch && (
                    <button
                      onClick={() => setTableSearch("")}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </label>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  {["All", "Active", "GO", "In Review"].map((filt) => (
                    <button
                      key={filt}
                      type="button"
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        tableFilter === filt
                          ? "bg-white text-[#173C40] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 cursor-pointer"
                      }`}
                      onClick={() => setTableFilter(filt)}
                    >
                      {filt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing {filteredTenders.length} of {tenders.length} RFPs
              </div>
            </div>

            {/* The Table */}
            <div className="table-wrap mt-3 overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Tender Ref & Title</th>
                    <th>Authority</th>
                    <th>Bid Deadline</th>
                    <th>Estimated Value & EMD</th>
                    <th>Readiness Score</th>
                    <th>Decision Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenders.length > 0 ? (
                    filteredTenders.map((row) => {
                      const isCurrent = activeTender?.id === row.id;
                      return (
                        <tr
                          key={row.id || row.reference}
                          className={
                            isCurrent
                              ? "bg-emerald-50/60 font-medium"
                              : "hover:bg-slate-50/80"
                          }
                        >
                          <td>
                            <div className="tender-name">
                              <span
                                className={`tender-file ${isCurrent ? "bg-[#173C40] text-white" : ""}`}
                              >
                                <FileText size={15} />
                              </span>
                              <div>
                                <strong className="flex items-center gap-1.5 text-slate-800">
                                  {row.title || "Untitled Tender"}
                                  {isCurrent && (
                                    <span className="text-[9px] bg-[#18794e] text-white px-1.5 py-0.2 rounded-full uppercase font-bold tracking-wider">
                                      Active Focus
                                    </span>
                                  )}
                                </strong>
                                <small className="text-slate-500 font-mono">
                                  {row.tenderNumber ||
                                    row.reference ||
                                    "REF-N/A"}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="text-xs text-slate-700 font-medium">
                              {row.organization || row.authority || "N/A"}
                            </span>
                          </td>

                          <td>
                            <span className="date-cell text-xs text-slate-600">
                              <CalendarDays
                                size={13}
                                className="text-slate-400"
                              />
                              {row.submissionDeadline
                                ? new Date(
                                    row.submissionDeadline,
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : row.due || "24 Sep 2026"}
                            </span>
                          </td>

                          <td>
                            <div className="text-xs">
                              <strong className="text-slate-800 block">
                                {row.estimatedValueDisplay || "₹2.50 Cr"}
                              </strong>
                              <small className="text-slate-500 block">
                                EMD: {row.emdDisplay || "₹50,000"}
                              </small>
                            </div>
                          </td>

                          <td>
                            <div className="readiness">
                              <span className="readiness-bar">
                                <i
                                  style={{
                                    width: `${row.goNoGoAnalysis?.overallScore || row.score || 80}%`,
                                  }}
                                />
                              </span>
                              <strong className="text-xs">
                                {row.goNoGoAnalysis?.overallScore ||
                                  row.score ||
                                  "82.5"}
                                %
                              </strong>
                            </div>
                          </td>

                          <td>
                            <StatusPill
                              tone={
                                row.statusType ||
                                (row.goNoGoAnalysis?.decision === "GO"
                                  ? "green"
                                  : "amber")
                              }
                            >
                              {row.status ||
                                row.goNoGoAnalysis?.decision ||
                                "In review"}
                            </StatusPill>
                          </td>

                          <td>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#173C40] rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                onClick={() => {
                                  onSelectTender(row);
                                  setView("hub");
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                  toast.success(
                                    `Active focus set to: ${row.title || row.tenderNumber}`,
                                  );
                                }}
                                title="Open Tender Command Center"
                              >
                                <Sparkles size={12} /> Open Hub
                              </button>

                              {onDeleteTender && (
                                <button
                                  type="button"
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      confirm(
                                        `Delete tender ${row.tenderNumber || row.title}?`,
                                      )
                                    ) {
                                      onDeleteTender(row.id);
                                    }
                                  }}
                                  title="Delete tender"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-10 text-slate-500"
                      >
                        <FileText
                          size={28}
                          className="mx-auto text-slate-300 mb-2"
                        />
                        <p className="text-xs font-semibold text-slate-700">
                          No tenders match your search criteria
                        </p>
                        <button
                          type="button"
                          className="button button-secondary text-xs mt-2"
                          onClick={() => {
                            setTableSearch("");
                            setTableFilter("All");
                          }}
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        companyProfile={companyProfile}
      />
    </>
  );
}
