/**
 * Validation rules and sanitizer helpers for Company Profile
 */
export function validateCompanyProfileUpdate(data) {
  const errors = [];

  if (data.name && typeof data.name !== "string") {
    errors.push("Company Name must be a string.");
  }

  if (data.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(data.pan.trim())) {
    errors.push("Invalid PAN format (Expected 10 alphanumeric characters e.g. AAVFB2670G).");
  }

  if (data.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/i.test(data.gstin.trim())) {
    errors.push("Invalid GSTIN format (Expected 15 alphanumeric characters).");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateReadinessScore(docs = []) {
  if (!docs || docs.length === 0) return 100;
  const verifiedCount = docs.filter((d) => d.tag === "Verified").length;
  return Math.min(100, Math.round((verifiedCount / docs.length) * 100));
}
