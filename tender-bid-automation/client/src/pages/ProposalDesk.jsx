import React, { useState } from "react";
import { toast } from "sonner";
import {
  Clock3,
  ChevronDown,
  ChevronRight,
  Copy,
  FileCheck2,
  MoreHorizontal,
  Plus,
  Send,
} from "lucide-react";
import { StatusPill } from "../components/Common";

export default function ProposalDesk({ activeTender, setActive }) {
  const [doc, setDoc] = useState("Executive Summary");
  const docs = [
    "Executive Summary",
    "Approach & Methodology",
    "Implementation Plan",
    "Covering Letter",
    "Key Personnel CVs",
  ];

  const handleRequestReview = () => {
    toast.success("Review request sent to Arjun Mehta", {
      description: "Signatory notified for digital verification.",
    });
  };

  const getDocContent = () => {
    if (doc === "Executive Summary") {
      return (
        activeTender?.proposals?.executiveSummary ||
        `Tech Solutions Pvt Ltd is pleased to submit this comprehensive technical bid for ${activeTender?.title || "this project"}.`
      );
    }
    if (doc === "Approach & Methodology") {
      return (
        activeTender?.proposals?.technicalApproach ||
        `Our technical approach utilizes modular, cloud-ready architecture designed for high availability and strict security adherence under ${activeTender?.organization || "the Department"}.`
      );
    }
    if (doc === "Implementation Plan") {
      return (
        activeTender?.proposals?.implementationPlan ||
        `Phase 1: System Mobilization (Weeks 1-3)\nPhase 2: Deployment & Configuration (Weeks 4-12)\nPhase 3: Integration & UAT (Weeks 13-16)\nPhase 4: Go-Live & SLA Handover (Weeks 17-20)`
      );
    }
    return `Formal document for ${doc} under tender ${activeTender?.tenderNumber || activeTender?.reference}.`;
  };

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb">
            <span>Bid workspace</span>
            <ChevronRight size={13} />
            <strong>Proposal Desk</strong>
          </div>
          <h1>Draft with context. Review with control.</h1>
          <p>
            AI-generated proposal for <strong>{activeTender?.title}</strong>.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary cursor-pointer"
            onClick={() => toast.success("Draft version saved locally")}
          >
            <FileCheck2 size={16} /> Save version
          </button>
          <button
            className="button button-primary cursor-pointer"
            onClick={() => {
              setActive("PDF Binder");
              toast.success("Draft marked ready for binder");
            }}
          >
            Send to binder <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="editor-shell fade-up delay-1">
        <aside className="editor-sidebar">
          <div className="editor-sidebar-head">
            <span className="eyebrow">DOCUMENTS · 05</span>
            <button className="cursor-pointer" onClick={() => toast("New template added")}>
              <Plus size={15} />
            </button>
          </div>
          {docs.map((item, index) => (
            <button
              key={item}
              className={`editor-doc cursor-pointer ${doc === item ? "active" : ""}`}
              onClick={() => setDoc(item)}
            >
              <span className="editor-doc-num">0{index + 1}</span>
              <span>
                <strong>{item}</strong>
                <small>
                  {index === 1 ? "5 pages · Draft" : "AI generated"}
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          ))}

          <div className="clause-card">
            <div className="eyebrow">RFP CLAUSE</div>
            <p>
              {activeTender?.scopeSummary
                ? activeTender.scopeSummary.slice(0, 140) + "..."
                : "“The bidder shall provide an approach that demonstrates delivery governance and SLA adherence.”"}
            </p>
            <button
              className="cursor-pointer"
              onClick={() => toast.success("Clause text copied to draft paper")}
            >
              Use in document <Copy size={13} />
            </button>
          </div>
        </aside>

        <section className="editor-main">
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <button className="toolbar-select">
                Normal text <ChevronDown size={14} />
              </button>
              <span className="toolbar-divider" />
              <button className="toolbar-text bold">B</button>
              <button className="toolbar-text italic">I</button>
              <button className="toolbar-text underline">U</button>
              <span className="toolbar-divider" />
              <button className="toolbar-text">≡</button>
              <button className="toolbar-text">☷</button>
            </div>
            <div className="toolbar-right">
              <StatusPill tone="green">AI Draft Ready</StatusPill>
              <button
                className="icon-button cursor-pointer"
                onClick={() => toast("Document formatting options")}
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>

          <div className="editor-paper">
            <div className="editor-watermark">TECH SOLUTIONS</div>
            <div className="document-meta">
              <span>TECH SOLUTIONS PVT LTD</span>
              <span>
                {activeTender?.tenderNumber || activeTender?.reference}
              </span>
            </div>
            <h2>{doc}</h2>
            <p className="doc-intro">
              Tailored response for {activeTender?.title} issued by{" "}
              {activeTender?.organization}.
            </p>

            <div className="prose text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
              {getDocContent()}
            </div>
            <div className="editor-cursor" />
          </div>

          <div className="editor-footer">
            <span>
              <Clock3 size={14} /> Last saved just now
            </span>
            <span>Page 1 of 4</span>
            <button
              className="button button-primary cursor-pointer"
              onClick={handleRequestReview}
            >
              Request human review <Send size={15} />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
