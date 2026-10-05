import React, { useState, useEffect } from "react";
import {
  Folder,
  Upload,
  Building2,
  FileText,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  User,
  Users,
  Stamp,
  ArrowUpRight,
  X,
  ExternalLink,
  Check,
} from "lucide-react";
import { companyProfileAPI } from "../services/api";
import { CompanyProfile as CompanyProfileType } from "../types";

export interface CompanyProfileProps {
  onProfileUpdated?: (profile: CompanyProfileType) => void;
}

export default function CompanyProfile({
  onProfileUpdated,
}: CompanyProfileProps) {
  const [profile, setProfile] = useState<CompanyProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [newCert, setNewCert] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const res = await companyProfileAPI.get();
        setProfile(res.data.companyProfile);
      } catch (err) {
        console.error("Error loading company profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await companyProfileAPI.update(profile);
      setProfile(res.data.companyProfile);
      setSaving(false);
      setIsEditModalOpen(false);
      if (onProfileUpdated) onProfileUpdated(res.data.companyProfile);
    } catch (err: any) {
      setSaving(false);
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleAddCert = () => {
    if (!newCert.trim() || !profile) return;
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            certifications: [...(prev.certifications || []), newCert.trim()],
          }
        : null,
    );
    setNewCert("");
  };

  const handleRemoveCert = (idx: number) => {
    if (!profile) return;
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            certifications: (prev.certifications || []).filter(
              (_, i) => i !== idx,
            ),
          }
        : null,
    );
  };

  if (loading || !profile) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading Company Vault...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-7 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11.5px] font-mono text-slate-400">
            Workspace <span className="text-slate-300">&gt;</span>{" "}
            <strong className="text-slate-600 font-semibold">
              Company Vault
            </strong>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Your bid-ready identity.
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Keep statutory documents, signatories and brand assets ready for
            every tender.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Building2 size={14} className="text-[#64748B]" />
            <span>Brand Studio</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0C3B36] hover:bg-[#082925] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload document</span>
          </button>
        </div>
      </div>

      {/* ── Top Verified Company Profile Card ── */}
      <div className="tf-card p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F3] border border-[#C6F1E3] text-[#0D7A66] flex items-center justify-center shrink-0">
            <Folder size={22} />
          </div>

          <div className="space-y-0.5">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#8899A6]">
              COMPANY PROFILE • VERIFIED
            </div>
            <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
              {profile.name || "Tech Solutions Pvt Ltd"}
            </h2>
            <p className="text-xs text-[#64748B]">
              GSTIN {profile.gstin || "18AABCT1234F1ZP"} • CIN{" "}
              {profile.registrationNo || "U72900AS2012PTC011234"} •{" "}
              {profile.headquarters || "Guwahati, Assam"}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
          <div className="text-3xl font-extrabold text-[#0F172A] leading-none">
            96%
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5 font-medium">
            profile readiness
          </div>
        </div>
      </div>

      {/* ── Two-Column Main Content (Core Vault + Workspace Setup) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Statutory Documents / Core Vault */}
        <div className="lg:col-span-7 tf-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">
                STATUTORY DOCUMENTS
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight mt-0.5">
                Core vault
              </h3>
              <p className="text-xs text-[#64748B]">
                Documents used by the eligibility engine.
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#E8F8F3] text-[#0D7A66] border border-[#C6F1E3]">
              12 / 13
            </span>
          </div>

          {/* Documents List */}
          <div className="space-y-2 pt-2">
            {/* Doc 1 */}
            <div className="p-3.5 rounded-xl border border-[#EEF3F7] hover:border-slate-300 bg-[#FAFCFD] hover:bg-white transition-all flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-slate-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    Certificate of Incorporation
                  </div>
                  <div className="text-[10.5px] text-[#94A3B8]">
                    Uploaded 18 Sep 2026 • 1.2 MB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F8F3] text-[#0D7A66] border border-[#C6F1E3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A66]"></span>
                  <span>Verified</span>
                </span>
                <ExternalLink
                  size={13}
                  className="text-slate-400 group-hover:text-slate-700"
                />
              </div>
            </div>

            {/* Doc 2 */}
            <div className="p-3.5 rounded-xl border border-[#EEF3F7] hover:border-slate-300 bg-[#FAFCFD] hover:bg-white transition-all flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-slate-600 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    GST Registration Certificate
                  </div>
                  <div className="text-[10.5px] text-[#94A3B8]">
                    Uploaded 18 Sep 2026 • 840 KB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F8F3] text-[#0D7A66] border border-[#C6F1E3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A66]"></span>
                  <span>Verified</span>
                </span>
                <ExternalLink
                  size={13}
                  className="text-slate-400 group-hover:text-slate-700"
                />
              </div>
            </div>

            {/* Doc 3 */}
            <div className="p-3.5 rounded-xl border border-[#EEF3F7] hover:border-slate-300 bg-[#FAFCFD] hover:bg-white transition-all flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-slate-600 flex items-center justify-center">
                  <DollarSign size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    CA Turnover Certificate
                  </div>
                  <div className="text-[10.5px] text-[#94A3B8]">
                    UDIN: 26123456XXXX • 620 KB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F8F3] text-[#0D7A66] border border-[#C6F1E3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A66]"></span>
                  <span>Verified</span>
                </span>
                <ExternalLink
                  size={13}
                  className="text-slate-400 group-hover:text-slate-700"
                />
              </div>
            </div>

            {/* Doc 4: Expiring */}
            <div className="p-3.5 rounded-xl border border-[#FCDFB6] bg-[#FEF6E9] hover:bg-[#FDF0DE] transition-all flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#FCDFB6] text-[#B45309] flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    ISO 27001 Certificate
                  </div>
                  <div className="text-[10.5px] text-[#92400E]">
                    Expires in 42 days • 2.4 MB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF6E9] text-[#B45309] border border-[#FCDFB6]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                  <span>Expiring</span>
                </span>
                <ExternalLink
                  size={13}
                  className="text-slate-400 group-hover:text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-bold text-[#0D7A66] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all 13 documents</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Workspace Setup (People & Brand) */}
        <div className="lg:col-span-5 tf-card p-6 space-y-4">
          <div>
            <div className="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">
              PEOPLE &amp; BRAND
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight mt-0.5">
              Workspace setup
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            {/* Item 1 */}
            <div className="p-3 rounded-xl bg-[#FAFCFD] border border-[#EEF3F7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-slate-600 flex items-center justify-center">
                  <User size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    Authorized signatory
                  </div>
                  <div className="text-[10.5px] text-[#64748B]">
                    {profile.authorizedSignatory?.name || "Arjun Mehta"} •{" "}
                    {profile.authorizedSignatory?.designation ||
                      "Managing Director"}
                  </div>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full bg-[#E8F8F3] border border-[#C6F1E3] flex items-center justify-center text-[#0D7A66]">
                <Check size={12} strokeWidth={3} />
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-3 rounded-xl bg-[#FAFCFD] border border-[#EEF3F7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-slate-600 flex items-center justify-center">
                  <Users size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    Key personnel CV bank
                  </div>
                  <div className="text-[10.5px] text-[#64748B]">
                    18 profiles • 4 tender roles mapped
                  </div>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full bg-[#E8F8F3] border border-[#C6F1E3] flex items-center justify-center text-[#0D7A66]">
                <Check size={12} strokeWidth={3} />
              </div>
            </div>

            {/* Item 3 */}
            <div className="p-3 rounded-xl bg-[#FAFCFD] border border-[#EEF3F7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-slate-600 flex items-center justify-center">
                  <Stamp size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    Letterhead &amp; watermark
                  </div>
                  <div className="text-[10.5px] text-[#64748B]">
                    Logo, footer and 10% watermark ready
                  </div>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full bg-[#E8F8F3] border border-[#C6F1E3] flex items-center justify-center text-[#0D7A66]">
                <Check size={12} strokeWidth={3} />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-all cursor-pointer"
            >
              <span>Edit company profile</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Edit Company Profile &amp; Turnovers
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold">
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full custom-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold">GSTIN *</label>
                  <input
                    type="text"
                    required
                    value={profile.gstin || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, gstin: e.target.value })
                    }
                    className="w-full custom-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold">PAN</label>
                  <input
                    type="text"
                    value={profile.pan || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, pan: e.target.value })
                    }
                    className="w-full custom-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold">
                    Headquarters Address
                  </label>
                  <input
                    type="text"
                    value={profile.headquarters || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, headquarters: e.target.value })
                    }
                    className="w-full custom-input"
                  />
                </div>
              </div>

              {/* Turnover */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-slate-700 font-bold block">
                  Annual Turnovers (Last 3 Years)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(profile.annualTurnover || []).map((yr, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <span className="font-bold text-[#0D7A66] text-[11px] block">
                        {yr.year}
                      </span>
                      <input
                        type="number"
                        value={yr.amountINR}
                        onChange={(e) => {
                          const updated = [...(profile.annualTurnover || [])];
                          updated[idx].amountINR = Number(e.target.value) || 0;
                          updated[idx].amountDisplay =
                            `₹${(Number(e.target.value || 0) / 10000000).toFixed(2)} Cr`;
                          setProfile({ ...profile, annualTurnover: updated });
                        }}
                        className="w-full custom-input text-xs mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-slate-700 font-bold block">
                  ISO Certifications
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.certifications || []).map((cert, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700"
                    >
                      <span>{cert}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(idx)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add certificate (e.g. ISO 27001)..."
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    className="flex-1 custom-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddCert}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl font-bold bg-[#0C3B36] text-white hover:bg-[#082925] cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
