import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileCheck2,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { companyProfileAPI } from "../services/api";
import { CompanyProfile } from "../types";

export interface VaultDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded?: (companyProfile: CompanyProfile) => void;
}

export default function VaultDocumentUploadModal({
  isOpen,
  onClose,
  onDocumentUploaded,
}: VaultDocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("Certifications");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFile(null);
      setName("");
      setCategory("Certifications");
      setExpiryDate("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!name) {
        setName(selected.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }
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
    if (droppedFile) {
      setFile(droppedFile);
      if (!name) {
        setName(
          droppedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("document", file);
      }
      formData.append("name", name);
      formData.append("category", category);
      if (expiryDate) {
        formData.append("expiryDate", expiryDate);
      }

      const res = await companyProfileAPI.uploadDocument(formData);
      if (res.data?.success) {
        toast.success(
          res.data.message || "Document uploaded to Vault successfully!",
        );
        if (onDocumentUploaded) {
          onDocumentUploaded(res.data.companyProfile);
        }
        onClose();
      }
    } catch (err: any) {
      console.error("Failed to upload document:", err);
      toast.error(
        err.response?.data?.error ||
          "Failed to upload document to Company Vault",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EF] text-[#173C40] flex items-center justify-center font-bold">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Upload to Company Vault
              </h3>
              <p className="text-[11px] text-slate-500">
                Add verified statutory documents, licenses or financial proofs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Dropzone */}
          <div
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-[#173C40] bg-[#eaf7ef]"
                : file
                  ? "border-emerald-300 bg-emerald-50/50"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#173C40] flex items-center justify-center">
                  <FileCheck2 size={20} />
                </div>
                <div className="text-left">
                  <strong className="block text-xs text-slate-800 font-semibold">
                    {file.name}
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(0)} KB · Ready to save to
                    encrypted vault
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
                  <Upload size={18} />
                </div>
                <strong className="block text-xs text-slate-700">
                  Choose document or drag & drop
                </strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF, DOCX, PNG up to 25 MB
                </p>
              </div>
            )}
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
              Document Display Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ISO 27001:2022 Certificate Copy"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#173C40] focus:ring-1 focus:ring-[#173C40]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#173C40] bg-white text-slate-700"
              >
                <option value="Certifications">
                  Certifications (ISO, CMMI)
                </option>
                <option value="Corporate">Corporate / Legal</option>
                <option value="Tax">Tax (GST, PAN)</option>
                <option value="Financial">
                  Financial (Turnover, Net Worth)
                </option>
                <option value="Statutory">Statutory & Undertakings</option>
                <option value="Human Resource">Human Resource / CVs</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#173C40] bg-white text-slate-700"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-2 text-slate-700">
            <ShieldCheck size={16} className="text-[#18794e] shrink-0 mt-0.5" />
            <span className="text-[11px] leading-tight text-slate-600">
              Uploaded files are stored in the sovereign encrypted company vault
              and automatically matched against all tender eligibility gates.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="button button-secondary text-xs cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary text-xs cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <Check size={14} /> Add to Company Vault
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
