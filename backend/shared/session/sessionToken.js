import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "bearly-ai-super-session-secret-2026";

export function createSignedSessionToken(userData) {
  const payloadObj = {
    ...userData,
    iat: Date.now()
  };
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySignedSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const jsonStr = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}
