import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  FileCheck2,
  FileText,
  Layers,
  Library,
  PenLine,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { StatusPill, tenderPipelineSteps } from "../components/Common";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import TenderUploadModal from "../components/TenderUploadModal";
import TenderIntakeAIChat from "../components/TenderIntakeAIChat";

// Integrated Tender Step Components
import Eligibility from "./Eligibility";
import PaymentProof from "./PaymentProof";
import ProposalDesk from "./ProposalDesk";
import PdfBinder from "./PdfBinder";
import ConfirmDialog from "../components/ConfirmDialog";

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
  const { tenderId } = useParams();
  const navigate = useNavigate();

  const isHubMode = Boolean(tenderId);

  // Active step is internal state inside the tender details route
  const [activeStep, setActiveStep] = useState(1);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const [tenderToDelete, setTenderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset step to 1 whenever tenderId changes
  useEffect(() => {
    setActiveStep(1);
    setIsAIChatOpen(false);
  }, [tenderId]);

  // Match the tender from URL param or fall back to activeTender
  const currentTender = useMemo(() => {
    if (tenderId) {
      return (
        tenders.find(
          (t) =>
            String(t.id) === String(tenderId) ||
            t.tenderNumber === tenderId ||
            t.reference === tenderId,
        ) ||
        activeTender ||
        null
      );
    }
    return activeTender || null;
  }, [tenderId, tenders, activeTender]);

  // Sync with global active tender when accessed via direct URL
  useEffect(() => {
    if (currentTender && currentTender.id !== activeTender?.id) {
      onSelectTender(currentTender);
    }
  }, [currentTender, activeTender?.id, onSelectTender]);

  const goToRepository = () => {
    navigate("/intake");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTenderDetails = (tender) => {
    if (!tender) return;
    onSelectTender(tender);
    navigate(`/intake/${tender.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(
      `Active focus set to: ${tender.title || tender.tenderNumber}`,
    );
  };

  // Table filtering & search state
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("All");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
      if (tableFilter === "Active") return t.id === currentTender?.id;
      if (tableFilter === "GO")
        return (
          (t.goNoGoAnalysis?.decision || t.status) === "GO" ||
          (t.score || 0) >= 80
        );
      if (tableFilter === "In Review")
        return (t.status || "In review").toLowerCase().includes("review");
      return true;
    });
  }, [tenders, tableSearch, tableFilter, currentTender?.id]);

  return (
    <>
      {/* TOP PAGE HEADER */}
      <div className="page-heading fade-up mb-6">
        <div>
          <div className="breadcrumb">
            <span>Bid workspace</span>
            <ChevronRight size={13} />
            {isHubMode && currentTender ? (
              <>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
                  onClick={goToRepository}
                >
                  Tenders Repository
                </button>
                <ChevronRight size={13} />
                <span className="text-emerald-800 font-mono font-medium">
                  {currentTender.tenderNumber ||
                    currentTender.reference ||
                    "Active Hub"}
                </span>
                <ChevronRight size={13} />
                <strong className="text-emerald-900">
                  {tenderPipelineSteps.find((s) => s.id === activeStep)
                    ?.label || "Step"}
                </strong>
              </>
            ) : (
              <strong>Tenders Repository</strong>
            )}
          </div>
          <h1>
            {isHubMode && currentTender
              ? "Tender Details & Operations"
              : `All Ingested Tenders`}
          </h1>
        </div>

        {/* Top Header Actions */}
        <div className="heading-actions flex items-center gap-2.5">
          {isHubMode && currentTender ? (
            <button
              type="button"
              className="button button-secondary shadow-xs cursor-pointer"
              onClick={goToRepository}
              title="Browse all tenders in repository"
            >
              <FileText size={15} /> All Tenders ({tenders.length})
            </button>
          ) : currentTender ? (
            <button
              type="button"
              className="button button-secondary shadow-xs text-emerald-800 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 cursor-pointer"
              onClick={() => openTenderDetails(currentTender)}
              title={`Return to active tender: ${currentTender.title || currentTender.tenderNumber}`}
            >
              <ArrowLeft size={15} className="text-[#18794e]" /> Back to Active
              Hub
            </button>
          ) : null}

          <button
            type="button"
            className="button button-primary shadow-sm cursor-pointer"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus size={15} /> Upload New RFP
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW A: ACTIVE TENDER DETAILS & WORKFLOW (ROUTE: /intake/:tenderId)
          ========================================================================= */}
      {isHubMode && currentTender ? (
        <div className="space-y-6 fade-up">
          {/* 2. TOP INTERACTIVE PIPELINE STEPPER (COMPONENT SWITCHER) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-3 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {tenderPipelineSteps.map((step) => {
                const IconComponent = step.icon;
                const isActive = activeStep === step.id;
                const isPassed = activeStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setActiveStep(step.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-[#173C40] text-white shadow-sm"
                        : isPassed
                          ? "bg-emerald-50/70 text-slate-800 hover:bg-emerald-100/70 border border-emerald-200/60"
                          : "bg-slate-50/60 text-slate-600 hover:bg-slate-100/80 border border-slate-200/50"
                    }`}
                  >
                    {/* Step Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-emerald-500 text-white font-bold"
                          : isPassed
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {isPassed ? (
                        <Check size={16} strokeWidth={2.5} />
                      ) : (
                        <IconComponent size={16} />
                      )}
                    </div>

                    {/* Step Labels */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isActive
                              ? "text-emerald-300"
                              : isPassed
                                ? "text-emerald-700"
                                : "text-slate-400"
                          }`}
                        >
                          Step {step.id}
                        </span>
                        {isPassed && (
                          <span className="text-[9px] bg-emerald-200/60 text-emerald-800 px-1 rounded font-medium">
                            Done
                          </span>
                        )}
                      </div>
                      <strong
                        className={`text-xs block truncate ${
                          isActive
                            ? "text-white font-bold"
                            : "text-slate-800 font-semibold"
                        }`}
                      >
                        {step.label.replace(/^\d+\.\s*/, "")}
                      </strong>
                      <span
                        className={`text-[10px] block truncate ${
                          isActive ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {step.subtitle}
                      </span>
                    </div>

                    {/* Active Indicator Chevron */}
                    {isActive && (
                      <ChevronRight
                        size={15}
                        className="text-emerald-300 shrink-0 hidden lg:block"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. STEP CONTENT COMPONENT AREA */}
          <div className="step-content-area">
            {/* STEP 1: OVERVIEW & SCOPE (With Prominent Eligibility Verdict, Full-Width 3-Column Matrix & Slide-Over AI Copilot) */}
            {activeStep === 1 && (
              <div className="space-y-6 fade-up">
                {/* 1.1 TOP PROMINENT ELIGIBILITY & GO/NO-GO VERDICT HERO BANNER */}
                <div className="bg-gradient-to-r from-[#082924] via-[#0C3B34] to-[#134942] text-white p-5 md:p-6 rounded-2xl shadow-lg border border-emerald-500/30">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Verdict & Summary */}
                    <div className="flex items-start gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-extrabold uppercase bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-900 animate-ping" />
                            VERDICT:{" "}
                            {currentTender?.goNoGoAnalysis?.decision ||
                              "GO DECISION"}{" "}
                            ({currentTender?.goNoGoAnalysis?.winProbability}%
                            WIN FIT)
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                          {companyProfile?.name || "Bidder Entity"}{" "}
                          Pre-Qualification Assessment
                        </h3>
                        <p className="text-xs text-emerald-100/85 max-w-3xl leading-relaxed">
                          AI evaluated this tender (
                          {currentTender?.documentMeta?.pageCount
                            ? `${currentTender.documentMeta.pageCount} pages`
                            : "RFP Document"}
                          ) against verified <strong>Company Vault</strong>.
                          Financial turnover, operating track record, required
                          certifications, technical manpower & statutory
                          compliance evaluated.
                        </p>
                      </div>
                    </div>

                    {/* Right: Scores & Fit Metrics */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      {/* Metric blocks */}
                      <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/15 backdrop-blur-xs">
                        <div className="text-center px-2.5 border-r border-white/15">
                          <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                            Fit Score
                          </span>
                          <strong className="text-base font-extrabold text-emerald-300 block">
                            {currentTender?.goNoGoAnalysis?.overallScore || 90}{" "}
                            / 100
                          </strong>
                          <small className="text-[9px] text-emerald-100">
                            {currentTender?.goNoGoAnalysis?.winProbability ||
                              85}
                            % Win Fit
                          </small>
                        </div>

                        <div className="text-center px-2.5 border-r border-white/15">
                          <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                            Turnover
                          </span>
                          <strong className="text-base font-extrabold text-white block">
                            {companyProfile?.annualTurnover?.[0]
                              ?.amountDisplay ||
                              (companyProfile?.averageTurnoverINR
                                ? `₹${(companyProfile.averageTurnoverINR / 10000000).toFixed(1)} Cr`
                                : "-")}
                          </strong>
                          <small className="text-[9px] text-emerald-300">
                            {currentTender?.eligibilityCriteria
                              ?.minTurnoverDisplay
                              ? `Req: ${currentTender.eligibilityCriteria.minTurnoverDisplay}`
                              : currentTender?.estimatedValueDisplay
                                ? `Req: ${currentTender.estimatedValueDisplay}`
                                : "Turnover Verified"}
                          </small>
                        </div>

                        <div className="text-center px-2.5">
                          <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                            EMD Security
                          </span>
                          <strong
                            className="text-base font-extrabold text-white block  max-w-[90px]"
                            title={currentTender?.emdDisplay || "-"}
                          >
                            {currentTender?.emdDisplay || "-"}
                          </strong>
                          <small className="text-[9px] text-emerald-300">
                            Verified
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.2 FULL-WIDTH 3-COLUMN SIDE-BY-SIDE VERIFICATION MATRIX TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  {/* Table Header Section */}
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#18794e] flex items-center justify-center font-bold">
                          <ShieldCheck size={15} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          Mandatory Pre-Qualification & Eligibility Verification
                          Table
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Side-by-side verification: Tender requirement clauses vs{" "}
                        {companyProfile?.name || "Company Vault"} verified
                        credentials
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                        <Check
                          size={14}
                          strokeWidth={3}
                          className="text-emerald-600"
                        />{" "}
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
                            2. {companyProfile?.name || "Bidder Entity"} (Vault
                            Evidence)
                          </th>
                          <th className="py-3 px-4 w-[16%] text-right">
                            3. AI Verification Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {(() => {
                          // 1. Agar backend se AI / Regex extracted compliance items aaye hain
                          const dynamicItems =
                            currentTender?.complianceItems || [];

                          if (dynamicItems.length === 0) {
                            return (
                              <tr>
                                <td
                                  colSpan="3"
                                  className="py-6 text-center text-slate-400 text-xs"
                                >
                                  No specific compliance clauses extracted.
                                  Review RFP document.
                                </td>
                              </tr>
                            );
                          }

                          return dynamicItems.map((comp, idx) => (
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
                                      {comp.clauseNo || `Clause ${idx + 1}`}{" "}
                                      {/* 👈 Dynamic Clause No. (e.g. Clause 4.2) */}
                                    </span>
                                    <strong className="text-slate-900 font-semibold">
                                      {comp.category ||
                                        "Eligibility Requirement"}
                                    </strong>
                                  </div>
                                  <p className="text-slate-600 text-[11.5px] leading-relaxed">
                                    {comp.requirement}{" "}
                                    {/* 👈 Exact requirement line from PDF */}
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
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 1.3 BOTTOM GRID: EXTRACTED PARAMETERS (LEFT) & GENERATED FILES (RIGHT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT: EXTRACTED RFP PARAMETERS (6 COLS) */}
                  <div className="lg:col-span-6 space-y-4">
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
                              Live structured intelligence parsed from document
                            </p>
                          </div>
                        </div>
                        <span className="text-[10.5px] font-mono text-[#18794e] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                          ✓ Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Authority
                          </span>
                          <strong
                            className="text-xs text-slate-800"
                            title={
                              currentTender?.organization ||
                              currentTender?.authority ||
                              "-"
                            }
                          >
                            {currentTender?.organization ||
                              currentTender?.authority ||
                              "-"}
                          </strong>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Bid Deadline
                          </span>
                          <strong className="text-xs text-slate-800 block">
                            {currentTender?.submissionDeadline
                              ? new Date(
                                  currentTender.submissionDeadline,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : currentTender?.due || "-"}
                          </strong>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Estimated Value
                          </span>
                          <strong className="text-xs text-emerald-700 font-bold block">
                            {currentTender?.estimatedValueDisplay || "-"}
                          </strong>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            EMD Security
                          </span>
                          <strong className="text-xs text-slate-800 block">
                            {currentTender?.emdDisplay ||
                              (currentTender?.emdAmountINR
                                ? `₹${Number(currentTender.emdAmountINR).toLocaleString("en-IN")}`
                                : "-")}
                          </strong>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Pre-Bid Meeting
                          </span>
                          <strong className="text-xs text-slate-800 block">
                            {currentTender?.preBidMeetingDate
                              ? new Date(
                                  currentTender.preBidMeetingDate,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Not Specified / NIL"}
                          </strong>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Mandatory Certs
                          </span>
                          <strong
                            className="text-xs text-slate-800 block "
                            title={
                              currentTender?.eligibilityCriteria
                                ?.requiredCertifications &&
                              currentTender.eligibilityCriteria
                                .requiredCertifications.length > 0
                                ? currentTender.eligibilityCriteria.requiredCertifications.join(
                                    ", ",
                                  )
                                : "As per RFP requirements"
                            }
                          >
                            {currentTender?.eligibilityCriteria
                              ?.requiredCertifications &&
                            currentTender.eligibilityCriteria
                              .requiredCertifications.length > 0
                              ? currentTender.eligibilityCriteria.requiredCertifications.join(
                                  " · ",
                                )
                              : "As per RFP"}
                          </strong>
                        </div>
                      </div>

                      {/* Scope Summary */}
                      <div className="mt-3.5 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-slate-700 text-xs leading-relaxed space-y-2">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                          <FileText size={14} className="text-[#18794e]" />{" "}
                          Scope of Work & Execution Summary:
                        </div>
                        <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line break-words">
                          {currentTender?.scopeSummary ||
                            currentTender?.scopeOfWork ||
                            currentTender?.description ||
                            "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: GENERATED BID FILES & DELIVERABLES HUB (6 COLS) */}
                  <div className="lg:col-span-6 space-y-4">
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
                                  {currentTender?.uploadedFileName ||
                                    currentTender?.documentMeta?.fileName ||
                                    "Tender_Document.pdf"}
                                </strong>
                                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                                  Source RFP
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-500">
                                {currentTender?.documentMeta?.pageCount || 1}{" "}
                                Pages · Extracted & Analyzed
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  name:
                                    currentTender?.uploadedFileName ||
                                    "Tender_RFP_Source.pdf",
                                  fileName: currentTender?.uploadedFileName,
                                  category: "RFP Document",
                                  tag: "Original RFP",
                                  issueDate:
                                    currentTender?.publishDate || "2026-05-10",
                                  fileUrl: currentTender?.uploadedFileName
                                    ? `/uploads/${currentTender.uploadedFileName}`
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
                                  {currentTender?.tenderNumber?.replace(
                                    /\//g,
                                    "_",
                                  ) || "Draft"}
                                  .docx
                                </strong>
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                                  AI Drafted
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-500">
                                Executive Summary, Architecture & SLA
                                Methodology
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveStep(4);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
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
                                  Compliance_Matrix_
                                  {currentTender?.tenderNumber?.replace(
                                    /\//g,
                                    "_",
                                  ) || "Sheet"}
                                  .xlsx
                                </strong>
                                <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                                  Evaluated
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-500">
                                9-Rule Verification Matrix & QCBS Evaluation
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveStep(2);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
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
                                Non-Blacklisting Affidavit, Form-1 &
                                Undertakings
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveStep(5);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Layers size={13} /> Step 5: Binder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ELIGIBILITY & GATES */}
            {activeStep === 2 && (
              <div className="fade-up">
                <Eligibility
                  activeTender={currentTender}
                  setActive={setActive}
                  isEmbedded={true}
                  onNextStep={() => {
                    setActiveStep(3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {/* STEP 3: PAYMENT PROOF */}
            {activeStep === 3 && (
              <div className="fade-up">
                <PaymentProof
                  activeTender={currentTender}
                  setActive={setActive}
                  isEmbedded={true}
                  onNextStep={() => {
                    setActiveStep(4);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {/* STEP 4: PROPOSAL DESK */}
            {activeStep === 4 && (
              <div className="fade-up">
                <ProposalDesk
                  activeTender={currentTender}
                  setActive={setActive}
                  isEmbedded={true}
                  onNextStep={() => {
                    setActiveStep(5);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {/* STEP 5: PDF BINDER */}
            {activeStep === 5 && (
              <div className="fade-up">
                <PdfBinder
                  activeTender={currentTender}
                  setActive={setActive}
                  isEmbedded={true}
                />
              </div>
            )}
          </div>

          {/* 4. BOTTOM STEPPER NAVIGATION FOOTER */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
            <div>
              {activeStep > 1 ? (
                <button
                  type="button"
                  className="button button-secondary text-xs cursor-pointer flex items-center gap-1.5"
                  onClick={() => {
                    setActiveStep((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ChevronLeft size={14} /> Back to Step {activeStep - 1}:{" "}
                  {tenderPipelineSteps[activeStep - 2]?.label.replace(
                    /^\d+\.\s*/,
                    "",
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-secondary text-xs cursor-pointer flex items-center gap-1.5"
                  onClick={goToRepository}
                >
                  <FileText size={14} /> View All Tenders ({tenders.length})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Step {activeStep} of 5
              </span>

              {activeStep < 5 ? (
                <button
                  type="button"
                  className="button button-primary cursor-pointer flex items-center gap-1.5 shadow-sm"
                  onClick={() => {
                    setActiveStep((prev) => Math.min(5, prev + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Proceed to Step {activeStep + 1}:{" "}
                  {tenderPipelineSteps[activeStep]?.label.replace(
                    /^\d+\.\s*/,
                    "",
                  )}{" "}
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary bg-emerald-700 hover:bg-emerald-600 cursor-pointer flex items-center gap-1.5 shadow-sm"
                  onClick={() => {
                    toast.success("All 5 workflow stages verified!");
                    goToRepository();
                  }}
                >
                  <Check size={16} /> Finish & Return to Repository
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW B: ALL TENDERS REPOSITORY TABLE (ROUTE: /intake)
            ========================================================================= */
        <div className="space-y-6 fade-up">
          {/* Active Tender Banner in Table View */}
          {currentTender && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold bg-[#18794e] text-white px-2 py-0.5 rounded-full tracking-wider">
                      Currently In Focus
                    </span>
                    <strong className="text-sm font-bold text-[#173C40] truncate block">
                      {currentTender.title || currentTender.tenderNumber}
                    </strong>
                  </div>
                  <p className="text-xs text-emerald-800 font-mono mt-0.5">
                    {currentTender.tenderNumber || currentTender.reference} ·{" "}
                    {currentTender.organization ||
                      currentTender.authority ||
                      "Govt Authority"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-[#173C40] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-colors"
                onClick={() => openTenderDetails(currentTender)}
              >
                Open Active Hub <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
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
                {currentTender?.tenderNumber ||
                  currentTender?.reference ||
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
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      const isCurrent = currentTender?.id === row.id;
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
                              {row.organization || row.authority || "-"}
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
                                : row.due || "-"}
                            </span>
                          </td>

                          <td>
                            <div className="text-xs">
                              <strong className="text-slate-800 block">
                                {row.estimatedValueDisplay || "-"}
                              </strong>
                              <small className="text-slate-500 block">
                                EMD: {row.emdDisplay || "-"}
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
                                onClick={() => openTenderDetails(row)}
                                title="Open Tender Command Center"
                              >
                                Open
                              </button>

                              {onDeleteTender && (
                                <button
                                  type="button"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTenderToDelete(row); // 👈 Opens modern Dialog
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
                          className="button button-secondary text-xs mt-2 cursor-pointer"
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

      {/* Shadcn-style Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!tenderToDelete}
        onClose={() => setTenderToDelete(null)}
        onConfirm={async () => {
          if (tenderToDelete && onDeleteTender) {
            setIsDeleting(true);
            await onDeleteTender(tenderToDelete.id);
            setIsDeleting(false);
            setTenderToDelete(null);
          }
        }}
        title="Delete Tender?"
        description="Are you sure you want to remove this tender from repository? This action cannot be undone."
        itemName={
          tenderToDelete
            ? `${tenderToDelete.tenderNumber || "Tender"} — ${tenderToDelete.title}`
            : ""
        }
        confirmText="Delete Tender"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        companyProfile={companyProfile}
      />

      {/* UPLOAD TENDER MODAL */}
      <TenderUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTenderCreated={(newTender) => {
          onTenderCreated(newTender);
          setIsUploadModalOpen(false);
          openTenderDetails(newTender);
          toast.success("RFP Ingested successfully!", {
            description: `${newTender.title || newTender.tenderNumber} is now ready in command center.`,
          });
        }}
      />

      {/* FLOATING SMALL 'ASK' COPILOT BUTTON FIXED AT BOTTOM RIGHT */}
      {isHubMode && currentTender && !isAIChatOpen && (
        <button
          type="button"
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-5 right-6 z-40 px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400/40 backdrop-blur-xs group"
          title="Ask Tender Copilot AI"
        >
          <Sparkles
            size={14}
            className="text-emerald-300 group-hover:rotate-12 transition-transform"
          />
          <span className="text-xs font-bold tracking-wide">Ask</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
        </button>
      )}

      {/* TENDER COPILOT AI SLIDE-OVER DRAWER */}
      {isAIChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsAIChatOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full sm:w-[500px] md:w-[560px] max-w-full h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Top Bar */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#0C3B34] via-[#0E473F] to-[#173C40] text-white flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
                  <Sparkles size={17} className="text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                      Tender Copilot AI
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10.5px] text-emerald-100/80 truncate font-mono">
                    {currentTender?.tenderNumber || "Active RFP Intelligence"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAIChatOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* AI Chatbot Component Embedded */}
            <div className="flex-1 overflow-hidden p-0 flex flex-col">
              <TenderIntakeAIChat
                tender={currentTender}
                companyProfile={companyProfile}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
