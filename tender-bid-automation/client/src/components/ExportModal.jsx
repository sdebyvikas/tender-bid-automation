import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  CheckSquare, 
  Square, 
  Loader2, 
  FileCheck
} from 'lucide-react';
import { exportAPI } from '../services/api';

export default function ExportModal({ isOpen, onClose, tender }) {
  const [format, setFormat] = useState('pdf'); // 'pdf' | 'docx'
  const [downloading, setDownloading] = useState(false);
  const [sections, setSections] = useState({
    executiveSummary: true,
    technicalApproach: true,
    complianceMatrix: true,
    boq: true,
    annexures: true
  });

  if (!isOpen || !tender) return null;

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = async () => {
    const selectedKeys = Object.keys(sections).filter(k => sections[k]);
    if (selectedKeys.length === 0) {
      alert('Please select at least one section to include in the exported bid document.');
      return;
    }

    setDownloading(true);
    try {
      await exportAPI.downloadPackage(tender.id, format, selectedKeys);
      setDownloading(false);
      onClose();
    } catch (err) {
      setDownloading(false);
      alert(`Export failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0D3B36] text-white flex items-center justify-center font-bold text-sm">
              <Download size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Export Bid Package</h3>
              <p className="text-xs text-slate-500 truncate max-w-[300px]">{tender.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={downloading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Format Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  format === 'pdf'
                    ? 'border-[#0D3B36] bg-emerald-50/50 text-[#0D3B36] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">Formal PDF</div>
                  <div className="text-[10.5px] text-slate-500">Print-ready for portal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('docx')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  format === 'docx'
                    ? 'border-[#0D3B36] bg-emerald-50/50 text-[#0D3B36] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  DOCX
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">Word Document</div>
                  <div className="text-[10.5px] text-slate-500">Editable proposal file</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section Checklist */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Include Sections</label>
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              
              <div 
                onClick={() => toggleSection('executiveSummary')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <FileText size={14} className="text-[#0D5C52]" />
                  <span>1. Executive Summary &amp; Credentials</span>
                </div>
                {sections.executiveSummary ? (
                  <CheckSquare size={16} className="text-[#0D3B36]" />
                ) : (
                  <Square size={16} className="text-slate-300" />
                )}
              </div>

              <div 
                onClick={() => toggleSection('technicalApproach')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <FileText size={14} className="text-[#0D5C52]" />
                  <span>2. Solution Architecture &amp; Methodology</span>
                </div>
                {sections.technicalApproach ? (
                  <CheckSquare size={16} className="text-[#0D3B36]" />
                ) : (
                  <Square size={16} className="text-slate-300" />
                )}
              </div>

              <div 
                onClick={() => toggleSection('complianceMatrix')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <FileCheck size={14} className="text-[#0D5C52]" />
                  <span>3. Clause Compliance Checklist</span>
                </div>
                {sections.complianceMatrix ? (
                  <CheckSquare size={16} className="text-[#0D3B36]" />
                ) : (
                  <Square size={16} className="text-slate-300" />
                )}
              </div>

              <div 
                onClick={() => toggleSection('boq')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <FileText size={14} className="text-[#0D5C52]" />
                  <span>4. Commercial BOQ Schedule</span>
                </div>
                {sections.boq ? (
                  <CheckSquare size={16} className="text-[#0D3B36]" />
                ) : (
                  <Square size={16} className="text-slate-300" />
                )}
              </div>

              <div 
                onClick={() => toggleSection('annexures')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <FileText size={14} className="text-[#0D5C52]" />
                  <span>5. Mandatory Undertakings (Form-1, MII, MAF)</span>
                </div>
                {sections.annexures ? (
                  <CheckSquare size={16} className="text-[#0D3B36]" />
                ) : (
                  <Square size={16} className="text-slate-300" />
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={downloading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D3B36] hover:bg-[#092B27] text-white shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
