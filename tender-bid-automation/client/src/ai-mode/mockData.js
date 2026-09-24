// Mock data for Tender AI Agent Studio

export const MOCK_TENDER_DATA = {
  id: 'tender-delhi-vms-099',
  tenderNumber: 'NIT-2026/099',
  title: 'Implementation of AI Video Management & Integrated Traffic Surveillance System',
  organization: 'Delhi Municipal Corporation & Traffic Police Authority',
  category: 'IT & Smart Surveillance Solutions',
  portal: 'GeM (Government e-Marketplace)',
  estimatedValueINR: 25000000, // ₹2.5 Crore
  emdAmountINR: 500000, // ₹5.00 Lakh
  tenderFeeINR: 5000,
  submissionDeadline: '15 Oct 2026, 03:00 PM',
  preBidDate: '30 Sep 2026, 11:00 AM',
  daysRemaining: 23,
  scopeSummary: 'Design, supply, installation, cloud hosting and 3-year AMC of AI-powered ANPR (Automatic Number Plate Recognition), Red Light Violation Detection (RLVD), and centralized Command & Control Center (ICCC) for 45 traffic junctions.'
};

export const SIGNATORIES_LIST = [
  {
    id: 'sig-1',
    name: 'Arjun Mehta',
    designation: 'Managing Director & Authorized Signatory',
    din: '08492011',
    email: 'arjun.mehta@techsolutions.in',
    phone: '+91 98101 23456',
    isDefault: true
  },
  {
    id: 'sig-2',
    name: 'Priya Sharma',
    designation: 'Director - Legal & Operations',
    din: '07129482',
    email: 'priya.sharma@techsolutions.in',
    phone: '+91 98112 87654',
    isDefault: false
  },
  {
    id: 'sig-3',
    name: 'Rohit Verma',
    designation: 'VP - Bidding & Government Accounts',
    din: '09283711',
    email: 'rohit.verma@techsolutions.in',
    phone: '+91 98711 00982',
    isDefault: false
  }
];

export const MOCK_ELIGIBILITY_REPORT_PASS = {
  status: 'ELIGIBLE',
  winProbability: 88,
  title: '✅ YOU ARE 100% ELIGIBLE TO BID',
  summary: 'Your company credentials in Company Vault successfully satisfy all mandatory legal, technical, and financial qualification criteria of NIT-2026/099.',
  checklist: [
    { label: 'GST & PAN Registration', required: 'Active GSTIN in Delhi/NCR', found: '07AAACT9921M1ZR (Active)', pass: true },
    { label: '3-Year Financial Turnover', required: 'Minimum Avg ₹1.50 Cr', found: 'Tech Solutions Avg: ₹3.46 Cr', pass: true },
    { label: 'Net Worth', required: 'Positive Net Worth >= ₹50 Lakh', found: 'Audited Net Worth: ₹5.80 Cr', pass: true },
    { label: 'ISO Certifications', required: 'ISO 27001:2022 & ISO 9001:2015', found: 'Cert IS-98214 (Valid till 2028)', pass: true },
    { label: 'Past Executed Projects', required: 'Min 2 Smart City / CCTV Projects', found: '3 Completed Projects (₹4.2 Cr total)', pass: true },
    { label: 'Power of Attorney', required: 'Notarized PoA from Board', found: 'Board Resolution Ref: DOC-POA-2025', pass: true },
    { label: 'EMD Payment / Exemption', required: '₹5,00,000 or MSME Udyam Cert', found: 'UDYAM-DL-02-0098412 (100% Exempt)', pass: true }
  ]
};

export const MOCK_ELIGIBILITY_REPORT_FAIL = {
  status: 'NOT_ELIGIBLE',
  winProbability: 35,
  title: '❌ YOU ARE NOT ELIGIBLE TO BID',
  summary: 'Your company fails 2 mandatory technical and financial threshold criteria for this tender.',
  reasons: [
    'Reason 1: Tender requires minimum average turnover of ₹10.00 Cr. Your company average turnover is ₹3.46 Cr (Short by ₹6.54 Cr).',
    'Reason 2: Tender requires CMMI Level 5 certification. Your vault currently contains CMMI Level 3.',
    'Reason 3: Tender requires 5 past executed projects of ₹3+ Cr each. Found only 1 matching project.'
  ],
  checklist: [
    { label: '3-Year Financial Turnover', required: 'Minimum Avg ₹10.00 Cr', found: 'Tech Solutions Avg: ₹3.46 Cr', pass: false },
    { label: 'CMMI Certification', required: 'CMMI Level 5 (Dev)', found: 'CMMI Level 3 (Dev)', pass: false },
    { label: 'Past Executed Projects', required: '5 Projects of ₹3+ Cr', found: 'Only 1 Project matches', pass: false },
    { label: 'GST Registration', required: 'Active GSTIN', found: '07AAACT9921M1ZR', pass: true }
  ]
};

