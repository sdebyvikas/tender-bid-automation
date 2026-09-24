import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const defaultCompanyProfile = {
  id: 'comp_techsolutions',
  name: 'Tech Solutions Pvt Ltd',
  pan: 'AABCT1234F',
  gstin: '18AABCT1234F1ZP',
  cin: 'U72900AS2012PTC011234',
  registrationNo: 'U72900AS2012PTC011234',
  headquarters: 'GS Road, Guwahati, Assam, India',
  website: 'https://techsolutions.example.com',
  readinessScore: 96,
  annualTurnover: [
    { year: '2023-24', amountINR: 162000000, amountDisplay: '₹16.20 Cr' },
    { year: '2022-23', amountINR: 145000000, amountDisplay: '₹14.50 Cr' },
    { year: '2021-22', amountINR: 137000000, amountDisplay: '₹13.70 Cr' }
  ],
  averageTurnoverINR: 148000000,
  averageTurnoverDisplay: '₹14.8 Cr',
  netWorthINR: 42000000,
  certifications: [
    'ISO 9001:2015 (Quality Management System)',
    'ISO 27001:2022 (Information Security Management) - Expiring in 42 days',
    'CMMI Dev Level 3',
    'ISO 20000-1:2018 (IT Service Management)'
  ],
  statutoryDocuments: [
    { id: 'doc_1', name: 'Certificate of Incorporation', meta: 'Uploaded 18 Sep 2026 · 1.2 MB', tag: 'Verified', category: 'Corporate', icon: 'FileCheck2' },
    { id: 'doc_2', name: 'GST Registration Certificate', meta: 'Uploaded 18 Sep 2026 · 840 KB', tag: 'Verified', category: 'Tax', icon: 'ShieldCheck' },
    { id: 'doc_3', name: 'CA Turnover Certificate', meta: 'UDIN: 26123456XXXX · 620 KB', tag: 'Verified', category: 'Financial', icon: 'CircleDollarSign' },
    { id: 'doc_4', name: 'ISO 9001:2015 Certificate', meta: 'Uploaded 12 Jan 2025 · 1.8 MB', tag: 'Verified', category: 'Certification', icon: 'ShieldCheck' },
    { id: 'doc_5', name: 'ISO 27001 Certificate', meta: 'Expires in 42 days · 2.4 MB', tag: 'Expiring', category: 'Certification', icon: 'AlertTriangle' },
    { id: 'doc_6', name: 'Power of Attorney Format', meta: 'Uploaded 18 Sep 2026 · 950 KB', tag: 'Verified', category: 'Legal', icon: 'FileText' },
    { id: 'doc_7', name: 'Non-Blacklisting Affidavit', meta: 'Uploaded 18 Sep 2026 · 420 KB', tag: 'Verified', category: 'Legal', icon: 'FileCheck2' },
    { id: 'doc_8', name: 'PAN Card Copy', meta: 'Uploaded 18 Sep 2026 · 310 KB', tag: 'Verified', category: 'Tax', icon: 'FileText' },
    { id: 'doc_9', name: 'MSME / Udyam Registration', meta: 'Uploaded 10 Jun 2025 · 580 KB', tag: 'Verified', category: 'Statutory', icon: 'FileCheck2' },
    { id: 'doc_10', name: 'Audited Balance Sheets (3 Yrs)', meta: 'Uploaded 15 Sep 2026 · 4.8 MB', tag: 'Verified', category: 'Financial', icon: 'CircleDollarSign' },
    { id: 'doc_11', name: 'Make In India Declaration', meta: 'Uploaded 18 Sep 2026 · 390 KB', tag: 'Verified', category: 'Statutory', icon: 'FileText' },
    { id: 'doc_12', name: 'Solvency Certificate', meta: 'Uploaded 18 Sep 2026 · 720 KB', tag: 'Verified', category: 'Financial', icon: 'CircleDollarSign' },
    { id: 'doc_13', name: 'Key Personnel CV Bank', meta: '18 profiles mapped · 3.6 MB', tag: 'Verified', category: 'Human Resource', icon: 'Users' }
  ],
  authorizedSignatory: {
    name: 'Arjun Mehta',
    designation: 'Managing Director & Authorized Signatory',
    email: 'arjun.mehta@techsolutions.example.com',
    phone: '+91-9876543210'
  },
  keyPersonnel: [
    { name: 'Arjun Mehta', role: 'Managing Director & Bid Sponsor', experienceYears: 18, qualification: 'B.Tech IIT Guwahati, MBA' },
    { name: 'Dr. Rajesh Verma', role: 'Principal Solutions Architect', experienceYears: 16, qualification: 'Ph.D. Computer Science' },
    { name: 'Pooja Sharma', role: 'Project Director (PMP, ITIL)', experienceYears: 14, qualification: 'M.Tech Software Engineering' },
    { name: 'Amitabh Sen', role: 'Lead DevOps & Cloud Engineer', experienceYears: 10, qualification: 'B.Tech IT, AWS Certified Architect' }
  ]
};

