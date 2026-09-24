import { useMemo, useState, type ComponentType } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileClock,
  FileText,
  FolderLock,
  Grid2X2,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  Library,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PenLine,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";

type Icon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
type NavKey = "Overview" | "Company Vault" | "Tender Intake" | "Eligibility" | "Payment Proof" | "Proposal Desk" | "PDF Binder";

const navItems: { label: NavKey; icon: Icon; section?: string; badge?: string }[] = [
  { label: "Overview", icon: LayoutDashboard, section: "Workspace" },
  { label: "Company Vault", icon: FolderLock, section: "Workspace", badge: "96%" },
  { label: "Tender Intake", icon: FileText, section: "Bid workspace", badge: "3" },
  { label: "Eligibility", icon: ShieldCheck, section: "Bid workspace" },
  { label: "Payment Proof", icon: CreditCard, section: "Bid workspace" },
  { label: "Proposal Desk", icon: PenLine, section: "Bid workspace" },
  { label: "PDF Binder", icon: Library, section: "Bid workspace", badge: "Draft" },
];

const pipeline = [
  { id: 1, label: "Company Vault", sub: "Profile & documents", icon: FolderLock, state: "done" },
  { id: 2, label: "Tender Intake", sub: "Upload & extract", icon: FileText, state: "done" },
  { id: 3, label: "Eligibility", sub: "Rules & score", icon: ShieldCheck, state: "current" },
  { id: 4, label: "Payment Proof", sub: "Fee & EMD", icon: CreditCard, state: "next" },
  { id: 5, label: "Proposal Desk", sub: "Draft & review", icon: PenLine, state: "next" },
  { id: 6, label: "PDF Binder", sub: "Assemble & export", icon: Library, state: "next" },
];

const tenderRows = [
  { ref: "ELE.93/2024/2", title: "Digital Citizen Services Platform", authority: "Electronics & IT Dept.", due: "24 Sep 2026", status: "In review", statusType: "amber", score: "82.5" },
  { ref: "GEM/2026/B/18402", title: "Cloud Infrastructure Managed Services", authority: "Ministry of Finance", due: "02 Oct 2026", status: "Ready to bid", statusType: "green", score: "91.0" },
  { ref: "UPSDC/IT/2026/117", title: "State Data Centre Modernisation", authority: "UP State Data Centre", due: "11 Oct 2026", status: "Needs attention", statusType: "red", score: "68.0" },
];

const vaultDocs = [
  { name: "Certificate of Incorporation", meta: "Uploaded 18 Sep 2026 · 1.2 MB", tag: "Verified", icon: FileCheck2 },
  { name: "GST Registration Certificate", meta: "Uploaded 18 Sep 2026 · 840 KB", tag: "Verified", icon: ShieldCheck },
  { name: "CA Turnover Certificate", meta: "UDIN: 26123456XXXX · 620 KB", tag: "Verified", icon: CircleDollarSign },
  { name: "ISO 27001 Certificate", meta: "Expires in 42 days · 2.4 MB", tag: "Expiring", icon: AlertTriangle },
];

function LogoMark() {
  return (
    <div className="logo-mark" aria-label="TenderFlow logo">
      <span className="logo-mark-orbit" />
      <span className="logo-mark-core">T</span>
    </div>
  );
}

