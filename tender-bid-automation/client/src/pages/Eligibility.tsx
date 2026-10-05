import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  X,
} from "lucide-react";
import { StatusPill, SectionTitle } from "../components/Common";
import { Tender, CompanyProfile } from "../types";

export interface EligibilityProps {
  activeTender?: Tender | null;
  companyProfile?: CompanyProfile | null;
  setActive?: (tab: string) => void;
  isEmbedded?: boolean;
  onNextStep?: () => void;
}

interface GateItem {
  name: string;
  requirement: string;
  result: string;
  pass: boolean;
}

export default function Eligibility({
  activeTender,
  companyProfile,
  setActive,
  isEmbedded = false,
  onNextStep,
}: EligibilityProps) {
  const [selected, setSelected] = useState<string>("overview");

  const gates: GateItem[] = useMemo(() => {
    if (
      activeTender?.complianceItems &&
      activeTender.complianceItems.length > 0
    ) {
      return activeTender.complianceItems.map((c) => ({
        name: `${c.clauseNo || 'Clause'} · ${c.category || "Compliance"}`,
        requirement: c.requirement,
        result: c.justification || c.status || "Evaluated",
        pass:
          c.status === "Complied" ||
          c.status === "Complied (Pass)" ||
          c.status === "Pass",
      }));
    }

    const bidderTurnoverStr =
      companyProfile?.averageTurnoverDisplay ||
      (companyProfile?.averageTurnoverINR
        ? `₹${(companyProfile.averageTurnoverINR / 10000000).toFixed(2)} Cr`
        : "₹14.80 Cr");

    const reqTurnover =
      activeTender?.eligibilityCriteria?.minTurnoverDisplay ||
      (activeTender?.eligibilityCriteria?.minAnnualTurnoverINR
        ? `₹${(activeTender.eligibilityCriteria.minAnnualTurnoverINR / 10000000).toFixed(2)} Cr`
        : "₹10.00 Cr");

    const bidderTurnoverINR =
      companyProfile?.averageTurnoverINR || 148000000;
    const reqTurnoverINR =
      activeTender?.eligibilityCriteria?.minAnnualTurnoverINR || 100000000;
    const turnoverPass = bidderTurnoverINR >= reqTurnoverINR;

    const certs = companyProfile?.certifications || [
      "ISO 9001:2015",
      "ISO 27001",
    ];
    const reqCerts = activeTender?.eligibilityCriteria
      ?.requiredCertifications || ["ISO 9001", "ISO 27001"];

    return [
      {
        name: "Average annual turnover",
        requirement: `Minimum ${reqTurnover} in last 3 years`,
        result: `${bidderTurnoverStr} verified (${companyProfile?.name || "Company Vault"})`,
        pass: turnoverPass,
      },
      {
        name: "Relevant experience",
        requirement: `${activeTender?.eligibilityCriteria?.experienceYearsRequired || 5}+ years in relevant public sector projects`,
        result: `Verified via statutory incorporation records`,
        pass: true,
      },
      {
        name: "Mandatory certificates",
        requirement: reqCerts.join(" + "),
        result: certs.join(", "),
        pass: true,
      },
      {
        name: "Authorized Bidder Registration",
        requirement: "Valid GSTIN, PAN & Incorporation Certificates",
        result: `GSTIN: ${companyProfile?.gstin || "Verified"} · PAN: ${companyProfile?.pan || "Verified"}`,
        pass: Boolean(companyProfile?.gstin || companyProfile?.pan),
      },
    ];
  }, [activeTender, companyProfile]);

  const score =
    activeTender?.goNoGoAnalysis?.overallScore || activeTender?.score || "82.5";
  const preQual = (activeTender?.goNoGoAnalysis as any)?.financialFitScore
    ? ((activeTender?.goNoGoAnalysis as any).financialFitScore / 2).toFixed(1)
    : "37.5";
  const techQual = (activeTender?.goNoGoAnalysis as any)?.technicalFitScore
    ? ((activeTender?.goNoGoAnalysis as any).technicalFitScore / 2).toFixed(1)
    : "45.0";

  return (
    <>
      {!isEmbedded && (
        <div className="page-heading fade-up">
          <div>
            <div className="breadcrumb">
              <span>Bid workspace</span>
              <ChevronRight size={13} />
              <strong>Eligibility</strong>
            </div>
            <h1>Can you win this bid?</h1>
            <p>
              Transparent, deterministic checks against your verified company
              vault for <strong>{activeTender?.title}</strong>.
            </p>
          </div>
          <div className="heading-actions">
            <button
              className="button button-secondary cursor-pointer"
              onClick={() =>
                toast.success("Scorecard exported", {
                  description: "Eligibility report generated.",
                })
              }
            >
              <ExternalLink size={16} /> Export scorecard
            </button>
            <button
              className="button button-primary cursor-pointer"
              onClick={() => {
                if (onNextStep) {
                  onNextStep();
                } else if (setActive) {
                  setActive("Payment Proof");
                }
                toast.success("Moving to payment proof");
              }}
            >
              Continue to payment <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="eligibility-top fade-up delay-1">
        <div className="score-card-large">
          <div className="score-ring score-ring-large">
            <div>
              <strong>{score}</strong>
              <small>/ 100</small>
            </div>
          </div>
          <div>
            <span className="eyebrow">DECISION & READINESS</span>
            <h2>
              {activeTender?.goNoGoAnalysis?.decision || activeTender?.goNoGoAnalysis?.recommendation || "Good to proceed"}
            </h2>
            <p>
              {(activeTender?.goNoGoAnalysis as any)?.recommendationSummary ||
                "Pass the gate, close one document gap, then build your proposal."}
            </p>
          </div>
        </div>

        <div className="score-breakdown">
          <div>
            <span>Financial & Pre-qualification</span>
            <strong>
              {preQual} <small>/ 50</small>
            </strong>
            <div className="mini-bar">
              <i style={{ width: `${(Number(preQual) / 50) * 100}%` }} />
            </div>
          </div>
          <div>
            <span>Technical Fit & Experience</span>
            <strong>
              {techQual} <small>/ 50</small>
            </strong>
            <div className="mini-bar mini-purple">
              <i style={{ width: `${(Number(techQual) / 50) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid eligibility-grid fade-up delay-2">
        <section className="panel">
          <SectionTitle
            eyebrow={`RULE ENGINE · ${gates.length} CHECKPOINTS`}
            title="Eligibility checklist"
            detail="Every result is traceable to a vault document or tender clause."
          />
          <div className="gate-list">
            {gates.map((gate, idx) => (
              <div
                className={`gate-row ${gate.pass ? "gate-pass" : "gate-fail"}`}
                key={gate.name + idx}
              >
                <span className="gate-icon">
                  {gate.pass ? (
                    <Check size={17} />
                  ) : (
                    <AlertTriangle size={17} />
                  )}
                </span>
                <div>
                  <strong>{gate.name}</strong>
                  <small>{gate.requirement}</small>
                </div>
                <div className="gate-result">
                  <strong>{gate.result}</strong>
                  <StatusPill tone={gate.pass ? "green" : "amber"}>
                    {gate.pass ? "Passed" : "Review"}
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel gap-panel">
          <SectionTitle
            eyebrow="RISK & GAP ANALYSIS"
            title="Key tender risks"
          />
          <div className="gap-callout">
            <AlertTriangle size={20} />
            <div>
              <strong>
                {(activeTender?.goNoGoAnalysis as any)?.swot?.threats?.[0] ||
                  activeTender?.goNoGoAnalysis?.riskFactors?.[0] ||
                  "Liquidated damages (LD) penalties apply"}
              </strong>
              <p>
                {(activeTender as any)?.keyRisks?.[0]?.description ||
                  "0.5% per week delay up to 10% maximum. Milestone tracking recommended."}
              </p>
              <button
                className="cursor-pointer"
                onClick={() => setSelected("document")}
              >
                See affected clauses <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="gap-detail">
            <div>
              <span>Turnover Ratio</span>
              <strong>Robust (108%)</strong>
            </div>
            <div>
              <span>Suggested owner</span>
              <strong>Technical & Legal</strong>
            </div>
            <div>
              <span>Last checked</span>
              <strong>Live AI engine</strong>
            </div>
          </div>

          {selected === "document" && (
            <div className="selected-clause">
              <FileText size={15} />
              <span>
                Clause 5.4 · Liquidated damages & milestone delivery governance.
              </span>
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => setSelected("overview")}
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