export const STAMP_PRESETS = [
  {
    id: 'stamp-seal',
    title: '🏢 Company Official Seal',
    badge: 'Official Stamp',
    description: 'Tech Solutions Corporate Seal',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><circle cx="80" cy="80" r="74" fill="none" stroke="%231e3a8a" stroke-width="4" stroke-dasharray="8 4"/><circle cx="80" cy="80" r="62" fill="none" stroke="%231e3a8a" stroke-width="2"/><circle cx="80" cy="80" r="54" fill="%23f0f9ff" stroke="%230284c7" stroke-width="1.5"/><path id="textPathTop" d="M 22 80 A 58 58 0 0 1 138 80" fill="none"/><text fill="%231e3a8a" font-size="10" font-weight="bold" font-family="sans-serif"><textPath href="%23textPathTop" startOffset="50%" text-anchor="middle">★ TECH SOLUTIONS PVT LTD ★</textPath></text><path id="textPathBottom" d="M 138 80 A 58 58 0 0 1 22 80" fill="none"/><text fill="%231e3a8a" font-size="9" font-weight="bold" font-family="sans-serif"><textPath href="%23textPathBottom" startOffset="50%" text-anchor="middle">COMMON SEAL • NEW DELHI</textPath></text><polygon points="80,50 85,63 99,63 88,72 92,85 80,77 68,85 72,72 61,63 75,63" fill="%230284c7"/><text x="80" y="104" text-anchor="middle" fill="%230369a1" font-size="8" font-family="sans-serif" font-weight="bold">ESTD. 2018</text><text x="80" y="116" text-anchor="middle" fill="%231e3a8a" font-size="7" font-family="sans-serif">REGD. NO. 334912</text></svg>'
  },
  {
    id: 'stamp-sig',
    title: '✍️ Authorized Digital Signature',
    badge: 'PoA Signatory',
    description: 'Arjun Mehta (DIN: 08492011)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="90" viewBox="0 0 220 90"><rect width="218" height="88" rx="6" fill="%23f8fafc" stroke="%233b82f6" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M 20 52 Q 40 18 65 48 T 110 35 T 150 55 T 195 40" fill="none" stroke="%231d4ed8" stroke-width="2.5" stroke-linecap="round"/><text x="20" y="70" fill="%230f172a" font-size="10" font-weight="bold" font-family="sans-serif">Digitally Signed by: Arjun Mehta</text><text x="20" y="82" fill="%2364748b" font-size="8" font-family="sans-serif">Date: 2026.09.22 • Validated e-Sign (PoA)</text><circle cx="198" cy="22" r="10" fill="%2310b981"/><path d="M 194 22 L 197 25 L 202 19" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  {
    id: 'stamp-iso',
    title: '🛡️ ISO 27001 Certified Security',
    badge: 'Certificate',
    description: 'Information Security Certified',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect x="10" y="10" width="140" height="140" rx="20" fill="%23f0fdf4" stroke="%2316a34a" stroke-width="3"/><circle cx="80" cy="65" r="32" fill="%23dcfce7" stroke="%2315803d" stroke-width="2"/><path d="M 68 65 L 76 73 L 92 57" fill="none" stroke="%2315803d" stroke-width="4" stroke-linecap="round"/><text x="80" y="115" text-anchor="middle" fill="%2314532d" font-size="13" font-weight="800" font-family="sans-serif">ISO 27001:2022</text><text x="80" y="132" text-anchor="middle" fill="%23166534" font-size="9" font-weight="bold" font-family="sans-serif">BSI CERTIFIED SECURITY</text></svg>'
  },
  {
    id: 'stamp-mii',
    title: '🇮🇳 Make in India Class-I Logo',
    badge: '74% Local',
    description: 'DPIIT Make in India Certified',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="190" height="100" viewBox="0 0 190 100"><rect width="188" height="98" rx="8" fill="%23fff7ed" stroke="%23ea580c" stroke-width="2"/><rect x="8" y="8" width="172" height="6" fill="%23f97316"/><rect x="8" y="14" width="172" height="6" fill="%23ffffff"/><rect x="8" y="20" width="172" height="6" fill="%2316a34a"/><text x="95" y="48" text-anchor="middle" fill="%239a3412" font-size="14" font-weight="900" font-family="sans-serif">MAKE IN INDIA</text><text x="95" y="66" text-anchor="middle" fill="%23c2410c" font-size="10" font-weight="bold" font-family="sans-serif">CLASS-I LOCAL SUPPLIER</text><text x="95" y="84" text-anchor="middle" fill="%23431407" font-size="9" font-family="sans-serif">74.2% Domestic Value Addition</text></svg>'
  },
  {
    id: 'stamp-bank',
    title: '🏦 Bank EMD Paid Receipt Stamp',
    badge: 'Challan Stamp',
    description: 'HDFC Bank Payment Verified',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="90" viewBox="0 0 200 90"><rect width="198" height="88" rx="6" fill="%23f0fdf4" stroke="%2316a34a" stroke-width="2" stroke-dasharray="6 3"/><text x="100" y="26" text-anchor="middle" fill="%2315803d" font-size="12" font-weight="bold" font-family="sans-serif">HDFC BANK • PAID &amp; SETTLED</text><text x="100" y="44" text-anchor="middle" fill="%23166534" font-size="10" font-family="sans-serif">UTR: HDFC99018231924</text><text x="100" y="60" text-anchor="middle" fill="%2314532d" font-size="11" font-weight="bold" font-family="sans-serif">AMOUNT: ₹5,00,000/-</text><text x="100" y="76" text-anchor="middle" fill="%234ade80" font-size="8" font-weight="bold" font-family="sans-serif">● TREASURY VERIFIED ●</text></svg>'
  }
];

