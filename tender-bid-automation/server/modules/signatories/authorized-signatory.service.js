import fs from "fs";
import path from "path";
import AuthorizedSignatory from "./authorized-signatory.model.js";
import CompanyProfile from "../company-profile/company-profile.model.js";
import { UPLOADS_DIR, readDB, writeDB } from "../../config/db.js";

export class AuthorizedSignatoryService {
  /**
   * Helper to sync active primary signatory to Company Profile
   */
  static async syncPrimaryToCompanyProfile(signatories) {
    try {
      const primary =
        signatories.find((s) => s.isPrimary) ||
        (signatories.length > 0 ? signatories[0] : null);
      if (primary) {
        await CompanyProfile.findOneAndUpdate(
          {},
          {
            authorizedSignatory: {
              name: primary.name,
              designation: primary.designation,
              email: primary.email,
              phone: primary.phone,
            },
          },
          { new: true, upsert: true },
        );
      } else {
        await CompanyProfile.findOneAndUpdate(
          {},
          {
            authorizedSignatory: {
              name: "",
              designation: "",
              email: "",
              phone: "",
            },
          },
          { new: true, upsert: true },
        );
      }
    } catch (err) {
      console.warn(
        "Could not sync primary to companyProfile model:",
        err.message,
      );
    }
  }

  /**
   * Fetches all Authorized Signatories from MongoDB (No auto-seeding)
   */
  static async getAllSignatories() {
    try {
      const signatories = await AuthorizedSignatory.find()
        .sort({ isPrimary: -1, createdAt: -1 })
        .lean();

      // Sync local store
      const db = readDB();
      db.authorizedSignatories = signatories;
      writeDB(db);

      await this.syncPrimaryToCompanyProfile(signatories);

      return { source: "MongoDB", signatories };
    } catch (err) {
      console.warn(
        "MongoDB getAllSignatories fallback to local store:",
        err.message,
      );
      const db = readDB();
      return {
        source: "Local Store",
        signatories: db.authorizedSignatories || [],
      };
    }
  }

  /**
   * Adds a new Authorized Signatory document directly to MongoDB collection
   */
  static async addSignatory(file, bodyData) {
    let savedFileName = null;
    let savedFileUrl = null;
    let savedFileType = null;

    if (file && file.buffer) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safeName = (file.originalname || "signature.pdf").replace(
        /[^a-zA-Z0-9.-]/g,
        "_",
      );
      savedFileName = `signatory-${uniqueSuffix}-${safeName}`;
      savedFileUrl = `/uploads/${savedFileName}`;
      savedFileType = file.mimetype || "application/pdf";
      try {
        fs.writeFileSync(path.join(UPLOADS_DIR, savedFileName), file.buffer);
      } catch (writeErr) {
        console.warn(
          "Could not save signature file to uploads dir:",
          writeErr.message,
        );
      }
    }

