/**
 * Algorithmic & AI Go / No-Go Decision Engine
 */
export function calculateGoNoGoScore(tender, companyProfile) {
  let financialFitScore = 75;
  let technicalFitScore = 80;
  let experienceScore = 75;
  let riskScore = 20;

  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  const threats = [];

  const companyTurnover = companyProfile.averageTurnoverINR || 38000000;
  const tenderEstimatedVal = tender.estimatedValueINR || 25000000;
  const tenderRequiredTurnover =
    tender.eligibilityCriteria?.minAnnualTurnoverINR ||
    Math.round(tenderEstimatedVal * 0.5);

  // 1. Turnover comparison
  if (companyTurnover >= tenderRequiredTurnover * 1.5) {
    financialFitScore = 95;
    strengths.push(
      `Company average turnover (${companyProfile.annualTurnover?.[0]?.amountDisplay || "₹3.8+ Cr"}) comfortably exceeds tender minimum requirement.`,
    );
  } else if (companyTurnover >= tenderRequiredTurnover) {
    financialFitScore = 82;
    strengths.push(
      "Company turnover meets the minimum qualification threshold.",
    );
  } else {
    financialFitScore = 40;
    weaknesses.push(
      "Company turnover falls below the prescribed minimum annual turnover requirement.",
    );
  }

  // 2. Certifications check
  const companyCerts = (companyProfile.certifications || []).map((c) =>
    c.toLowerCase(),
  );
  const requiredCerts = tender.eligibilityCriteria?.requiredCertifications || [
    "ISO 9001",
    "ISO 27001",
  ];
  let certMatchCount = 0;

  requiredCerts.forEach((req) => {
    const matched = companyCerts.some((c) =>
      c.includes(req.toLowerCase().replace(/[^a-z0-9]/g, "")),
    );
    if (matched) {
      certMatchCount++;
    }
  });

  if (certMatchCount === requiredCerts.length) {
    technicalFitScore += 10;
    strengths.push(
      `Fully complies with all mandatory ISO and quality certifications (${requiredCerts.join(", ")}).`,
    );
  } else {
    technicalFitScore -= 15;
    weaknesses.push(
      `Missing certified credentials: ${requiredCerts.slice(certMatchCount).join(", ")}.`,
    );
  }

  // 3. Past Project Relevance
  const pastProjects = companyProfile.pastProjects || [];
  const maxProjectValue = Math.max(
    ...pastProjects.map((p) => p.valueINR || 0),
    0,
  );

  if (maxProjectValue >= tenderEstimatedVal * 0.4) {
    experienceScore = 90;
    strengths.push(
      `Strong credential: has successfully delivered similar high-value projects (${pastProjects[0]?.title || "ICCC Platform"}).`,
    );
  } else {
    experienceScore = 60;
    weaknesses.push(
      "Past project values are lower than the standard 40-50% tender benchmark.",
    );
  }

  // 4. Opportunities & Threats
  opportunities.push(
    "Long term high-margin AMC / support annuity revenue potential.",
  );
  opportunities.push(
    "Expansion of reference profile in prestigious government procurement domain.",
  );

  threats.push(
    "Liquidated damages (LD) penalties in case of hardware delivery chain delays.",
  );
  if (tender.emdAmountINR > 1000000) {
    threats.push(
      "High EMD / Bid Security blocking liquidity during technical evaluation cycle.",
    );
  }

  // Normalize scores
  financialFitScore = Math.min(100, Math.max(0, financialFitScore));
  technicalFitScore = Math.min(100, Math.max(0, technicalFitScore));
  experienceScore = Math.min(100, Math.max(0, experienceScore));
  riskScore = Math.min(100, Math.max(0, riskScore));

  const overallScore = Math.round(
    financialFitScore * 0.35 + technicalFitScore * 0.35 + experienceScore * 0.3,
  );
  const winProbability = Math.round(
    Math.max(30, Math.min(96, overallScore - riskScore * 0.25)),
  );

  let decision = "GO";
  let recommendationSummary = "";

  if (overallScore >= 75 && financialFitScore >= 60) {
    decision = "GO";
    recommendationSummary = `Strong GO recommendation. With an overall qualification score of ${overallScore}% and Win Probability of ${winProbability}%, our company profile comfortably satisfies technical, financial, and certification thresholds.`;
  } else if (overallScore >= 55) {
    decision = "CONDITIONAL GO";
    recommendationSummary = `Conditional recommendation. Satisfies majority of technical scope, but consider partnering with a consortium / OEM member to mitigate past single-contract size or specific certification gaps.`;
  } else {
    decision = "NO-GO";
    recommendationSummary = `NO-GO recommended. High discrepancy between company financial turnover / past project criteria and mandatory RFP requirements. Pursuing this independently carries low win likelihood.`;
  }

  return {
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
    keyClauses: tender.goNoGoAnalysis?.keyClauses || [
      {
        title: "Liquidated Damages",
        description:
          "0.5% per week of delay up to maximum 10% of total contract value.",
        riskLevel: "Medium",
      },
      {
        title: "SLA & Uptime",
        description: "99.5% service uptime required with 4-hour MTTR response.",
        riskLevel: "Low",
      },
      {
        title: "Payment Milestones",
        description:
          "60% on delivery/installation, 20% on UAT signoff, 20% quarterly milestone.",
        riskLevel: "Low",
      },
    ],
  };
}
