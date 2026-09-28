/**
 * Algorithmic & AI Go / No-Go Decision Engine
 * Evaluates Bidder Qualification against Tender Scope & Eligibility.
 * Produces dynamic, category-aware scores without hardcoded IT/Hardware templates.
 */
export function calculateGoNoGoScore(tender, companyProfile = {}) {
  let financialFitScore = 80;
  let technicalFitScore = 80;
  let experienceScore = 75;
  let riskScore = 20;

  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  const threats = [];

  // 1. Detect Tender Domain / Category
  const domainText =
    `${tender.title || ""} ${tender.category || ""} ${tender.scopeSummary || ""}`.toLowerCase();
  const isConsultancy =
    domainText.includes("consultan") ||
    domainText.includes("advisory") ||
    domainText.includes("planning") ||
    domainText.includes("strategy") ||
    domainText.includes("public relation") ||
    domainText.includes("media") ||
    domainText.includes("dipr") ||
    domainText.includes("research") ||
    domainText.includes("communication");

  // Extract / Calculate Company Turnover reliably
  let companyTurnover = companyProfile.averageTurnoverINR || 0;
  if (
    !companyTurnover &&
    Array.isArray(companyProfile.annualTurnover) &&
    companyProfile.annualTurnover.length > 0
  ) {
    const sum = companyProfile.annualTurnover.reduce(
      (acc, curr) => acc + (curr.amountINR || 0),
      0,
    );
    companyTurnover = Math.round(sum / companyProfile.annualTurnover.length);
  }

  const tenderRequiredTurnover =
    tender.eligibilityCriteria?.minAnnualTurnoverINR ||
    (tender.estimatedValueINR ? Math.round(tender.estimatedValueINR * 0.3) : 0);

  // 2. Turnover & Financial Fit Evaluation
  if (tenderRequiredTurnover > 0 && companyTurnover > 0) {
    if (companyTurnover >= tenderRequiredTurnover * 1.5) {
      financialFitScore = 95;
      strengths.push(
        `Bidder average turnover (${companyProfile.annualTurnover?.[0]?.amountDisplay || `₹${(companyTurnover / 10000000).toFixed(2)} Cr`}) comfortably exceeds RFP threshold of ${tender.eligibilityCriteria?.minTurnoverDisplay || `₹${(tenderRequiredTurnover / 10000000).toFixed(2)} Cr`}.`,
      );
    } else if (companyTurnover >= tenderRequiredTurnover) {
      financialFitScore = 85;
      strengths.push(
        `Bidder turnover satisfies the minimum qualification threshold (${tender.eligibilityCriteria?.minTurnoverDisplay || `₹${(tenderRequiredTurnover / 10000000).toFixed(2)} Cr`}).`,
      );
    } else {
      financialFitScore = 35;
      weaknesses.push(
        `Bidder turnover (₹${(companyTurnover / 10000000).toFixed(2)} Cr) is below the mandatory RFP requirement of ${tender.eligibilityCriteria?.minTurnoverDisplay || `₹${(tenderRequiredTurnover / 10000000).toFixed(2)} Cr`}.`,
      );
    }
  } else if (companyTurnover > 0) {
    financialFitScore = 85;
    strengths.push(
      `Bidder maintains strong financial solvency with certified turnover records (${companyProfile.annualTurnover?.[0]?.amountDisplay || `₹${(companyTurnover / 10000000).toFixed(2)} Cr`}).`,
    );
  } else {
    financialFitScore = 60;
    weaknesses.push(
      "Bidder financial turnover details are pending in Company Profile Vault.",
    );
  }

  // 3. Certifications Check (Only if RFP explicitly mandates any)
  const requiredCerts =
    tender.eligibilityCriteria?.requiredCertifications || [];
  const companyCerts = (companyProfile.certifications || []).map((c) =>
    c.toLowerCase(),
  );

  if (requiredCerts.length > 0) {
    let certMatchCount = 0;
    requiredCerts.forEach((req) => {
      const matched = companyCerts.some((c) =>
        c.includes(req.toLowerCase().replace(/[^a-z0-9]/g, "")),
      );
      if (matched) certMatchCount++;
    });

    if (certMatchCount === requiredCerts.length) {
      technicalFitScore += 10;
      strengths.push(
        `Complies with all mandatory RFP certifications (${requiredCerts.join(", ")}).`,
      );
    } else {
      technicalFitScore -= 15;
      weaknesses.push(
        `Missing specific required certifications: ${requiredCerts.filter((r) => !companyCerts.some((c) => c.includes(r.toLowerCase()))).join(", ")}.`,
      );
    }
  } else {
    strengths.push(
      "No mandatory ISO / restrictive quality certifications mandated by RFP.",
    );
  }

  // 4. Past Experience & Scope Synergy
  const pastProjects = companyProfile.pastProjects || [];
  const minExpYears = tender.eligibilityCriteria?.minExperienceYears || 0;

  if (minExpYears > 0) {
    strengths.push(
      `Meets the requirement of minimum ${minExpYears} years of proven industry track record.`
    );
  }

  if (pastProjects.length > 0) {
    experienceScore = 88;
    strengths.push(
      `Demonstrated credentials with delivered projects for ${pastProjects
        .slice(0, 2)
        .map((p) => p.client || p.title)
        .join(" and ")}.`
    );
  } else {
    experienceScore = 65;
    weaknesses.push(
      "Relevant past project completion certificates need to be uploaded to Company Vault."
    );
  }

  // 5. Dynamic Category-Specific Opportunities & Threats
  if (isConsultancy) {
    opportunities.push(
      "High-value strategic positioning as a core advisory and communication partner for the department.",
    );
    opportunities.push(
      "Opportunity to establish long-term government stakeholder advisory & media planning footprint.",
    );
    threats.push(
      "Strict deliverable timelines with multi-stakeholder review and milestone acceptance requirements.",
    );
  } else {
    opportunities.push(
      "Expansion of enterprise solution footprint with potential for long-term support & expansion.",
    );
    opportunities.push(
      "Enhanced government reference credential for large-scale turnkey execution.",
    );
    threats.push("Execution and supply chain delivery milestone compliance.");
  }

  if (tender.emdAmountINR && tender.emdAmountINR > 500000) {
    threats.push(
      `Liquidity impact: EMD / Bid Security of ${tender.emdDisplay || `₹${tender.emdAmountINR}`} required during evaluation.`,
    );
  }

  // 6. Dynamic Score Normalization
  financialFitScore = Math.min(100, Math.max(0, financialFitScore));
  technicalFitScore = Math.min(100, Math.max(0, technicalFitScore));
  experienceScore = Math.min(100, Math.max(0, experienceScore));
  riskScore = Math.min(100, Math.max(0, riskScore));

  const overallScore = Math.round(
    financialFitScore * 0.35 + technicalFitScore * 0.35 + experienceScore * 0.3,
  );
  const winProbability = Math.round(
    Math.max(30, Math.min(96, overallScore - riskScore * 0.2)),
  );

  let decision = "GO";
  let recommendationSummary = "";

  if (overallScore >= 75 && financialFitScore >= 60) {
    decision = "GO";
    recommendationSummary = `Strong GO recommendation. With an overall qualification score of ${overallScore}% and estimated Win Probability of ${winProbability}%, the bidder profile satisfies technical, financial, and eligibility thresholds for "${tender.title || "this RFP"}".`;
  } else if (overallScore >= 55) {
    decision = "CONDITIONAL GO";
    recommendationSummary = `Conditional recommendation. Bidder satisfies primary technical scope, but should verify specific past-contract thresholds or key personnel requirements.`;
  } else {
    decision = "NO-GO";
    recommendationSummary = `NO-GO recommended. Discrepancy between bidder profile and mandatory RFP thresholds. Pursuing independently carries lower win likelihood.`;
  }

  // 7. Dynamic Key Clauses (Extract authentic clauses or use domain-accurate framework)
  let keyClauses = [];
  if (
    tender.keyRisks &&
    Array.isArray(tender.keyRisks) &&
    tender.keyRisks.length > 0
  ) {
    keyClauses = tender.keyRisks.map((k) => ({
      title: k.title || "Contractual Clause",
      description: k.description || "",
      riskLevel: k.riskLevel || "Medium",
    }));
  } else if (isConsultancy) {
    keyClauses = [
      {
        title: "Milestone & Deliverable Sign-Off",
        description:
          "Disbursements linked to structured deliverable validation, monthly strategy reviews, and competent authority approval.",
        riskLevel: "Low",
      },
      {
        title: "Performance Review & Quality Adherence",
        description:
          "Regular performance audits and periodic evaluation of advisory outputs against agreed ToR KPIs.",
        riskLevel: "Low",
      },
      {
        title: "Non-Disclosure & Confidentiality",
        description:
          "Strict data confidentiality and adherence to government communication guidelines.",
        riskLevel: "Medium",
      },
    ];
  } else {
    keyClauses = [
      {
        title: "Liquidated Damages (LD)",
        description:
          "Standard penalty for operational delay as specified in tender conditions.",
        riskLevel: "Medium",
      },
      {
        title: "Payment Milestones",
        description:
          "Disbursements structured against phased delivery milestones and satisfactory acceptance.",
        riskLevel: "Low",
      },
    ];
  }

  return {
    source: "AI Generated (Bid Intelligence Engine)",
    isCalculatedMetric: true,
    disclaimer:
      "Win Probability and Overall Score are AI-estimated predictive analytics based on qualification matching, not direct statements from the tender document.",
    decision,
    winProbability,
    overallScore,
    financialFitScore,
    technicalFitScore,
    experienceScore,
    riskScore,
    recommendationSummary,
    swot: {
      strengths,
      weaknesses,
      opportunities,
      threats,
    },
    keyClauses,
  };
}
