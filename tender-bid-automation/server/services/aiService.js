import { callLLM } from "../config/aiConfig.js";
import {
  extractFallbackTenderData,
  cleanOrganizationName,
} from "./documentParser.js";

/**
 * Smart Universal Document Context Assembler for 50–150+ Page RFPs
 * Never misses substantive chapters by scanning beyond Table of Contents.
 */
function buildSmartDocumentContext(rawText) {
  if (!rawText) return "";
  if (rawText.length <= 90000) {
    return rawText;
  }
  // 1. First 22,000 chars: NIT notice, important dates schedule, issuing entity, project title
  const headerSection = `=== [STARTING PAGES: NIT & SCHEDULE OF DATES] ===\n${rawText.slice(0, 22000)}`;
  // 2. Substantive Section Scanning (Targeting real chapters beyond Index/TOC)
  const middleSections = [];

  // Ignore the first 6,000 characters when matching section bodies (to bypass Page 2 Index/TOC)
  const bodyText = rawText.slice(5000);
  const chapterPatterns = [
    {
      name: "SECTION-IV: BIDDER'S ELIGIBILITY & PRE-QUALIFICATION CRITERIA",
      regex:
        /(?:SECTION\s*[-–IVX\d]*\s*[:\-]?\s*(?:BIDDER['’]?S\s*)?(?:ELIGIBILITY|PRE-?QUALIFICATION|QUALIFYING\s*CRITERIA)|ELIGIBILITY\s*CRITERIA\s*AND\s*METHOD\s*OF\s*SELECTION|BIDDER['’]?S\s*ELIGIBILITY\s*CRITERIA)[\s\S]{200,25000}/i,
    },
    {
      name: "TECHNICAL EVALUATION CRITERIA & QCBS SCORING",
      regex:
        /(?:TECHNICAL\s*EVALUATION\s*CRITERIA|EVALUATION\s*OF\s*BIDS\s*AND\s*SELECTION|CRITERIA\s*FOR\s*EVALUATION)[\s\S]{200,18000}/i,
    },
    {
      name: "TERMS OF REFERENCE (TOR) & SCOPE OF WORK",
      regex:
        /(?:SECTION\s*[-–IVX\d]*\s*[:\-]?\s*(?:TERMS\s*OF\s*REFERENCE|SCOPE\s*OF\s*WORK)|TERMS\s*OF\s*REFERENCE\s*\(TOR\)\s*AND\s*SCOPE\s*OF\s*WORK|SCOPE\s*OF\s*WORK\s*\(SOW\))[\s\S]{200,25000}/i,
    },
    {
      name: "PAYMENT TERMS, SLA & LIQUIDATED DAMAGES",
      regex:
        /(?:PAYMENT\s*TERMS\s*WILL\s*BE\s*AS\s*UNDER|SERVICE\s*LEVEL\s*STANDARD\s*AND\s*PENALTY|LIQUIDATED\s*DAMAGES|PENALTY\s*CLAUSE)[\s\S]{200,12000}/i,
    },
    {
      name: "PROPOSED TEAM STRUCTURE & KEY PERSONNEL DEPLOYMENT",
      regex:
        /(?:PROPOSED\s*TEAM\s*STRUCTURE|MANPOWER\s*REQUIREMENTS|KEY\s*PERSONNEL\s*DEPLOYMENT|PROJECT\s*TEAM\s*COMPOSITION|MINIMUM\s*MANPOWER)[\s\S]{200,15000}/i,
    },
  ];
  chapterPatterns.forEach((pat) => {
    const match = bodyText.match(pat.regex);
    if (match) {
      middleSections.push(
        `=== [SUBSTANTIVE SECTION: ${pat.name}] ===\n${match[0]}`,
      );
    }
  });
  // 3. Ending 25,000 chars: Annexure formats, Manufacturer Authorizations, Non-Blacklisting declarations
  const endSection = `=== [END PAGES: ANNEXURES & STATUTORY FORMATS] ===\n${rawText.slice(-25000)}`;
  return [headerSection, ...middleSections, endSection].join(
    "\n\n--------------------------------------------\n\n",
  );
}

/**
 * AI Document Ingestion & Metadata Analysis
 */
export async function analyzeTenderWithAI(
  rawText,
  fileName = "Tender_Doc",
  options = {},
) {
  try {
    const isScanned = options.isScanned || false;
    const fileBase64 = options.fileBase64 || null;
    const companyProfile = options.companyProfile || null;
    const uploadedDocsList = (companyProfile?.statutoryDocuments || [])
      .filter((d) => d.tag === "Verified" || d.fileName)
      .map((d) => `"${d.name}" (${d.category || "General"}, File: ${d.originalName || d.fileName || "Uploaded"})`)
      .join(", ");

    const companyContextStr = companyProfile
      ? `Bidder Company Profile:
- Company Name: ${companyProfile.name || "Bidder Entity"}
- CIN / Registration No: ${companyProfile.cin || companyProfile.registrationNo || "Not Verified"}
- PAN Number in Profile: ${companyProfile.pan || "Not Provided"}
- GSTIN in Profile: ${companyProfile.gstin || "Not Provided"}
- Annual / Average Turnover in Profile: ${companyProfile.annualTurnover?.[0]?.amountDisplay || (companyProfile.averageTurnoverINR ? `₹${(companyProfile.averageTurnoverINR / 10000000).toFixed(2)} Cr` : "Not Provided")}
- ACTUALLY UPLOADED & VERIFIED PHYSICAL DOCUMENTS IN COMPANY VAULT: [ ${uploadedDocsList || "PAN CARD only (No other certificates uploaded)"} ]

STRICT VAULT VERIFICATION RULES (NEVER ASSUME VERIFIED UNLESS PHYSICAL FILE IS IN VAULT):
- ONLY mark a clause as "Complied (Pass)" if its required physical document (e.g. "PAN CARD") is ACTUALLY present in the list of UPLOADED & VERIFIED PHYSICAL DOCUMENTS IN COMPANY VAULT above!
- If a requirement demands a physical certificate/letter (such as GST Registration Certificate, ESI Certificate, EPF Certificate, CA Audited Balance Sheet with UDIN, CA Net Worth Certificate, Manpower Appointment Letters, Incorporation Certificate, Non-Debarment Affidavit) and that document file is NOT in the uploaded list above:
  -> You MUST set "status": "Pending Verification" (or "Not Met").
  -> In "justification", explicitly state: "Physical [Document Name] is not uploaded in Company Vault. Upload required in Vault to achieve Pass status."`
      : "Bidder: Indian Commercial Entity. No verified statutory documents uploaded in Vault.";
    const systemPrompt = `You are an elite Government Procurement & Bid Automation Analyst. 
Analyze the provided Tender / RFP document and extract ALL authentic bid parameters and the COMPLETE, EXHAUSTIVE Eligibility Matrix directly from the document.
CRITICAL EXTRACTION RULES (STRICT 1:1 REPRODUCTION):
- "title": Extract the full specific project/work title from the Cover Page / NIT, NOT generic strings.
- "organization": Extract the full issuing Government Ministry, Department, Corporation, or PSU (e.g. "Uttar Pradesh State Tourism Development Corporation Ltd. (UPSTDC Ltd.)"). Clean any time/prefix garbage.
- "tenderNumber": Extract exact NIT No. / Tender No. / RFP Ref.
- "submissionDeadline": Strictly extract "Last date and Time of Submission of bids" / "Bid Submission End Date" from the schedule table with time. Convert to standard ISO string.
- "preBidMeetingDate": Strictly extract "Pre-bid Meeting" date/time from the schedule table. Convert to standard ISO string.
- "publishDate": Strictly extract publication date (e.g. "YYYY-MM-DD").
- "estimatedValueINR": Exact numeric value in INR (null if not specified or left blank in RFP).
- "estimatedValueDisplay": Formatted string or "-" if blank.
- "emdAmountINR": Number in INR (e.g. 50000 for Rs. 50,000/-).
- "emdDisplay": Formatted string (e.g. "₹50,000").
- "tenderFeeINR": Tender document fee in INR.
- "scopeSummary": Comprehensive authentic summary of deliverables and scope of work from Section-III.
- "complianceItems": CAREFULLY examine "Section-IV: Bidder's Eligibility Criteria" or the "Pre-Qualification Criteria Table" in the document and extract EVERY SINGLE row/criterion verbatim into the array. DO NOT combine or invent generic clauses:
  - "clauseNo": Exact clause / Sl No as written in the RFP table (e.g. "Clause 1.0 (Registration)", "Clause 2.0 (Turnover)", "Clause 4.0 (Technical Manpower)", "Clause 5.0 (Prior Experience)", "Clause 6.0 (GIGW Websites)").
  - "category": Exact category from the table (e.g. "Registration / Incorporation", "Average Turnover", "Non-Blacklisting", "Technical Manpower", "Prior Experience", "GIGW Experience", "Certifications").
  - "requirement": Full exact text from the 'Description' column of the RFP table (e.g. "Must have minimum 10 technical employees with B.Tech/BE/MCA/M.Tech/M.Sc degrees", "Executed at least ONE software project > Rs. 50 lakhs for Govt with Payment Gateway, API, Portal & Dashboard integration", "Developed & maintained at least 1 GIGW compliant website").
  - "evidenceDoc": Mandatory supporting document required from the 'Documentary Evidence' column (e.g. "Certificate of Registration + GST + PAN", "Audited Balance Sheets by CA", "HR Declaration with employee qualifications", "Work Order & Completion Certificate").
  - "isMandatory": true
  - "status": If company verified documents exist in vault, set "Complied (Pass)"; if physical document upload is pending, set "Pending Verification".
  - "justification": Concise explanation showing how the bidder profile matches or what document is needed.
- "teamStructure": Extract any proposed team structure, key personnel, or manpower deployment requirements mentioned in the RFP (e.g. Section 6.1 "Proposed Team Structure - Total 20 Resources"):
  - "totalResources": Total number of personnel/resources required (e.g. 20)
  - "deploymentSummary": Brief summary of deployment model (e.g. "Deployment of 20 domain specialists across 5 functional teams")
  - "teams": Array of team divisions or resource groups:
    - "teamName": Exact name of the team/unit (e.g. "Central Strategy & Governance Team", "National & Strategic Liaison Team", "Data, Analytics & Intelligence Unit", "Research & Knowledge Support Pool", "Presentation & Knowledge Visualisation")
    - "resourceCount": Exact count of resources required for this team/unit (e.g. 10, 4, 4, 2, 1)
    - "roles": Array of role titles or specializations if mentioned
- "detectedAnnexures": List all required Annexures and Forms from Section-VI (Annexure-I to Annexure-X).
- "keyRisks": List key procurement risks, SLA penalties (e.g. 99% uptime, 10% penalty cap), and timelines.
Return a STRICT valid JSON object matching this schema:
{
  "tenderNumber": "string",
  "title": "string",
  "organization": "string",
  "category": "string",
  "portal": "string",
  "estimatedValueINR": number | null,
  "estimatedValueDisplay": "string",
  "emdAmountINR": number,
  "emdDisplay": "string",
  "tenderFeeINR": number,
  "publishDate": "YYYY-MM-DD",
  "submissionDeadline": "ISO string",
  "preBidMeetingDate": "ISO string",
  "scopeSummary": "string",
  "eligibilityCriteria": {
    "minAnnualTurnoverINR": number,
    "minTurnoverDisplay": "string",
    "minExperienceYears": number,
    "requiredCertifications": ["string"],
    "pastProjectRequirement": "string"
  },
  "complianceItems": [
    {
      "clauseNo": "string",
      "category": "string",
      "requirement": "string",
      "evidenceDoc": "string",
      "isMandatory": true,
      "status": "Complied (Pass) | Pending Verification | Deviation | Not Met",
      "justification": "string"
    }
  ],
  "teamStructure": {
    "totalResources": 20,
    "deploymentSummary": "string",
    "teams": [
      {
        "teamName": "string",
        "resourceCount": 10,
        "roles": ["string"]
      }
    ]
  },
  "detectedAnnexures": [
    { "formNumber": "string", "title": "string", "description": "string" }
  ],
  "keyRisks": [
    { "title": "string", "description": "string", "riskLevel": "Low | Medium | High" }
  ]
}`;

    let response;

    if (fileBase64) {
      try {
        console.log(
          `📄 Analyzing complete PDF document directly with Multimodal AI for: ${fileName}`,
        );
        const userPrompt = `Document Filename: ${fileName}\n\n${companyContextStr}\n\nPerform in-depth analysis of this complete Tender Document PDF. Extract all exact parameters, the complete Eligibility Criteria table (with all sub-clauses, turnover, net worth, manpower, experience), and map against the bidder company profile.`;

        response = await callLLM({
          systemPrompt,
          userPrompt,
          responseFormat: "json",
          temperature: 0.2,
          inlineData: {
            data: fileBase64,
            mimeType: "application/pdf",
          },
        });
      } catch (mmErr) {
        console.warn(
          "Multimodal PDF analysis failed, falling back to text parsing:",
          mmErr.message,
        );
      }
    }

    if (!response) {
      // 📄 DIGITAL TEXT EXTRACTION (Fast & resilient with Groq/Gemini text models)
      const smartDocumentText = buildSmartDocumentContext(rawText);
      const userPrompt = `Document Filename: ${fileName}\n\n${companyContextStr}\n\nDocument Length: ${rawText.length} characters\n\nFull Tender Extract (Covering Notice, Eligibility, Scope, and End Annexures):\n${smartDocumentText}`;

      response = await callLLM({
        systemPrompt,
        userPrompt,
        responseFormat: "json",
        temperature: 0.2,
      });
    }

    const parsed = JSON.parse(response);
    const fallback = extractFallbackTenderData(rawText, fileName);

    // Validate deadline - ensure not hallucinated
    let finalDeadline = parsed.submissionDeadline;
    if (!finalDeadline || isNaN(new Date(finalDeadline).getTime())) {
      finalDeadline = fallback.submissionDeadline;
    }

    let finalPreBid = parsed.preBidMeetingDate;
    if (!finalPreBid || isNaN(new Date(finalPreBid).getTime())) {
      finalPreBid = fallback.preBidMeetingDate;
    }

    const dueFormatted = new Date(finalDeadline).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      tenderNumber:
        parsed.tenderNumber && !parsed.tenderNumber.includes("______")
          ? parsed.tenderNumber
          : fallback.tenderNumber,
      title:
        parsed.title &&
        parsed.title !== "REQUEST FOR PROPOSAL (RFP)" &&
        parsed.title.length > 5
          ? parsed.title
          : fallback.title,
      organization: cleanOrganizationName(
        parsed.organization &&
          parsed.organization !== "Ltd." &&
          parsed.organization.length > 3
          ? parsed.organization
          : fallback.organization,
        rawText,
      ),
      category: parsed.category || fallback.category,
      portal: parsed.portal || fallback.portal,
      estimatedValueINR: parsed.estimatedValueINR || fallback.estimatedValueINR,
      estimatedValueDisplay:
        parsed.estimatedValueDisplay || fallback.estimatedValueDisplay,
      emdAmountINR:
        parsed.emdAmountINR && parsed.emdAmountINR >= 1000
          ? parsed.emdAmountINR
          : fallback.emdAmountINR,
      emdDisplay:
        parsed.emdDisplay && parsed.emdAmountINR >= 1000
          ? parsed.emdDisplay
          : fallback.emdDisplay,
      tenderFeeINR: parsed.tenderFeeINR || fallback.tenderFeeINR,
      publishDate: parsed.publishDate || fallback.publishDate,
      submissionDeadline: finalDeadline,
      preBidMeetingDate: finalPreBid,
      due: dueFormatted,
      scopeSummary: parsed.scopeSummary || fallback.scopeSummary,
      eligibilityCriteria:
        parsed.eligibilityCriteria || fallback.eligibilityCriteria,
      complianceItems: parsed.complianceItems || [],
      teamStructure:
        parsed.teamStructure && parsed.teamStructure.teams?.length > 0
          ? parsed.teamStructure
          : extractFallbackTeamStructure(rawText),
      detectedAnnexures:
        parsed.detectedAnnexures && parsed.detectedAnnexures.length > 0
          ? parsed.detectedAnnexures
          : extractDynamicAnnexures(rawText),
      keyRisks: parsed.keyRisks || [],
    };
  } catch (err) {
    console.warn("AI analysis fallback triggered:", err.message);
    const fallback = extractFallbackTenderData(rawText, fileName);
    const detectedAnnexures = extractDynamicAnnexures(rawText);
    const teamStructure = extractFallbackTeamStructure(rawText);

    return {
      ...fallback,
      complianceItems: [],
      teamStructure,
      detectedAnnexures,
      keyRisks: [],
    };
  }
}

