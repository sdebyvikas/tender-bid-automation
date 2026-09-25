import React, { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  LockKeyhole,
  MoreHorizontal,
  Zap,
} from "lucide-react";
import { StatusPill, IconButton, SectionTitle } from "../components/Common";
import { exportAPI } from "../services/api";

export default function PdfBinder({ activeTender }) {
  const [items, setItems] = useState([
    "Tender fee & EMD proof",
    "Covering letter",
    "Power of Attorney",
    "Non-blacklisting affidavit",
    "Approach & Methodology",
    "Key personnel CVs",
    "CA turnover & financials",
    "GST, PAN & ISO copies",
  ]);
  const [selected, setSelected] = useState(0);
  const [exporting, setExporting] = useState(false);

  const move = (direction) => {
    setItems((current) => {
      const next = [...current];
      const target = selected + direction;
      if (target < 0 || target >= next.length) return next;
      [next[selected], next[target]] = [next[target], next[selected]];
      setSelected(target);
      return next;
    });
  };

  const handleExportMasterPDF = async () => {
    setExporting(true);
    try {
      const tenderId = activeTender?.id || "tender_ele_93";
      await exportAPI.downloadPackage(tenderId, "pdf", [
        "executiveSummary",
        "technicalApproach",
        "complianceMatrix",
        "boqSummary",
      ]);
      toast.success("Master PDF Bid Package downloaded successfully!");
    } catch (err) {
      toast.error("Failed to export master PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb">
            <span>Bid workspace</span>
            <ChevronRight size={13} />
            <strong>PDF Binder</strong>
          </div>
          <h1>One package. No loose ends.</h1>
          <p>
            Continuous stamped compilation for{" "}
            <strong>{activeTender?.title}</strong>.
          </p>
        </div>
        <div className="heading-actions">
          <StatusPill tone="green">Ready · 44 pages</StatusPill>
          <button
            className="button button-primary cursor-pointer"
            onClick={handleExportMasterPDF}
            disabled={exporting}
          >
            <Download size={16} />{" "}
            {exporting ? "Generating Master PDF..." : "Export master PDF"}
          </button>
        </div>
      </div>

      <div className="binder-layout fade-up delay-1">
        <section className="panel sequence-panel">
          <SectionTitle
            eyebrow="DOCUMENT SEQUENCE"
            title="Drag-ready binder"
            detail="The order below becomes the continuous page sequence."
            action={
              <button
                className="small-link cursor-pointer"
                onClick={() =>
                  toast("Auto-sort applied", {
                    description: "Recommended cover sequence restored.",
                  })
                }
              >
                Auto-sort <Zap size={14} />
              </button>
            }
          />

          <div className="sequence-list">
            {items.map((item, index) => (
              <button
                className={`sequence-row cursor-pointer ${selected === index ? "selected" : ""}`}
                key={item}
                onClick={() => setSelected(index)}
              >
                <span className="drag-dots">⠿</span>
                <span className="sequence-num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="sequence-copy">
                  <strong>{item}</strong>
                  <small>
                    {index === 0
                      ? "Cover 1 · 2 pages"
                      : index < 5
                        ? "Cover 2 · Letterhead"
                        : "Cover 2 · Vault document"}
                  </small>
                </span>
                <span className="sequence-pages">
                  {index === 0
                    ? "02"
                    : index === 4
                      ? "05"
                      : index === 5
                        ? "12"
                        : "03"}{" "}
                  pp
                </span>
                <MoreHorizontal size={16} />
              </button>
            ))}
          </div>

          <div className="sequence-controls">
            <span>
              Selected: <strong>{items[selected]}</strong>
            </span>
            <div>
              <button
                className="button button-secondary cursor-pointer"
                onClick={() => move(-1)}
                disabled={selected === 0}
              >
                Move up
              </button>
              <button
                className="button button-secondary cursor-pointer"
                onClick={() => move(1)}
                disabled={selected === items.length - 1}
              >
                Move down
              </button>
            </div>
          </div>
        </section>

        <aside className="binder-preview">
          <div className="binder-preview-head">
            <div>
              <span className="eyebrow">LIVE PREVIEW</span>
              <h2>Master bid package</h2>
            </div>
            <IconButton
              label="More preview actions"
              onClick={() => toast("Preview options")}
            >
              <MoreHorizontal size={17} />
            </IconButton>
          </div>

          <div className="pdf-sheet">
            <div className="pdf-cover-brand">
              <span className="paper-logo">TS</span>
              <div>
                <strong>TECH SOLUTIONS</strong>
                <small>PRIVATE LIMITED</small>
              </div>
            </div>
            <div className="pdf-cover-label">TECHNICAL BID</div>
            <h3 className="line-clamp-2">
              {activeTender?.title || "Adventure & Water Sports Portal"}
            </h3>
            <div className="pdf-cover-meta">
              <span>
                Tender Ref
                <strong>
                  {activeTender?.tenderNumber ||
                    activeTender?.reference ||
                    "TDR-996534"}
                </strong>
              </span>
              <span>
                Client
                <strong>
                  {activeTender?.organization?.slice(0, 28) || "UPSTDC Ltd."}
                </strong>
              </span>
            </div>
            <div className="pdf-cover-stamp">
              MASTER
              <br />
              PACKAGE
            </div>
            <div className="pdf-page-number">
              01 <span>of 44</span>
            </div>
          </div>

          <div className="binder-footer">
            <div>
              <CheckCircle2 size={16} />
              <span>
                <strong>8 documents</strong>
                <small>44 pages · stamped & indexed</small>
              </span>
            </div>
            <button
              className="button button-primary cursor-pointer"
              onClick={() => toast.success("Table of contents refreshed")}
            >
              Refresh index <Zap size={15} />
            </button>
          </div>
        </aside>
      </div>

      <div className="disclaimer-strip">
        <LockKeyhole size={15} />
        <span>
          Financial BoQ remains separate from this technical package — pricing
          is always a human decision.
        </span>
        <button
          className="cursor-pointer"
          onClick={() => toast("BoQ separation is a core compliance rule")}
        >
          Learn more
        </button>
      </div>
    </>
  );
}