function StatusPill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "green" | "amber" | "red" | "slate" | "blue" }) {
  return <span className={`status-pill status-${tone}`}><span className="status-dot" />{children}</span>;
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return <button className="icon-button" aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

function SectionTitle({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="section-title-row">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {detail && <p className="section-detail">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

function Overview({ setActive, setStage }: { setActive: (key: NavKey) => void; setStage: (stage: number) => void }) {
  const [showAll, setShowAll] = useState(false);

  const actionItems = [
    { icon: AlertTriangle, title: "ISO 27001 certificate expires soon", text: "Renew before 31 Oct 2026 to keep eligibility coverage.", tone: "amber", action: "Review vault", target: "Company Vault" as NavKey },
    { icon: CreditCard, title: "Add EMD payment proof", text: "Tender ELE.93/2024/2 is waiting for its Cover-1 instrument.", tone: "blue", action: "Add proof", target: "Payment Proof" as NavKey },
    { icon: PenLine, title: "Review methodology draft", text: "5 sections are ready for a human review before binding.", tone: "green", action: "Open editor", target: "Proposal Desk" as NavKey },
  ];

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={13} /><strong>Overview</strong></div>
          <h1>Good morning, Arjun <span className="heading-spark">✦</span></h1>
          <p>Here’s the pulse of your bid workspace. One tender is ready for your decision.</p>
        </div>
        <div className="heading-actions">
          <button className="button button-secondary" onClick={() => toast.success("Workspace link copied") }><Copy size={16} /> Share workspace</button>
          <button className="button button-primary" onClick={() => { setActive("Tender Intake"); toast("Tender intake opened", { description: "Upload a new RFP to begin extraction." }); }}><Plus size={17} /> New tender</button>
        </div>
      </div>

      <div className="metric-grid fade-up delay-1">
        <div className="metric-card metric-primary">
          <div className="metric-top"><span className="metric-label">Active tenders</span><span className="metric-icon"><BriefcaseBusiness size={17} /></span></div>
          <div className="metric-value">12</div>
          <div className="metric-foot"><span className="metric-positive"><ArrowUpRight size={14} /> 18.2%</span><span>vs last month</span></div>
          <div className="sparkline sparkline-navy"><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>
        <div className="metric-card">
          <div className="metric-top"><span className="metric-label">Vault readiness</span><span className="metric-icon metric-icon-green"><FolderLock size={17} /></span></div>
          <div className="metric-value">96<span className="metric-unit">%</span></div>
          <div className="metric-foot"><span className="metric-positive"><ArrowUpRight size={14} /> 4.8%</span><span>this quarter</span></div>
          <div className="progress-track"><span style={{ width: "96%" }} /></div>
        </div>
        <div className="metric-card">
          <div className="metric-top"><span className="metric-label">Avg. preparation time</span><span className="metric-icon metric-icon-purple"><Zap size={17} /></span></div>
          <div className="metric-value">34<span className="metric-unit">m</span></div>
          <div className="metric-foot"><span className="metric-positive"><ArrowDownRight size={14} /> 41.5%</span><span>vs manual process</span></div>
          <div className="sparkline sparkline-purple"><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>
        <div className="metric-card">
          <div className="metric-top"><span className="metric-label">Potential bid value</span><span className="metric-icon metric-icon-gold"><CircleDollarSign size={17} /></span></div>
          <div className="metric-value metric-value-money">₹18.4<span className="metric-unit">Cr</span></div>
          <div className="metric-foot"><span className="metric-positive"><ArrowUpRight size={14} /> 12.6%</span><span>across open bids</span></div>
          <div className="sparkline sparkline-gold"><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>
      </div>

      <section className="workflow-card fade-up delay-2">
        <div className="workflow-topline">
          <div>
            <div className="eyebrow eyebrow-light">BID COMMAND CENTER <span className="live-dot" /> LIVE WORKFLOW</div>
            <h2>ELE.93/2024/2 <span>·</span> Digital Citizen Services Platform</h2>
            <p>Electronics & IT Department, Government of Assam <span className="workflow-separator">·</span> Due 24 Sep 2026</p>
          </div>
          <div className="workflow-actions"><StatusPill tone="amber">In review</StatusPill><IconButton label="More tender actions"><MoreHorizontal size={18} /></IconButton></div>
        </div>
        <div className="workflow-body">
          <div className="workflow-score-wrap">
            <div className="score-ring"><div><strong>82.5</strong><small>/ 100</small></div></div>
            <div><span className="score-kicker">Readiness score</span><strong className="score-status">Good to proceed</strong><p>2 checkpoints need your attention</p></div>
          </div>
          <div className="workflow-progress"><div className="workflow-progress-line" /><div className="pipeline-steps">
            {pipeline.map((step) => {
              const StepIcon = step.icon;
              const active = step.id === 3;
              return <button key={step.id} className={`pipeline-step ${step.state} ${active ? "pipeline-active" : ""}`} onClick={() => { setStage(step.id); const match = navItems.find((x) => x.label === step.label); if (match) setActive(match.label); }}>
                <span className="pipeline-node">{step.state === "done" ? <Check size={16} strokeWidth={2.6} /> : <StepIcon size={16} />}</span>
                <span className="pipeline-copy"><strong>{step.label}</strong><small>{step.sub}</small></span>
              </button>;
            })}
          </div></div>
        </div>
        <div className="workflow-bottom"><div className="workflow-note"><Sparkles size={16} /><span>Next best action: <strong>review the missing ISO 27001 certificate</strong></span></div><button className="workflow-link" onClick={() => { setActive("Eligibility"); setStage(3); }}>Open bid workflow <ArrowUpRight size={16} /></button></div>
      </section>

      <div className="content-grid fade-up delay-3">
        <section className="panel action-panel">
          <SectionTitle eyebrow="ATTENTION NEEDED" title="Action queue" detail="Small steps that keep your bid moving." action={<span className="count-badge">03</span>} />
          <div className="action-list">
            {(showAll ? actionItems : actionItems.slice(0, 2)).map((item) => { const ItemIcon = item.icon; return <div className="action-item" key={item.title}><div className={`action-icon action-${item.tone}`}><ItemIcon size={17} /></div><div className="action-copy"><strong>{item.title}</strong><p>{item.text}</p><button onClick={() => { setActive(item.target); toast(item.action, { description: `Opening ${item.target}` }); }}>{item.action} <ChevronRight size={14} /></button></div></div>; })}
          </div>
          <button className="text-button" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show less" : "View all actions"} <ArrowUpRight size={15} /></button>
        </section>

        <section className="panel coverage-panel">
          <SectionTitle eyebrow="DOCUMENT COVERAGE" title="Vault health" detail="Documents mapped to your active tenders." action={<button className="small-link" onClick={() => setActive("Company Vault")}>Manage vault <ArrowUpRight size={14} /></button>} />
          <div className="coverage-overview"><div className="coverage-ring"><div><strong>96%</strong><small>ready</small></div></div><div className="coverage-legend"><div><span className="legend-color legend-green" /><span>Verified</span><strong>48</strong></div><div><span className="legend-color legend-amber" /><span>Expiring soon</span><strong>3</strong></div><div><span className="legend-color legend-gray" /><span>Missing</span><strong>1</strong></div></div></div>
          <div className="coverage-insight"><ShieldCheck size={15} /><span>Your company profile meets the baseline for <strong>8 of 9</strong> open tenders.</span></div>
        </section>
      </div>

      <section className="panel tenders-panel fade-up delay-4">
        <SectionTitle eyebrow="OPEN BID PIPELINE" title="Recent tenders" detail="Track every tender from intake to submission-ready package." action={<button className="button button-ghost" onClick={() => setActive("Tender Intake")}>View all tenders <ArrowUpRight size={15} /></button>} />
        <div className="table-wrap"><table><thead><tr><th>Tender</th><th>Authority</th><th>Due date</th><th>Readiness</th><th>Status</th><th /></tr></thead><tbody>{tenderRows.map((row) => <tr key={row.ref}><td><div className="tender-name"><span className="tender-file"><FileText size={15} /></span><div><strong>{row.title}</strong><small>{row.ref}</small></div></div></td><td>{row.authority}</td><td><span className="date-cell"><CalendarDays size={14} />{row.due}</span></td><td><div className="readiness"><span className="readiness-bar"><i style={{ width: `${row.score}%` }} /></span><strong>{row.score}</strong></div></td><td><StatusPill tone={row.statusType as "green" | "amber" | "red"}>{row.status}</StatusPill></td><td><IconButton label={`Open ${row.ref}`} onClick={() => { setActive("Tender Intake"); toast("Tender opened", { description: row.ref }); }}><ChevronRight size={17} /></IconButton></td></tr>)}</tbody></table></div>
      </section>

      <div className="disclaimer-strip"><LockKeyhole size={15} /><span>Prototype mode — AI extraction, document generation and PDF processing are represented as UI steps only.</span><button onClick={() => toast("AI integration is intentionally disabled", { description: "This prototype focuses on the user journey and workflow." })}>Why?</button></div>
    </>
  );
}

function CompanyVault({ setActive }: { setActive: (key: NavKey) => void }) {
  return <>
    <div className="page-heading fade-up"><div><div className="breadcrumb"><span>Workspace</span><ChevronRight size={13} /><strong>Company Vault</strong></div><h1>Your bid-ready identity.</h1><p>Keep statutory documents, signatories and brand assets ready for every tender.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => toast("Brand Studio", { description: "Letterhead controls are available in the next build." })}><Building2 size={16} /> Brand Studio</button><button className="button button-primary" onClick={() => toast.success("Upload drawer opened") }><Upload size={16} /> Upload document</button></div></div>
    <div className="vault-hero panel fade-up delay-1"><div className="vault-hero-mark"><FolderLock size={26} /></div><div className="vault-hero-copy"><span className="eyebrow">COMPANY PROFILE · VERIFIED</span><h2>Tech Solutions Pvt Ltd</h2><p>GSTIN 18AABCT1234F1ZP <span>·</span> CIN U72900AS2012PTC011234 <span>·</span> Guwahati, Assam</p></div><div className="vault-hero-stat"><strong>96%</strong><span>profile readiness</span><div className="progress-track"><span style={{ width: "96%" }} /></div></div></div>
    <div className="content-grid vault-grid fade-up delay-2"><section className="panel"><SectionTitle eyebrow="STATUTORY DOCUMENTS" title="Core vault" detail="Documents used by the eligibility engine." action={<span className="count-badge count-green">12 / 13</span>} /><div className="doc-list">{vaultDocs.map((doc) => { const DocIcon = doc.icon; return <div className="doc-row" key={doc.name}><div className="doc-type-icon"><DocIcon size={18} /></div><div className="doc-row-copy"><strong>{doc.name}</strong><small>{doc.meta}</small></div><StatusPill tone={doc.tag === "Expiring" ? "amber" : "green"}>{doc.tag}</StatusPill><IconButton label={`Open ${doc.name}`}><ExternalLink size={15} /></IconButton></div>; })}</div><button className="text-button" onClick={() => toast("All documents", { description: "Document library opened in prototype mode." })}>View all 13 documents <ArrowUpRight size={15} /></button></section><section className="panel vault-side-panel"><SectionTitle eyebrow="PEOPLE & BRAND" title="Workspace setup" /><div className="setup-list"><div><span className="setup-icon"><UserRound size={16} /></span><div><strong>Authorized signatory</strong><small>Arjun Mehta · Managing Director</small></div><CheckCircle2 size={17} className="setup-check" /></div><div><span className="setup-icon"><Users size={16} /></span><div><strong>Key personnel CV bank</strong><small>18 profiles · 4 tender roles mapped</small></div><CheckCircle2 size={17} className="setup-check" /></div><div><span className="setup-icon"><Building2 size={16} /></span><div><strong>Letterhead & watermark</strong><small>Logo, footer and 10% watermark ready</small></div><CheckCircle2 size={17} className="setup-check" /></div></div><button className="button button-secondary full-width" onClick={() => toast("Profile editor", { description: "Company profile editing is mocked for this UI." })}>Edit company profile <ArrowUpRight size={15} /></button></section></div>
  </>;
}

function TenderIntake({ setActive, setStage }: { setActive: (key: NavKey) => void; setStage: (stage: number) => void }) {
  const [uploaded, setUploaded] = useState(false);
  return <>
    <div className="page-heading fade-up"><div><div className="breadcrumb"><span>Bid workspace</span><ChevronRight size={13} /><strong>Tender Intake</strong></div><h1>Bring a tender into focus.</h1><p>Upload the RFP, confirm the extracted brief, then move into deterministic checks.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => toast("Supported files: PDF, JPG, PNG") }><HelpCircle size={16} /> How it works</button><button className="button button-primary" onClick={() => setUploaded(true)}><Upload size={16} /> Upload RFP</button></div></div>
    <div className="intake-layout fade-up delay-1"><section className={`upload-card ${uploaded ? "upload-complete" : ""}`}><div className="upload-orb"><FileText size={28} /></div>{uploaded ? <><StatusPill tone="green">Upload complete</StatusPill><h2>Assam_DCS_RFP_2026.pdf</h2><p>148 pages · 18.6 MB · Ready for extraction preview</p><button className="button button-primary" onClick={() => { setActive("Eligibility"); setStage(3); toast.success("Extraction preview confirmed"); }}>Review extracted brief <ChevronRight size={16} /></button></> : <><h2>Drop your RFP here</h2><p>PDFs up to 150 pages, scanned or digital. This prototype will show the next extraction step.</p><button className="button button-secondary" onClick={() => setUploaded(true)}><Upload size={16} /> Choose PDF file</button><span className="upload-caption">or drag & drop anywhere in this area</span></>}</section><section className="panel extraction-panel"><div className="eyebrow">WHAT HAPPENS NEXT</div><h2>From 148 pages to one clear brief.</h2><div className="extraction-steps"><div className="extraction-step"><span>01</span><div><strong>Read & structure</strong><p>Metadata, deadlines, fees and clauses become searchable fields.</p></div></div><div className="extraction-step"><span>02</span><div><strong>Surface the gates</strong><p>Turnover, years of experience, certificates and local office rules.</p></div></div><div className="extraction-step"><span>03</span><div><strong>Build the scorecard</strong><p>100-mark technical matrix becomes a transparent readiness score.</p></div></div></div><div className="extraction-note"><Sparkles size={15} /><span>AI extraction is shown as a product step only in this prototype.</span></div></section></div>
    <section className="panel extracted-preview fade-up delay-2"><SectionTitle eyebrow="EXTRACTION PREVIEW · SAMPLE DATA" title="Digital Citizen Services Platform" detail="Review before the rules engine evaluates your profile." action={<StatusPill tone="blue">Awaiting confirmation</StatusPill>} /><div className="preview-grid"><div><span className="preview-label">Tender reference</span><strong>ELE.93/2024/2</strong></div><div><span className="preview-label">Authority</span><strong>Electronics & IT Dept., Assam</strong></div><div><span className="preview-label">Bid deadline</span><strong>24 Sep 2026 · 17:00 IST</strong></div><div><span className="preview-label">EMD amount</span><strong>₹2,40,000</strong></div><div><span className="preview-label">Mandatory certificates</span><strong>ISO 9001 · ISO 27001</strong></div><div><span className="preview-label">Technical weightage</span><strong>100 marks</strong></div></div><div className="preview-footer"><span><CheckCircle2 size={15} /> 24 fields structured</span><span><FileCheck2 size={15} /> 9 annexures detected</span><button className="button button-primary" onClick={() => { setActive("Eligibility"); setStage(3); }}>Confirm & check eligibility <ChevronRight size={16} /></button></div></section>
  </>;
}

function Eligibility({ setActive }: { setActive: (key: NavKey) => void }) {
  const [selected, setSelected] = useState("overview");
  const gates = [{ name: "Average annual turnover", requirement: "Minimum ₹10 Cr in last 3 years", result: "₹14.8 Cr", pass: true }, { name: "Relevant experience", requirement: "5+ years in citizen services", result: "8 years", pass: true }, { name: "Mandatory certificates", requirement: "ISO 9001 + ISO 27001", result: "ISO 27001 expiring", pass: false }, { name: "Local presence", requirement: "Office in Assam or NE region", result: "Guwahati office", pass: true }];
  return <>
    <div className="page-heading fade-up"><div><div className="breadcrumb"><span>Bid workspace</span><ChevronRight size={13} /><strong>Eligibility</strong></div><h1>Can you win this bid?</h1><p>Transparent, deterministic checks against your verified company vault.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => toast("Scorecard exported", { description: "A scorecard PDF would be downloaded here." })}><ExternalLink size={16} /> Export scorecard</button><button className="button button-primary" onClick={() => { setActive("Payment Proof"); toast.success("Moving to payment proof"); }}>Continue to payment <ChevronRight size={16} /></button></div></div>
    <div className="eligibility-top fade-up delay-1"><div className="score-card-large"><div className="score-ring score-ring-large"><div><strong>82.5</strong><small>/ 100</small></div></div><div><span className="eyebrow">TECHNICAL READINESS</span><h2>Good to proceed</h2><p>Pass the gate, close one document gap, then build your proposal.</p></div></div><div className="score-breakdown"><div><span>Pre-qualification</span><strong>37.5 <small>/ 50</small></strong><div className="mini-bar"><i style={{ width: "75%" }} /></div></div><div><span>Methodology target</span><strong>45 <small>/ 50</small></strong><div className="mini-bar mini-purple"><i style={{ width: "90%" }} /></div></div></div></div>
    <div className="content-grid eligibility-grid fade-up delay-2"><section className="panel"><SectionTitle eyebrow="RULE ENGINE · 4 GATES" title="Eligibility checklist" detail="Every result is traceable to a vault document or tender clause." /><div className="gate-list">{gates.map((gate) => <div className={`gate-row ${gate.pass ? "gate-pass" : "gate-fail"}`} key={gate.name}><span className="gate-icon">{gate.pass ? <Check size={17} /> : <AlertTriangle size={17} />}</span><div><strong>{gate.name}</strong><small>{gate.requirement}</small></div><div className="gate-result"><strong>{gate.result}</strong><StatusPill tone={gate.pass ? "green" : "amber"}>{gate.pass ? "Passed" : "Review"}</StatusPill></div></div>)}</div></section><section className="panel gap-panel"><SectionTitle eyebrow="GAP ANALYSIS" title="One thing to fix" /><div className="gap-callout"><AlertTriangle size={20} /><div><strong>ISO 27001 certificate is expiring</strong><p>Upload a renewed certificate before final binding. This is a review flag, not a hard disqualification.</p><button onClick={() => setSelected("document")}>See affected clauses <ChevronRight size={14} /></button></div></div><div className="gap-detail"><div><span>Impact on score</span><strong>− 4.0 marks</strong></div><div><span>Suggested owner</span><strong>Legal & compliance</strong></div><div><span>Last checked</span><strong>Just now</strong></div></div>{selected === "document" && <div className="selected-clause"><FileText size={15} /><span>Clause 3.2 · Mandatory certificates <strong>“Valid ISO 27001 certificate copy”</strong></span><X size={14} onClick={() => setSelected("overview")} /></div>}</section></div>
  </>;
}

