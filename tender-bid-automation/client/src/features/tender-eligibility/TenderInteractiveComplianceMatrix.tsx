import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Upload,
  Plus,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Building2,
  FolderOpen,
  Edit2,
  Save,
  X,
  HelpCircle
} from 'lucide-react';
import { Tender, ComplianceItem } from '../../types/tender';
import { CompanyProfile, StatutoryDocument } from '../../types/company';
import { complianceAPI } from '../../services/api';
import { toast } from 'sonner';

interface TenderInteractiveComplianceMatrixProps {
  tender: Tender;
  companyProfile: CompanyProfile | null;
  complianceList: ComplianceItem[];
  onComplianceUpdated: (updatedList: ComplianceItem[]) => void;
  onOpenVaultUpload?: (suggestedDocName?: string) => void;
}

export default function TenderInteractiveComplianceMatrix({
  tender,
  companyProfile,
  complianceList,
  onComplianceUpdated,
  onOpenVaultUpload,
}: TenderInteractiveComplianceMatrixProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [activeVaultPickerClauseId, setActiveVaultPickerClauseId] = useState<string | null>(null);
  const [isAddClauseModalOpen, setIsAddClauseModalOpen] = useState<boolean>(false);
  const [newClauseData, setNewClauseData] = useState({
    clauseNo: '',
    category: 'Technical',
    requirement: '',
    status: 'Complied',
    evidenceDoc: 'Technical Proposal',
    justification: '',
    isMandatory: true,
  });

  const vaultDocs = useMemo(() => {
    return companyProfile?.statutoryDocuments || [];
  }, [companyProfile]);

  // Check if a clause has a physical file uploaded in the vault
  const getVaultStatus = (item: ComplianceItem) => {
    const evidence = (item.evidenceDoc || '').toLowerCase();
    const req = (item.requirement || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    const matchedDoc = vaultDocs.find((doc) => {
      const docName = (doc.name || '').toLowerCase();
      return (
        doc.fileName &&
        (evidence.includes(docName) ||
          docName.includes(evidence) ||
          (cat.includes('statutory') && docName.includes('pan')) ||
          (req.includes('pan') && docName.includes('pan')) ||
          (req.includes('gst') && docName.includes('gst')) ||
          (req.includes('turnover') && docName.includes('turnover')) ||
          (req.includes('net worth') && docName.includes('net worth')) ||
          (req.includes('iso') && docName.includes('iso')) ||
          (req.includes('incorporation') && docName.includes('incorporation')))
      );
    });

    if (matchedDoc && matchedDoc.fileName) {
      return {
        isPhysical: true,
        docName: matchedDoc.name,
        fileName: matchedDoc.fileName,
        fileUrl: matchedDoc.fileUrl,
      };
    }

    return {
      isPhysical: false,
      docName: null,
      fileName: null,
      fileUrl: null,
    };
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    complianceList.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['All', 'Mandatory (PQC)', 'Action Required', ...Array.from(set)];
  }, [complianceList]);

  // Filtered clauses
  const filteredClauses = useMemo(() => {
    return complianceList.filter((item) => {
      const matchSearch =
        !searchTerm ||
        (item.clauseNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.requirement || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.evidenceDoc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.justification || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Mandatory (PQC)') return item.isMandatory !== false;
      if (selectedCategory === 'Action Required') {
        const vs = getVaultStatus(item);
        return !vs.isPhysical && item.status !== 'Complied';
      }
      return item.category === selectedCategory;
    });
  }, [complianceList, searchTerm, selectedCategory, vaultDocs]);

  // Update Status handler
  const handleStatusChange = async (itemId: string, newStatus: string) => {
    const updated = complianceList.map((c) =>
      c.id === itemId ? { ...c, status: newStatus } : c
    );
    onComplianceUpdated(updated);

    try {
      await complianceAPI.updateItem(tender.id, itemId, { status: newStatus });
      toast.success('Compliance status updated');
    } catch (err: any) {
      toast.error('Failed to sync status with server');
    }
  };

  // Attach Vault Doc to Clause
  const handleAttachVaultDoc = async (itemId: string, doc: StatutoryDocument) => {
    const updated = complianceList.map((c) =>
      c.id === itemId
        ? {
            ...c,
            evidenceDoc: doc.name,
            justification: `Verified in Vault: ${doc.name} (${doc.fileName || 'Attached'})`,
            status: 'Complied',
          }
        : c
    );
    onComplianceUpdated(updated);
    setActiveVaultPickerClauseId(null);

    try {
      await complianceAPI.updateItem(tender.id, itemId, {
        evidenceDoc: doc.name,
        justification: `Verified in Vault: ${doc.name} (${doc.fileName || 'Attached'})`,
        status: 'Complied',
      });
      toast.success(`Attached "${doc.name}" to clause`);
    } catch (err: any) {
      toast.error('Failed to update clause doc');
    }
  };

  // Save Justification Notes
  const handleSaveNotes = async (itemId: string) => {
    const updated = complianceList.map((c) =>
      c.id === itemId ? { ...c, justification: editNotes } : c
    );
    onComplianceUpdated(updated);
    setEditingItemId(null);

    try {
      await complianceAPI.updateItem(tender.id, itemId, { justification: editNotes });
      toast.success('Justification saved');
    } catch (err) {
      toast.error('Failed to save justification');
    }
  };

  // Add Custom Clause
  const handleAddClauseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClauseData.requirement.trim()) {
      toast.error('Please enter requirement text');
      return;
    }

    try {
      const payload = {
        ...newClauseData,
        clauseNo: newClauseData.clauseNo || `Sec ${complianceList.length + 1}.0`,
      };
      const res = await complianceAPI.addItem(tender.id, payload);
      const updatedList = res.data?.complianceItems || [...complianceList, { ...payload, id: `item-${Date.now()}` }];
      onComplianceUpdated(updatedList);
      setIsAddClauseModalOpen(false);
      setNewClauseData({
        clauseNo: '',
        category: 'Technical',
        requirement: '',
        status: 'Complied',
        evidenceDoc: 'Technical Proposal',
        justification: '',
        isMandatory: true,
      });
      toast.success('Custom clause added to compliance matrix');
    } catch (err: any) {
      toast.error(`Failed to add clause: ${err.message}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 space-y-4 bg-slate-50/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#18794e] flex items-center justify-center font-bold">
                <ShieldCheck size={15} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                RFP Technical Compliance &amp; Master Vault Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Attach physical documents directly from your Master Vault, verify compliance status, and manage evidence notes.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddClauseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus size={14} className="text-[#18794e]" />
              Add Custom Clause
            </button>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clause, requirement, certificate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#18794e]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#18794e] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Compliance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-28 border-r border-slate-200/80">Clause / Ref</th>
              <th className="py-3 px-4 min-w-[280px] border-r border-slate-200/80">RFP Tender Requirement</th>
              <th className="py-3 px-4 min-w-[240px] border-r border-slate-200/80">Master Vault Document Linkage</th>
              <th className="py-3 px-4 w-44 border-r border-slate-200/80">Compliance Status</th>
              <th className="py-3 px-4 min-w-[200px]">Remarks / Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredClauses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <FolderOpen size={30} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-slate-600">No matching compliance clauses found</p>
                  <p className="text-[11px] text-slate-400">Try clearing filters or search term.</p>
                </td>
              </tr>
            ) : (
              filteredClauses.map((item, index) => {
                const vaultStatus = getVaultStatus(item);
                const isPassed = item.status === 'Complied' || item.status === 'Complied (Pass)' || item.status === 'Pass';
                const isEditing = editingItemId === item.id;

                return (
                  <tr
                    key={item.id || index}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Column 1: Clause & Category */}
                    <td className="py-3.5 px-4 align-top border-r border-slate-100">
                      <div className="space-y-1">
                        <strong className="text-slate-900 font-mono font-bold block">
                          {item.clauseNo || `Sec ${index + 1}.0`}
                        </strong>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {item.category || 'General'}
                        </span>
                        {item.isMandatory !== false && (
                          <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-rose-50 text-rose-700 border border-rose-200 block w-fit">
                            Mandatory
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 2: RFP Requirement */}
                    <td className="py-3.5 px-4 align-top border-r border-slate-100">
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {item.requirement}
                      </p>
                    </td>

                    {/* Column 3: Vault Document Linkage */}
                    <td className="py-3.5 px-4 align-top border-r border-slate-100">
                      <div className="space-y-2">
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5">
                          {vaultStatus.isPhysical ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              Physical File in Vault
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle size={11} className="text-amber-600" />
                              Missing Physical File
                            </span>
                          )}
                        </div>

                        {/* Document Name */}
                        <div className="text-[11px] font-medium text-slate-800 flex items-center gap-1.5">
                          <FileCheck2 size={13} className={vaultStatus.isPhysical ? 'text-[#18794e]' : 'text-slate-400'} />
                          <span className="truncate max-w-[200px]" title={item.evidenceDoc || vaultStatus.docName || 'No document mapped'}>
                            {vaultStatus.fileName || item.evidenceDoc || vaultStatus.docName || 'Document not attached'}
                          </span>
                        </div>

                        {/* 1-Click Vault Actions */}
                        <div className="flex items-center gap-2 pt-1 relative">
                          <button
                            type="button"
                            onClick={() => setActiveVaultPickerClauseId(activeVaultPickerClauseId === item.id ? null : item.id)}
                            className="text-[11px] font-bold text-[#18794e] hover:text-[#156a45] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Pick from Vault</span>
                            <ChevronDown size={12} />
                          </button>

                          {!vaultStatus.isPhysical && onOpenVaultUpload && (
                            <>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => onOpenVaultUpload(item.requirement)}
                                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                              >
                                <Upload size={11} />
                                <span>Upload</span>
                              </button>
                            </>
                          )}

                          {/* Dropdown for Picking Document from Vault */}
                          {activeVaultPickerClauseId === item.id && (
                            <div className="absolute left-0 top-7 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 p-2 space-y-1">
                              <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                                Select Vault Document
                              </div>
                              {vaultDocs.length === 0 ? (
                                <div className="p-2 text-center text-[11px] text-slate-400">
                                  No documents in Vault
                                </div>
                              ) : (
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                  {vaultDocs.map((doc) => (
                                    <button
                                      key={doc.id || doc.name}
                                      type="button"
                                      onClick={() => handleAttachVaultDoc(item.id, doc)}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-emerald-50 text-slate-800 flex flex-col cursor-pointer transition-colors"
                                    >
                                      <span className="font-semibold truncate">{doc.name}</span>
                                      <span className="text-[10px] text-slate-400 truncate">
                                        {doc.fileName ? `📁 ${doc.fileName}` : 'No file uploaded'}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 4: Compliance Status */}
                    <td className="py-3.5 px-4 align-top border-r border-slate-100">
                      <select
                        value={item.status || 'Complied'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#18794e] ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : item.status === 'Review Required'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : item.status === 'Exemption Claimed'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="Complied">Complied (Pass)</option>
                        <option value="Review Required">Review Required</option>
                        <option value="Exemption Claimed">Exemption Claimed</option>
                        <option value="Not Complied">Not Complied (Gap)</option>
                      </select>
                    </td>

                    {/* Column 5: Remarks / Justification */}
                    <td className="py-3.5 px-4 align-top">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={2}
                            className="w-full p-2 bg-white border border-[#18794e] rounded-lg text-xs text-slate-800 focus:outline-none"
                            placeholder="Enter justification remarks..."
                          />
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNotes(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#18794e] text-white rounded text-[11px] font-bold cursor-pointer"
                            >
                              <Save size={12} />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group/notes relative">
                          <p className="text-slate-600 text-xs italic leading-relaxed">
                            {item.justification || item.deviationRemarks || 'Complied in full as per RFP requirements.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditNotes(item.justification || item.deviationRemarks || '');
                            }}
                            className="mt-1 text-[11px] text-[#18794e] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer opacity-70 group-hover/notes:opacity-100 transition-opacity"
                          >
                            <Edit2 size={11} />
                            <span>Edit Notes</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Custom Clause Modal */}
      {isAddClauseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-[#18794e]" />
                Add Custom Compliance Clause
              </h4>
              <button
                type="button"
                onClick={() => setIsAddClauseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddClauseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clause Reference / Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sec 4.2 / Cl. 7.1"
                  value={newClauseData.clauseNo}
                  onChange={(e) => setNewClauseData({ ...newClauseData, clauseNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newClauseData.category}
                  onChange={(e) => setNewClauseData({ ...newClauseData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Statutory">Statutory & Tax</option>
                  <option value="Financial">Financial PQC</option>
                  <option value="Technical">Technical & Experience</option>
                  <option value="Legal">Legal & Contractual</option>
                  <option value="General">General Eligibility</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requirement Text *
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter exact RFP condition or criteria..."
                  value={newClauseData.requirement}
                  onChange={(e) => setNewClauseData({ ...newClauseData, requirement: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evidence Document to Attach
                </label>
                <input
                  type="text"
                  placeholder="e.g. ISO 27001 Certificate / CA Certificate"
                  value={newClauseData.evidenceDoc}
                  onChange={(e) => setNewClauseData({ ...newClauseData, evidenceDoc: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClauseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#18794e] hover:bg-[#156a45] text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Add Clause
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