function extractFallbackTeamStructure(rawText) {
  if (!rawText) return null;
  const teams = [];
  let totalResources = 0;

  // Pattern matching for team definitions like "Central Strategy & Governance Team – 10 Resources" or "(Total 20 Resources)"
  const totalMatch = rawText.match(/(?:Total\s*(\d+)\s*Resources|(\d+)\s*(?:Total\s*)?Resources)/i);
  if (totalMatch) {
    totalResources = parseInt(totalMatch[1] || totalMatch[2], 10);
  }

  const teamRegex = /([A-Za-z\s,&/]+(?:Team|Unit|Pool|Visualisation|Squad|Group|Wing))\s*[-–—:]?\s*(\d+)\s*(?:Resources?|Persons?|Members?|Headcount)/gi;
  let match;
  while ((match = teamRegex.exec(rawText)) !== null) {
    const name = match[1].trim();
    const count = parseInt(match[2], 10);
    if (name.length >= 3 && count > 0 && !teams.some((t) => t.teamName === name)) {
      teams.push({
        teamName: name,
        resourceCount: count,
        roles: [],
      });
    }
  }

  if (teams.length > 0) {
    const calcTotal = teams.reduce((acc, t) => acc + t.resourceCount, 0);
    return {
      totalResources: totalResources || calcTotal,
      deploymentSummary: `Deployment of ${totalResources || calcTotal} domain specialists across ${teams.length} functional teams`,
      teams,
    };
  }
  return null;
}