function PaymentProof({ setActive }: { setActive: (key: NavKey) => void }) {
  const [mode, setMode] = useState("NEFT / RTGS");
  const [saved, setSaved] = useState(false);
  return <>
    <div className="page-heading fade-up"><div><div className="breadcrumb"><span>Bid workspace</span><ChevronRight size={13} /><strong>Payment Proof</strong></div><h1>Make the money trail simple.</h1><p>Capture tender fee and EMD proof once. The binder places it in the right cover automatically.</p></div><div className="heading-actions"><StatusPill tone={saved ? "green" : "amber"}>{saved ? "Proof saved" : "Proof pending"}</StatusPill></div></div>
    <div className="payment-layout fade-up delay-1"><section className="panel payment-form"><SectionTitle eyebrow="COVER 1 · PAYMENT PROOF" title="Tender fee & EMD" detail="ELE.93/2024/2 · Digital Citizen Services Platform" /><div className="mode-tabs">{["NEFT / RTGS", "Cheque / DD", "Portal challan", "MSME exemption"].map((item) => <button className={mode === item ? "active" : ""} key={item} onClick={() => setMode(item)}>{item}</button>)}</div><div className="form-grid"><label><span>Instrument / UTR number</span><input value={mode === "NEFT / RTGS" ? "HDFC26092498122" : "DD-004812"} readOnly /></label><label><span>Amount</span><input value="₹2,40,000" readOnly /></label><label><span>Bank / issuing authority</span><input value="HDFC Bank · GS Road Branch" readOnly /></label><label><span>Issue date</span><input value="18 Sep 2026" readOnly /></label></div><div className="receipt-drop"><div className="receipt-icon"><FileText size={20} /></div><div><strong>Payment_receipt_18402.pdf</strong><span>Uploaded just now · 482 KB</span></div><CheckCircle2 size={18} className="receipt-ok" /></div><div className="form-footer"><span><ShieldCheck size={15} /> Encrypted in company vault</span><button className="button button-primary" onClick={() => { setSaved(true); toast.success("Payment proof saved"); }}>Save payment proof <Check size={16} /></button></div></section><section className="payment-preview"><div className="preview-paper"><div className="paper-header"><span className="paper-logo">TS</span><span>Tech Solutions Pvt Ltd</span><small>TENDER FEE & EMD PROOF</small></div><div className="paper-rule" /><div className="paper-title">Submission Proof Slip</div><div className="paper-fields"><span>Tender ref.<strong>ELE.93/2024/2</strong></span><span>Instrument<strong>HDFC26092498122</strong></span><span>Amount<strong>₹2,40,000</strong></span><span>Mode<strong>{mode}</strong></span></div><div className="fake-receipt"><span>HDFC BANK</span><strong>NEFT PAYMENT ACKNOWLEDGEMENT</strong><small>UTR HDFC26092498122 · 18 SEP 2026</small></div><div className="paper-footer">Cover 1 <span>Auto-generated preview</span></div></div></section></div>
  </>;
}

