import React, { useState } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { CompanyProfile } from '../types';

export interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: CompanyProfile | null;
  companyProfile?: CompanyProfile | null;
  onSave?: (profile: Partial<CompanyProfile>) => Promise<any> | void;
  onUpdateProfile?: (profile: Partial<CompanyProfile>) => Promise<any> | void;
}

export default function CompanyProfileModal({
  isOpen,
  onClose,
  profile,
  companyProfile,
  onSave,
  onUpdateProfile,
}: CompanyProfileModalProps) {
  const currentProfile = profile || companyProfile;
  const saveHandler = onUpdateProfile || onSave;

  const [formData, setFormData] = useState({
    name: currentProfile?.name || 'Tech Solutions Pvt Ltd',
    gstin: currentProfile?.gstin || '18AABCT1234F1ZP',
    cin: currentProfile?.cin || 'U72900AS2012PTC011234',
    headquarters: currentProfile?.headquarters || 'GS Road, Guwahati, Assam, India',
    signatoryName: currentProfile?.authorizedSignatory?.name || 'Arjun Mehta',
    signatoryRole: currentProfile?.authorizedSignatory?.designation || 'Managing Director',
    signatoryEmail: currentProfile?.authorizedSignatory?.email || 'arjun.mehta@techsolutions.example.com',
    signatoryPhone: currentProfile?.authorizedSignatory?.phone || '+91-9876543210',
    turnoverY1: currentProfile?.annualTurnover?.[0]?.amountINR ? (currentProfile.annualTurnover[0].amountINR / 10000000).toString() : '16.20',
    turnoverY2: currentProfile?.annualTurnover?.[1]?.amountINR ? (currentProfile.annualTurnover[1].amountINR / 10000000).toString() : '14.50',
    turnoverY3: currentProfile?.annualTurnover?.[2]?.amountINR ? (currentProfile.annualTurnover[2].amountINR / 10000000).toString() : '13.70',
  });
  const [saving, setSaving] = useState(false);

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
        authorizedSignatory: {
          name: formData.signatoryName,
          designation: formData.signatoryRole,
          email: formData.signatoryEmail,
          phone: formData.signatoryPhone
        },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 fade-up">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EF] text-[#2E716A] flex items-center justify-center font-bold">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Edit Company Profile</h3>
              <p className="text-[11px] text-slate-500">Statutory bidder identity & financial baseline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#204E4A]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#204E4A]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">CIN / Reg No</label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#204E4A]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Headquarters</label>
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#204E4A]"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-2">Annual Turnover (₹ Crore)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[9px] text-slate-400 block mb-0.5">2023-24</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.turnoverY1}
                  onChange={(e) => setFormData({ ...formData, turnoverY1: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none focus:border-[#204E4A]"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block mb-0.5">2022-23</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.turnoverY2}
                  onChange={(e) => setFormData({ ...formData, turnoverY2: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none focus:border-[#204E4A]"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block mb-0.5">2021-22</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.turnoverY3}
                  onChange={(e) => setFormData({ ...formData, turnoverY3: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none focus:border-[#204E4A]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Authorized Signatory</label>
              <input
                type="text"
                value={formData.signatoryName}
                onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#204E4A]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Signatory Role</label>
              <input
                type="text"
                value={formData.signatoryRole}
                onChange={(e) => setFormData({ ...formData, signatoryRole: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#204E4A]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="button button-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="button button-primary text-xs cursor-pointer"
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
