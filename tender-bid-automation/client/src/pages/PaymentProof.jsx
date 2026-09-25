import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { SectionTitle } from "../components/Common";
import { tenderAPI } from "../services/api";

export default function PaymentProof({ activeTender, setActive }) {
  const [mode, setMode] = useState("Demand Draft (DD)");
  const [saved, setSaved] = useState(true);
  const [utr, setUtr] = useState("DD-849201934");
  const [amount, setAmount] = useState("₹50,000");
  const [bank, setBank] = useState("State Bank of India · Lucknow Branch");
  const [issueDate, setIssueDate] = useState("21 Sep 2026");

  useEffect(() => {
    if (activeTender) {
      if (activeTender.emdDisplay) {
        setAmount(activeTender.emdDisplay);
      } else if (activeTender.emdAmountINR) {
        setAmount(
          `₹${Number(activeTender.emdAmountINR).toLocaleString("en-IN")}`,
        );
      }
    }
  }, [activeTender]);

  const handleSavePayment = async () => {
    try {
      if (activeTender?.id) {
        await tenderAPI.savePaymentProof(activeTender.id, {
          mode,
          instrumentNumber: utr,
          amount,
          issuingBank: bank,
          issueDate,
        });
      }
      setSaved(true);
      toast.success("Payment instrument details saved successfully!");
    } catch (err) {
      toast.error("Failed to save payment proof details");
    }
  };

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb">
            <span>Bid workspace</span>
            <ChevronRight size={13} />
            <strong>Payment Proof</strong>
          </div>
          <h1>Lock in your fee & EMD proof.</h1>
          <p>
            Generate Cover-1 receipt slips mapped directly to tender{" "}
            <strong>{activeTender?.title}</strong>.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary cursor-pointer"
            onClick={() =>
              toast.success("Instrument slip downloaded", {
                description: "PDF ready for Cover-1 physical bundle.",
              })
            }
          >
            <Download size={16} /> Download slip
          </button>
          <button
            className="button button-primary cursor-pointer"
            onClick={() => {
              setActive("Proposal Desk");
              toast.success("Navigating to Proposal Desk");
            }}
          >
            Go to Proposal Desk <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="content-grid payment-grid fade-up delay-1">
        <section className="panel">
          <SectionTitle
            eyebrow="INSTRUMENT DETAILS"
            title="Tender fee & EMD record"
            detail="Values will auto-fill into Form-1 Covering Letter and PDF Cover-1 slip."
          />

          <div className="form-grid">
            <label>
              <span>Instrument type</span>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setSaved(false);
                }}
              >
                <option>Demand Draft (DD)</option>
                <option>Bank Guarantee (BG)</option>
                <option>RTGS / NEFT Transfer</option>
                <option>MSME Exemption Certificate</option>
              </select>
            </label>

            <label>
              <span>Transaction Ref / DD Number</span>
              <input
                value={utr}
                onChange={(e) => {
                  setUtr(e.target.value);
                  setSaved(false);
                }}
                placeholder="e.g. UTR / Instrument No."
              />
            </label>

            <label>
              <span>Amount</span>
              <input
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSaved(false);
                }}
              />
            </label>

            <label>
              <span>Issuing Bank & Branch</span>
              <input
                value={bank}
                onChange={(e) => {
                  setBank(e.target.value);
                  setSaved(false);
                }}
              />
            </label>

            <label>
              <span>Date of Issue</span>
              <input
                value={issueDate}
                onChange={(e) => {
                  setIssueDate(e.target.value);
                  setSaved(false);
                }}
              />
            </label>

            <label>
              <span>Beneficiary / Favouring</span>
              <input
                value={
                  activeTender?.organization ||
                  "Managing Director, UPSTDC Ltd."
                }
                readOnly
              />
            </label>
          </div>

          <div className="payment-submit-row">
            <button
              className="button button-secondary cursor-pointer"
              onClick={handleSavePayment}
            >
              {saved ? (
                <>
                  <Check size={16} /> Saved
                </>
              ) : (
                "Save details"
              )}
            </button>
            <span className="helper-text">
              <ShieldCheck size={14} className="text-[#18794e]" />
              Attached to Cover-1 statutory annexure package.
            </span>
          </div>
        </section>

        <section className="panel receipt-panel">
          <SectionTitle
            eyebrow="AUTO-GENERATED SLIP"
            title="Cover-1 slip preview"
            action={
              <span className="small-link">
                Cover 1 <ArrowUpRight size={14} />
              </span>
            }
          />
          <div className="receipt-paper">
            <div className="paper-head">
              <div>
                <strong>TECH SOLUTIONS PVT LTD</strong>
                <small>GSTIN 18AABCT1234F1ZP</small>
              </div>
              <span className="stamp-badge">
                <Landmark size={14} /> Verified
              </span>
            </div>
            <div className="fake-receipt">
              <span>{bank.toUpperCase()}</span>
              <strong>DEMAND DRAFT / PAYMENT ACKNOWLEDGEMENT</strong>
              <small>
                NO. {utr} · FAVOURING{" "}
                {activeTender?.organization?.slice(0, 30) || "UPSTDC Ltd."}
              </small>
            </div>
            <div className="paper-footer">
              Cover 1 <span>Auto-generated preview</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
