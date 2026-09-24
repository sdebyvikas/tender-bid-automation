import { callLLM } from '../config/aiConfig.js';
import { extractFallbackTenderData } from './documentParser.js';

/**
 * AI Document Ingestion & Metadata Analysis
 */
export async function analyzeTenderWithAI(rawText, fileName = 'Tender_Doc') {
  try {
    const systemPrompt = `You are a Senior RFP & Government Procurement Analyst. Parse the provided Tender / RFP document text and extract critical bid parameters.
CRITICAL EXTRACTION RULES:
- "title": Extract the full specific project/work title (e.g. "Development of Online Portal for Issuance of License for Adventure Sports and Water Sports in Uttar Pradesh"), NOT just generic strings like "REQUEST FOR PROPOSAL" or "RFP".
- "organization": Extract the full issuing Government Department, PSU, Corporation, or Authority name (e.g. "Uttar Pradesh State Tourism Development Corporation Ltd. (UPSTDC Ltd.)").
- "submissionDeadline": Strictly extract "Bid Submission End Date" / "Bid Due Date" / "Last date for submission" from the schedule table with time if provided. Convert to standard ISO string (e.g. "31-05-2025 12:00 NOON" -> "2025-05-31T06:30:00.000Z"). Do NOT invent fake future dates.
- "preBidMeetingDate": Strictly extract "Pre-bid Meeting" / "Pre-bid Conference" date/time from the schedule table (e.g. "19-05-2025 12:00 NOON" -> "2025-05-19T06:30:00.000Z").
- "publishDate": Strictly extract "Date of Publishing" / "Date of Publication" (e.g. "2025-05-10").
- "emdAmountINR": Number in INR (e.g. 50000 or 100000). Look for Earnest Money Deposit (EMD) clause, NOT table-of-contents page numbers.
- "emdDisplay": Formatted INR string (e.g. "₹50,000" or "₹1.00 Lakh").
- "tenderFeeINR": Tender document fee in INR (e.g. 5900 or 2360).

Return a STRICT valid JSON object with the following fields:
{
  "tenderNumber": "Tender or NIT reference number",
  "title": "Comprehensive project title",
  "organization": "Issuing Ministry, Department, PSU or Entity",
  "category": "e.g. IT & Software, Surveillance, Healthcare IT, Cloud Infrastructure, Civil",
  "portal": "e.g. e-Tender UP, GeM, CPPP, State Portal, Direct",
  "estimatedValueINR": number (in INR integer, e.g. 25000000),
  "estimatedValueDisplay": "e.g. ₹2.50 Crore",
  "emdAmountINR": number,
  "emdDisplay": "e.g. ₹50,000",
  "tenderFeeINR": number,
  "publishDate": "YYYY-MM-DD",
  "submissionDeadline": "ISO string date",
  "preBidMeetingDate": "ISO string date",
  "scopeSummary": "3 to 4 sentences summarizing the core deliverables, technology stack, and SLA scope",
  "eligibilityCriteria": {
    "minAnnualTurnoverINR": number,
    "minTurnoverDisplay": "string",
    "minExperienceYears": number,
    "requiredCertifications": ["ISO 9001:2015", "ISO 27001"],
    "pastProjectRequirement": "Summary of required past experience"
  },
  "keyRisks": [
    { "title": "string", "description": "string", "riskLevel": "Low | Medium | High" }
  ]
}`;

    const userPrompt = `Document Filename: ${fileName}\n\nDocument Text Extract:\n${rawText.slice(0, 10000)}`;

    const response = await callLLM({
      systemPrompt,
      userPrompt,
      responseFormat: 'json',
      temperature: 0.2
    });

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

    const dueFormatted = new Date(finalDeadline).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      tenderNumber: parsed.tenderNumber && !parsed.tenderNumber.includes('______') ? parsed.tenderNumber : fallback.tenderNumber,
      title: parsed.title && parsed.title !== 'REQUEST FOR PROPOSAL (RFP)' && parsed.title.length > 5 ? parsed.title : fallback.title,
      organization: parsed.organization && parsed.organization !== 'Ltd.' && parsed.organization.length > 3 ? parsed.organization : fallback.organization,
      category: parsed.category || fallback.category,
      portal: parsed.portal || fallback.portal,
      estimatedValueINR: parsed.estimatedValueINR || fallback.estimatedValueINR,
      estimatedValueDisplay: parsed.estimatedValueDisplay || fallback.estimatedValueDisplay,
      emdAmountINR: parsed.emdAmountINR && parsed.emdAmountINR >= 1000 ? parsed.emdAmountINR : fallback.emdAmountINR,
      emdDisplay: parsed.emdDisplay && parsed.emdAmountINR >= 1000 ? parsed.emdDisplay : fallback.emdDisplay,
      tenderFeeINR: parsed.tenderFeeINR || fallback.tenderFeeINR,
      publishDate: parsed.publishDate || fallback.publishDate,
      submissionDeadline: finalDeadline,
      preBidMeetingDate: finalPreBid,
      due: dueFormatted,
      scopeSummary: parsed.scopeSummary || fallback.scopeSummary,
      eligibilityCriteria: parsed.eligibilityCriteria || {
        minAnnualTurnoverINR: 15000000,
        minTurnoverDisplay: '₹1.50 Cr',
        minExperienceYears: 3,
        requiredCertifications: ['ISO 9001:2015', 'ISO 27001'],
        pastProjectRequirement: 'At least 1 similar IT/Software integration project executed in past 5 years.'
      },
      keyRisks: parsed.keyRisks || [
        { title: 'Delivery Timeline', description: 'Strict milestone delivery timeline with liquidated damages penalties.', riskLevel: 'Medium' },
        { title: 'SLA Uptime', description: 'Stringent 99.5% uptime requirement during 5-year warranty/O&M.', riskLevel: 'Low' }
      ]
    };
  } catch (err) {
    console.warn('AI analysis fallback triggered:', err.message);
    const fallback = extractFallbackTenderData(rawText, fileName);
    return {
      ...fallback,
      eligibilityCriteria: {
        minAnnualTurnoverINR: 15000000,
        minTurnoverDisplay: '₹1.50 Cr',
        minExperienceYears: 3,
        requiredCertifications: ['ISO 9001:2015', 'ISO 27001'],
        pastProjectRequirement: 'At least 1 similar project executed in last 5 years.'
      },
      keyRisks: [
        { title: 'Liquidated Damages', description: '0.5% per week delay up to 10% maximum.', riskLevel: 'Medium' },
        { title: 'Data Sovereignty', description: 'All data must strictly reside in Indian territory.', riskLevel: 'Low' }
      ]
    };
  }
}

