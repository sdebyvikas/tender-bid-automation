import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  UserCheck,
  ShieldCheck,
  FileSpreadsheet,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Mail,
  Phone,
  Briefcase,
  Plus,
  Edit3,
} from "lucide-react";
import { Tender, ComplianceItem } from "../../types/tender";
import { CompanyProfile, AuthorizedSignatoryItem } from "../../types/company";
import { exportComplianceMatrixToExcel } from "./TenderComplianceExporter";
import { signatoryAPI } from "../../services/api";
import { toast } from "sonner";

interface TenderBidderIdentityHeroProps {
  tender: Tender;
  companyProfile: CompanyProfile | null;
  complianceList: ComplianceItem[];
  onOpenProfileModal?: () => void;
  onOpenSignatoriesModal?: () => void;
  onSignatoryChange?: (name: string, designation: string) => void;
}

export default function TenderBidderIdentityHero({
  tender,
  companyProfile,
  complianceList,
  onOpenProfileModal,
  onOpenSignatoriesModal,
  onSignatoryChange,
}: TenderBidderIdentityHeroProps) {
  // 1. Dynamic Bidder Name from Company Vault
  const bidderName =
    companyProfile?.name ||
    companyProfile?.companyName ||
    "Company Profile Pending Setup";

  const [dbSignatories, setDbSignatories] = useState<AuthorizedSignatoryItem[]>(
    [],
  );

  // Load live signatories directly from MongoDB collection
  const loadSignatories = async () => {
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
    loadSignatories();
  }, [companyProfile]);

  // 2. Dynamic Available Signatories List from MongoDB collection
  const availableSignatories = useMemo(() => {
    if (dbSignatories.length > 0) {
      return dbSignatories.map((sig) => ({
        name: sig.name,
        designation: sig.designation || "Authorized Signatory",
        email: sig.email || "Email Not Set",
        phone: sig.phone || "Phone Not Set",
        din: sig.din,
        poaRef: sig.poaRef,
        signatureFileUrl: sig.signatureFileUrl || sig.specimenSignatureUrl,
        isPrimary: sig.isPrimary,
      }));
    }

    if (companyProfile?.authorizedSignatory?.name) {
      return [
        {
          name: companyProfile.authorizedSignatory.name,
          designation:
            companyProfile.authorizedSignatory.designation ||
            "Authorized Signatory",
          email: companyProfile.authorizedSignatory.email || "Email Not Set",
          phone: companyProfile.authorizedSignatory.phone || "Phone Not Set",
          signatureFileUrl: (companyProfile.authorizedSignatory as any)
            ?.signatureFileUrl,
          isPrimary: true,
        },
      ];
    }

    return [
      {
        name: "No Signatory Configured",
        designation: "Click Manage to add Signatory",
        email: "Not Set",
        phone: "Not Set",
        signatureFileUrl: undefined,
        isPrimary: false,
      },
    ];
  }, [dbSignatories, companyProfile]);

  // 3. Active Selected Signatory State
  const [selectedSignatory, setSelectedSignatory] = useState<string>(
    availableSignatories[0]?.name || "No Signatory Configured",
  );
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>(
    availableSignatories[0]?.designation || "Click Manage to add Signatory",
  );
  const [isSignatoryMenuOpen, setIsSignatoryMenuOpen] =
    useState<boolean>(false);

  // Sync state if availableSignatories update
  useEffect(() => {
    if (availableSignatories.length > 0) {
      const primary =
        availableSignatories.find((s) => s.isPrimary) ||
        availableSignatories[0];
      setSelectedSignatory(primary.name);
      setSignatoryDesignation(primary.designation);
    }
  }, [availableSignatories]);

  const activeSignatoryObj = useMemo(() => {
    return (
      availableSignatories.find((s) => s.name === selectedSignatory) ||
      availableSignatories[0]
    );
  }, [availableSignatories, selectedSignatory]);

  // 4. Dynamic Check: Is Power of Attorney (PoA) physically in Vault?
  const hasPoaDocument = useMemo(() => {
    const docs = companyProfile?.statutoryDocuments || [];
    return docs.some(
      (doc) =>
        Boolean(doc.fileName) &&
        (doc.name?.toLowerCase().includes("power of attorney") ||
          doc.name?.toLowerCase().includes("poa") ||
          doc.name?.toLowerCase().includes("board resolution") ||
          doc.name?.toLowerCase().includes("authorization")),
    );
  }, [companyProfile?.statutoryDocuments]);

  // 5. Dynamic Score and Decision from Tender Extraction
  const score = tender.goNoGoAnalysis?.overallScore || tender.score || 0;
  const decision =
    tender.goNoGoAnalysis?.decision ||
    tender.goNoGoAnalysis?.recommendation ||
    "Under Review";

  const handleSelectSignatory = (sig: {
    name: string;
    designation: string;
  }) => {
    setSelectedSignatory(sig.name);
    setSignatoryDesignation(sig.designation);
    setIsSignatoryMenuOpen(false);
    if (onSignatoryChange) {
      onSignatoryChange(sig.name, sig.designation);
    }
    toast.success(
      `Authorized Signatory set to ${sig.name} (${sig.designation})`,
    );
  };

  const handleExportExcel = () => {
    try {
      exportComplianceMatrixToExcel(
        tender,
        companyProfile,
        complianceList,
        selectedSignatory,
      );
      toast.success("Compliance Matrix downloaded (.csv / Excel format)", {
        description: `Exported ${complianceList.length} evaluated clauses for ${tender.title?.substring(0, 30)}...`,
      });
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#082924] via-[#0C3B34] to-[#134942] text-white p-5 md:p-6 rounded-2xl shadow-lg border border-emerald-500/30 space-y-5">
      {/* Top Bar: Submitting Entity & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/15">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-900 animate-ping" />
              STEP 2: ELIGIBILITY & GATES
            </span>
            {/* <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-emerald-200 flex items-center gap-1">
              <Building2 size={12} /> Sole Prime Bidder
            </span> */}
            {/* <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-emerald-200 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-300" /> Vault
              Physical Verification Active
            </span> */}
          </div>

          {/* Dynamic Bidder Name */}
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
            {bidderName}
          </h2>

          {/* Dynamic Legal Identifiers */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-100/85">
            <span>
              <strong className="text-white">HQ:</strong>{" "}
              {companyProfile?.headquarters || "Address Pending"}
            </span>
            <span className="text-emerald-400">•</span>
            <span>
              <strong className="text-white">PAN:</strong>{" "}
              {companyProfile?.pan || "Not Set"}
            </span>
            <span className="text-emerald-400">•</span>
            <span>
              <strong className="text-white">GSTIN:</strong>{" "}
              {companyProfile?.gstin || "Not Set"}
            </span>
            <span className="text-emerald-400">•</span>
            <span>
              <strong className="text-white">CIN/Reg:</strong>{" "}
              {companyProfile?.cin ||
                companyProfile?.registrationNo ||
                "Not Set"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Authorized Signatory Selection & QCBS Score Metric */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Signatory Selection Card */}
        <div className="md:col-span-2 bg-white/10 p-3.5 rounded-xl border border-white/15 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold">
                <UserCheck size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Authorized Bid Signatory
                </h4>
                <p className="text-[10px] text-emerald-200">
                  Name, designation &amp; digital signature on all tender
                  submissions
                </p>
              </div>
            </div>

            {/* Actions: Switch Dropdown & Manage Button */}
            <div className="flex items-center gap-2">
              {onOpenSignatoriesModal && (
                <button
                  type="button"
                  onClick={onOpenSignatoriesModal}
                  className="text-[11px] font-bold text-emerald-300 hover:text-white underline cursor-pointer"
                >
                  Manage Signatories
                </button>
              )}

              {/* Dropdown Toggle for Signatories from Vault */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSignatoryMenuOpen(!isSignatoryMenuOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-[11px] font-semibold border border-white/20 transition-colors cursor-pointer"
                >
                  <span>Switch Signatory ({availableSignatories.length})</span>
                  <ChevronDown size={13} />
                </button>

                {isSignatoryMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-slate-900 border border-emerald-500/40 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 text-xs">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-emerald-300 flex items-center justify-between">
                      <span>Select Signatory</span>
                      {onOpenSignatoriesModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignatoryMenuOpen(false);
                            onOpenSignatoriesModal();
                          }}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus size={10} /> Manage
                        </button>
                      )}
                    </div>
                    {availableSignatories.map((sig) => (
                      <button
                        key={sig.name}
                        type="button"
                        onClick={() => handleSelectSignatory(sig)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex flex-col ${
                          selectedSignatory === sig.name
                            ? "bg-[#18794e] text-white font-bold"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="font-semibold">{sig.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {sig.designation}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Signatory Dynamic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-white/10">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-emerald-300 shrink-0" />
              <div className="truncate">
                <span className="text-emerald-200 text-[9px] uppercase font-bold block">
                  NAME & TITLE
                </span>
                <strong className="text-white text-xs">
                  {selectedSignatory}
                </strong>
                <span className="text-emerald-100/80 block text-[10px] truncate">
                  {signatoryDesignation}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail size={14} className="text-emerald-300 shrink-0" />
              <div className="truncate">
                <span className="text-emerald-200 text-[9px] uppercase font-bold block">
                  OFFICIAL EMAIL
                </span>
                <span className="text-white text-xs truncate block">
                  {activeSignatoryObj.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={14} className="text-emerald-300 shrink-0" />
              <div className="truncate">
                <span className="text-emerald-200 text-[9px] uppercase font-bold block">
                  AUTHORIZATION & SIGNATURE
                </span>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {hasPoaDocument ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300 font-bold text-xs">
                      <CheckCircle2 size={12} /> PoA Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-300 font-medium text-xs">
                      <AlertTriangle size={12} /> PoA Pending
                    </span>
                  )}
                  {activeSignatoryObj.signatureFileUrl && (
                    <a
                      href={activeSignatoryObj.signatureFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-200 border border-emerald-400/40 rounded text-[10px] font-bold"
                    >
                      📄 Signature PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic QCBS Readiness Mini-Card */}
        <div className="bg-white/10 p-3.5 rounded-xl border border-white/15 backdrop-blur-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-emerald-200 block">
              QCBS TECH READINESS
            </span>
            <div className="text-xl font-extrabold text-white flex items-baseline gap-1 mt-0.5">
              <span>{score}</span>
              <span className="text-xs font-normal text-emerald-200">
                / 100 PTS
              </span>
            </div>
            <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-bold text-emerald-300">
              <CheckCircle2 size={13} /> {decision}
            </span>
          </div>

          <div className="w-12 h-12 rounded-full border-3 border-emerald-400/60 border-t-emerald-300 flex items-center justify-center font-extrabold text-xs text-white bg-white/5">
            {score}%
          </div>
        </div>
      </div>
    </div>
  );
}
