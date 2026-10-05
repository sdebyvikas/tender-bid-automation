import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderLock,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  LucideIcon
} from "lucide-react";
import { StatusPill, IconButton, SectionTitle } from "../components/Common";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import VaultDocumentEditModal from "../components/VaultDocumentEditModal";
import { CompanyProfile, StatutoryDocument } from "../types";

export interface CompanyVaultProps {
  companyProfile?: CompanyProfile | null;
  onEditProfile: () => void;
  onUploadDoc: () => void;
  onDocumentUpdated?: (companyProfile: CompanyProfile) => void;
  onDeleteDoc?: (docId: string) => void;
}

export default function CompanyVault({
  companyProfile,
  onEditProfile,
  onUploadDoc,
  onDocumentUpdated,
  onDeleteDoc,
}: CompanyVaultProps) {
  const [catFilter, setCatFilter] = useState<string>("All");
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<StatutoryDocument | null>(null);
  const [selectedDocForEdit, setSelectedDocForEdit] = useState<StatutoryDocument | null>(null);

  const docs = companyProfile?.statutoryDocuments || [];

  const categories = [
    "All",
    "Certifications",
    "Tax",
    "Financial",
    "Corporate",
    "Statutory",
    "Human Resource",
  ];

  const filteredDocs = useMemo(() => {
    if (!docs || docs.length === 0) return [];
    if (catFilter === "All") return docs;
    return docs.filter(
      (d) =>
        (d.category || "").toLowerCase() === catFilter.toLowerCase() ||
        (d.name || "").toLowerCase().includes(catFilter.toLowerCase()),
    );
  }, [docs, catFilter]);

  const verifiedCount = docs.filter((d) => d.tag === "Verified").length;
  const totalCount = docs.length;
  const readiness =
    totalCount > 0
      ? Math.round((verifiedCount / totalCount) * 100)
      : (companyProfile?.readinessScore ?? 100);

  const getDocIcon = (iconName?: string): LucideIcon => {
    switch (iconName) {
      case "FileCheck2":
        return FileCheck2;
      case "ShieldCheck":
        return ShieldCheck;
      case "CircleDollarSign":
        return CircleDollarSign;
      case "Users":
        return Users;
      case "AlertTriangle":
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>Company Vault</strong>
          </div>
          <h1>Your bid-ready identity.</h1>
          <p>
            Keep statutory documents, signatories and brand assets ready for
            every tender.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary cursor-pointer"
            onClick={onEditProfile}
            title="Edit Company Details & Signatories"
          >
            <Edit3 size={15} /> Edit Profile
          </button>
          <button
            className="button button-primary cursor-pointer"
            onClick={onUploadDoc}
          >
            <Upload size={16} /> Upload document
          </button>
        </div>
      </div>

      <div className="vault-hero panel fade-up delay-1">
        <div className="vault-hero-mark">
          <FolderLock size={26} />
        </div>
        <div className="vault-hero-copy">
          <div className="flex items-center gap-2">
            <span className="eyebrow">COMPANY PROFILE · VERIFIED</span>
            <button
              onClick={onEditProfile}
              className="text-xs text-emerald-800 hover:text-emerald-950 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 size={12} /> Edit
            </button>
          </div>
          <h2>{companyProfile?.name || "Company Profile Not Configured"}</h2>
          <p>
            {companyProfile?.gstin
              ? `GSTIN ${companyProfile.gstin}`
              : "GSTIN not configured"}{" "}
            <span>·</span>{" "}
            {companyProfile?.cin
              ? `CIN ${companyProfile.cin}`
              : "CIN not configured"}{" "}
            <span>·</span>{" "}
            {companyProfile?.headquarters || "Location not configured"}
          </p>
        </div>
        <div className="vault-hero-stat">
          <strong>{readiness}%</strong>
          <span>profile readiness</span>
          <div className="progress-track">
            <span style={{ width: `${readiness}%` }} />
          </div>
        </div>
      </div>

      <div className="fade-up delay-2">
        <section className="panel p-4">
          <SectionTitle
            eyebrow="STATUTORY DOCUMENTS & CERTIFICATES"
            title="Core vault"
            detail="Documents automatically cross-checked by the eligibility engine."
            action={
              <span
                className={`count-badge ${verifiedCount === totalCount ? "count-green" : "bg-emerald-50 text-emerald-800"}`}
              >
                {verifiedCount} / {totalCount} Verified
              </span>
            }
          />

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatFilter(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  catFilter === cat
                    ? "bg-[#173C40] text-white border-[#173C40] font-medium"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200"
                }`}
              >
                {cat}{" "}
                {cat === "All"
                  ? `(${totalCount})`
                  : `(${docs.filter((d) => (d.category || "").toLowerCase() === cat.toLowerCase()).length})`}
              </button>
            ))}
          </div>

          <div className="doc-list max-h-[460px] overflow-y-auto pr-1">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => {
                const DocIcon = getDocIcon(doc.icon);
                return (
                  <div className="doc-row" key={doc.id || doc.name}>
                    <div className="doc-type-icon">
                      <DocIcon size={18} />
                    </div>
                    <div className="doc-row-copy">
                      <strong>{doc.name}</strong>
                      <small>{doc.meta}</small>
                    </div>
                    <StatusPill
                      tone={
                        doc.tag === "Expiring"
                          ? "amber"
                          : doc.tag === "Expired"
                            ? "red"
                            : "green"
                      }
                    >
                      {doc.tag || "Verified"}
                    </StatusPill>
                    <div className="flex items-center gap-1">
                      <IconButton
                        label={`Preview ${doc.name}`}
                        onClick={() => {
                          setSelectedDocForPreview(doc);
                        }}
                      >
                        <ExternalLink size={15} />
                      </IconButton>
                      <IconButton
                        label={`Edit ${doc.name}`}
                        onClick={() => setSelectedDocForEdit(doc)}
                      >
                        <Edit3 size={15} />
                      </IconButton>
                      {onDeleteDoc && (
                        <button
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={`Delete ${doc.name}`}
                          onClick={() => onDeleteDoc(doc.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <FileText size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  No documents in "{catFilter}" category
                </p>
                <button
                  className="button button-secondary text-xs mt-2 cursor-pointer"
                  onClick={onUploadDoc}
                >
                  <Upload size={14} /> Upload {catFilter} Document
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#18794e]" /> Encrypted
              with AES-256 in local repository
            </span>
            <button
              className="button button-primary text-xs cursor-pointer"
              onClick={onUploadDoc}
            >
              <Upload size={14} /> Add new document
            </button>
          </div>
        </section>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        document={selectedDocForPreview}
        companyProfile={companyProfile}
      />

      {/* DOCUMENT EDIT MODAL */}
      <VaultDocumentEditModal
        isOpen={Boolean(selectedDocForEdit)}
        onClose={() => setSelectedDocForEdit(null)}
        document={selectedDocForEdit}
        onDocumentUpdated={(updatedProfile) => {
          if (onDocumentUpdated) onDocumentUpdated(updatedProfile);
        }}
      />
    </>
  );
}
