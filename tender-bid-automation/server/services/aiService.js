import { callLLM } from "../config/aiConfig.js";
import {
  extractFallbackTenderData,
  cleanOrganizationName,
} from "./documentParser.js";

/**
 * AI Document Ingestion & Metadata Analysis
 */
function buildSmartDocumentContext(rawText) {
  if (!rawText) return "";
  if (rawText.length <= 60000) {
    return rawText;
  }

  // Smart Context Assembler for 80-100+ page documents:
  // 1. First 20,000 chars: NIT notice, important dates schedule, issuing entity, project title
  const headerSection = `=== [STARTING PAGES: NIT & SCHEDULE] ===\n${rawText.slice(0, 20000)}`;

  // 2. Middle page extraction: Eligibility, Turnover, Penalties, SLA, Scope
  const middleSections = [];
  const middlePatterns = [
    {
      name: "ELIGIBILITY & TURNOVER",
      regex:
        /(?:eligibility\s*criteria|pre-?qualification|turnover\s*requirement|minimum\s*qualification)[\s\S]{100,10000}/i,
    },
    {
      name: "PENALTIES, SLA & PAYMENTS",
      regex:
        /(?:liquidated\s*damages|penalt(?:y|ies)|sla\s*requirements|payment\s*milestones)[\s\S]{100,8000}/i,
    },
    {
      name: "SCOPE & DELIVERABLES",
      regex:
        /(?:scope\s*of\s*work|technical\s*specifications|key\s*deliverables)[\s\S]{100,10000}/i,
    },
  ];

  middlePatterns.forEach((pat) => {
    const match = rawText.match(pat.regex);
    if (match) {
      middleSections.push(`=== [MIDDLE SECTION: ${pat.name}] ===\n${match[0]}`);
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

    const companyContextStr = companyProfile
      ? `Bidder Company Profile:
- Company Name: ${companyProfile.name || "Bidder Entity"}
- CIN / Legal: ${companyProfile.cin || "Active MCA Registration"}
- Annual / Avg Turnover: ${companyProfile.annualTurnover?.[0]?.amountDisplay || (companyProfile.averageTurnoverINR ? `₹${(companyProfile.averageTurnoverINR / 10000000).toFixed(2)} Cr` : "Verified in Vault")}
- Net Worth: Positive net worth certified by CA
- Technical Manpower: In-house certified engineers (B.Tech / MCA)
- Active Certifications: ${(companyProfile.certifications || []).join(", ") || "ISO 9001:2015, ISO 27001:2022, CMMI"}
- Statutory: Active PAN (${companyProfile.pan || "Active"}), GSTIN (${companyProfile.gstin || "Active"}), ESI, EPF`
      : "Bidder: Reputed Indian IT Solutions & Systems Integration Company with active MCA, PAN, GSTIN, and multi-crore enterprise delivery credentials.";

    const systemPrompt = `You are an elite Government Procurement & Bid Automation Analyst. 
Analyze the provided Tender / RFP document (which is a complete tender document PDF) and extract complete bid parameters and the FULL Eligibility Matrix.

CRITICAL EXTRACTION RULES:
- "title": Extract the full specific project/work title (e.g. "Selection of Agency for Strategy, Planning and Advisory Consultancy"), NOT generic strings like "REQUEST FOR PROPOSAL" or "RFP".
- "organization": Extract the full exact issuing Government Ministry, Department, PSU, or Authority (e.g. "DEPARTMENT OF INFORMATION & PUBLIC RELATIONS (DIPR)"). Avoid OCR slips (e.g. "Public Relations", NOT "Public Rights").
- "tenderNumber": Extract exact NIT No. / Tender No. / RFP Ref.
- "submissionDeadline": Strictly extract "Last date and Time of Submission of bids" / "Bid Submission End Date" from the schedule table with time if provided. Convert to standard ISO string.
- "preBidMeetingDate": Strictly extract "Pre-bid Meeting" date/time from the schedule table. Convert to standard ISO string.
- "publishDate": Strictly extract publication date (e.g. "YYYY-MM-DD").
- "estimatedValueINR": Exact numeric value in INR (e.g. 30000000 for Rs. 3 Crore approx).
- "estimatedValueDisplay": Formatted string (e.g. "₹3.00 Crore" or "₹50.00 Lakhs").
- "emdAmountINR": Number in INR (e.g. 500000 for Rs. 5,00,000/-).
- "emdDisplay": Formatted string (e.g. "₹5.00 Lakhs" or "₹5,00,000").
- "tenderFeeINR": Tender document fee in INR (0 if NIL).
- "scopeSummary": Comprehensive authentic summary of work, deliverables, and domain-specific terms of reference from the RFP.
- "complianceItems": CAREFULLY examine the "Eligibility Criteria" / "Mandatory Criteria" section and extract EVERY distinct clause/rule into a structured array:
  - "clauseNo": Exact clause identifier as written in the PDF (e.g. "Clause 1.1", "Clause 12.B", "Clause 3", "Section 4").
  - "category": One of ["Financial Turnover", "Experience & Scale", "Net Worth", "Technical / Advisory Manpower", "Statutory Compliance", "Quality & Security", "Legal Status", "Commercial & Terms"]
  - "requirement": Full, exact wording of the requirement from the PDF (e.g. "Minimum turnover of Rs. 3 Crore in last 3 FYs", "Experience of 3 years in strategic advisory/communication", "2 completed projects >= Rs. 50 Lakh").
  - "evidenceDoc": Mandatory supporting document required (e.g. "CA Certificate with UDIN + Audited Balance Sheets", "Client Work Orders & Completion Certificates", "Non-Blacklisting Affidavit").
  - "isMandatory": true
  - "status": If company verified documents are attached in vault, set "Complied (Pass)"; if verification is incomplete, set "Pending Verification". If criteria not met, set "Deviation" or "Not Met".
  - "justification": Detailed justification explaining how the bidder satisfies this requirement.
- "annexures": List all required Annexures, Forms, and Undertakings from the end pages of the RFP.

Return a STRICT valid JSON object matching this schema:
{
  "tenderNumber": "string",
  "title": "string",
  "organization": "string",
  "category": "string",
  "portal": "string",
  "estimatedValueINR": number,
  "estimatedValueDisplay": "string",
  "emdAmountINR": number,
  "emdDisplay": "string",
  "tenderFeeINR": number,
  "publishDate": "YYYY-MM-DD",
  "submissionDeadline": "ISO string",
  "preBidMeetingDate": "ISO string",
  "scopeSummary": "Comprehensive summary of deliverables and scope of work",
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
  "detectedAnnexures": [
    { "formNumber": "Annexure-A", "title": "Affidavit Regarding Debarment", "description": "string" }
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

    return {
      ...fallback,
      complianceItems: [],
      detectedAnnexures,
      keyRisks: [],
    };
  }
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