function ProposalDesk({ setActive }: { setActive: (key: NavKey) => void }) {
  const [doc, setDoc] = useState("Approach & Methodology");
  const docs = ["Covering Letter", "Power of Attorney", "Non-Blacklisting Affidavit", "Approach & Methodology", "Key Personnel CVs"];
  return <>
    <div className="page-heading fade-up"><div><div className="breadcrumb"><span>Bid workspace</span><ChevronRight size={13} /><strong>Proposal Desk</strong></div><h1>Draft with context. Review with control.</h1><p>AI-ready document workspace with a human approval step before anything is bound.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => toast("Draft version saved", { description: "This preview keeps the draft local." })}><FileCheck2 size={16} /> Save version</button><button className="button button-primary" onClick={() => { setActive("PDF Binder"); toast.success("Draft marked ready for binder"); }}>Send to binder <ChevronRight size={16} /></button></div></div>
    <div className="editor-shell fade-up delay-1"><aside className="editor-sidebar"><div className="editor-sidebar-head"><span className="eyebrow">DOCUMENTS · 05</span><button onClick={() => toast("New document", { description: "Document templates will be configurable here." })}><Plus size={15} /></button></div>{docs.map((item, index) => <button key={item} className={`editor-doc ${doc === item ? "active" : ""}`} onClick={() => setDoc(item)}><span className="editor-doc-num">0{index + 1}</span><span><strong>{item}</strong><small>{index === 3 ? "5 pages · Draft" : "Ready for review"}</small></span><ChevronRight size={15} /></button>)}<div className="clause-card"><div className="eyebrow">RFP CLAUSE</div><p>“The bidder shall provide an approach that demonstrates delivery governance, SLA adherence and risk mitigation.”</p><button onClick={() => toast("Clause copied to draft")}>Use in document <Copy size={13} /></button></div></aside><section className="editor-main"><div className="editor-toolbar"><div className="toolbar-left"><button className="toolbar-select">Normal text <ChevronDown size={14} /></button><span className="toolbar-divider" /><button className="toolbar-text bold">B</button><button className="toolbar-text italic">I</button><button className="toolbar-text underline">U</button><span className="toolbar-divider" /><button className="toolbar-text">≡</button><button className="toolbar-text">☷</button></div><div className="toolbar-right"><StatusPill tone="amber">Needs review</StatusPill><button className="icon-button"><MoreHorizontal size={17} /></button></div></div><div className="editor-paper"><div className="editor-watermark">TECH SOLUTIONS</div><div className="document-meta"><span>TECH SOLUTIONS PVT LTD</span><span>ELE.93/2024/2</span></div><h2>{doc}</h2><p className="doc-intro">A considered delivery approach for the Digital Citizen Services Platform tender.</p><h3>1. Our understanding</h3><p>Tech Solutions understands that the department is seeking a secure, inclusive and measurable digital service layer for citizens. Our approach brings together delivery governance, service design and resilient cloud operations.</p><h3>2. Delivery methodology</h3><div className="methodology-table"><div><span>01</span><strong>Discover & align</strong><small>Stakeholder workshops · Week 1–2</small></div><div><span>02</span><strong>Design & validate</strong><small>Service blueprint · Week 3–5</small></div><div><span>03</span><strong>Build & assure</strong><small>Agile sprints · Week 6–14</small></div></div><p>Each stage is governed by a shared RAID log, weekly steering review and acceptance gates tied to measurable outcomes.</p><div className="editor-cursor" /></div><div className="editor-footer"><span><Clock3 size={14} /> Last saved 2 min ago</span><span>Page 2 of 5</span><button className="button button-primary" onClick={() => toast.success("Review request sent to Arjun Mehta")}>Request human review <Send size={15} /></button></div></section></div>
  </>;
}

