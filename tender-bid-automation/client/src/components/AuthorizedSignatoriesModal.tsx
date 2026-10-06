import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  FileCheck2,
  Save,
  AlertCircle,
  UploadCloud,
  FileText,
  File,
  Eye,
  Paperclip,
  Check,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { CompanyProfile, AuthorizedSignatoryItem } from '../types';
import { signatoryAPI } from '../services/api';

export interface AuthorizedSignatoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyProfile?: CompanyProfile | null;
  onSave?: (updatedProfile: Partial<CompanyProfile>) => Promise<any> | void;
}

export default function AuthorizedSignatoriesModal({
  isOpen,
  onClose,
  companyProfile,
  onSave,
}: AuthorizedSignatoriesModalProps) {
  const [signatories, setSignatories] = useState<AuthorizedSignatoryItem[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // File Upload state for Signature / PoA PDF
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState({
    name: '',
    designation: 'Managing Director & Authorized Signatory',
    email: '',
    phone: '',
    pan: '',
    din: '',
    poaRef: '',
    dscType: 'Class 3 DSC (Signing & Encryption)',
    isPrimary: false,
  });

  // Fetch all signatories from MongoDB dedicated collection
  const fetchSignatories = async () => {
    try {
      setLoading(true);
      const res = await signatoryAPI.getAll();
      if (res.data?.signatories && Array.isArray(res.data.signatories)) {
        setSignatories(res.data.signatories);
      }
    } catch (err: any) {
      console.warn('Error fetching signatories from MongoDB collection:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSignatories();
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setSelectedFile(null);
    setExistingFileUrl(null);
    setExistingFileName(null);
    setFormData({
      name: '',
      designation: 'Managing Director & Authorized Signatory',
      email: '',
      phone: '',
      pan: '',
      din: '',
      poaRef: '',
      dscType: 'Class 3 DSC (Signing & Encryption)',
      isPrimary: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartAdd = () => {
    resetForm();
    setFormData({
      name: '',
      designation: 'Director & Authorized Signatory',
      email: '',
      phone: '',
      pan: '',
      din: '',
      poaRef: 'Board Res. No. 01/2024',
      dscType: 'Class 3 DSC (Signing & Encryption)',
      isPrimary: signatories.length === 0,
    });
    setIsAdding(true);
  };

  const handleStartEdit = (sig: AuthorizedSignatoryItem) => {
    setEditingId(sig.id || sig._id);
    setFormData({
      name: sig.name || '',
      designation: sig.designation || 'Director & Authorized Signatory',
      email: sig.email || '',
      phone: sig.phone || '',
      pan: sig.pan || '',
      din: sig.din || '',
      poaRef: sig.poaRef || '',
      dscType: sig.dscType || 'Class 3 DSC (Signing & Encryption)',
      isPrimary: Boolean(sig.isPrimary),
    });
    setExistingFileUrl(sig.signatureFileUrl || sig.specimenSignatureUrl || null);
    setExistingFileName(sig.signatureFileName || null);
    setSelectedFile(null);
    setIsAdding(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      toast.success(`Selected signature file: ${file.name}`);
    }
  };

  // Save / Add Signatory directly to MongoDB collection
  const handleSaveSignatory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter signatory name');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('designation', formData.designation.trim());
      fd.append('email', formData.email.trim());
      fd.append('phone', formData.phone.trim());
      fd.append('pan', formData.pan.trim());
      fd.append('din', formData.din.trim());
      fd.append('poaRef', formData.poaRef.trim());
      fd.append('dscType', formData.dscType);
      fd.append('isPrimary', String(formData.isPrimary));
      fd.append('status', 'Active');

      if (selectedFile) {
        fd.append('signatureFile', selectedFile);
      }

      let res;
      if (editingId) {
        res = await signatoryAPI.update(editingId, fd);
        toast.success(`Updated "${formData.name}" successfully!`);
      } else {
        res = await signatoryAPI.create(fd);
        toast.success(`Added "${formData.name}" successfully!`);
      }

      if (res.data?.signatories) {
        setSignatories(res.data.signatories);
      } else {
        await fetchSignatories();
      }

      // If onSave prop was provided, trigger refresh in parent
      if (onSave) {
        const primary = res.data?.signatories?.find((s: any) => s.isPrimary) || res.data?.signatory;
        if (primary) {
          onSave({
            authorizedSignatory: {
              name: primary.name,
              designation: primary.designation,
              email: primary.email,
              phone: primary.phone,
            },
            authorizedSignatories: res.data?.signatories,
          });
        }
      }

      resetForm();
    } catch (err: any) {
      console.error('Error saving signatory:', err);
      toast.error(`Save failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete Signatory
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from Authorized Signatories?`)) {
      return;
    }
    setSaving(true);
    try {
      const res = await signatoryAPI.delete(id);
      toast.success(`Removed "${name}" from Authorized Signatories`);
      if (res.data?.signatories) {
        setSignatories(res.data.signatories);
      } else {
        await fetchSignatories();
      }

      if (onSave) {
        const primary = res.data?.signatories?.find((s: any) => s.isPrimary);
        onSave({
          authorizedSignatory: primary
            ? {
                name: primary.name,
                designation: primary.designation,
                email: primary.email,
                phone: primary.phone,
              }
            : undefined,
          authorizedSignatories: res.data?.signatories,
        });
      }
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Set as Primary Signatory in MongoDB collection
  const handleSetPrimary = async (id: string, name: string) => {
    setSaving(true);
    try {
      const res = await signatoryAPI.setPrimary(id);
      toast.success(`Set "${name}" as Default Primary Signatory!`);
      if (res.data?.signatories) {
        setSignatories(res.data.signatories);
      } else {
        await fetchSignatories();
      }

      if (onSave) {
        const primary = res.data?.signatories?.find((s: any) => s.isPrimary);
        if (primary) {
          onSave({
            authorizedSignatory: {
              name: primary.name,
              designation: primary.designation,
              email: primary.email,
              phone: primary.phone,
            },
            authorizedSignatories: res.data?.signatories,
          });
        }
      }
    } catch (err: any) {
      toast.error(`Set primary failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 fade-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#18794e] flex items-center justify-center font-bold shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Authorized Signatories &amp; Power of Attorney Registry
                </h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-[#18794e] font-bold text-[10px] rounded-full border border-emerald-200">
                  {signatories.length} Registered Signers
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Designated directors authorized to digitally sign bids, undertakings, and upload signature PDFs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Header: Add Signatory Button */}
        {!isAdding && (
          <div className="flex items-center justify-between py-2 mb-2">
            <span className="text-xs text-slate-600 font-medium">
              Registered Signing Authorities
            </span>
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#18794e] hover:bg-[#156a45] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add New Signatory</span>
            </button>
          </div>
        )}

        {/* Body Section */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {/* Add / Edit Form */}
          {isAdding && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 fade-up">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-[#18794e]" />
                  {editingId ? 'Edit Signatory & Signature PDF' : 'New Signatory Credentials & Signature PDF'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveSignatory} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#18794e]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Designation / Role *</label>
                    <input
                      type="text"
                      placeholder="e.g. Director & Authorized Signatory"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#18794e]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      placeholder="rahul@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#18794e]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Mobile</label>
                    <input
                      type="tel"
                      placeholder="+91 98112 34567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#18794e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">DIN / Director ID</label>
                    <input
                      type="text"
                      placeholder="e.g. DIN: 08912345"
                      value={formData.din}
                      onChange={(e) => setFormData({ ...formData, din: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#18794e]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Power of Attorney / Board Res.</label>
                    <input
                      type="text"
                      placeholder="e.g. Board Res. No. 01/2024"
                      value={formData.poaRef}
                      onChange={(e) => setFormData({ ...formData, poaRef: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#18794e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">DSC Type / Token</label>
                    <select
                      value={formData.dscType}
                      onChange={(e) => setFormData({ ...formData, dscType: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#18794e]"
                    >
                      <option value="Class 3 DSC (Signing & Encryption)">Class 3 DSC (Signing &amp; Encryption)</option>
                      <option value="Class 3 DSC (Signing Only)">Class 3 DSC (Signing Only)</option>
                      <option value="USB Token (ePass2003 / ProxKey)">USB Token (ePass2003 / ProxKey)</option>
                      <option value="Aadhaar eSign / OTP Verified">Aadhaar eSign / OTP Verified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Director PAN</label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 uppercase outline-none focus:ring-2 focus:ring-[#18794e]"
                    />
                  </div>
                </div>

                {/* PDF / Image Signature Upload Section */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                  <label className="block font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip size={13} className="text-[#18794e]" />
                      Upload Specimen Signature / PoA PDF / DSC Token Certificate
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">PDF, PNG, JPG (Max 25MB)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="signatory-file-input"
                  />

                  {/* Existing File Link */}
                  {existingFileUrl && !selectedFile && (
                    <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={15} className="text-[#18794e] shrink-0" />
                        <span className="text-xs text-slate-800 font-medium truncate">
                          {existingFileName || 'Uploaded Signature Document'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={existingFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#18794e] hover:bg-emerald-100 border border-emerald-300 rounded text-[11px] font-bold"
                        >
                          <Eye size={12} /> View PDF
                        </a>
                        <label
                          htmlFor="signatory-file-input"
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          Replace File
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Selected New File */}
                  {selectedFile && (
                    <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-300 rounded-lg">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck2 size={16} className="text-[#18794e] shrink-0" />
                        <div>
                          <strong className="text-xs text-slate-900 block truncate">{selectedFile.name}</strong>
                          <span className="text-[10px] text-slate-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB · Ready to save
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Empty upload prompt */}
                  {!existingFileUrl && !selectedFile && (
                    <label
                      htmlFor="signatory-file-input"
                      className="border-2 border-dashed border-slate-200 hover:border-[#18794e] hover:bg-emerald-50/40 rounded-lg p-3 text-center cursor-pointer flex flex-col items-center justify-center transition-colors block"
                    >
                      <UploadCloud size={20} className="text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">Click to attach Signature PDF / Image</span>
                      <span className="text-[10px] text-slate-400">Specimen signature will be linked to bid proposals</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="rounded text-[#18794e] focus:ring-[#18794e]"
                    />
                    <span className="font-semibold text-slate-700 text-xs">
                      Set as Primary Default Signatory for Bids
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#18794e] hover:bg-[#156a45] text-white rounded-xl font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    {saving ? 'Saving...' : editingId ? 'Update Signatory' : 'Save Signatory'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of All Signatories */}
          {loading ? (
            <div className="py-8 text-center text-slate-400">
              <div className="animate-spin w-6 h-6 border-2 border-[#18794e] border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs font-semibold">Fetching Signatories...</p>
            </div>
          ) : signatories.length === 0 ? (
            <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <UserCheck size={28} className="mx-auto text-slate-300 mb-1.5" />
              <p className="font-semibold text-slate-600 text-xs">No Authorized Signatories registered yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "Add New Signatory" to register your signing authorities.</p>
            </div>
          ) : (
            signatories.map((sig) => {
              const sigKey = sig.id || sig._id || sig.name;
              return (
                <div
                  key={sigKey}
                  className={`p-4 rounded-xl border transition-all ${
                    sig.isPrimary
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Avatar & Details */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          sig.isPrimary ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {sig.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs text-slate-900 font-bold">{sig.name}</strong>
                          {sig.isPrimary && (
                            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-extrabold text-[9px] uppercase rounded-full tracking-wider">
                              Primary Default Signatory
                            </span>
                          )}
                          {sig.din && (
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 font-mono text-[9px] rounded">
                              {sig.din}
                            </span>
                          )}
                          {sig.dscType && (
                            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[9px] font-bold rounded border border-blue-100">
                              {sig.dscType}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-600 font-medium block mt-0.5">
                          {sig.designation}
                        </span>

                        {/* Contact, PoA & PDF Signature Badges */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 mt-2">
                          {sig.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} className="text-slate-400" />
                              {sig.email}
                            </span>
                          )}
                          {sig.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              {sig.phone}
                            </span>
                          )}
                          {sig.poaRef && (
                            <span className="flex items-center gap-1 text-[#18794e] font-semibold">
                              <FileCheck2 size={12} />
                              {sig.poaRef}
                            </span>
                          )}

                          {/* PDF / Specimen Signature Link */}
                          {(sig.signatureFileUrl || sig.specimenSignatureUrl) ? (
                            <a
                              href={sig.signatureFileUrl || sig.specimenSignatureUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-[#18794e] hover:bg-emerald-200 rounded-md font-bold text-[10px] border border-emerald-300"
                            >
                              <FileText size={11} />
                              <span>View Signature PDF</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              No PDF attached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!sig.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(sig.id || sig._id, sig.name)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#18794e] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors"
                        >
                          Set Primary
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(sig)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Signatory & Upload Signature PDF"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(sig.id || sig._id, sig.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Signatory"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck size={14} className="text-[#18794e]" />
            Authorized signing registry · Digital signatures ready for tenders
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
