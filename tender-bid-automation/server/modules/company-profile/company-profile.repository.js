import CompanyProfile from "./company-profile.model.js";
import { readDB, writeDB } from "../../config/db.js";
import { calculateGoNoGoScore } from "../../services/goNoGoEngine.js";

/**
 * Repository layer for Company Profile data access & persistence
 */
export class CompanyProfileRepository {
  static async getProfile() {
    try {
      let profile = await CompanyProfile.findOne().lean();
      if (!profile) {
        const db = readDB();
        const initial = db.companyProfile || {
          id: "comp_master_profile",
          name: "Bio Waste Management Service",
        };
        const created = await CompanyProfile.create(initial);
        profile = created.toObject ? created.toObject() : created;
      }

      // Sync local store
      const db = readDB();
      db.companyProfile = profile;
      writeDB(db);

      return { source: "MongoDB", profile };
    } catch (err) {
      console.warn("MongoDB getProfile fallback to local store:", err.message);
      const db = readDB();
      return { source: "Local Store", profile: db.companyProfile };
    }
  }

  static async saveProfile(updateData) {
    try {
      const updated = await CompanyProfile.findOneAndUpdate({}, updateData, {
        returnDocument: "after",
        new: true,
        upsert: true,
        runValidators: true,
      }).lean();

      // Sync local store & re-calculate tender scores
      const db = readDB();
      db.companyProfile = updated;
      if (db.tenders && Array.isArray(db.tenders)) {
        db.tenders.forEach((tender) => {
          tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
        });
      }
      writeDB(db);

      return { source: "MongoDB", profile: updated };
    } catch (err) {
      console.warn("MongoDB saveProfile fallback to local store:", err.message);
      const db = readDB();
      db.companyProfile = { ...db.companyProfile, ...updateData };
      if (db.tenders && Array.isArray(db.tenders)) {
        db.tenders.forEach((tender) => {
          tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
        });
      }
      writeDB(db);
      return { source: "Local Store", profile: db.companyProfile };
    }
  }
}