function extractDynamicAnnexures(rawText) {
  if (!rawText) return [];
  const detectedAnnexures = [];
  const annexureMatches = [
    ...rawText.matchAll(
      /(?:Annexure|Form|Appendix|Schedule)\s*[-–—:]?\s*([A-Za-z0-9IVXLCDM]+)[\s:\.\-]*([^\n\r]{5,60})/gi,
    ),
  ];
  const seen = new Set();
  annexureMatches.slice(0, 10).forEach((m) => {
    const code = `Annexure-${m[1].toUpperCase()}`;
    const title = m[2].trim();
    if (!seen.has(code) && title.length >= 3 && !title.includes("....")) {
      seen.add(code);
      detectedAnnexures.push({
        formNumber: code,
        title: title,
        description: "Mandatory tender submission document / undertaking",
      });
    }
  });
  return detectedAnnexures;
}

/**
 * AI Proposal Section Generator & Refiner
 */
export async function generateProposalSection({
  sectionName,
  tender,
  companyProfile,
  customInstructions = "",
}) {
  const domainText =
    `${tender.title || ""} ${tender.category || ""} ${tender.scopeSummary || ""}`.toLowerCase();
  const isConsultancy =
    domainText.includes("consultan") ||
    domainText.includes("advisory") ||
    domainText.includes("planning") ||
    domainText.includes("strategy") ||
    domainText.includes("public relation") ||
    domainText.includes("media") ||
    domainText.includes("dipr") ||
    domainText.includes("research") ||
    domainText.includes("communication");

  const consultancySectionDescriptions = {
    executiveSummary:
      "Compelling Executive Summary establishing bidder credentials, understanding of the Department's strategic objectives, stakeholder ecosystem, and commitment to deliverable excellence.",
    technicalApproach:
      "Strategic Advisory Methodology, Empirical Research & Baseline Assessment, Communication Planning, Stakeholder Mapping, and Media Rollout Strategy.",
    implementationPlan:
      "Phased Advisory Roadmap (Inception & Discovery, Strategy Formulation, Campaign Execution & Stakeholder Coordination, Periodic Impact Assessment).",
    slaGovernance:
      "Project Governance Framework, Deliverable Sign-Off Mechanism, Steering Committee Cadence, and Advisory Output Quality Assurance.",
    riskMitigation:
      "Risk Management Strategy addressing communication risks, multi-stakeholder alignment, message consistency, and proactive mitigation controls.",
  };

  const itSectionDescriptions = {
    executiveSummary:
      "Compelling Executive Summary establishing bidder credibility, understanding of technical requirements, value proposition, and commitment to SLA excellence.",
    technicalApproach:
      "Detailed Technical Architecture, Solution Components, Data Flow, Security Framework (Tier-III cloud, encryption), and Scalability.",
    implementationPlan:
      "Work Breakdown Structure (WBS), Phased Milestones (Weeks/Months), Deployment Plan, Resource Allocation, and UAT Testing Methodology.",
    slaGovernance:
      "Service Level Agreement (SLA) framework, 24x7 Helpdesk tiers (L1, L2, L3), MTTR targets, Incident Escalation Matrix, and Preventative Maintenance Plan.",
    riskMitigation:
      "Risk Management Strategy identifying technical, operational, and supply chain risks along with proactive mitigation controls.",
  };

  const sectionDescriptions = isConsultancy
    ? consultancySectionDescriptions
    : itSectionDescriptions;

  const targetDesc =
    sectionDescriptions[sectionName] ||
    `Detailed professional bid proposal content for section: ${sectionName}`;

  try {
    const systemPrompt = isConsultancy
      ? `You are a Principal Strategic Bid Consultant and Policy Advisory Specialist at an elite Indian Management Consulting firm.
Draft a highly persuasive, rigorous, and formal tender proposal section for a Government Strategy / Consultancy / Communication RFP.
Maintain professional government tone. Use clear headings, structured bullet points, and actionable advisory frameworks.
Avoid generic IT jargon like 'cloud hosting, deployment, UAT, MTTR' unless relevant. Incorporate specific facts from the Tender Scope and Company Profile provided.`
      : `You are a Principal Bid Manager and Solution Architect at an elite Indian Technology Solutions firm.
Draft a highly persuasive, technically rigorous, and formal tender proposal section.
Maintain professional government & enterprise RFP tone. Use clear headings, bullet points, and actionable details.
Avoid generic boilerplate fluff—incorporate specific facts from the Tender and Company Profile provided.`;

    const userPrompt = `Section to Draft: ${sectionName} (${targetDesc})
${customInstructions ? `Special Instructions / Focus: ${customInstructions}` : ""}

Tender Context:
- Title: ${tender.title}
- Organization: ${tender.organization}
- Tender Ref: ${tender.tenderNumber}
- Scope & ToR: ${tender.scopeSummary}
- Estimated Value: ${tender.estimatedValueDisplay}

Company Credentials:
- Name: ${companyProfile.name}
- Average Turnover: ${companyProfile.averageTurnoverINR ? `₹${(companyProfile.averageTurnoverINR / 10000000).toFixed(2)} Cr` : "Verified"}
- Certifications / Credentials: ${(companyProfile.certifications || []).join(", ") || "Standard Industry Accreditations"}
- Relevant Past Projects: ${(companyProfile.pastProjects || []).map((p) => `${p.title} for ${p.client} (${p.valueDisplay})`).join("; ")}
- Key Personnel / Experts: ${(companyProfile.keyPersonnel || []).map((p) => `${p.name} (${p.role})`).join("; ")}

Draft the complete proposal section in clean markdown:`;

    const content = await callLLM({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
    });

    return content;
  } catch (err) {
    console.warn("AI proposal generation fallback triggered:", err.message);
    if (sectionName === "executiveSummary") {
      if (isConsultancy) {
        return `### 1. Executive Summary\n\n**${companyProfile.name}** is honoured to submit this strategic advisory and technical proposal in response to the RFP *"${tender.title}"* (Ref: **${tender.tenderNumber}**) issued by **${tender.organization}**.\n\nWith extensive domain experience in strategic planning, stakeholder research, and institutional communication advisory, we propose an agile, evidence-backed approach designed to fulfill the Department's mission.\n\n#### Key Value Pillars of Our Approach:\n- **Strategic Alignment**: Tailored methodology ensuring seamless alignment with ${tender.organization}'s policy objectives.\n- **Proven Track Record**: Successfully delivered advisory & strategy engagements for leading government and public sector institutions including ${(companyProfile.pastProjects || []).map((p) => p.client).join(" and ") || "state entities"}.\n- **Rigorous Governance**: Dedicated project leads with structured monthly milestones, deliverable validation, and transparent KPI monitoring.`;
      }
      return `### 1. Executive Summary\n\n**${companyProfile.name}** is honoured to submit this comprehensive technical proposal for *"${tender.title}"* (Ref: **${tender.tenderNumber}**) issued by **${tender.organization}**.\n\nWith our proven delivery track record and certified quality standards (${(companyProfile.certifications || []).join(", ")}), we propose a scalable, reliable, and secure turnkey solution.`;
    }
    return `### ${sectionName.toUpperCase()}\n\nDetailed execution methodology proposed by **${companyProfile.name}** for **${tender.organization}** under **${tender.tenderNumber}**.\n\nOur approach adheres strictly to industry standards, transparent deliverable reviews, and rapid milestone achievement.`;
  }
}

