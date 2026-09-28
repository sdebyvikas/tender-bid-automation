import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Copy,
  CreditCard,
  FileText,
  FolderLock,
  LockKeyhole,
  MoreHorizontal,
  PenLine,
  Plus,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  StatusPill,
  IconButton,
  SectionTitle,
  pipeline,
} from "../components/Common";

export default function Overview({
  tenders,
  activeTender,
  selectedTenderId,
  onSelectTender,
  setActive,
  setStage,
  onOpenUploadModal,
}) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const actionItems = [
    {
      icon: AlertTriangle,
      title: "ISO 27001 certificate expires soon",
      text: "Renew before 31 Oct 2026 to keep eligibility coverage.",
      tone: "amber",
      action: "Review vault",
      target: "Company Vault",
    },
    {
      icon: CreditCard,
      title: "Add EMD payment proof",
      text: `Tender ${activeTender?.tenderNumber || activeTender?.reference || activeTender?.title || "Active Tender"} is waiting for its Cover-1 instrument.`,
      tone: "blue",
      action: "Add proof",
      target: "Payment Proof",
    },
    {
      icon: PenLine,
      title: "Review methodology draft",
      text: "AI proposal drafts are ready for human review before binding.",
      tone: "green",
      action: "Open editor",
      target: "Proposal Desk",
    },
  ];

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>Overview</strong>
          </div>
          <h1>
            Good morning, Arjun <span className="heading-spark">✦</span>
          </h1>
          <p>
            Here’s the pulse of your bid workspace. {tenders.length} active
            tenders loaded.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary cursor-pointer"
            onClick={() => toast.success("Workspace link copied to clipboard")}
          >
            <Copy size={16} /> Share workspace
          </button>
          <button
            className="button button-primary cursor-pointer"
            onClick={onOpenUploadModal}
          >
            <Plus size={17} /> New tender
          </button>
        </div>
      </div>

      <div className="metric-grid fade-up delay-1">
        <div className="metric-card metric-primary">
          <div className="metric-top">
            <span className="metric-label">Active tenders</span>
            <span className="metric-icon">
              <BriefcaseBusiness size={17} />
            </span>
          </div>
          <div className="metric-value">{tenders.length || 12}</div>
          <div className="metric-foot">
            <span className="metric-positive">
              <ArrowUpRight size={14} /> 18.2%
            </span>
            <span>vs last month</span>
          </div>
          <div className="sparkline sparkline-navy">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Vault readiness</span>
            <span className="metric-icon metric-icon-green">
              <FolderLock size={17} />
            </span>
          </div>
          <div className="metric-value">
            96<span className="metric-unit">%</span>
          </div>
          <div className="metric-foot">
            <span className="metric-positive">
              <ArrowUpRight size={14} /> 4.8%
            </span>
            <span>this quarter</span>
          </div>
          <div className="progress-track">
            <span style={{ width: "96%" }} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Avg. preparation time</span>
            <span className="metric-icon metric-icon-purple">
              <Zap size={17} />
            </span>
          </div>
          <div className="metric-value">
            34<span className="metric-unit">m</span>
          </div>
          <div className="metric-foot">
            <span className="metric-positive">
              <ArrowDownRight size={14} /> 41.5%
            </span>
            <span>vs manual process</span>
          </div>
          <div className="sparkline sparkline-purple">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Potential bid value</span>
            <span className="metric-icon metric-icon-gold">
              <CircleDollarSign size={17} />
            </span>
          </div>
          <div className="metric-value metric-value-money">
            ₹18.4<span className="metric-unit">Cr</span>
          </div>
          <div className="metric-foot">
            <span className="metric-positive">
              <ArrowUpRight size={14} /> 12.6%
            </span>
            <span>across open bids</span>
          </div>
          <div className="sparkline sparkline-gold">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>

      {/* BID COMMAND CENTER CARD */}
      <section className="workflow-card fade-up delay-2">
        <div className="workflow-topline">
          <div>
            <div className="eyebrow eyebrow-light flex items-center gap-2">
              BID COMMAND CENTER <span className="live-dot" /> LIVE WORKFLOW
              {tenders.length > 1 && (
                <span className="ml-2 text-xs text-emerald-300 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/40">
                  {tenders.findIndex((t) => t.id === activeTender?.id) + 1} of{" "}
                  {tenders.length} Active
                </span>
              )}
            </div>
            <h2>
              {activeTender?.tenderNumber || activeTender?.reference ? (
                <>
                  {activeTender?.tenderNumber || activeTender?.reference}{" "}
                  <span>·</span>{" "}
                </>
              ) : null}
              {activeTender?.title || "Tender Overview"}
            </h2>
            <p>
              {activeTender?.organization || activeTender?.authority || "-"}{" "}
              <span className="workflow-separator">·</span> Due{" "}
              {activeTender?.due ||
                (activeTender?.submissionDeadline
                  ? new Date(
                      activeTender.submissionDeadline,
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-")}
            </p>
          </div>
          <div className="workflow-actions">
            <StatusPill tone={activeTender?.statusType || "amber"}>
              {activeTender?.status || "In review"}
            </StatusPill>
            <IconButton
              label="More tender actions"
              onClick={() => toast("Tender operations menu")}
            >
              <MoreHorizontal size={18} />
            </IconButton>
          </div>
        </div>

        <div className="workflow-body">
          <div className="workflow-score-wrap">
            <div className="score-ring">
              <div>
                <strong>
                  {activeTender?.goNoGoAnalysis?.overallScore ||
                    activeTender?.score ||
                    "82.5"}
                </strong>
                <small>/ 100</small>
              </div>
            </div>
            <div>
              <span className="score-kicker">Readiness score</span>
              <strong className="score-status">
                {activeTender?.goNoGoAnalysis?.decision || "Good to proceed"}
              </strong>
              <p>
                {activeTender?.goNoGoAnalysis?.recommendationSummary ||
                  "2 checkpoints need your attention"}
              </p>
            </div>
          </div>

          <div className="workflow-progress">
            <div className="workflow-progress-line" />
            <div className="pipeline-steps">
              {pipeline.map((step) => {
                const StepIcon = step.icon;
                const active = step.id === 3;
                return (
                  <button
                    key={step.id}
                    className={`pipeline-step ${step.state} ${active ? "pipeline-active" : ""}`}
                    onClick={() => {
                      setStage(step.id);
                      setActive(step.label);
                    }}
                  >
                    <span className="pipeline-node">
                      {step.state === "done" ? (
                        <Check size={16} strokeWidth={2.6} />
                      ) : (
                        <StepIcon size={16} />
                      )}
                    </span>
                    <span className="pipeline-copy">
                      <strong>{step.label}</strong>
                      <small>{step.sub}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="workflow-bottom">
          <div className="workflow-note">
            <Sparkles size={16} />
            <span>
              Next best action:{" "}
              <strong>Review compliance gates & generated proposal</strong>
            </span>
          </div>
          <button
            className="workflow-link cursor-pointer"
            onClick={() => {
              if (activeTender?.id) {
                navigate(`/intake/${activeTender.id}/eligibility`);
              } else {
                navigate("/intake");
              }
            }}
          >
            Open bid workflow <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* CONTENT GRID: Action Queue & Document Coverage */}
      <div className="content-grid fade-up delay-3">
        <section className="panel action-panel">
          <SectionTitle
            eyebrow="ATTENTION NEEDED"
            title="Action queue"
            detail="Small steps that keep your bid moving."
            action={<span className="count-badge">03</span>}
          />
          <div className="action-list">
            {(showAll ? actionItems : actionItems.slice(0, 2)).map((item) => {
              const ItemIcon = item.icon;
              return (
                <div className="action-item" key={item.title}>
                  <div className={`action-icon action-${item.tone}`}>
                    <ItemIcon size={17} />
                  </div>
                  <div className="action-copy">
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                    <button
                      className="cursor-pointer"
                      onClick={() => {
                        setActive(item.target);
                        toast(item.action, {
                          description: `Navigating to ${item.target}`,
                        });
                      }}
                    >
                      {item.action} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="text-button cursor-pointer"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show less" : "View all actions"}{" "}
            <ArrowUpRight size={15} />
          </button>
        </section>

        <section className="panel coverage-panel">
          <SectionTitle
            eyebrow="DOCUMENT COVERAGE"
            title="Vault health"
            detail="Documents mapped to your active tenders."
            action={
              <button
                className="small-link cursor-pointer"
                onClick={() => setActive("Company Vault")}
              >
                Manage vault <ArrowUpRight size={14} />
              </button>
            }
          />
          <div className="coverage-overview">
            <div className="coverage-ring">
              <div>
                <strong>96%</strong>
                <small>ready</small>
              </div>
            </div>
            <div className="coverage-legend">
              <div>
                <span className="legend-color legend-green" />
                <span>Verified</span>
                <strong>48</strong>
              </div>
              <div>
                <span className="legend-color legend-amber" />
                <span>Expiring soon</span>
                <strong>3</strong>
              </div>
              <div>
                <span className="legend-color legend-gray" />
                <span>Missing</span>
                <strong>1</strong>
              </div>
            </div>
          </div>
          <div className="coverage-insight">
            <ShieldCheck size={15} />
            <span>
              Your company profile meets the baseline for{" "}
              <strong>8 of 9</strong> open tenders.
            </span>
          </div>
        </section>
      </div>

      {/* OPEN BID PIPELINE TABLE */}
      <section className="panel tenders-panel fade-up delay-4">
        <SectionTitle
          eyebrow="OPEN BID PIPELINE"
          title="Recent tenders"
          detail="Click on any tender to make it active across all 6 workspace steps."
          action={
            <button
              className="button button-ghost cursor-pointer"
              onClick={() => navigate("/intake")}
            >
              View all tenders <ArrowUpRight size={15} />
            </button>
          }
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tender</th>
                <th>Authority</th>
                <th>Due date</th>
                <th>Readiness</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tenders.map((row) => {
                const isCurrent = activeTender?.id === row.id;
                return (
                  <tr
                    key={row.id || row.reference}
                    className={isCurrent ? "bg-emerald-50/60 font-medium" : ""}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      onSelectTender(row);
                      navigate(`/intake/${row.id}/overview`);
                      toast.success(
                        `Active tender switched to: ${row.title || row.tenderNumber}`,
                      );
                    }}
                  >
                    <td>
                      <div className="tender-name">
                        <span
                          className={`tender-file ${isCurrent ? "bg-[#173C40] text-white" : ""}`}
                        >
                          <FileText size={15} />
                        </span>
                        <div>
                          <strong className="flex items-center gap-1.5">
                            {row.title}
                            {isCurrent && (
                              <span className="text-[10px] bg-[#18794e] text-white px-1.5 py-0.2 rounded-full uppercase font-bold tracking-wider">
                                Active
                              </span>
                            )}
                          </strong>
                          <small>{row.tenderNumber || row.reference}</small>
                        </div>
                      </div>
                    </td>
                    <td>{row.organization || row.authority || "-"}</td>
                    <td>
                      <span className="date-cell">
                        <CalendarDays size={14} />
                        {row.due ||
                          (row.submissionDeadline
                            ? new Date(
                                row.submissionDeadline,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-")}
                      </span>
                    </td>
                    <td>
                      <div className="readiness">
                        <span className="readiness-bar">
                          <i
                            style={{
                              width: `${row.goNoGoAnalysis?.overallScore || row.score || 80}%`,
                            }}
                          />
                        </span>
                        <strong>
                          {row.goNoGoAnalysis?.overallScore ||
                            row.score ||
                            "82.5"}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <StatusPill
                        tone={
                          row.statusType ||
                          (row.goNoGoAnalysis?.decision === "GO"
                            ? "green"
                            : "amber")
                        }
                      >
                        {row.status ||
                          row.goNoGoAnalysis?.decision ||
                          "In review"}
                      </StatusPill>
                    </td>
                    <td>
                      <IconButton
                        label={`Open ${row.tenderNumber || row.reference}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTender(row);
                          navigate(`/intake/${row.id}/overview`);
                          toast("Tender loaded in workspace", {
                            description: row.title,
                          });
                        }}
                      >
                        <ChevronRight size={17} />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="disclaimer-strip">
        <LockKeyhole size={15} />
        <span>
          Prototype mode — AI extraction, document generation and PDF processing
          are fully connected to your local backend engine.
        </span>
        <button
          className="cursor-pointer"
          onClick={() =>
            toast("AI Backend Connected", {
              description:
                "AI document parser, Go/No-Go score engine, and PDF export are live.",
            })
          }
        >
          Why?
        </button>
      </div>
    </>
  );
}
