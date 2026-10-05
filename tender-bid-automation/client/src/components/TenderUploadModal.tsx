import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  FileCheck2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Building2,
} from "lucide-react";
import { tenderAPI } from "../services/api";
import { Tender } from "../types";

export interface TenderUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenderCreated: (tender: Tender) => void;
}

export default function TenderUploadModal({
  isOpen,
  onClose,
  onTenderCreated,
}: TenderUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [elapsedSecs, setElapsedSecs] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [manualData, setManualData] = useState({
    title: "",
    tenderNumber: "",
    organization: "",
    category: "IT & Software Solutions",
    portal: "GeM (Government e-Marketplace)",
    estimatedValueINR: 20000000,
    emdAmountINR: 400000,
    submissionDeadline: new Date(Date.now() + 20 * 86400000)
      .toISOString()
      .split("T")[0],
    scopeSummary: "",
  });

  const processingSteps = [
    {
      title: "PDF Ingestion & Structure Analysis",
      desc: "Reading binary layout and detecting table grids",
      icon: FileCheck2,
    },
    {
      title: "Visually Scanning Schedule & NIT Table",
      desc: "Extracting Authority, EMD, Due Date, Pre-bid & Estimated Value",
      icon: Clock,
    },
    {
      title: "Section 6 Eligibility Matrix Extraction",
      desc: "Preserving multi-column turnover, net worth & manpower tables",
      icon: FileSpreadsheet,
    },
    {
      title: "Company Vault Evidence Matching",
      desc: "Verifying credentials against Tech Solutions Pvt Ltd Vault",
      icon: Building2,
    },
    {
      title: "Compiling Go/No-Go & Clause Scorecard",
      desc: "Generating clause-by-clause compliance breakdown",
      icon: ShieldCheck,
    },
  ];

  useEffect(() => {
    let timer: any;
    if (loading) {
      setElapsedSecs(0);
      timer = setInterval(() => {
        setElapsedSecs((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (selected) {
      if (selected.size > MAX_FILE_SIZE) {
        setError("File size exceeds 50MB. Please select a smaller file.");
        setFile(null);
        return;
      }
      if (
        !selected.name.toLowerCase().endsWith(".pdf") &&
        selected.type !== "application/pdf"
      ) {
        setError("Only PDF files (.pdf) are supported for tender parsing.");
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (droppedFile) {
      if (droppedFile.size > MAX_FILE_SIZE) {
        setError("File size exceeds 50MB. Please select a smaller file.");
        setFile(null);
        return;
      }
      if (
        !droppedFile.name.toLowerCase().endsWith(".pdf") &&
        droppedFile.type !== "application/pdf"
      ) {
        setError("Only PDF files (.pdf) are supported for tender parsing.");
        setFile(null);
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a tender PDF file first.");
      return;
    }

    if (
      !file.name.toLowerCase().endsWith(".pdf") &&
      file.type !== "application/pdf"
    ) {
      setError("Only PDF files (.pdf) are supported for tender parsing.");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < processingSteps.length - 1 ? prev + 1 : prev,
      );
    }, 3200);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const res = await tenderAPI.upload(formData);
      clearInterval(stepInterval);
      setCurrentStep(processingSteps.length - 1);

      setTimeout(() => {
        setLoading(false);
        onTenderCreated(res.data.tender);
        onClose();
      }, 700);
    } catch (err: any) {
      clearInterval(stepInterval);
      setLoading(false);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to analyze tender document",
      );
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.title || !manualData.organization) {
      setError("Please fill in at least the Tender Title and Organization.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await tenderAPI.createManual(manualData);
      setLoading(false);
      onTenderCreated(res.data?.tender || res.data);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.error || err.message || "Failed to create tender",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Ingest New Tender / RFP
              </h3>
              <p className="text-xs text-slate-500">
                Upload tender notice for automatic AI parsing and Go/No-Go
                qualification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-white px-6 pt-2">
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "border-[#0D3B36] text-[#0D3B36]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Upload Tender Document (AI Auto-Parse)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-6 px-4 flex flex-col space-y-5">
              {/* Top Banner */}
              <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0D3B36] text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles size={20} className="animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Multimodal AI Ingestion in Progress
                    </h4>
                    <p className="text-xs text-slate-600">
                      Reading {file?.name || "Tender Document"} with visual
                      table layout preservation
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300/60">
                    <Clock size={12} className="animate-pulse" />
                    {elapsedSecs}s elapsed
                  </span>
                </div>
              </div>

              {/* Multi-step Live Visual Checklist */}
              <div className="space-y-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                {processingSteps.map((step, idx) => {
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                        isCurrent
                          ? "bg-white border border-emerald-300/80 shadow-xs ring-2 ring-emerald-500/10"
                          : isDone
                            ? "bg-emerald-50/40 border border-emerald-100"
                            : "opacity-45 bg-transparent border border-transparent"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <CheckCircle2 size={15} />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-6 h-6 rounded-full bg-[#0D3B36] text-emerald-300 flex items-center justify-center shadow-xs">
                            <Loader2 size={14} className="animate-spin" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[11px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs font-bold leading-tight ${
                              isCurrent
                                ? "text-[#0D3B36]"
                                : isDone
                                  ? "text-emerald-900"
                                  : "text-slate-500"
                            }`}
                          >
                            {step.title}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              Processing
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[10px] font-bold text-emerald-600">
                              Done ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Overall Pipeline Progress</span>
                  <span className="font-bold text-slate-700">
                    {Math.min(
                      Math.round(
                        ((currentStep + 1) / processingSteps.length) * 100,
                      ),
                      95,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                  <div
                    className="bg-gradient-to-r from-[#0D3B36] to-emerald-600 h-full transition-all duration-700 rounded-full"
                    style={{
                      width: `${Math.min(((currentStep + 1) / processingSteps.length) * 100, 95)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center italic">
                Preserving table columns, financial clauses &amp; CA
                certification requirements
              </p>
            </div>
          ) : activeTab === "upload" ? (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-[#0D3B36] bg-emerald-50/50"
                    : file
                      ? "border-emerald-500 bg-emerald-50/30"
                      : "border-slate-300 hover:border-[#0D3B36] hover:bg-slate-50 bg-slate-50/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />

                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <FileCheck2 size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to
                        analyze
                      </p>
                    </div>
                    <span className="text-xs text-[#0D5C52] font-semibold hover:underline">
                      Click or drag another to replace
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-[#0D3B36] flex items-center justify-center">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        Drag &amp; drop your RFP or Tender document here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PDF documents only (.pdf up to 50MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D3B36] hover:bg-[#092B27] text-white shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <span>Parse &amp; Qualify Tender</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Tender Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implementation of AI Video Management System"
                    value={manualData.title}
                    onChange={(e) =>
                      setManualData({ ...manualData, title: e.target.value })
                    }
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Tender Ref No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NIT-2026/099"
                    value={manualData.tenderNumber}
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        tenderNumber: e.target.value,
                      })
                    }
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi Municipal Corporation"
                    value={manualData.organization}
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        organization: e.target.value,
                      })
                    }
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Estimated Value (₹)
                  </label>
                  <input
                    type="number"
                    value={manualData.estimatedValueINR}
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        estimatedValueINR: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    EMD Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={manualData.emdAmountINR}
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        emdAmountINR: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Scope Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief scope description..."
                    value={manualData.scopeSummary}
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        scopeSummary: e.target.value,
                      })
                    }
                    className="w-full custom-input text-xs resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D3B36] text-white shadow-sm cursor-pointer"
                >
                  <span>Create Tender</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
