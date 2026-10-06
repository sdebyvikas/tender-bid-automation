import { AuthorizedSignatoryService } from "./authorized-signatory.service.js";

export class AuthorizedSignatoryController {
  static async getAll(req, res) {
    try {
      const result = await AuthorizedSignatoryService.getAllSignatories();
      res.json({
        success: true,
        source: result.source,
        signatories: result.signatories,
      });
    } catch (err) {
      console.error("SignatoryController.getAll error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async create(req, res) {
    try {
      console.log("--> SignatoryController.create called! File:", req.file ? req.file.originalname : "none", "Body:", req.body);
      const result = await AuthorizedSignatoryService.addSignatory(req.file, req.body);
      res.json({
        success: true,
        message: `Authorized Signatory "${result.signatory.name}" added to MongoDB collection!`,
        signatory: result.signatory,
        signatories: result.signatories,
        source: result.source,
      });
    } catch (err) {
      console.error("SignatoryController.create error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const result = await AuthorizedSignatoryService.updateSignatory(
        req.params.id,
        req.file,
        req.body
      );
      res.json({
        success: true,
        message: `Authorized Signatory "${result.signatory.name}" updated in MongoDB!`,
        signatory: result.signatory,
        signatories: result.signatories,
        source: result.source,
      });
    } catch (err) {
      console.error("SignatoryController.update error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await AuthorizedSignatoryService.deleteSignatory(req.params.id);
      res.json({
        success: true,
        message: "Authorized Signatory removed from MongoDB collection",
        signatories: result.signatories,
        source: result.source,
      });
    } catch (err) {
      console.error("SignatoryController.delete error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async setPrimary(req, res) {
    try {
      const result = await AuthorizedSignatoryService.setPrimarySignatory(req.params.id);
      res.json({
        success: true,
        message: "Primary Default Signatory updated successfully in MongoDB!",
        signatories: result.signatories,
        source: result.source,
      });
    } catch (err) {
      console.error("SignatoryController.setPrimary error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
