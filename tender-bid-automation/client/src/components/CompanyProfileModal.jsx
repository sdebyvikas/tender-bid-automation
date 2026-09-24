import React, { useState } from 'react';
import { X, Building2, Save, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanyProfileModal({ isOpen, onClose, profile, onSave }) {
  const [formData, setFormData] = useState({
    name: profile?.name || 'Tech Solutions Pvt Ltd',
    gstin: profile?.gstin || '18AABCT1234F1ZP',
    cin: profile?.cin || 'U72900AS2012PTC011234',
    headquarters: profile?.headquarters || 'GS Road, Guwahati, Assam, India',
    signatoryName: profile?.authorizedSignatory?.name || 'Arjun Mehta',
    signatoryRole: profile?.authorizedSignatory?.designation || 'Managing Director',
    signatoryEmail: profile?.authorizedSignatory?.email || 'arjun.mehta@techsolutions.example.com',
    signatoryPhone: profile?.authorizedSignatory?.phone || '+91-9876543210',
    turnoverY1: profile?.annualTurnover?.[0]?.amountINR ? (profile.annualTurnover[0].amountINR / 10000000).toString() : '16.20',
    turnoverY2: profile?.annualTurnover?.[1]?.amountINR ? (profile.annualTurnover[1].amountINR / 10000000).toString() : '14.50',
    turnoverY3: profile?.annualTurnover?.[2]?.amountINR ? (profile.annualTurnover[2].amountINR / 10000000).toString() : '13.70',
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedProfile = {
        ...profile,
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
      await onSave(updatedProfile);
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
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
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
              className="button button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="button button-primary text-xs"
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
