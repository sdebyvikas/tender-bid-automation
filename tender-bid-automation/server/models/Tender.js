import mongoose from "mongoose";

const ComplianceItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    clauseNo: { type: String, default: "Clause 1.0" },
    requirement: { type: String, required: true },
    category: { type: String, default: "Technical" },
    isMandatory: { type: Boolean, default: true },
    status: { type: String, default: "Complied" },
    justification: { type: String, default: "" },
    deviationRemarks: { type: String, default: "None" },
    evidenceDoc: { type: String, default: "" },
  },
  { _id: false }
);

const BOQItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    item: { type: String, required: true },
    unit: { type: String, default: "Unit" },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    category: { type: String, default: "Services" },
  },
  { _id: false }
);

const TenderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    tenderNumber: { type: String, default: "" },
    reference: { type: String, default: "" },
    title: { type: String, required: true },
    organization: { type: String, default: "" },
    authority: { type: String, default: "" },
    category: { type: String, default: "General Procurement" },
    portal: { type: String, default: "GeM Portal" },
    estimatedValueINR: { type: Number, default: 0 },
    estimatedValueDisplay: { type: String, default: "" },
    emdAmountINR: { type: Number, default: 0 },
    emdDisplay: { type: String, default: "" },
    tenderFeeINR: { type: Number, default: 0 },
    publishDate: { type: String, default: "" },
    submissionDeadline: { type: String, default: "" },
    preBidMeetingDate: { type: String, default: "" },
    due: { type: String, default: "" },
    status: { type: String, default: "In Analysis" },
    statusType: { type: String, default: "amber" },
    priority: { type: String, default: "Medium" },
    score: { type: Number, default: 75.0 },
    technicalWeightage: { type: String, default: "100 marks" },
    fieldsStructuredCount: { type: Number, default: 0 },
    annexuresDetectedCount: { type: Number, default: 0 },
    scopeSummary: { type: String, default: "" },
    hasBOQ: { type: Boolean, default: false },
    boqType: { type: String, default: "" },
    rawTextSnippet: { type: String, default: "" },
    uploadedFileName: { type: String, default: "" },
    documentMeta: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    eligibilityCriteria: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    goNoGoAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    complianceItems: [ComplianceItemSchema],
    boqItems: [BOQItemSchema],
    proposals: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    paymentProof: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    binderSequence: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Tender = mongoose.model("Tender", TenderSchema);
export default Tender;
