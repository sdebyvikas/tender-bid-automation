import { Tender, ComplianceItem } from '../../types/tender';
import { CompanyProfile } from '../../types/company';

export function exportComplianceMatrixToExcel(
  tender: Tender,
  companyProfile: CompanyProfile | null,
  complianceList: ComplianceItem[],
  authorizedSignatoryName?: string
) {
  const bidderName = companyProfile?.name || companyProfile?.companyName || 'Bidder Entity';
  const signatory = authorizedSignatoryName || companyProfile?.authorizedSignatory?.name || 'Authorized Signatory';
  const tenderRef = tender.tenderNumber || tender.reference || tender.id || 'N/A';
  const tenderTitle = tender.title || 'Government Tender';
  const organization = tender.organization || tender.authority || 'Issuing Authority';
  const exportDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Build CSV content with Excel-friendly formatting and UTF-8 BOM
  let csv = '\uFEFF'; // UTF-8 BOM for Excel Hindi/Special char support

  // Header Metadata Section
  csv += `"TENDER TECHNICAL COMPLIANCE & ELIGIBILITY MATRIX"\n`;
  csv += `"Tender Title:","${tenderTitle.replace(/"/g, '""')}"\n`;
  csv += `"Tender Ref / NIT:","${tenderRef.replace(/"/g, '""')}"\n`;
  csv += `"Issuing Authority:","${organization.replace(/"/g, '""')}"\n`;
  csv += `"Submitting Bidder:","${bidderName.replace(/"/g, '""')}"\n`;
  csv += `"Authorized Signatory:","${signatory.replace(/"/g, '""')}"\n`;
  csv += `"Date of Verification:","${exportDate}"\n`;
  csv += `"Total Evaluated Clauses:","${complianceList.length}"\n\n`;

  // Table Columns Header
  csv += `"Sr No","Clause No","Category","RFP Requirement","Compliance Status","Evidence Document Attached","Physical Vault Verification","Bidder Justification / Remarks"\n`;

  // Rows
  complianceList.forEach((item, index) => {
    const srNo = index + 1;
    const clauseNo = (item.clauseNo || `Sec ${srNo}.0`).replace(/"/g, '""');
    const category = (item.category || 'General').replace(/"/g, '""');
    const requirement = (item.requirement || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const status = (item.status || 'Complied').replace(/"/g, '""');
    const evidenceDoc = (item.evidenceDoc || 'Technical Proposal / Statutory Record').replace(/"/g, '""');
    
    // Check if physical file exists in vault
    const isVaultLinked = (companyProfile?.statutoryDocuments || []).some(
      (doc) =>
        doc.fileName &&
        (item.evidenceDoc?.toLowerCase().includes(doc.name.toLowerCase()) ||
          doc.name.toLowerCase().includes(item.category?.toLowerCase() || ''))
    );
    const vaultStatus = isVaultLinked ? 'PHYSICAL FILE LINKED IN VAULT' : (item.status === 'Complied' ? 'DECLARED / ATTACHED' : 'ACTION REQUIRED');
    const remarks = (item.justification || item.deviationRemarks || 'Complied in full without deviation').replace(/"/g, '""').replace(/\n/g, ' ');

    csv += `"${srNo}","${clauseNo}","${category}","${requirement}","${status}","${evidenceDoc}","${vaultStatus}","${remarks}"\n`;
  });

  // Footer / Declaration
  csv += `\n"DECLARATION:"\n`;
  csv += `"We hereby certify that all statements made and documents attached in this Compliance Matrix are true, correct, and complete to the best of our knowledge and belief."\n`;
  csv += `"For and on behalf of:","${bidderName.replace(/"/g, '""')}"\n`;
  csv += `"Signature:","_____________________________"\n`;
  csv += `"Name & Designation:","${signatory.replace(/"/g, '""')}"\n`;

  // Trigger Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = tenderTitle.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `Compliance_Matrix_${safeTitle}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
