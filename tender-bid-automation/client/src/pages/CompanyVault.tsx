import React, { useState, useMemo, useEffect } from "react";
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
  UserCheck,
  Plus,
  Mail,
  Phone,
  Briefcase,
  LucideIcon
} from "lucide-react";
import { StatusPill, IconButton, SectionTitle } from "../components/Common";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import VaultDocumentEditModal from "../components/VaultDocumentEditModal";
import { CompanyProfile, StatutoryDocument, AuthorizedSignatoryItem } from "../types";
import { signatoryAPI } from "../services/api";

export interface CompanyVaultProps {
  companyProfile?: CompanyProfile | null;
  onEditProfile: () => void;
  onOpenSignatoriesModal?: () => void;
  onUploadDoc: () => void;
  onDocumentUpdated?: (companyProfile: CompanyProfile) => void;
  onDeleteDoc?: (docId: string) => void;
}

export default function CompanyVault({
  companyProfile,
  onEditProfile,
  onOpenSignatoriesModal,
  onUploadDoc,
  onDocumentUpdated,
  onDeleteDoc,
}: CompanyVaultProps) {
  const [catFilter, setCatFilter] = useState<string>("All");
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<StatutoryDocument | null>(null);
  const [selectedDocForEdit, setSelectedDocForEdit] = useState<StatutoryDocument | null>(null);
  const [dbSignatories, setDbSignatories] = useState<AuthorizedSignatoryItem[]>([]);

  // Fetch live signatories from MongoDB collection
  const loadDbSignatories = async () => {
    try {
      const res = await signatoryAPI.getAll();
      if (res.data?.signatories && Array.isArray(res.data.signatories)) {
        setDbSignatories(res.data.signatories);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadDbSignatories();
  }, [companyProfile]);

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

  // Signatories list from vault profile or live MongoDB collection
  const signatoriesList = useMemo(() => {
    if (dbSignatories.length > 0) {
      return dbSignatories;
    }
    if (companyProfile?.authorizedSignatories && companyProfile.authorizedSignatories.length > 0) {
      return companyProfile.authorizedSignatories;
    }
    const list = [];
    if (companyProfile?.authorizedSignatory?.name) {
      list.push({
        id: 'primary',
        name: companyProfile.authorizedSignatory.name,
        designation: companyProfile.authorizedSignatory.designation || 'Managing Director',
        email: companyProfile.authorizedSignatory.email || '',
        phone: companyProfile.authorizedSignatory.phone || '',
        isPrimary: true,
      });
    }
    return list;
  }, [dbSignatories, companyProfile]);

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
            Keep statutory documents, authorized signatories and brand assets ready for
            every tender.
          </p>
        </div>
        <div className="heading-actions flex items-center gap-2">
          {onOpenSignatoriesModal && (
            <button
              className="button button-secondary cursor-pointer flex items-center gap-1.5"
              onClick={onOpenSignatoriesModal}
              title="Add, Edit or Delete Signing Authorities"
            >
              <UserCheck size={15} className="text-[#18794e]" /> Signatories ({signatoriesList.length})
            </button>
          )}

          <button
            className="button button-secondary cursor-pointer"
            onClick={onEditProfile}
            title="Edit Company Details"
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

      {/* VAULT HERO BANNER */}
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

      {/* DEDICATED SIGNATORIES & KEY PERSONNEL DESK */}
      <div className="fade-up delay-1 mb-6">
        <section className="panel p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#18794e] flex items-center justify-center font-bold">
                  <UserCheck size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Authorized Signatories &amp; Power of Attorney Registry
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Designated directors authorized to digitally sign bids, undertakings and affidavits.
              </p>
            </div>

            {onOpenSignatoriesModal && (
              <button
                type="button"
                onClick={onOpenSignatoriesModal}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#18794e] hover:bg-[#156a45] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Plus size={14} />
                <span>Manage Signatories</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {signatoriesList.length === 0 ? (
              <div className="col-span-full py-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <UserCheck size={24} className="mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-600">No Authorized Signatories registered yet</p>
                {onOpenSignatoriesModal && (
                  <button
                    type="button"
                    onClick={onOpenSignatoriesModal}
                    className="text-xs text-[#18794e] font-bold hover:underline mt-1 cursor-pointer"
                  >
                    + Add your first Signatory
                  </button>
                )}
              </div>
            ) : (
              signatoriesList.map((sig) => (
                <div
                  key={sig.id || sig.name}
                  className={`p-3.5 rounded-xl border space-y-2 relative transition-colors ${
                    sig.isPrimary
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          sig.isPrimary ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {sig.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-xs text-slate-900 block">{sig.name}</strong>
                        <span className="text-[10px] text-slate-500 font-medium block">{sig.designation}</span>
                      </div>
                    </div>
                    {sig.isPrimary ? (
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[9px] font-extrabold uppercase rounded-full tracking-wider">
                        Primary Signer
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold uppercase rounded">
                        Authorized
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 space-y-1">
                    {sig.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        <span>{sig.email}</span>
                      </div>
                    )}
                    {sig.phone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        <span>{sig.phone}</span>
                      </div>
                    )}
                    {(sig.signatureFileUrl || sig.specimenSignatureUrl) ? (
                      <div className="pt-1">
                        <a
                          href={sig.signatureFileUrl || sig.specimenSignatureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-[#18794e] hover:bg-emerald-200 rounded font-bold text-[9px] border border-emerald-300"
                        >
                          <FileText size={10} /> View Signature PDF
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* CORE VAULT DOCUMENTS SECTION */}
      <div className="fade-up delay-2">
        <section className="panel p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
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
                    ? "bg-[#18794e] text-white border-[#18794e] font-bold"
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
