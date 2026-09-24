import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileCheck2, 
  Sparkles, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';
import { tenderAPI } from '../services/api';

export default function TenderUploadModal({ isOpen, onClose, onTenderCreated }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manual'
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [manualData, setManualData] = useState({
    title: '',
    tenderNumber: '',
    organization: '',
    category: 'IT & Software Solutions',
    portal: 'GeM (Government e-Marketplace)',
    estimatedValueINR: 20000000,
    emdAmountINR: 400000,
    submissionDeadline: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    scopeSummary: ''
  });

  if (!isOpen) return null;

  const steps = [
    'Parsing document structures & pages...',
    'Extracting RFP scope, financial & eligibility terms...',
    'Matching credentials against Company Profile...',
    'Generating Go / No-Go decision & risk matrix...',
    'Compiling initial clause compliance checklist...'
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a tender document file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const res = await tenderAPI.upload(formData);
      clearInterval(stepInterval);
      setCurrentStep(steps.length - 1);
      
      setTimeout(() => {
        setLoading(false);
        onTenderCreated(res.data.tender);
        onClose();
      }, 600);
    } catch (err) {
      clearInterval(stepInterval);
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to analyze tender document');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualData.title || !manualData.organization) {
      setError('Please fill in at least the Tender Title and Organization.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await tenderAPI.createManual(manualData);
      setLoading(false);
      onTenderCreated(res.data.tender);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to create tender');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0D3B36] text-white flex items-center justify-center font-bold text-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Ingest New Tender / RFP</h3>
              <p className="text-xs text-slate-500">Upload tender notice for automatic AI parsing and Go/No-Go qualification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-white px-6 pt-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#0D3B36] text-[#0D3B36]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📄 Upload Tender Document (AI Auto-Parse)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-[#0D3B36] text-[#0D3B36]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            ✍️ Quick Manual Entry
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-100 border-t-[#0D3B36] animate-spin"></div>
              
              <div className="space-y-1 max-w-md">
                <h4 className="font-extrabold text-slate-900 text-sm">Processing Tender Document</h4>
                <p className="text-xs text-[#0D5C52] font-mono animate-pulse">
                  {steps[currentStep]}
                </p>
              </div>

              <div className="w-full max-w-sm bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#0D3B36] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : activeTab === 'upload' ? (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging 
                    ? 'border-[#0D3B36] bg-emerald-50/50' 
                    : file 
                    ? 'border-emerald-500 bg-emerald-50/30' 
                    : 'border-slate-300 hover:border-[#0D3B36] hover:bg-slate-50 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv"
                  className="hidden"
                />

                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <FileCheck2 size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze</p>
                    </div>
                    <span className="text-xs text-[#0D5C52] font-semibold hover:underline">Click or drag another to replace</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-[#0D3B36] flex items-center justify-center">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Drag &amp; drop your RFP or Tender document here</p>
                      <p className="text-xs text-slate-500 mt-1">Supports PDF, Word (.docx), Excel (.xlsx/.csv), or plain text up to 50MB</p>
                    </div>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D3B36] hover:bg-[#092B27] text-white shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Parse &amp; Qualify Tender</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Tender Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implementation of AI Video Management System"
                    value={manualData.title}
                    onChange={e => setManualData({ ...manualData, title: e.target.value })}
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tender Ref No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NIT-2026/099"
                    value={manualData.tenderNumber}
                    onChange={e => setManualData({ ...manualData, tenderNumber: e.target.value })}
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Issuing Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi Municipal Corporation"
                    value={manualData.organization}
                    onChange={e => setManualData({ ...manualData, organization: e.target.value })}
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={manualData.estimatedValueINR}
                    onChange={e => setManualData({ ...manualData, estimatedValueINR: e.target.value })}
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">EMD Amount (₹)</label>
                  <input
                    type="number"
                    value={manualData.emdAmountINR}
                    onChange={e => setManualData({ ...manualData, emdAmountINR: e.target.value })}
                    className="w-full custom-input text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Scope Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Brief scope description..."
                    value={manualData.scopeSummary}
                    onChange={e => setManualData({ ...manualData, scopeSummary: e.target.value })}
                    className="w-full custom-input text-xs resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D3B36] text-white shadow-sm"
                >
                  <span>Create Tender</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
