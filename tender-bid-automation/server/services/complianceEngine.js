import { v4 as uuidv4 } from "uuid";
import { callLLM } from "../config/aiConfig.js";

/**
 * Generate clause-by-clause compliance matrix from tender text using AI or heuristic fallback
 */

export async function generateComplianceMatrix(
  tenderText,
  tenderTitle = "RFP",
  companyProfile = null,
) {
  // Try AI first
  try {
    const systemPrompt = `You are a Senior Government Tender Compliance Specialist. Analyze the provided tender/RFP text and extract a structured compliance matrix.
Return a valid JSON object with the key "complianceItems", which is an array of objects with the following fields:
- "clauseNo": Exact clause reference from RFP (e.g. "Clause 1.1", "Clause 12.A", "Clause 3", "Section 4.1")
- "requirement": Full exact text or clear summary of what is required
- "category": One of ["Eligibility", "Financial", "Technical / Advisory", "Regulatory", "Commercial & Terms"]
- "isMandatory": boolean
- "status": One of ["Complied (Pass)", "Pending Verification", "Deviation", "Not Met"] (Set "Pending Verification" if real vault documents are pending verification, or "Complied (Pass)" only if verifiable evidence is present)
- "justification": Detailed justification explaining how the requirement is satisfied
- "deviationRemarks": "None" or explanation of minor variance
- "evidenceDoc": e.g. "CA Turnover Certificate with UDIN", "Client Completion Certificate", "Incorporation Certificate", "Non-Blacklisting Affidavit"

Provide 6 to 10 key distinct clauses covering Legal Eligibility, Financial turnover, Net Worth, Domain Experience, Key Personnel, and Statutory Declarations.`;

    // Locate Eligibility Section if present in document
    let textSlice = tenderText;
    const eligIndex = tenderText.search(/eligibility\s*criteria|pre-?qualification|minimum\s*eligibility/i);
    if (eligIndex !== -1) {
      textSlice = tenderText.slice(eligIndex, eligIndex + 25000);
    } else {
      textSlice = tenderText.slice(0, 25000);
    }

    const userPrompt = `Tender Title: ${tenderTitle}
Company Profile Context: ${companyProfile ? JSON.stringify({ name: companyProfile.name, turnover: companyProfile.averageTurnoverINR, netWorth: companyProfile.netWorthINR }) : "Bidder Entity"}

Tender Text Extract:
${textSlice}`;

    const rawResponse = await callLLM({
      systemPrompt,
      userPrompt,
      responseFormat: "json",
      temperature: 0.2,
    });

    const parsed = JSON.parse(rawResponse);
    if (parsed.complianceItems && Array.isArray(parsed.complianceItems)) {
      return parsed.complianceItems.map((item) => ({
        id: `comp_${uuidv4().slice(0, 8)}`,
        clauseNo: item.clauseNo || "Clause 1.0",
        requirement: item.requirement || "Requirement specification",
        category: item.category || "Eligibility",
        isMandatory: item.isMandatory !== undefined ? item.isMandatory : true,
        status: item.status || "Pending Verification",
        justification:
          item.justification ||
          `Subject to document verification against ${companyProfile?.name || "Bidder Vault"} records.`,
        deviationRemarks: item.deviationRemarks || "None",
        evidenceDoc: item.evidenceDoc || "Supporting Credentials in Vault",
      }));
    }
  } catch (err) {
    console.warn("AI Compliance extraction fallback triggered:", err.message);
  }

  // Domain-Aware Fallback Matrix
  const isConsultancy = `${tenderTitle} ${tenderText}`
    .toLowerCase()
    .match(/consultan|advisory|planning|strategy|public relation|media|dipr|research|communication/);

  if (isConsultancy) {
    return [
      {
        id: `comp_${uuidv4().slice(0, 8)}`,
        clauseNo: "Clause 1.0",
        requirement:
          "Bidder must be a registered Indian legal entity with active PAN and GST registration in operational states.",
        category: "Eligibility",
        isMandatory: true,
        status: companyProfile?.gstin ? "Complied (Pass)" : "Pending Verification",
        justification: `${companyProfile?.name || "Bidder Entity"} holds valid legal incorporation with active GSTIN (${companyProfile?.gstin || "Pending Vault Upload"}) and PAN.`,
        deviationRemarks: "None",
        evidenceDoc: "Certificate of Incorporation & GST Certificate",
      },
      {
        id: `comp_${uuidv4().slice(0, 8)}`,
        clauseNo: "Clause 2.0",
        requirement:
          "Average annual financial turnover from consulting/advisory services during last 3 FYs must meet mandatory RFP threshold.",
        category: "Financial",
        isMandatory: true,
        status: "Pending Verification",
        justification: `Audited financial statements and CA turnover certificate pending verification against RFP threshold.`,
        deviationRemarks: "None",
        evidenceDoc: "CA Turnover Certificate with UDIN & Audited Balance Sheets",
      },
      {
        id: `comp_${uuidv4().slice(0, 8)}`,
        clauseNo: "Clause 3.0",
        requirement:
          "Bidder must have minimum 3 years of demonstrable track record in strategic planning, advisory, and stakeholder communications.",
        category: "Technical / Advisory",
        isMandatory: true,
        status: "Pending Verification",
        justification: `Track record and client credentials must be verified via attached completion certificates.`,
        deviationRemarks: "None",
        evidenceDoc: "Client Work Orders & Completion Certificates",
      },
      {
        id: `comp_${uuidv4().slice(0, 8)}`,
        clauseNo: "Clause 4.0",
        requirement:
          "Bidder must have successfully delivered at least 2 relevant advisory / strategy projects of scale in government or public sector.",
        category: "Technical / Advisory",
        isMandatory: true,
        status: "Pending Verification",
        justification: `Past project citations and client sign-off letters require document validation in vault.`,
        deviationRemarks: "None",
        evidenceDoc: "Project Sign-off & Client Testimonials",
      },
      {
        id: `comp_${uuidv4().slice(0, 8)}`,
        clauseNo: "Clause 5.0",
        requirement:
          "Bidder must have dedicated team of qualified domain experts and strategists available for project deployment.",
        category: "Technical / Advisory",
        isMandatory: true,
        status: "Pending Verification",
        justification: `CV profiles of key personnel to be verified against RFP Terms of Reference requirements.`,
        deviationRemarks: "None",
        evidenceDoc: "Key Personnel CVs & Deployment Undertaking",
      },
      {
        id: `comp_${uuidv4().slice(0, 8)}`,
        clauseNo: "Clause 6.0",
        requirement:
          "Bidder must not be debarred or blacklisted by any Central/State Government Ministry, Department, or PSU.",
        category: "Regulatory",
        isMandatory: true,
        status: "Pending Verification",
        justification: `Duly notarized Non-Blacklisting Affidavit on stamp paper required as per prescribed Annexure.`,
        deviationRemarks: "None",
        evidenceDoc: "Non-Blacklisting Affidavit (Annexure-A)",
      },
    ];
  }

  // General IT Fallback
  return [
    {
      id: `comp_${uuidv4().slice(0, 8)}`,
      clauseNo: "Clause 1.0",
      requirement:
        "Bidder must be a registered legal entity in India with active PAN and GST registration.",
      category: "Eligibility",
      isMandatory: true,
      status: companyProfile?.gstin ? "Complied (Pass)" : "Pending Verification",
      justification: `${companyProfile?.name || "Bidder Entity"} holds valid legal incorporation and active GST (${companyProfile?.gstin || "In Vault"}).`,
      deviationRemarks: "None",
      evidenceDoc: "Certificate of Incorporation & GST Certificate",
    },
    {
      id: `comp_${uuidv4().slice(0, 8)}`,
      clauseNo: "Clause 2.0",
      requirement:
        "Average annual financial turnover during last 3 financial years must satisfy mandatory RFP threshold.",
      category: "Financial",
      isMandatory: true,
      status: "Pending Verification",
      justification: `Financial statements subject to CA audit verification.`,
      deviationRemarks: "None",
      evidenceDoc: "CA Turnover Certificate with UDIN & Audited Balance Sheets",
    },
    {
      id: `comp_${uuidv4().slice(0, 8)}`,
      clauseNo: "Clause 3.0",
      requirement:
        "Bidder must have positive net worth as certified by Statutory Auditor as on close of last FY.",
      category: "Financial",
      isMandatory: true,
      status: "Pending Verification",
      justification: `Net worth certificate with CA UDIN verification required.`,
      deviationRemarks: "None",
      evidenceDoc: "Statutory Auditor Net Worth Certificate",
    },
    {
      id: `comp_${uuidv4().slice(0, 8)}`,
      clauseNo: "Clause 4.0",
      requirement:
        "Bidder must have demonstrated track record in delivering similar solutions.",
      category: "Technical",
      isMandatory: true,
      status: "Pending Verification",
      justification: `Credentials to be validated with past client work orders.`,
      deviationRemarks: "None",
      evidenceDoc: "Client Work Orders & Completion Certificates",
    },
    {
      id: `comp_${uuidv4().slice(0, 8)}`,
      clauseNo: "Clause 5.0",
      requirement:
        "Bidder must not be debarred / blacklisted by any Government Ministry or PSU.",
      category: "Regulatory",
      isMandatory: true,
      status: "Pending Verification",
      justification: `Duly attested Non-Blacklisting Affidavit required.`,
      deviationRemarks: "None",
      evidenceDoc: "Non-Blacklisting Affidavit",
    },
  ];
}