    try {
      const existingCount = await AuthorizedSignatory.countDocuments();
      const isPrimary =
        bodyData.isPrimary === true ||
        bodyData.isPrimary === "true" ||
        existingCount === 0;

      if (isPrimary) {
        // Unset primary from all existing signatories
        await AuthorizedSignatory.updateMany({}, { isPrimary: false });
      }

      const newSignatoryDoc = {
        id: bodyData.id || `sig_${Date.now()}`,
        name: bodyData.name ? bodyData.name.trim() : "Authorized Signatory",
        designation: bodyData.designation
          ? bodyData.designation.trim()
          : "Director & Authorized Signatory",
        email: bodyData.email ? bodyData.email.trim() : "",
        phone: bodyData.phone ? bodyData.phone.trim() : "",
        pan: bodyData.pan ? bodyData.pan.trim().toUpperCase() : "",
        din: bodyData.din ? bodyData.din.trim() : "",
        poaRef: bodyData.poaRef ? bodyData.poaRef.trim() : "",
        dscType: bodyData.dscType || "Class 3 DSC (Signing & Encryption)",
        signatureFileName: savedFileName || bodyData.signatureFileName || null,
        signatureFileUrl: savedFileUrl || bodyData.signatureFileUrl || null,
        signatureFileType: savedFileType || bodyData.signatureFileType || null,
        specimenSignatureUrl:
          savedFileUrl || bodyData.specimenSignatureUrl || null,
        isPrimary,
        status: bodyData.status || "Active",
      };

      const created = await AuthorizedSignatory.create(newSignatoryDoc);
      const allSignatories = await AuthorizedSignatory.find()
        .sort({ isPrimary: -1, createdAt: -1 })
        .lean();

      // Sync local store
      const db = readDB();
      db.authorizedSignatories = allSignatories;
      writeDB(db);

      await this.syncPrimaryToCompanyProfile(allSignatories);

      return {
        source: "MongoDB",
        signatory: created.toObject ? created.toObject() : created,
        signatories: allSignatories,
      };
    } catch (err) {
      console.warn(
        "MongoDB addSignatory fallback to local store:",
        err.message,
      );
      const db = readDB();
      const list = db.authorizedSignatories || [];

      const isPrimary =
        bodyData.isPrimary === true ||
        bodyData.isPrimary === "true" ||
        list.length === 0;

      if (isPrimary) {
        list.forEach((s) => (s.isPrimary = false));
      }

      const newSignatory = {
        id: bodyData.id || `sig_${Date.now()}`,
        name: bodyData.name || "Authorized Signatory",
        designation: bodyData.designation || "Director & Authorized Signatory",
        email: bodyData.email || "",
        phone: bodyData.phone || "",
        pan: bodyData.pan || "",
        din: bodyData.din || "",
        poaRef: bodyData.poaRef || "",
        dscType: bodyData.dscType || "Class 3 DSC (Signing & Encryption)",
        signatureFileName: savedFileName || null,
        signatureFileUrl: savedFileUrl || null,
        signatureFileType: savedFileType || null,
        specimenSignatureUrl: savedFileUrl || null,
        isPrimary,
        status: bodyData.status || "Active",
        createdAt: new Date().toISOString(),
      };

      list.unshift(newSignatory);
      db.authorizedSignatories = list;
      writeDB(db);

      return {
        source: "Local Store",
        signatory: newSignatory,
        signatories: list,
      };
    }
  }

  /**
   * Updates an existing Authorized Signatory in MongoDB
   */
  static async updateSignatory(signatoryId, file, bodyData) {
    try {
      let query = { id: signatoryId };
      let existing = await AuthorizedSignatory.findOne(query);
      if (!existing) {
        query = { _id: signatoryId };
        existing = await AuthorizedSignatory.findOne(query);
      }

      if (!existing) {
        throw new Error(
          `Signatory with ID "${signatoryId}" not found in MongoDB`,
        );
      }

      let savedFileName = existing.signatureFileName;
      let savedFileUrl = existing.signatureFileUrl;
      let savedFileType = existing.signatureFileType;

      if (file && file.buffer) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const safeName = (file.originalname || "signature.pdf").replace(
          /[^a-zA-Z0-9.-]/g,
          "_",
        );
        savedFileName = `signatory-${uniqueSuffix}-${safeName}`;
        savedFileUrl = `/uploads/${savedFileName}`;
        savedFileType = file.mimetype || "application/pdf";
        try {
          fs.writeFileSync(path.join(UPLOADS_DIR, savedFileName), file.buffer);
        } catch (writeErr) {
          console.warn(
            "Could not save signature file to uploads dir:",
            writeErr.message,
          );
        }
      }

      const isPrimary =
        bodyData.isPrimary !== undefined
          ? bodyData.isPrimary === true || bodyData.isPrimary === "true"
          : existing.isPrimary;

      if (isPrimary) {
        await AuthorizedSignatory.updateMany(
          { _id: { $ne: existing._id } },
          { isPrimary: false },
        );
      }

      const updatePayload = {
        name:
          bodyData.name !== undefined ? bodyData.name.trim() : existing.name,
        designation:
          bodyData.designation !== undefined
            ? bodyData.designation.trim()
            : existing.designation,
        email:
          bodyData.email !== undefined ? bodyData.email.trim() : existing.email,
        phone:
          bodyData.phone !== undefined ? bodyData.phone.trim() : existing.phone,
        pan:
          bodyData.pan !== undefined
            ? bodyData.pan.trim().toUpperCase()
            : existing.pan,
        din: bodyData.din !== undefined ? bodyData.din.trim() : existing.din,
        poaRef:
          bodyData.poaRef !== undefined
            ? bodyData.poaRef.trim()
            : existing.poaRef,
        dscType:
          bodyData.dscType !== undefined ? bodyData.dscType : existing.dscType,
        signatureFileName: savedFileName,
        signatureFileUrl: savedFileUrl,
        signatureFileType: savedFileType,
        specimenSignatureUrl: savedFileUrl,
        isPrimary,
        status:
          bodyData.status !== undefined ? bodyData.status : existing.status,
      };

      const updated = await AuthorizedSignatory.findOneAndUpdate(
        { _id: existing._id },
        updatePayload,
        { new: true },
      ).lean();

      const allSignatories = await AuthorizedSignatory.find()
        .sort({ isPrimary: -1, createdAt: -1 })
        .lean();

      // Sync local store
      const db = readDB();
      db.authorizedSignatories = allSignatories;
      writeDB(db);

      await this.syncPrimaryToCompanyProfile(allSignatories);

      return {
        source: "MongoDB",
        signatory: updated,
        signatories: allSignatories,
      };
    } catch (err) {
      console.warn(
        "MongoDB updateSignatory fallback to local store:",
        err.message,
      );
      const db = readDB();
      let list = db.authorizedSignatories || [];
      const idx = list.findIndex(
        (s) => s.id === signatoryId || s._id === signatoryId,
      );
      if (idx === -1) {
        throw new Error(`Signatory with ID "${signatoryId}" not found`);
      }

      if (bodyData.isPrimary === true || bodyData.isPrimary === "true") {
        list.forEach((s) => (s.isPrimary = false));
      }

      list[idx] = {
        ...list[idx],
        ...bodyData,
        isPrimary:
          bodyData.isPrimary !== undefined
            ? Boolean(bodyData.isPrimary)
            : list[idx].isPrimary,
        updatedAt: new Date().toISOString(),
      };

      db.authorizedSignatories = list;
      writeDB(db);

      return { source: "Local Store", signatory: list[idx], signatories: list };
    }
  }

  /**
   * Deletes a Signatory document from MongoDB
   */
  static async deleteSignatory(signatoryId) {
    try {
      let query = { id: signatoryId };
      let sigToDelete = await AuthorizedSignatory.findOne(query);
      if (!sigToDelete) {
        query = { _id: signatoryId };
        sigToDelete = await AuthorizedSignatory.findOne(query);
      }

      if (sigToDelete && sigToDelete.signatureFileName) {
        const filePath = path.join(UPLOADS_DIR, sigToDelete.signatureFileName);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn("Could not remove signature file:", e.message);
          }
        }
      }

      if (sigToDelete) {
        await AuthorizedSignatory.deleteOne({ _id: sigToDelete._id });
      }

      let allSignatories = await AuthorizedSignatory.find()
        .sort({ isPrimary: -1, createdAt: -1 })
        .lean();

      // If deleted one was primary and list has remaining signers, promote first
      if (
        allSignatories.length > 0 &&
        !allSignatories.some((s) => s.isPrimary)
      ) {
        await AuthorizedSignatory.updateOne(
          { _id: allSignatories[0]._id },
          { isPrimary: true },
        );
        allSignatories = await AuthorizedSignatory.find()
          .sort({ isPrimary: -1, createdAt: -1 })
          .lean();
      }

      // Sync local store
      const db = readDB();
      db.authorizedSignatories = allSignatories;
      writeDB(db);

      await this.syncPrimaryToCompanyProfile(allSignatories);

      return { source: "MongoDB", success: true, signatories: allSignatories };
    } catch (err) {
      console.warn(
        "MongoDB deleteSignatory fallback to local store:",
        err.message,
      );
      const db = readDB();
      let list = db.authorizedSignatories || [];
      list = list.filter((s) => s.id !== signatoryId && s._id !== signatoryId);

      if (list.length > 0 && !list.some((s) => s.isPrimary)) {
        list[0].isPrimary = true;
      }

      db.authorizedSignatories = list;
      writeDB(db);

      return { source: "Local Store", success: true, signatories: list };
    }
  }

  /**
   * Sets a signatory as the primary signer
   */
  static async setPrimarySignatory(signatoryId) {
    try {
      let query = { id: signatoryId };
      let target = await AuthorizedSignatory.findOne(query);
      if (!target) {
        query = { _id: signatoryId };
        target = await AuthorizedSignatory.findOne(query);
      }

      if (!target) {
        throw new Error(
          `Signatory with ID "${signatoryId}" not found in MongoDB`,
        );
      }

      // Unset all, set target to true
      await AuthorizedSignatory.updateMany({}, { isPrimary: false });
      await AuthorizedSignatory.updateOne(
        { _id: target._id },
        { isPrimary: true },
      );

      const allSignatories = await AuthorizedSignatory.find()
        .sort({ isPrimary: -1, createdAt: -1 })
        .lean();

      // Sync local store
      const db = readDB();
      db.authorizedSignatories = allSignatories;
      writeDB(db);

      await this.syncPrimaryToCompanyProfile(allSignatories);

      return { source: "MongoDB", success: true, signatories: allSignatories };
    } catch (err) {
      console.warn(
        "MongoDB setPrimarySignatory fallback to local store:",
        err.message,
      );
      const db = readDB();
      let list = db.authorizedSignatories || [];
      list.forEach((s) => {
        s.isPrimary = s.id === signatoryId || s._id === signatoryId;
      });

      db.authorizedSignatories = list;
      writeDB(db);

      return { source: "Local Store", success: true, signatories: list };
    }
  }
}
