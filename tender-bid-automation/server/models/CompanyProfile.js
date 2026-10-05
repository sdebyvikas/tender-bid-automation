import mongoose from "mongoose";

const AnnualTurnoverSchema = new mongoose.Schema(
  {
    year: { type: String, required: true },
    amountINR: { type: Number, required: true },
    amountDisplay: { type: String },
  },
  { _id: false }
);

const StatutoryDocumentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    meta: { type: String },
    tag: {
      type: String,
      enum: ["Verified", "Expiring", "Expired", "Pending", "Missing"],
      default: "Verified",
    },
    category: { type: String, default: "Statutory" },
    icon: { type: String, default: "FileText" },
    fileName: { type: String, default: null },
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    originalName: { type: String, default: null },
    expiryDate: { type: String, default: null },
    uploadedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const AuthorizedSignatorySchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    designation: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const KeyPersonnelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    qualification: { type: String, default: "" },
  },
  { _id: false }
);

const CompanyProfileSchema = new mongoose.Schema(
  {
    id: { type: String, default: "comp_techsolutions", unique: true },
    name: { type: String, required: true },
    pan: { type: String, default: "" },
    gstin: { type: String, default: "" },
    cin: { type: String, default: "" },
    registrationNo: { type: String, default: "" },
    headquarters: { type: String, default: "" },
    website: { type: String, default: "" },
    readinessScore: { type: Number, default: 0 },
    annualTurnover: [AnnualTurnoverSchema],
    averageTurnoverINR: { type: Number, default: 0 },
    averageTurnoverDisplay: { type: String, default: "" },
    netWorthINR: { type: Number, default: 0 },
    certifications: [{ type: String }],
    statutoryDocuments: [StatutoryDocumentSchema],
    authorizedSignatory: {
      type: AuthorizedSignatorySchema,
      default: () => ({}),
    },
    keyPersonnel: [KeyPersonnelSchema],
  },
  {
    timestamps: true,
  }
);

const CompanyProfile =
  mongoose.models.CompanyProfile ||
  mongoose.model("CompanyProfile", CompanyProfileSchema);

export default CompanyProfile;
