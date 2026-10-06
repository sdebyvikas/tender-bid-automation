import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Coins, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { CompanyProfile } from '../types';

export interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: CompanyProfile | null;
  companyProfile?: CompanyProfile | null;
  onSave?: (profile: Partial<CompanyProfile>) => Promise<any> | void;
  onUpdateProfile?: (profile: Partial<CompanyProfile>) => Promise<any> | void;
  onOpenSignatories?: () => void;
}

export default function CompanyProfileModal({
  isOpen,
  onClose,
  profile,
  companyProfile,
  onSave,
  onUpdateProfile,
  onOpenSignatories,
}: CompanyProfileModalProps) {
  const currentProfile = profile || companyProfile;
  const saveHandler = onUpdateProfile || onSave;

  const [formData, setFormData] = useState({
    name: currentProfile?.name || 'Vikas Kumar Company',
    gstin: currentProfile?.gstin || '18AABCT1234F1ZP',
    cin: currentProfile?.cin || 'U72900AS2012PTC011234',
    headquarters: currentProfile?.headquarters || 'GS Road, Guwahati, Assam, India',
    turnoverY1: currentProfile?.annualTurnover?.[0]?.amountINR ? (currentProfile.annualTurnover[0].amountINR / 10000000).toString() : '16.20',
    turnoverY2: currentProfile?.annualTurnover?.[1]?.amountINR ? (currentProfile.annualTurnover[1].amountINR / 10000000).toString() : '14.50',
    turnoverY3: currentProfile?.annualTurnover?.[2]?.amountINR ? (currentProfile.annualTurnover[2].amountINR / 10000000).toString() : '13.70',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        name: currentProfile?.name || 'Vikas Kumar Company',
        gstin: currentProfile?.gstin || '18AABCT1234F1ZP',
        cin: currentProfile?.cin || 'U72900AS2012PTC011234',
        headquarters: currentProfile?.headquarters || 'GS Road, Guwahati, Assam, India',
        turnoverY1: currentProfile?.annualTurnover?.[0]?.amountINR ? (currentProfile.annualTurnover[0].amountINR / 10000000).toString() : '16.20',
        turnoverY2: currentProfile?.annualTurnover?.[1]?.amountINR ? (currentProfile.annualTurnover[1].amountINR / 10000000).toString() : '14.50',
        turnoverY3: currentProfile?.annualTurnover?.[2]?.amountINR ? (currentProfile.annualTurnover[2].amountINR / 10000000).toString() : '13.70',
      });
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedProfile: Partial<CompanyProfile> = {
        ...currentProfile,
        name: formData.name,
        gstin: formData.gstin,
        cin: formData.cin,
        headquarters: formData.headquarters,
        annualTurnover: [
          { year: '2023-24', amountINR: parseFloat(formData.turnoverY1) * 10000000, amountDisplay: `₹${formData.turnoverY1} Cr` },
          { year: '2022-23', amountINR: parseFloat(formData.turnoverY2) * 10000000, amountDisplay: `₹${formData.turnoverY2} Cr` },
          { year: '2021-22', amountINR: parseFloat(formData.turnoverY3) * 10000000, amountDisplay: `₹${formData.turnoverY3} Cr` }
        ]
      };
      if (saveHandler) {
        await saveHandler(updatedProfile);
      }
      toast.success('Company profile updated successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 fade-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#18794e] flex items-center justify-center font-bold">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Edit Company Profile</h3>
              <p className="text-[11px] text-slate-500">Statutory bidder identity &amp; financial baseline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Company Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#18794e]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">GSTIN *</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#18794e]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">CIN / Reg No *</label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#18794e]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Headquarters Location</label>
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#18794e]"
                required
              />
            </div>
          </div>

          {/* Annual Turnover Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Coins size={13} className="text-[#18794e]" />
                3-Year Audited Annual Turnover (₹ Crore)
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[9px] font-semibold text-slate-500 block mb-0.5">FY 2023-24</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.turnoverY1}
                  onChange={(e) => setFormData({ ...formData, turnoverY1: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#18794e]"
                />
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-500 block mb-0.5">FY 2022-23</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.turnoverY2}
                  onChange={(e) => setFormData({ ...formData, turnoverY2: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#18794e]"
                />
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-500 block mb-0.5">FY 2021-22</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.turnoverY3}
                  onChange={(e) => setFormData({ ...formData, turnoverY3: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#18794e]"
                />
              </div>
            </div>
          </div>

          {/* Quick Link to Separate Authorized Signatories */}
          {onOpenSignatories && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-[#18794e]" />
                <span className="text-xs font-semibold text-emerald-950">Manage Signing Authorities &amp; PoA</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSignatories();
                }}
                className="text-xs font-bold text-[#18794e] hover:underline cursor-pointer"
              >
                Open Signatories &rarr;
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#18794e] hover:bg-[#156a45] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
