export interface AnnualTurnover {
  year: string;
  amountINR: number;
  amountDisplay?: string;
  [key: string]: any;
}

export type StatutoryDocTag = "Verified" | "Expiring" | "Expired" | "Pending" | "Missing" | string;

export interface StatutoryDocument {
  id: string;
  name: string;
  meta?: string;
  tag?: StatutoryDocTag;
  category?: string;
  icon?: string;
  fileName?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  originalName?: string | null;
  expiryDate?: string | null;
  uploadedAt?: string;
  [key: string]: any;
}

export interface AuthorizedSignatory {
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface KeyPersonnel {
  name: string;
  role?: string;
  experienceYears?: number;
  qualification?: string;
  [key: string]: any;
}

export interface CompanyProfile {
  _id?: string;
  id?: string;
  name: string;
  companyName?: string;
  pan?: string;
  gstin?: string;
  cin?: string;
  registrationNo?: string;
  headquarters?: string;
  website?: string;
  readinessScore?: number;
  annualTurnover?: AnnualTurnover[];
  averageTurnoverINR?: number;
  averageTurnoverDisplay?: string;
  netWorthINR?: number;
  certifications?: string[];
  statutoryDocuments?: StatutoryDocument[];
  authorizedSignatory?: AuthorizedSignatory;
  keyPersonnel?: KeyPersonnel[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}