const sampleTenders = [
  {
    id: 'tender_ele_93',
    tenderNumber: 'ELE.93/2024/2',
    reference: 'ELE.93/2024/2',
    title: 'Digital Citizen Services Platform',
    organization: 'Electronics & IT Dept., Government of Assam',
    authority: 'Electronics & IT Dept., Assam',
    category: 'Citizen Services & E-Governance Platform',
    portal: 'Assam e-Procurement Portal',
    estimatedValueINR: 184000000,
    estimatedValueDisplay: '₹18.40 Cr',
    emdAmountINR: 240000,
    emdDisplay: '₹2,40,000',
    tenderFeeINR: 5000,
    publishDate: '2026-09-10',
    submissionDeadline: '2026-09-24T17:00:00',
    due: '24 Sep 2026',
    status: 'In review',
    statusType: 'amber',
    score: 82.5,
    technicalWeightage: '100 marks',
    fieldsStructuredCount: 24,
    annexuresDetectedCount: 9,
    scopeSummary: 'Design, development, regional cloud hosting, continuous delivery governance, SLA adherence, and citizen digital service workflows across Assam state districts.',
    eligibilityCriteria: {
      minAnnualTurnoverINR: 100000000,
      minTurnoverDisplay: 'Minimum ₹10 Cr in last 3 years',
      minExperienceYears: 5,
      requiredCertifications: ['ISO 9001', 'ISO 27001'],
      pastProjectRequirement: '5+ years in citizen services software and regional office presence in Assam / North-East region.'
    },
    scoreBreakdown: {
      overall: 82.5,
      preQualification: 37.5,
      preQualificationMax: 50,
      methodologyTarget: 45.0,
      methodologyMax: 50
    },
    gates: [
      {
        name: 'Average annual turnover',
        requirement: 'Minimum ₹10 Cr in last 3 years',
        result: '₹14.8 Cr (Tech Solutions)',
        pass: true
      },
      {
        name: 'Relevant experience',
        requirement: '5+ years in citizen services',
        result: '8 years verified experience',
        pass: true
      },
      {
        name: 'Mandatory certificates',
        requirement: 'ISO 9001 + ISO 27001',
        result: 'ISO 27001 certificate is expiring in 42 days',
        pass: false
      },
      {
        name: 'Local presence',
        requirement: 'Office in Assam or NE region',
        result: 'Guwahati office verified',
        pass: true
      }
    ],
    gapAnalysis: {
      title: 'ISO 27001 certificate is expiring',
      description: 'Upload a renewed certificate before final binding. This is a review flag, not a hard disqualification.',
      impactOnScore: '− 4.0 marks',
      suggestedOwner: 'Legal & compliance',
      lastChecked: 'Just now',
      affectedClause: 'Clause 3.2 · Mandatory certificates “Valid ISO 27001 certificate copy”'
    },
    paymentProof: {
      mode: 'NEFT / RTGS',
      instrumentNumber: 'HDFC26092498122',
      amountDisplay: '₹2,40,000',
      bank: 'HDFC Bank · GS Road Branch',
      issueDate: '18 Sep 2026',
      receiptFileName: 'Payment_receipt_18402.pdf',
      receiptFileSize: '482 KB',
      isSaved: true
    },
    proposalDocuments: [
      { id: 'doc_cover', name: 'Covering Letter', pages: 1, status: 'Ready for review' },
      { id: 'doc_poa', name: 'Power of Attorney', pages: 2, status: 'Ready for review' },
      { id: 'doc_nonblack', name: 'Non-Blacklisting Affidavit', pages: 1, status: 'Ready for review' },
      { id: 'doc_methodology', name: 'Approach & Methodology', pages: 5, status: 'Draft' },
      { id: 'doc_cvs', name: 'Key Personnel CVs', pages: 12, status: 'Ready for review' }
    ],
    proposalContent: {
      'Covering Letter': `To,
The Director,
Electronics & IT Department, Government of Assam,
Guwahati, Assam.

Subject: Submission of Technical & Commercial Bid for Digital Citizen Services Platform (Ref: ELE.93/2024/2)

Dear Sir/Madam,
Having examined the RFP documents including Addenda/Corrigenda, we, the undersigned, offer to design, implement, host, and maintain the Digital Citizen Services Platform in full conformity with the stated terms and conditions...`,
      'Power of Attorney': `POWER OF ATTORNEY
(To be executed on Non-Judicial Stamp Paper of appropriate value)

Know all men by these presents, we Tech Solutions Pvt Ltd having our registered office at GS Road, Guwahati, Assam, do hereby constitute, appoint and authorize Mr. Arjun Mehta, Managing Director, as our true and lawful attorney...`,
      'Non-Blacklisting Affidavit': `AFFIDAVIT ON NON-BLACKLISTING
(To be executed on ₹100 Stamp Paper and Notarized)

I, Arjun Mehta, Managing Director and Authorized Signatory of Tech Solutions Pvt Ltd, do hereby solemnly affirm and state that:
1. Tech Solutions Pvt Ltd has not been banned or blacklisted by any Government Department, PSU, or autonomous body in India...`,
      'Approach & Methodology': `A considered delivery approach for the Digital Citizen Services Platform tender.

1. Our understanding
Tech Solutions understands that the department is seeking a secure, inclusive and measurable digital service layer for citizens. Our approach brings together delivery governance, service design and resilient cloud operations.

2. Delivery methodology
01 Discover & align - Stakeholder workshops · Week 1–2
02 Design & validate - Service blueprint · Week 3–5
03 Build & assure - Agile sprints · Week 6–14

Each stage is governed by a shared RAID log, weekly steering review and acceptance gates tied to measurable outcomes.

3. Technical Architecture & Security
State data residency compliance, microservices architecture, and automated CI/CD security pipelines guarantee 99.9% uptime for Assam state citizen services.`,
      'Key Personnel CVs': `KEY PERSONNEL CV BANK & PROJECT ASSIGNMENTS

1. Arjun Mehta - Project Sponsor & Governance Lead (18 Yrs Exp)
2. Dr. Rajesh Verma - Principal Solutions Architect (16 Yrs Exp)
3. Pooja Sharma - Project Director (PMP, 14 Yrs Exp)
4. Amitabh Sen - Lead Cloud & Security DevOps Engineer (10 Yrs Exp)`
    },
    binderSequence: [
      { id: 'bind_1', name: 'Tender fee & EMD proof', cover: 'Cover 1', pages: 2, type: 'receipt' },
      { id: 'bind_2', name: 'Covering letter', cover: 'Cover 2', pages: 1, type: 'letterhead' },
      { id: 'bind_3', name: 'Power of Attorney', cover: 'Cover 2', pages: 2, type: 'letterhead' },
      { id: 'bind_4', name: 'Non-blacklisting affidavit', cover: 'Cover 2', pages: 1, type: 'letterhead' },
      { id: 'bind_5', name: 'Approach & Methodology', cover: 'Cover 2', pages: 5, type: 'letterhead' },
      { id: 'bind_6', name: 'Key personnel CVs', cover: 'Cover 2', pages: 12, type: 'vault' },
      { id: 'bind_7', name: 'CA turnover & financials', cover: 'Cover 2', pages: 10, type: 'vault' },
      { id: 'bind_8', name: 'GST, PAN & ISO copies', cover: 'Cover 2', pages: 15, type: 'vault' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tender_gem_18402',
    tenderNumber: 'GEM/2026/B/18402',
    reference: 'GEM/2026/B/18402',
    title: 'Cloud Infrastructure Managed Services',
    organization: 'Ministry of Finance, New Delhi',
    authority: 'Ministry of Finance',
    category: 'Cloud Infrastructure & Managed DevOps',
    portal: 'GeM (Government e-Marketplace)',
    estimatedValueINR: 280000000,
    estimatedValueDisplay: '₹28.00 Cr',
    emdAmountINR: 560000,
    emdDisplay: '₹5,60,000',
    tenderFeeINR: 10000,
    publishDate: '2026-09-12',
    submissionDeadline: '2026-10-02T15:00:00',
    due: '02 Oct 2026',
    status: 'Ready to bid',
    statusType: 'green',
    score: 91.0,
    technicalWeightage: '100 marks',
    fieldsStructuredCount: 28,
    annexuresDetectedCount: 6,
    scopeSummary: 'Multi-cloud management, Kubernetes orchestration, FinOps optimization and 24/7 security operations monitoring.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tender_upsdc_117',
    tenderNumber: 'UPSDC/IT/2026/117',
    reference: 'UPSDC/IT/2026/117',
    title: 'State Data Centre Modernisation',
    organization: 'UP State Data Centre Department',
    authority: 'UP State Data Centre',
    category: 'Datacenter Modernisation & HCI',
    portal: 'UP e-Tender',
    estimatedValueINR: 125000000,
    estimatedValueDisplay: '₹12.50 Cr',
    emdAmountINR: 250000,
    emdDisplay: '₹2,50,000',
    tenderFeeINR: 5000,
    publishDate: '2026-09-15',
    submissionDeadline: '2026-10-11T16:00:00',
    due: '11 Oct 2026',
    status: 'Needs attention',
    statusType: 'red',
    score: 68.0,
    technicalWeightage: '100 marks',
    fieldsStructuredCount: 22,
    annexuresDetectedCount: 8,
    scopeSummary: 'Upgrade of state data centre server racks, SAN storage and zero-trust perimeter firewalls.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to read DB
export function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        companyProfile: defaultCompanyProfile,
        tenders: sampleTenders,
        settings: {
          defaultCurrency: 'INR',
          defaultMarginPercent: 18,
          taxPercent: 18,
          autoAiAnalysis: true
        }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return {
      companyProfile: defaultCompanyProfile,
      tenders: sampleTenders,
      settings: {}
    };
  }
}

// Helper to write DB
export function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

export { DATA_DIR, UPLOADS_DIR };