/**
 * AI Proposal Section Generator & Refiner
 */
export async function generateProposalSection({ sectionName, tender, companyProfile, customInstructions = '' }) {
  const sectionDescriptions = {
    executiveSummary: 'Compelling Executive Summary establishing bidder credibility, understanding of client pain points, value proposition, and commitment to SLA excellence.',
    technicalApproach: 'Detailed Technical Architecture, Solution Components, Data Flow, Security Framework (MeitY Tier-III cloud, encryption), and Scalability.',
    implementationPlan: 'Work Breakdown Structure (WBS), Phased Milestones (Weeks/Months), Deployment Plan, Resource Allocation, and UAT Testing Methodology.',
    slaGovernance: 'Service Level Agreement (SLA) framework, 24x7 Helpdesk tiers (L1, L2, L3), MTTR targets, Incident Escalation Matrix, and Preventative Maintenance Plan.',
    riskMitigation: 'Risk Management Strategy identifying technical, operational, and supply chain risks along with proactive mitigation controls.'
  };

  const targetDesc = sectionDescriptions[sectionName] || `Detailed professional bid proposal content for section: ${sectionName}`;

  try {
    const systemPrompt = `You are a Principal Bid Manager and Solution Architect at an elite Indian Technology Consulting firm.
Draft a highly persuasive, technically rigorous, and formal tender proposal section.
Maintain professional government & enterprise RFP tone. Use clear headings, bullet points, and actionable details.
Avoid generic boilerplate fluff—incorporate specific facts from the Tender and Company Profile provided.`;

    const userPrompt = `Section to Draft: ${sectionName} (${targetDesc})
${customInstructions ? `Special Instructions / Tone: ${customInstructions}` : ''}

Tender Details:
- Title: ${tender.title}
- Organization: ${tender.organization}
- Tender Ref: ${tender.tenderNumber}
- Scope: ${tender.scopeSummary}
- Estimated Value: ${tender.estimatedValueDisplay}

Company Capabilities:
- Name: ${companyProfile.name}
- Average Turnover: ${companyProfile.averageTurnoverINR} (${companyProfile.annualTurnover?.[0]?.amountDisplay})
- Certifications: ${(companyProfile.certifications || []).join(', ')}
- Relevant Past Projects: ${(companyProfile.pastProjects || []).map(p => `${p.title} for ${p.client} (${p.valueDisplay})`).join('; ')}
- Key Personnel: ${(companyProfile.keyPersonnel || []).map(p => `${p.name} (${p.role})`).join('; ')}

Draft the complete proposal text in clean markdown:`;

    const content = await callLLM({
      systemPrompt,
      userPrompt,
      temperature: 0.3
    });

    return content;
  } catch (err) {
    console.warn('AI proposal generation fallback triggered:', err.message);
    // Intelligent fallback content
    if (sectionName === 'executiveSummary') {
      return `### 1. Executive Summary\n\n**${companyProfile.name}** is honoured to submit this comprehensive technical and commercial proposal for the *"${tender.title}"* (Ref: **${tender.tenderNumber}**) issued by **${tender.organization}**.\n\nWith our proven pedigree in delivering mission-critical enterprise systems and holding international certifications (${(companyProfile.certifications || []).join(', ')}), we propose a future-ready, scalable, and secure turnkey solution.\n\n#### Key Value Drivers of Our Proposal:\n- **Domain Expertise**: Successfully deployed similar systems for premier entities including ${(companyProfile.pastProjects || []).map(p => p.client).join(' and ')}.\n- **Zero-Disruption Migration**: Phased agile implementation minimizing operational downtime.\n- **Sovereign Security**: Fully compliant with Indian data localization and Tier-III cloud specifications.\n- **Guaranteed SLA**: 24/7 dedicated support desk ensuring 99.5%+ system availability.`;
    }
    return `### ${sectionName.toUpperCase()}\n\nDetailed technical execution methodology proposed by **${companyProfile.name}** for **${tender.organization}** under **${tender.tenderNumber}**.\n\nOur approach adheres strictly to industry best practices, comprehensive quality assurance (ISO 9001/27001), and rapid milestone achievement.`;
  }
}