function PdfBinder() {
  const [items, setItems] = useState(["Tender fee & EMD proof", "Covering letter", "Power of Attorney", "Non-blacklisting affidavit", "Approach & Methodology", "Key personnel CVs", "CA turnover & financials", "GST, PAN & ISO copies"]);
  const [selected, setSelected] = useState(0);
  const move = (direction: number) => setItems((current) => { const next = [...current]; const target = selected + direction; if (target < 0 || target >= next.length) return next; [next[selected], next[target]] = [next[target], next[selected]]; setSelected(target); return next; });
  return <>
    <div className="page-heading fade-up"><div><div className="breadcrumb"><span>Bid workspace</span><ChevronRight size={13} /><strong>PDF Binder</strong></div><h1>One package. No loose ends.</h1><p>Arrange the exact submission sequence and see how the final master PDF will read.</p></div><div className="heading-actions"><StatusPill tone="amber">Draft · 48 pages</StatusPill><button className="button button-primary" onClick={() => toast.success("Master PDF export queued", { description: "Final stamping is represented in this prototype." })}><ExternalLink size={16} /> Export master PDF</button></div></div>
    <div className="binder-layout fade-up delay-1"><section className="panel sequence-panel"><SectionTitle eyebrow="DOCUMENT SEQUENCE" title="Drag-ready binder" detail="The order below becomes the continuous page sequence." action={<button className="small-link" onClick={() => toast("Auto-sort applied", { description: "Recommended cover sequence restored." })}>Auto-sort <Zap size={14} /></button>} /><div className="sequence-list">{items.map((item, index) => <button className={`sequence-row ${selected === index ? "selected" : ""}`} key={item} onClick={() => setSelected(index)}><span className="drag-dots">⠿</span><span className="sequence-num">{String(index + 1).padStart(2, "0")}</span><span className="sequence-copy"><strong>{item}</strong><small>{index === 0 ? "Cover 1 · 2 pages" : index < 5 ? "Cover 2 · Letterhead" : "Cover 2 · Vault document"}</small></span><span className="sequence-pages">{index === 0 ? "02" : index === 4 ? "05" : index === 5 ? "12" : "03"} pp</span><MoreHorizontal size={16} /></button>)}</div><div className="sequence-controls"><span>Selected: <strong>{items[selected]}</strong></span><div><button className="button button-secondary" onClick={() => move(-1)} disabled={selected === 0}>Move up</button><button className="button button-secondary" onClick={() => move(1)} disabled={selected === items.length - 1}>Move down</button></div></div></section><aside className="binder-preview"><div className="binder-preview-head"><div><span className="eyebrow">LIVE PREVIEW</span><h2>Master bid package</h2></div><IconButton label="More preview actions"><MoreHorizontal size={17} /></IconButton></div><div className="pdf-sheet"><div className="pdf-cover-brand"><span className="paper-logo">TS</span><div><strong>TECH SOLUTIONS</strong><small>PRIVATE LIMITED</small></div></div><div className="pdf-cover-label">TECHNICAL BID</div><h3>Digital Citizen<br /><em>Services Platform</em></h3><div className="pdf-cover-meta"><span>Tender Ref<strong>ELE.93/2024/2</strong></span><span>Submitted by<strong>Tech Solutions Pvt Ltd</strong></span></div><div className="pdf-cover-stamp">MASTER<br />PACKAGE</div><div className="pdf-page-number">01 <span>of 48</span></div></div><div className="binder-footer"><div><CheckCircle2 size={16} /><span><strong>8 documents</strong><small>48 pages · stamped & indexed</small></span></div><button className="button button-primary" onClick={() => toast("Table of contents refreshed")}>Refresh index <Zap size={15} /></button></div></aside></div>
    <div className="disclaimer-strip"><LockKeyhole size={15} /><span>Financial BoQ remains separate from this technical package — pricing is always a human decision.</span><button onClick={() => toast("BoQ separation is a core compliance rule")}>Learn more</button></div>
  </>;
}

