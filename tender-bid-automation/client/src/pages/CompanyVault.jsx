import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderLock,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import { StatusPill, IconButton, SectionTitle } from "../components/Common";
import DocumentPreviewModal from "../components/DocumentPreviewModal";

export default function CompanyVault({
  companyProfile,
  onEditProfile,
  onUploadDoc,
  onDeleteDoc,
}) {
  const [catFilter, setCatFilter] = useState("All");
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);

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

  const getDocIcon = (iconName) => {
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
            onClick={() =>
              toast("Brand Studio", {
                description: "Letterhead, Watermark & Seal assets active.",
              })
            }
          >
            <Building2 size={16} /> Brand Studio
          </button>
          <button className="button button-primary cursor-pointer" onClick={onUploadDoc}>
            <Upload size={16} /> Upload document
          </button>
        </div>
      </div>

      <div className="vault-hero panel fade-up delay-1">
        <div className="vault-hero-mark">
          <FolderLock size={26} />
        </div>
        <div className="vault-hero-copy">
          <span className="eyebrow">COMPANY PROFILE · VERIFIED</span>
          <h2>{companyProfile?.name || "Tech Solutions Pvt Ltd"}</h2>
          <p>
            GSTIN {companyProfile?.gstin || "18AABCT1234F1ZP"} <span>·</span>{" "}
            CIN {companyProfile?.cin || "U72900AS2012PTC011234"} <span>·</span>{" "}
            {companyProfile?.headquarters || "Guwahati, Assam"}
          </p>
        </div>
        <div className="vault-hero-stat">
          <strong>{companyProfile?.readinessScore || 96}%</strong>
          <span>profile readiness</span>
          <div className="progress-track">
            <span
              style={{ width: `${companyProfile?.readinessScore || 96}%` }}
            />
          </div>
        </div>
      </div>

      <div className="content-grid vault-grid fade-up delay-2">
        <section className="panel">
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
                      {doc.tag}
                    </StatusPill>
                    <div className="flex items-center gap-1">
                      <IconButton
                        label={`Preview ${doc.name}`}
                        onClick={() => {
                          setSelectedDocForPreview(doc);
                          toast.success(`Viewing ${doc.name}`, {
                            description: "Verified document in Sovereign Vault",
                          });
                        }}
                      >
                        <ExternalLink size={15} />
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

        <section className="panel vault-side-panel">
          <SectionTitle eyebrow="PEOPLE & BRAND" title="Workspace setup" />
          <div className="setup-list">
            <div>
              <span className="setup-icon">
                <UserRound size={16} />
              </span>
              <div>
                <strong>Authorized signatory</strong>
                <small>
                  {companyProfile?.authorizedSignatory?.name || "Arjun Mehta"} ·{" "}
                  {companyProfile?.authorizedSignatory?.designation ||
                    "Managing Director"}
                </small>
              </div>
              <CheckCircle2 size={17} className="setup-check" />
            </div>

            <div>
              <span className="setup-icon">
                <Users size={16} />
              </span>
              <div>
                <strong>Key personnel CV bank</strong>
                <small>
                  {companyProfile?.keyPersonnel?.length || 18} profiles · 4
                  tender roles mapped
                </small>
              </div>
              <CheckCircle2 size={17} className="setup-check" />
            </div>

            <div>
              <span className="setup-icon">
                <Building2 size={16} />
              </span>
              <div>
                <strong>Letterhead & watermark</strong>
                <small>Logo, footer and 10% watermark ready</small>
              </div>
              <CheckCircle2 size={17} className="setup-check" />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
            <strong className="text-xs text-slate-800 block mb-1">
              Annual Turnover Baseline
            </strong>
            <div className="space-y-1 text-[11px] text-slate-600">
              {(
                companyProfile?.annualTurnover || [
                  { year: "2023-24", amountDisplay: "₹16.20 Cr" },
                  { year: "2022-23", amountDisplay: "₹14.50 Cr" },
                  { year: "2021-22", amountDisplay: "₹13.70 Cr" },
                ]
              ).map((t) => (
                <div key={t.year} className="flex justify-between">
                  <span>FY {t.year}</span>
                  <strong className="text-slate-800">{t.amountDisplay}</strong>
                </div>
              ))}
            </div>
          </div>

          <button
            className="button button-secondary full-width cursor-pointer"
            onClick={onEditProfile}
          >
            Edit company profile <ArrowUpRight size={15} />
          </button>
        </section>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        document={selectedDocForPreview}
        companyProfile={companyProfile}
      />
    </>
  );
}