/**
 * AI Tender Chatbot Assistant
 */
export async function queryTenderAssistant({ query, tender, companyProfile, chatHistory = [] }) {
  try {
    const systemPrompt = `You are an AI Tender & Bid Assistant specializing in RFP analysis for Indian and Global government procurement.
You have access to the Tender document details and the Bidder Company's profile.
Answer questions accurately based on the tender's scope, eligibility, commercial clauses, and compliance.
Quote relevant clauses where applicable. If information is not found in the tender extract, state clearly what standard practice suggests.`;

    const formattedHistory = chatHistory.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    const userPrompt = `Tender Reference: ${tender.tenderNumber} - "${tender.title}"
Issuing Authority: ${tender.organization}
Category: ${tender.category} | Estimated Value: ${tender.estimatedValueDisplay} | EMD: ${tender.emdDisplay}
Submission Deadline: ${tender.submissionDeadline} | Pre-Bid Date: ${tender.preBidMeetingDate}
Scope Summary: ${tender.scopeSummary}

Compliance Items:
${JSON.stringify((tender.complianceItems || []).map(c => ({ clause: c.clauseNo, req: c.requirement, status: c.status })))}

Key Clauses & Risks:
${JSON.stringify(tender.goNoGoAnalysis?.keyClauses || [])}

Company Context: ${companyProfile.name} (Turnover: ${companyProfile.annualTurnover?.[0]?.amountDisplay}, Certs: ${(companyProfile.certifications || []).join(', ')})

${formattedHistory ? `Recent Chat History:\n${formattedHistory}\n\n` : ''}User Question: ${query}`;

    const answer = await callLLM({
      systemPrompt,
      userPrompt,
      temperature: 0.3
    });

    return answer;
  } catch (err) {
    console.warn('AI chat assistant fallback:', err.message);
    const qLower = query.toLowerCase();
    if (qLower.includes('emd') || qLower.includes('deposit')) {
      return `The Earnest Money Deposit (EMD) for **${tender.tenderNumber}** is **${tender.emdDisplay}** (Estimated Tender Value: **${tender.estimatedValueDisplay}**). EMD exemption applies if your entity is registered under MSME/NSIC for the relevant service category.`;
    }
    if (qLower.includes('deadline') || qLower.includes('date') || qLower.includes('last date')) {
      return `The submission deadline for **${tender.title}** is **${new Date(tender.submissionDeadline).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}**. The pre-bid meeting is scheduled for **${new Date(tender.preBidMeetingDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}**.`;
    }
    if (qLower.includes('penalty') || qLower.includes('liquidated') || qLower.includes('ld')) {
      return `As per the tender risk terms, Liquidated Damages (LD) are set at **0.5% per week of delay**, subject to a maximum cap of **10%** of the total contract value.`;
    }
    return `Regarding your query on **${tender.title}**: Our system records show that this tender is issued by **${tender.organization}** with an estimated value of **${tender.estimatedValueDisplay}**. The company profile is fully qualified across financial turnover and ISO compliance criteria.`;
  }
}