function Placeholder({ active, setActive }: { active: NavKey; setActive: (key: NavKey) => void }) {
  return <div className="placeholder panel fade-up"><div className="placeholder-icon"><Settings2 size={25} /></div><span className="eyebrow">{active.toUpperCase()}</span><h2>This workspace is ready for your next decision.</h2><p>The full interaction pattern is represented across the core bid workflow. Use the sidebar to move between modules.</p><button className="button button-primary" onClick={() => setActive("Overview")}>Back to overview <LayoutDashboard size={16} /></button></div>;
}

export default function Home() {
  const [active, setActive] = useState<NavKey>("Overview");
  const [stage, setStage] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = useMemo(() => active === "Overview" ? "Overview" : active, [active]);

  const content = active === "Overview" ? <Overview setActive={setActive} setStage={setStage} /> : active === "Company Vault" ? <CompanyVault setActive={setActive} /> : active === "Tender Intake" ? <TenderIntake setActive={setActive} setStage={setStage} /> : active === "Eligibility" ? <Eligibility setActive={setActive} /> : active === "Payment Proof" ? <PaymentProof setActive={setActive} /> : active === "Proposal Desk" ? <ProposalDesk setActive={setActive} /> : active === "PDF Binder" ? <PdfBinder /> : <Placeholder active={active} setActive={setActive} />;

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="brand-row"><div className="brand-lockup"><LogoMark /><div><strong>Tender<span>Flow</span></strong><small>Bid operations OS</small></div></div><button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
      <div className="workspace-switcher"><div className="workspace-avatar">TS</div><div><strong>Tech Solutions</strong><small>Admin workspace</small></div><ChevronDown size={15} /></div>
      <nav className="side-nav">{["Workspace", "Bid workspace"].map((section) => <div key={section} className="nav-section"><span className="nav-section-label">{section}</span>{navItems.filter((item) => item.section === section).map((item) => { const NavIcon = item.icon; return <button key={item.label} className={`nav-item ${active === item.label ? "active" : ""}`} onClick={() => { setActive(item.label); setSidebarOpen(false); if (item.label === "Eligibility") setStage(3); }}><NavIcon size={17} strokeWidth={active === item.label ? 2.2 : 1.8} /><span>{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}</button>; })}</div>)}</nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-tip"><div className="tip-spark"><Sparkles size={15} /></div><strong>30 min to bid-ready</strong><p>Your workflow is 41% faster than the team average.</p><button onClick={() => toast("Automation insights", { description: "Time saved is calculated from your workspace activity." })}>See insights <ArrowUpRight size={14} /></button></div>
      <div className="sidebar-footer"><button className="nav-item" onClick={() => toast("Settings", { description: "Workspace settings are coming next." })}><Settings2 size={17} /><span>Settings</span></button><div className="profile-row"><div className="profile-avatar">AM</div><div><strong>Arjun Mehta</strong><small>Administrator</small></div><MoreHorizontal size={16} /></div></div>
    </aside>
    {sidebarOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div className="topbar-page"><Grid2X2 size={15} /><span>{pageTitle}</span></div></div><div className="topbar-actions"><label className="search-box"><Search size={16} /><input placeholder="Search tenders, documents..." /><kbd>⌘ K</kbd></label><IconButton label="Help center" onClick={() => toast("Help center", { description: "Guidance is available inside each workflow step." })}><HelpCircle size={18} /></IconButton><button className="notification-button" aria-label="Notifications" onClick={() => toast("You have 3 notifications")}><Bell size={18} /><i /></button><div className="top-avatar">AM</div></div></header><div className="page-content">{content}</div></main>
  </div>;
}
