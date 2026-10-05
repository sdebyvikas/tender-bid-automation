export interface ComplianceItem {
  id: string;
  clauseNo?: string;
  requirement: string;
  category?: string;
  isMandatory?: boolean;
  status?: "Complied" | "Partially Complied" | "Deviation" | "Not Complied" | string;
  justification?: string;
  deviationRemarks?: string;
  evidenceDoc?: string;
  [key: string]: any;
}

export interface BOQItem {
  id: string;
  item: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
  [key: string]: any;
}

export interface GoNoGoCriterion {
  parameter: string;
  score: number;
  maxScore: number;
  weightage: number;
  status: "Pass" | "Fail" | "Warning" | "Review" | string;
  remarks: string;
  [key: string]: any;
}

export interface GoNoGoAnalysis {
  recommendation?: "BID" | "NO BID" | "BID WITH CONDITIONS" | "REVIEW" | string;
  decision?: "GO" | "NO-GO" | "REVIEW" | string;
  overallScore?: number;
  winProbability?: number;
  criteria?: GoNoGoCriterion[];
  riskFactors?: string[];
  strengths?: string[];
  notes?: string;
  analyzedAt?: string;
  [key: string]: any;
}

export interface EligibilityCriteria {
  minAverageTurnoverINR?: number;
  minAnnualTurnoverINR?: number;
  minTurnoverDisplay?: string;
  experienceYearsRequired?: number;
  requiredCertifications?: string[];
  minNetWorthINR?: number;
  similarProjectsRequired?: number;
  similarProjectMinValueINR?: number;
  specialConditions?: string[];
  status?: string;
  [key: string]: any;
}

export interface PaymentProof {
  referenceNumber?: string;
  bankName?: string;
  paymentMode?: "NEFT" | "RTGS" | "UPI" | "Demand Draft" | "Bank Guarantee" | string;
  amountINR?: number;
  amountDisplay?: string;
  transactionDate?: string;
  documentUrl?: string;
  fileName?: string;
  status?: "Verified" | "Pending" | "Rejected" | string;
  remarks?: string;
  [key: string]: any;
}

export interface DocumentMeta {
  pageCount?: number;
  fileSize?: number;
  mimeType?: string;
  rawExtractedSections?: string[];
  [key: string]: any;
}

export interface ProposalSections {
  executiveSummary?: string;
  technicalApproach?: string;
  complianceMatrix?: string;
  boqSummary?: string;
  implementationPlan?: string;
  riskMitigation?: string;
  teamStructure?: string;
  commercialProposal?: string;
  [key: string]: string | undefined;
}

export interface Tender {
  _id?: string;
  id: string;
  tenderNumber?: string;
  reference?: string;
  title: string;
  organization?: string;
  authority?: string;
  category?: string;
  portal?: string;
  estimatedValueINR?: number;
  estimatedValueDisplay?: string;
  emdAmountINR?: number;
  emdDisplay?: string;
  tenderFeeINR?: number;
  publishDate?: string;
  submissionDeadline?: string;
  preBidMeetingDate?: string;
  due?: string;
  status?: "In Analysis" | "Eligible" | "Bid Prepared" | "Submitted" | "Won" | "Lost" | "Archived" | string;
  statusType?: "green" | "emerald" | "amber" | "yellow" | "red" | "blue" | "purple" | "gray" | string;
  priority?: "High" | "Medium" | "Low" | string;
  score?: number;
  technicalWeightage?: string;
  fieldsStructuredCount?: number;
  annexuresDetectedCount?: number;
  scopeSummary?: string;
  scopeOfWork?: string;
  description?: string;
  hasBOQ?: boolean;
  boqType?: string;
  rawTextSnippet?: string;
  uploadedFileName?: string;
  documentMeta?: DocumentMeta;
  eligibilityCriteria?: EligibilityCriteria | Record<string, any>;
  goNoGoAnalysis?: GoNoGoAnalysis | Record<string, any>;
  complianceItems?: ComplianceItem[];
  boqItems?: BOQItem[];
  proposals?: ProposalSections | Record<string, any>;
  paymentProof?: PaymentProof | null;
  binderSequence?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}
