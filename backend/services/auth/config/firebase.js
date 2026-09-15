import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "../serviceAccount.json" with { type: "json" };

let app = null;

try {
  if (serviceAccount && serviceAccount.project_id && serviceAccount.private_key) {
    app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
    console.log("✅ Firebase Admin initialized successfully");
  } else {
    console.log("ℹ️ Firebase service account not configured. Dev / Demo mode enabled.");
  }
} catch (error) {
  console.warn("⚠️ Firebase Admin initialization error:", error.message);
}

export { app };