import mongoose from "mongoose";

const AuthorizedSignatorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    designation: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    pan: { type: String, default: "" },
    din: { type: String, default: "" },
    poaRef: { type: String, default: "" },
    dscType: { type: String, default: "Class 3 DSC (Signing & Encryption)" },
    signatureFileName: { type: String, default: null },
    signatureFileUrl: { type: String, default: null },
    signatureFileType: { type: String, default: null },
    specimenSignatureUrl: { type: String, default: null },
    isPrimary: { type: Boolean, default: false },
    status: { type: String, default: "Active" },
  },
  {
    timestamps: true,
    collection: "authorizedsignatories",
  }
);

if (mongoose.models && mongoose.models.AuthorizedSignatory) {
  delete mongoose.models.AuthorizedSignatory;
}

const AuthorizedSignatory = mongoose.model(
  "AuthorizedSignatory",
  AuthorizedSignatorySchema
);

export default AuthorizedSignatory;
