import mongoose from "../services/auth/node_modules/mongoose/index.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from services/auth/.env
dotenv.config({ path: path.join(__dirname, "../services/auth/.env") });

const mongoUri =
  process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/cortex_ai";
const defaultAmount = Number(process.env.DEFAULT_CREDITS) || 99999;

// Can accept arguments:
// node scripts/set-credits.js [amount]
// or node scripts/set-credits.js [userEmail] [amount]
const args = process.argv.slice(2);
let targetEmail = null;
let targetCredits = defaultAmount;

if (args.length === 1) {
  if (!isNaN(Number(args[0]))) {
    targetCredits = Number(args[0]);
  } else {
    targetEmail = args[0];
  }
} else if (args.length >= 2) {
  targetEmail = args[0];
  targetCredits = Number(args[1]) || defaultAmount;
}

async function main() {
  try {
    console.log(`Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const query = targetEmail ? { email: targetEmail } : {};
    const result = await mongoose.connection
      .collection("users")
      .updateMany(query, {
        $set: {
          credits: targetCredits,
          totalCredits: targetCredits,
        },
      });

    console.log(`\n✅ Successfully updated credits to ${targetCredits}!`);
    console.log(
      `Matched Users: ${result.matchedCount} | Modified Users: ${result.modifiedCount}`,
    );

    const users = await mongoose.connection
      .collection("users")
      .find(query)
      .toArray();
    console.log("\nUpdated Users list:");
    users.forEach((u) => {
      console.log(
        ` - ${u.email || u.firebaseUid}: ${u.credits} credits (Plan: ${u.plan || "free"})`,
      );
    });

    console.log("\n📋 Per-Agent Deduction Costs Configured in .env:");
    console.log(` - Chat Agent:   ${process.env.CREDIT_COST_CHAT || 1} credit(s)`);
    console.log(` - Search Agent: ${process.env.CREDIT_COST_SEARCH || 5} credit(s)`);
    console.log(` - Coding Agent: ${process.env.CREDIT_COST_CODING || 10} credit(s)`);
    console.log(` - PDF Agent:    ${process.env.CREDIT_COST_PDF || 10} credit(s)`);
    console.log(` - PPT Agent:    ${process.env.CREDIT_COST_PPT || 10} credit(s)`);
    console.log(` - Image Agent:  ${process.env.CREDIT_COST_IMAGE || 10} credit(s)`);
    console.log(` - Vision Agent: ${process.env.CREDIT_COST_VISION || 10} credit(s)`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error setting credits:", err.message);
    process.exit(1);
  }
}

main();