export const INITIAL_DOCUMENT_SECTIONS = [
  {
    id: 'sec-cover',
    title: 'Master Official Bid Cover Page',
    type: 'cover',
    badge: 'Cover Page',
    pageCount: 1,
    content: `GOVERNMENT OF NCT OF DELHI
DELHI MUNICIPAL CORPORATION & TRAFFIC POLICE AUTHORITY

TECHNICAL & COMMERCIAL BID SUBMISSION DOSSIER

Tender Notice Reference: NIT-2026/099
Name of Work: Implementation of AI Video Management & Integrated Traffic Surveillance System

SUBMITTED BY:
Bidder Name: Tech Solutions Private Limited
Corporate Identity Number (CIN): U72200DL2018PTC334912
GSTIN: 07AAACT9921M1ZR | PAN: AAACT9921M
Registered Address: Tech Tower, Okhla Industrial Area Phase-III, New Delhi - 110020

AUTHORITY CONTACT & SUBMISSION:
Submitted To: The Executive Engineer (E&M), Municipal Building, New Delhi - 110002
Date of Bid Submission: 22nd September 2026

[SignatoryPlaceholder]`
  },
  {
    id: 'sec-toc',
    title: 'Table of Contents / Document Index',
    type: 'toc',
    badge: 'Index',
    pageCount: 1,
    content: `TABLE OF CONTENTS / INDEX OF SUBMITTED BID DOSSIER

[DynamicTableOfContentsPlaceholder]`
  },
  {
    id: 'sec-form1',
    title: 'Annexure 1: Form-1 Bid Submission Cover Letter',
    type: 'legal',
    badge: 'Signed',
    pageCount: 1,
    content: `To,
The Executive Engineer (E&M),
Delhi Municipal Corporation & Traffic Police Authority,
New Delhi - 110002.

Subject: Submission of Technical & Commercial Bid for "Implementation of AI Video Management & Integrated Traffic Surveillance System" (Tender Ref: NIT-2026/099).

Dear Sir / Madam,

Having examined the Tender Documents, terms and conditions, and Technical Specifications for the subject work, we, the undersigned Tech Solutions Private Limited, offer to execute the entire scope of work in conformity with the bidding documents.

1. We confirm that our bid remains valid for 180 days from the submission deadline.
2. We have attached the complete Power of Attorney authorizing the undersigned.
3. We confirm full compliance with all technical, commercial, and SLA requirements.

Yours faithfully,
[SignatoryPlaceholder]
Tech Solutions Private Limited`
  },
  {
    id: 'sec-poa',
    title: 'Annexure 2: Special Power of Attorney (PoA)',
    type: 'legal',
    badge: '₹100 Stamp',
    pageCount: 1,
    content: `ANNEXURE - POA: SPECIAL POWER OF ATTORNEY
(To be executed on Non-Judicial Stamp Paper of ₹100/- and duly notarized)

KNOWN ALL MEN BY THESE PRESENTS that Tech Solutions Private Limited, having its Registered Office at Tech Tower, Okhla Industrial Area Phase-III, New Delhi - 110020, through Board Resolution dated 14th January 2025, hereby nominates, constitutes and appoints:

[SignatoryDetailsPlaceholder]

as the true and lawful Attorney of the Company in its name and on its behalf to submit bid documents, sign technical & commercial agreements, negotiate, and execute all deeds in connection with Tender Ref: NIT-2026/099 issued by Delhi Municipal Corporation.

All acts and deeds done by the said Attorney shall be deemed to be the acts and deeds of the Company.

IN WITNESS WHEREOF, the Common Seal of the Company has been affixed on this 22nd day of September 2026.`
  },
  {
    id: 'sec-emd',
    title: 'Annexure 3: EMD Security & Fee Declaration',
    type: 'payment',
    badge: 'EMD Proof',
    pageCount: 1,
    content: `EARNEST MONEY DEPOSIT (EMD) & TENDER FEE SUBMISSION PROOF

[EMDPaymentProofPlaceholder]`
  },
  {
    id: 'sec-nonblack',
    title: 'Annexure 4: Non-Blacklisting & Debarment Declaration',
    type: 'legal',
    badge: 'Notarized',
    pageCount: 1,
    content: `DECLARATION ON NON-BLACKLISTING / NON-DEBARMENT
(On Company Official Letterhead)

We hereby solemnly declare and affirm that Tech Solutions Private Limited has NOT been blacklisted, debarred, or suspended by the Government of India, any State Government, Municipal Body, or PSU from participating in public procurement as on the date of bid submission.

We further confirm that there are no ongoing legal proceedings regarding fraudulent practices against the company or its directors.

For Tech Solutions Private Limited
[SignatoryPlaceholder]`
  },
  {
    id: 'sec-mii',
    title: 'Annexure 5: Make in India (MII) Local Content Certificate',
    type: 'compliance',
    badge: 'Class-I (74%)',
    pageCount: 1,
    content: `LOCAL CONTENT SELF-CERTIFICATION UNDER PUBLIC PROCUREMENT (PREFERENCE TO MAKE IN INDIA) ORDER 2017

Tender Ref: NIT-2026/099
Name of Work: Implementation of AI Video Management & Integrated Traffic Surveillance System

We hereby certify that Tech Solutions Private Limited qualifies as a "Class-I Local Supplier" with domestic value addition of 74.2% in accordance with DPIIT Order No. P-45021/2/2017-PP (BE-II).

Location of Local Value Addition:
1. AI Analytics Inference Software: Developed in Okhla, New Delhi
2. Junction Ingestion Edge Nodes: Assembled in Noida, Uttar Pradesh

For Tech Solutions Private Limited
[SignatoryPlaceholder]`
  },
  {
    id: 'sec-proposal',
    title: 'Section 6: Technical Proposal & System Architecture',
    type: 'technical',
    badge: 'AI Drafted',
    pageCount: 4,
    content: `EXECUTIVE SUMMARY & TECHNICAL SOLUTION ARCHITECTURE

1. Edge-AI Vision Ingestion:
   - High-throughput RTSP video ingestion across 45 junction camera clusters.
   - Real-time ANPR with 98.4% detection accuracy for standard Indian license plates.
   - Automated detection of Red Light Violations (RLVD), Triple Riding, and No-Helmet incidents.

2. Central Command & Control Center (ICCC):
   - Microservices-based Video Management System (VMS) on Kubernetes.
   - High availability cluster with 99.95% guaranteed uptime.
   - Real-time incident dispatch to Delhi Traffic Police field e-challan systems.

3. 3-Year Service Level Agreement (SLA):
   - Sub-second incident capture.
   - 4-hour onsite hardware replacement guarantee with dedicated resident engineers.`
  },
  {
    id: 'sec-compliance',
    title: 'Section 7: Clause-by-Clause Compliance Matrix',
    type: 'compliance',
    badge: '100% Match',
    pageCount: 3,
    content: `CLAUSE-BY-CLAUSE TECHNICAL & COMMERCIAL COMPLIANCE MATRIX

• Clause 3.1 [Signatory]: Power of Attorney submitted for Authorized Signatory -> COMPLIED (Attached Annexure 2)
• Clause 4.2 [Accuracy]: ANPR algorithm achieves >= 95% benchmark -> COMPLIED (98.4% Benchmark Lab Certified)
• Clause 5.7 [Security]: ISO 27001:2022 and ISO 9001:2015 certifications -> COMPLIED (Certificates Attached)
• Clause 7.4 [EMD]: EMD of ₹5,00,000 -> COMPLIED (Attached Annexure 3)
• Clause 8.1 [MII]: Minimum 50% Local Content -> COMPLIED (74.2% Class-I Local Supplier - Attached Annexure 5)`
  }
];
