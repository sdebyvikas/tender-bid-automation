import mongoose from "mongoose";
import CompanyProfile from "../models/CompanyProfile.js";
import Tender from "../models/Tender.js";
import { readDB } from "./db.js";

export async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/tender_bid_automation";
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri);
    console.log(`🍃 MongoDB Connected successfully to: ${uri}`);

    // Seed initial Company Vault data if collection is empty
    await seedCompanyProfile();
    // Seed initial Tenders if collection is empty
    await seedTenders();
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
  }
}

async function seedCompanyProfile() {
  try {
    const existing = await CompanyProfile.findOne();
    if (!existing) {
      const localData = readDB();
      const initialProfile = localData.companyProfile;
      if (initialProfile) {
        await CompanyProfile.create(initialProfile);
        console.log(`✅ Default Company Vault seeded into MongoDB collection!`);
      }
    }
  } catch (err) {
    console.error("Error seeding CompanyProfile to MongoDB:", err.message);
  }
}

async function seedTenders() {
  try {
    const count = await Tender.countDocuments();
    if (count === 0) {
      const localData = readDB();
      const initialTenders = localData.tenders || [];
      if (initialTenders.length > 0) {
        await Tender.insertMany(initialTenders);
        console.log(
          `✅ Seeded ${initialTenders.length} initial tenders into MongoDB collection!`
        );
      }
    }
  } catch (err) {
    console.error("Error seeding Tenders to MongoDB:", err.message);
  }
}