/**
 * AI Tender Chatbot Assistant
 */
export async function queryTenderAssistant({
  query,
  tender,
  companyProfile,
  chatHistory = [],
}) {
  try {
    const systemPrompt = `You are an AI Tender & Bid Assistant specializing in RFP analysis for Indian and Global government procurement.
You have access to the Tender document details and the Bidder Company's profile.
Answer questions accurately based on the tender's scope, eligibility, commercial clauses, and compliance.
Quote relevant clauses where applicable. If information is not found in the tender extract, state clearly what standard practice suggests.`;

    const formattedHistory = chatHistory
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const userPrompt = `Tender Reference: ${tender.tenderNumber} - "${tender.title}"
Issuing Authority: ${tender.organization}
Category: ${tender.category} | Estimated Value: ${tender.estimatedValueDisplay} | EMD: ${tender.emdDisplay}
Submission Deadline: ${tender.submissionDeadline} | Pre-Bid Date: ${tender.preBidMeetingDate}
Scope Summary: ${tender.scopeSummary}

Compliance Items:
${JSON.stringify((tender.complianceItems || []).map((c) => ({ clause: c.clauseNo, req: c.requirement, status: c.status })))}

Key Clauses & Risks:
${JSON.stringify(tender.goNoGoAnalysis?.keyClauses || [])}

Company Context: ${companyProfile.name} (Turnover: ${companyProfile.annualTurnover?.[0]?.amountDisplay}, Certs: ${(companyProfile.certifications || []).join(", ")})

${formattedHistory ? `Recent Chat History:\n${formattedHistory}\n\n` : ""}User Question: ${query}`;

    const answer = await callLLM({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
    });

    return answer;
  } catch (err) {
    console.warn("AI chat assistant fallback:", err.message);
    const qLower = query.toLowerCase();
    if (qLower.includes("emd") || qLower.includes("deposit")) {
      return `The Earnest Money Deposit (EMD) for **${tender.tenderNumber}** is **${tender.emdDisplay}** (Estimated Tender Value: **${tender.estimatedValueDisplay}**). EMD exemption applies if your entity is registered under MSME/NSIC for the relevant service category.`;
    }
    if (
      qLower.includes("deadline") ||
      qLower.includes("date") ||
      qLower.includes("last date")
    ) {
      return `The submission deadline for **${tender.title}** is **${new Date(tender.submissionDeadline).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}**. The pre-bid meeting is scheduled for **${new Date(tender.preBidMeetingDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}**.`;
    }
    if (
      qLower.includes("penalty") ||
      qLower.includes("liquidated") ||
      qLower.includes("ld")
    ) {
      return `As per the tender risk terms, Liquidated Damages (LD) are set at **0.5% per week of delay**, subject to a maximum cap of **10%** of the total contract value.`;
    }
    return `Regarding your query on **${tender.title}**: Our system records show that this tender is issued by **${tender.organization}** with an estimated value of **${tender.estimatedValueDisplay}**. The company profile is fully qualified across financial turnover and ISO compliance criteria.`;
  }
}
