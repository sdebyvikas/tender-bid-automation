import { CompanyProfileService } from "./company-profile.service.js";
import { validateCompanyProfileUpdate } from "./company-profile.validation.js";

export class CompanyProfileController {
  static async getProfile(req, res) {
    try {
      const result = await CompanyProfileService.getProfile();
      res.json({
        success: true,
        source: result.source,
        companyProfile: result.profile,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const validation = validateCompanyProfileUpdate(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.errors.join(" "),
        });
      }

      const result = await CompanyProfileService.updateProfile(req.body);
      res.json({
        success: true,
        message: "Company Profile updated successfully!",
        source: result.source,
        companyProfile: result.profile,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async uploadDocument(req, res) {
    try {
      console.log("--> CompanyProfileController.uploadDocument called! File:", req.file ? `${req.file.originalname} (${req.file.size}B)` : "NO FILE", "Body:", req.body);
      const result = await CompanyProfileService.uploadVaultDocument(
        req.file,
        req.body
      );
      res.json({
        success: true,
        message: `Document "${result.document.name}" uploaded and master profile synced!`,
        document: result.document,
        companyProfile: result.profile,
      });
    } catch (err) {
      console.error("Upload error in CompanyProfileController:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateDocument(req, res) {
    try {
      const result = await CompanyProfileService.updateVaultDocument(
        req.params.docId,
        req.file,
        req.body
      );
      res.json({
        success: true,
        message: "Document updated successfully in Company Vault!",
        companyProfile: result.profile,
      });
    } catch (err) {
      console.error("Update document error in CompanyProfileController:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async deleteDocument(req, res) {
    try {
      const result = await CompanyProfileService.deleteVaultDocument(
        req.params.docId
      );
      res.json({
        success: true,
        message: "Document deleted from Company Vault",
        companyProfile: result.profile,
      });
    } catch (err) {
      console.error("Delete document error in CompanyProfileController:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getSignatories(req, res) {
    try {
      const result = await CompanyProfileService.getSignatories();
      res.json({
        success: true,
        source: result.source,
        signatories: result.signatories,
        companyProfile: result.profile,
      });
    } catch (err) {
      console.error("getSignatories error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async addSignatory(req, res) {
    try {
      console.log("--> addSignatory called! File:", req.file ? req.file.originalname : "none", "Body:", req.body);
      const result = await CompanyProfileService.addSignatory(req.file, req.body);
      res.json({
        success: true,
        message: `Authorized Signatory "${result.signatory.name}" added successfully to MongoDB!`,
        signatory: result.signatory,
        companyProfile: result.profile,
        source: result.source,
      });
    } catch (err) {
      console.error("addSignatory error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateSignatory(req, res) {
    try {
      const result = await CompanyProfileService.updateSignatory(
        req.params.id,
        req.file,
        req.body
      );
      res.json({
        success: true,
        message: `Authorized Signatory "${result.signatory.name}" updated successfully!`,
        signatory: result.signatory,
        companyProfile: result.profile,
        source: result.source,
      });
    } catch (err) {
      console.error("updateSignatory error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async deleteSignatory(req, res) {
    try {
      const result = await CompanyProfileService.deleteSignatory(req.params.id);
      res.json({
        success: true,
        message: "Authorized Signatory removed from MongoDB registry",
        companyProfile: result.profile,
        source: result.source,
      });
    } catch (err) {
      console.error("deleteSignatory error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async setPrimarySignatory(req, res) {
    try {
      const result = await CompanyProfileService.setPrimarySignatory(req.params.id);
      res.json({
        success: true,
        message: "Default Primary Signatory updated successfully!",
        companyProfile: result.profile,
        source: result.source,
      });
    } catch (err) {
      console.error("setPrimarySignatory error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
