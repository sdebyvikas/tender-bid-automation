import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  FileCheck2,
  ShieldCheck,
  Check,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { companyProfileAPI } from "../services/api";
import { StatutoryDocument, CompanyProfile } from "../types";

export interface VaultDocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: StatutoryDocument | null;
  onDocumentUpdated?: (companyProfile: CompanyProfile) => void;
}

export default function VaultDocumentEditModal({
  isOpen,
  onClose,
  document,
  onDocumentUpdated,
}: VaultDocumentEditModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("Certifications");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [tag, setTag] = useState<string>("Verified");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (document) {
      setName(document.name || "");
      setCategory(document.category || "Statutory");
      setExpiryDate(document.expiryDate || "");
      setTag(document.tag || "Verified");
      setFile(null);
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
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
      formData.append("tag", tag);
      if (expiryDate) {
        formData.append("expiryDate", expiryDate);
      }

      const res = await companyProfileAPI.updateDocument(document.id, formData);
      if (res.data?.success) {
        toast.success(
          res.data.message || "Document updated in Company Vault successfully!",
        );
        if (onDocumentUpdated) {
          onDocumentUpdated(res.data.companyProfile);
        }
        onClose();
      }
    } catch (err: any) {
      console.error("Failed to update document:", err);
      toast.error(
        err.response?.data?.error ||
          "Failed to update document in Company Vault",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 fade-up max-h-[90vh] overflow-y-auto">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EF] text-[#173C40] flex items-center justify-center font-bold">
              <RefreshCw size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Edit Vault Document
              </h3>
              <p className="text-[11px] text-slate-500">
                Update document title, category, expiry or replace file attachment
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
          {/* Document Title / Name */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-semibold">
              Document Display Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GST Registration Certificate"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#173C40] focus:ring-1 focus:ring-[#173C40]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-semibold">
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

            {/* Status / Tag */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-semibold">
                Status Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#173C40] bg-white text-slate-700"
              >
                <option value="Verified">Verified Compliant</option>
                <option value="Expiring">Expiring Soon</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending Verification</option>
              </select>
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-semibold">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#173C40] bg-white text-slate-700"
            />
          </div>

          {/* REPLACE FILE SECTION */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 font-semibold">
              Replace File Attachment (Optional)
            </label>

            {/* Current File Info */}
            {document.fileName && !file && (
              <div className="mb-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText size={16} className="text-slate-400" />
                  <span className="font-mono text-[11px] truncate max-w-[280px]">
                    Current file: <strong>{document.fileName}</strong>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-mono">
                  Attached
                </span>
              </div>
            )}

            {/* Dropzone */}
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#173C40] bg-[#eaf7ef]"
                  : file
                    ? "border-emerald-400 bg-emerald-50/50"
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
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#173C40] flex items-center justify-center">
                    <FileCheck2 size={18} />
                  </div>
                  <div className="text-left">
                    <strong className="block text-xs text-slate-800 font-semibold">
                      New file: {file.name}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(0)} KB · Will replace current file
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-1.5">
                    <Upload size={16} />
                  </div>
                  <strong className="block text-xs text-slate-700">
                    Click to choose a new replacement file
                  </strong>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">
                    Leave empty to keep the current file
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-2 text-slate-700">
            <ShieldCheck size={16} className="text-[#18794e] shrink-0 mt-0.5" />
            <span className="text-[11px] leading-tight text-slate-600">
              Changes will be synchronized in MongoDB and auto-reflected across all RFP eligibility gates.
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
                <span>Saving...</span>
              ) : (
                <>
                  <Check size={14} /> Save Document Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
