import React, { useMemo, useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
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
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  Download,
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
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react';

import { tenderAPI, companyProfileAPI, exportAPI } from './services/api';
import TenderAIChatDrawer from './components/TenderAIChatDrawer';
import TenderUploadModal from './components/TenderUploadModal';
import CompanyProfileModal from './components/CompanyProfileModal';
import VaultDocumentUploadModal from './components/VaultDocumentUploadModal';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import AIModeWorkspace from './ai-mode/AIModeWorkspace';

const navItems = [
  // =========================================================================
  // 🌟 AI AGENT MODE MENU (Comment this line to HIDE, Uncomment to SHOW)
  // =========================================================================
  { label: 'AI Mode', icon: Sparkles, section: 'Bid workspace', badge: 'AI 2.0' },
  // =========================================================================
  { label: 'Overview', icon: LayoutDashboard, section: 'Workspace' },
  { label: 'Company Vault', icon: FolderLock, section: 'Workspace', badge: '96%' },
  { label: 'Tender Intake', icon: FileText, section: 'Bid workspace', badge: '3' },
  { label: 'Eligibility', icon: ShieldCheck, section: 'Bid workspace' },
  { label: 'Payment Proof', icon: CreditCard, section: 'Bid workspace' },
  { label: 'Proposal Desk', icon: PenLine, section: 'Bid workspace' },
  { label: 'PDF Binder', icon: Library, section: 'Bid workspace', badge: 'Draft' },
];

const pipeline = [
  { id: 1, label: 'Company Vault', sub: 'Profile & documents', icon: FolderLock, state: 'done' },
  { id: 2, label: 'Tender Intake', sub: 'Upload & extract', icon: FileText, state: 'done' },
  { id: 3, label: 'Eligibility', sub: 'Rules & score', icon: ShieldCheck, state: 'current' },
  { id: 4, label: 'Payment Proof', sub: 'Fee & EMD', icon: CreditCard, state: 'next' },
  { id: 5, label: 'Proposal Desk', sub: 'Draft & review', icon: PenLine, state: 'next' },
  { id: 6, label: 'PDF Binder', sub: 'Assemble & export', icon: Library, state: 'next' },
];

function LogoMark() {
  return (
    <div className="logo-mark" aria-label="TenderFlow logo">
      <span className="logo-mark-orbit" />
      <span className="logo-mark-core">T</span>
    </div>
  );
}

function StatusPill({ children, tone = 'slate' }) {
  return (
    <span className={`status-pill status-${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}

function IconButton({ label, children, onClick }) {
  return (
    <button className="icon-button" aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  );
}

function SectionTitle({ eyebrow, title, detail, action }) {
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

// -------------------------------------------------------------
// 1. OVERVIEW VIEW
// -------------------------------------------------------------
function Overview({ tenders, activeTender, selectedTenderId, onSelectTender, setActive, setStage, onOpenUploadModal }) {
  const [showAll, setShowAll] = useState(false);

  const actionItems = [
    {
      icon: AlertTriangle,
      title: 'ISO 27001 certificate expires soon',
      text: 'Renew before 31 Oct 2026 to keep eligibility coverage.',
      tone: 'amber',
      action: 'Review vault',
      target: 'Company Vault'
    },
    {
      icon: CreditCard,
      title: 'Add EMD payment proof',
      text: `Tender ${activeTender?.tenderNumber || activeTender?.reference || 'ELE.93/2024/2'} is waiting for its Cover-1 instrument.`,
      tone: 'blue',
      action: 'Add proof',
      target: 'Payment Proof'
    },
    {
      icon: PenLine,
      title: 'Review methodology draft',
      text: 'AI proposal drafts are ready for human review before binding.',
      tone: 'green',
      action: 'Open editor',
      target: 'Proposal Desk'
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
          <p>Here’s the pulse of your bid workspace. {tenders.length} active tenders loaded.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary"
            onClick={() => toast.success('Workspace link copied to clipboard')}
          >
            <Copy size={16} /> Share workspace
          </button>
          <button
            className="button button-primary"
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
            <i /><i /><i /><i /><i /><i /><i /><i />
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
            <span style={{ width: '96%' }} />
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
            <i /><i /><i /><i /><i /><i /><i /><i />
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
            <i /><i /><i /><i /><i /><i /><i /><i />
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
                  {tenders.findIndex(t => t.id === activeTender?.id) + 1} of {tenders.length} Active
                </span>
              )}
            </div>
            <h2>
              {activeTender?.tenderNumber || activeTender?.reference || 'ELE.93/2024/2'} <span>·</span> {activeTender?.title || 'Digital Citizen Services Platform'}
            </h2>
            <p>
              {activeTender?.organization || activeTender?.authority || 'Electronics & IT Department'}{' '}
              <span className="workflow-separator">·</span> Due {activeTender?.due || (activeTender?.submissionDeadline ? new Date(activeTender.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '24 Sep 2026')}
            </p>
          </div>
          <div className="workflow-actions">
            <StatusPill tone={activeTender?.statusType || 'amber'}>
              {activeTender?.status || 'In review'}
            </StatusPill>
            <IconButton label="More tender actions" onClick={() => toast('Tender operations menu')}>
              <MoreHorizontal size={18} />
            </IconButton>
          </div>
        </div>

        <div className="workflow-body">
          <div className="workflow-score-wrap">
            <div className="score-ring">
              <div>
                <strong>{activeTender?.goNoGoAnalysis?.overallScore || activeTender?.score || '82.5'}</strong>
                <small>/ 100</small>
              </div>
            </div>
            <div>
              <span className="score-kicker">Readiness score</span>
              <strong className="score-status">{activeTender?.goNoGoAnalysis?.decision || 'Good to proceed'}</strong>
              <p>{activeTender?.goNoGoAnalysis?.recommendationSummary || '2 checkpoints need your attention'}</p>
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
                    className={`pipeline-step ${step.state} ${active ? 'pipeline-active' : ''}`}
                    onClick={() => {
                      setStage(step.id);
                      setActive(step.label);
                    }}
                  >
                    <span className="pipeline-node">
                      {step.state === 'done' ? <Check size={16} strokeWidth={2.6} /> : <StepIcon size={16} />}
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
              Next best action: <strong>Review compliance gates & generated proposal</strong>
            </span>
          </div>
          <button
            className="workflow-link"
            onClick={() => {
              setActive('Eligibility');
              setStage(3);
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
                      onClick={() => {
                        setActive(item.target);
                        toast(item.action, { description: `Navigating to ${item.target}` });
                      }}
                    >
                      {item.action} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="text-button" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show less' : 'View all actions'} <ArrowUpRight size={15} />
          </button>
        </section>

        <section className="panel coverage-panel">
          <SectionTitle
            eyebrow="DOCUMENT COVERAGE"
            title="Vault health"
            detail="Documents mapped to your active tenders."
            action={
              <button className="small-link" onClick={() => setActive('Company Vault')}>
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
              Your company profile meets the baseline for <strong>8 of 9</strong> open tenders.
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
            <button className="button button-ghost" onClick={() => setActive('Tender Intake')}>
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
                    className={isCurrent ? 'bg-emerald-50/60 font-medium' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onSelectTender(row);
                      toast.success(`Active tender switched to: ${row.title || row.tenderNumber}`);
                    }}
                  >
                    <td>
                      <div className="tender-name">
                        <span className={`tender-file ${isCurrent ? 'bg-[#173C40] text-white' : ''}`}>
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
                    <td>{row.organization || row.authority}</td>
                    <td>
                      <span className="date-cell">
                        <CalendarDays size={14} />
                        {row.due || (row.submissionDeadline ? new Date(row.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '24 Sep 2026')}
                      </span>
                    </td>
                    <td>
                      <div className="readiness">
                        <span className="readiness-bar">
                          <i style={{ width: `${row.goNoGoAnalysis?.overallScore || row.score || 80}%` }} />
                        </span>
                        <strong>{row.goNoGoAnalysis?.overallScore || row.score || '82.5'}</strong>
                      </div>
                    </td>
                    <td>
                      <StatusPill tone={row.statusType || (row.goNoGoAnalysis?.decision === 'GO' ? 'green' : 'amber')}>
                        {row.status || row.goNoGoAnalysis?.decision || 'In review'}
                      </StatusPill>
                    </td>
                    <td>
                      <IconButton
                        label={`Open ${row.tenderNumber || row.reference}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTender(row);
                          setActive('Tender Intake');
                          toast('Tender loaded in workspace', { description: row.title });
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
          Prototype mode — AI extraction, document generation and PDF processing are fully connected to your local backend engine.
        </span>
        <button
          onClick={() =>
            toast('AI Backend Connected', {
              description: 'AI document parser, Go/No-Go score engine, and PDF export are live.'
            })
          }
        >
          Why?
        </button>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// 2. COMPANY VAULT VIEW
// -------------------------------------------------------------
function CompanyVault({ companyProfile, onEditProfile, onUploadDoc, onDeleteDoc }) {
  const [catFilter, setCatFilter] = useState('All');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);

  const docs = companyProfile?.statutoryDocuments || [];

  const categories = ['All', 'Certifications', 'Tax', 'Financial', 'Corporate', 'Statutory', 'Human Resource'];

  const filteredDocs = useMemo(() => {
    if (!docs || docs.length === 0) return [];
    if (catFilter === 'All') return docs;
    return docs.filter(
      (d) =>
        (d.category || '').toLowerCase() === catFilter.toLowerCase() ||
        (d.name || '').toLowerCase().includes(catFilter.toLowerCase())
    );
  }, [docs, catFilter]);

  const verifiedCount = docs.filter((d) => d.tag === 'Verified').length;
  const totalCount = docs.length;

  const getDocIcon = (iconName) => {
    switch (iconName) {
      case 'FileCheck2': return FileCheck2;
      case 'ShieldCheck': return ShieldCheck;
      case 'CircleDollarSign': return CircleDollarSign;
      case 'Users': return Users;
      case 'AlertTriangle': return AlertTriangle;
      default: return FileText;
    }
  };

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>Company Vault</strong>
          </div>
          <h1>Your bid-ready identity.</h1>
          <p>Keep statutory documents, signatories and brand assets ready for every tender.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary"
            onClick={() => toast('Brand Studio', { description: 'Letterhead, Watermark & Seal assets active.' })}
          >
            <Building2 size={16} /> Brand Studio
          </button>
          <button
            className="button button-primary"
            onClick={onUploadDoc}
          >
            <Upload size={16} /> Upload document
          </button>
        </div>
      </div>

      <div className="vault-hero panel fade-up delay-1">
        <div className="vault-hero-mark">
          <FolderLock size={26} />
        </div>
        <div className="vault-hero-copy">
          <span className="eyebrow">COMPANY PROFILE · VERIFIED</span>
          <h2>{companyProfile?.name || 'Tech Solutions Pvt Ltd'}</h2>
          <p>
            GSTIN {companyProfile?.gstin || '18AABCT1234F1ZP'} <span>·</span> CIN {companyProfile?.cin || 'U72900AS2012PTC011234'} <span>·</span> {companyProfile?.headquarters || 'Guwahati, Assam'}
          </p>
        </div>
        <div className="vault-hero-stat">
          <strong>{companyProfile?.readinessScore || 96}%</strong>
          <span>profile readiness</span>
          <div className="progress-track">
            <span style={{ width: `${companyProfile?.readinessScore || 96}%` }} />
          </div>
        </div>
      </div>

      <div className="content-grid vault-grid fade-up delay-2">
        <section className="panel">
          <SectionTitle
            eyebrow="STATUTORY DOCUMENTS & CERTIFICATES"
            title="Core vault"
            detail="Documents automatically cross-checked by the eligibility engine."
            action={
              <span className={`count-badge ${verifiedCount === totalCount ? 'count-green' : 'bg-emerald-50 text-emerald-800'}`}>
                {verifiedCount} / {totalCount} Verified
              </span>
            }
          />

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatFilter(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  catFilter === cat
                    ? 'bg-[#173C40] text-white border-[#173C40] font-medium'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200'
                }`}
              >
                {cat} {cat === 'All' ? `(${totalCount})` : `(${docs.filter(d => (d.category || '').toLowerCase() === cat.toLowerCase()).length})`}
              </button>
            ))}
          </div>

          <div className="doc-list max-h-[460px] overflow-y-auto pr-1">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => {
                const DocIcon = getDocIcon(doc.icon);
                return (
                  <div className="doc-row" key={doc.id || doc.name}>
                    <div className="doc-type-icon">
                      <DocIcon size={18} />
                    </div>
                    <div className="doc-row-copy">
                      <strong>{doc.name}</strong>
                      <small>{doc.meta}</small>
                    </div>
                    <StatusPill tone={doc.tag === 'Expiring' ? 'amber' : doc.tag === 'Expired' ? 'red' : 'green'}>
                      {doc.tag}
                    </StatusPill>
                    <div className="flex items-center gap-1">
                      <IconButton
                        label={`Preview ${doc.name}`}
                        onClick={() => {
                          setSelectedDocForPreview(doc);
                          toast.success(`Viewing ${doc.name}`, { description: 'Verified document in Sovereign Vault' });
                        }}
                      >
                        <ExternalLink size={15} />
                      </IconButton>
                      {onDeleteDoc && (
                        <button
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={`Delete ${doc.name}`}
                          onClick={() => onDeleteDoc(doc.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <FileText size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No documents in "{catFilter}" category</p>
                <button
                  className="button button-secondary text-xs mt-2"
                  onClick={onUploadDoc}
                >
                  <Upload size={14} /> Upload {catFilter} Document
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#18794e]" /> Encrypted with AES-256 in local repository
            </span>
            <button
              className="button button-primary text-xs"
              onClick={onUploadDoc}
            >
              <Upload size={14} /> Add new document
            </button>
          </div>
        </section>

        <section className="panel vault-side-panel">
          <SectionTitle eyebrow="PEOPLE & BRAND" title="Workspace setup" />
          <div className="setup-list">
            <div>
              <span className="setup-icon">
                <UserRound size={16} />
              </span>
              <div>
                <strong>Authorized signatory</strong>
                <small>
                  {companyProfile?.authorizedSignatory?.name || 'Arjun Mehta'} · {companyProfile?.authorizedSignatory?.designation || 'Managing Director'}
                </small>
              </div>
              <CheckCircle2 size={17} className="setup-check" />
            </div>

            <div>
              <span className="setup-icon">
                <Users size={16} />
              </span>
              <div>
                <strong>Key personnel CV bank</strong>
                <small>{companyProfile?.keyPersonnel?.length || 18} profiles · 4 tender roles mapped</small>
              </div>
              <CheckCircle2 size={17} className="setup-check" />
            </div>

            <div>
              <span className="setup-icon">
                <Building2 size={16} />
              </span>
              <div>
                <strong>Letterhead & watermark</strong>
                <small>Logo, footer and 10% watermark ready</small>
              </div>
              <CheckCircle2 size={17} className="setup-check" />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
            <strong className="text-xs text-slate-800 block mb-1">Annual Turnover Baseline</strong>
            <div className="space-y-1 text-[11px] text-slate-600">
              {(companyProfile?.annualTurnover || [
                { year: '2023-24', amountDisplay: '₹16.20 Cr' },
                { year: '2022-23', amountDisplay: '₹14.50 Cr' },
                { year: '2021-22', amountDisplay: '₹13.70 Cr' }
              ]).map((t) => (
                <div key={t.year} className="flex justify-between">
                  <span>FY {t.year}</span>
                  <strong className="text-slate-800">{t.amountDisplay}</strong>
                </div>
              ))}
            </div>
          </div>

          <button
            className="button button-secondary full-width"
            onClick={onEditProfile}
          >
            Edit company profile <ArrowUpRight size={15} />
          </button>
        </section>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        document={selectedDocForPreview}
        companyProfile={companyProfile}
      />
    </>
  );
}

// -------------------------------------------------------------
// 3. TENDER INTAKE VIEW (LIVE FILE UPLOAD & AI EXTRACTION)
// -------------------------------------------------------------
function TenderIntake({ tenders = [], activeTender, onSelectTender, setActive, setStage, onTenderCreated }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  const steps = [
    'Reading PDF structure & 44+ pages...',
    'Extracting RFP scope, deadlines & EMD...',
    'Matching criteria with Company Vault...',
    'Building 4-Gate Decision Scorecard...'
  ];

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsUploading(true);
    setUploadStep(0);

    const stepInterval = setInterval(() => {
      setUploadStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1100);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);

      const res = await tenderAPI.upload(formData);
      clearInterval(stepInterval);
      setUploadStep(steps.length - 1);

      setTimeout(() => {
        setIsUploading(false);
        if (res.data?.tender) {
          onTenderCreated(res.data.tender);
          toast.success('RFP Document analyzed successfully!', {
            description: `${selectedFile.name} parsed into structured fields.`
          });
        }
      }, 500);
    } catch (err) {
      clearInterval(stepInterval);
      setIsUploading(false);
      toast.error('Failed to parse tender PDF', {
        description: err.response?.data?.error || err.message
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb">
            <span>Bid workspace</span>
            <ChevronRight size={13} />
            <strong>Tender Intake</strong>
          </div>
          <h1>Bring a tender into focus.</h1>
          <p>Upload the RFP, confirm the extracted brief, then move into deterministic checks.</p>
        </div>
        <div className="heading-actions flex items-center gap-2">
          {tenders.length > 1 && (
            <select
              value={activeTender?.id || ''}
              onChange={(e) => {
                const target = tenders.find(t => t.id === e.target.value);
                if (target && onSelectTender) onSelectTender(target);
              }}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#173C40]"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderNumber || t.reference}: {t.title ? (t.title.length > 40 ? t.title.slice(0, 40) + '...' : t.title) : 'Untitled'}
                </option>
              ))}
            </select>
          )}
          <button
            className="button button-secondary"
            onClick={() => toast('How it works', { description: 'Upload any government or private RFP (PDF, DOCX, XLSX). AI extracts 24 critical fields.' })}
          >
            <HelpCircle size={16} /> How it works
          </button>
          <button
            className="button button-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} /> Upload RFP
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            accept=".pdf,.docx,.doc,.txt,.xlsx"
            className="hidden"
          />
        </div>
      </div>

      <div className="intake-layout fade-up delay-1">
        <section
          className={`upload-card ${activeTender || file ? 'upload-complete' : ''} ${isDragging ? 'border-[#173C40] bg-[#eaf7ef]' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-orb">
            <FileText size={28} />
          </div>

          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <div className="w-10 h-10 rounded-full border-3 border-emerald-200 border-t-[#173C40] animate-spin" />
              <strong className="text-xs text-slate-800 font-semibold">{file?.name || 'Processing RFP...'}</strong>
              <p className="text-[10px] text-[#18794e] font-mono animate-pulse">{steps[uploadStep]}</p>
              <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#18794e] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${((uploadStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : activeTender || file ? (
            <>
              <StatusPill tone="green">Active RFP Loaded</StatusPill>
              <h2 className="text-base font-bold text-slate-900 mt-2">
                {activeTender?.uploadedFileName || activeTender?.documentMeta?.fileName || file?.name || 'Assam_DCS_RFP_2026.pdf'}
              </h2>
              <p>
                {activeTender?.documentMeta?.pageCount || activeTender?.documentMeta?.numPages || 44} pages · {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'Analyzed with AI'} · Ready for extraction preview
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  className="button button-secondary text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} /> Upload another RFP
                </button>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setActive('Eligibility');
                    setStage(3);
                    toast.success('Extraction preview confirmed');
                  }}
                >
                  Review extracted brief <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Drop your RFP here</h2>
              <p>PDFs up to 150 pages, scanned or digital. AI will extract all 24 gates and parameters.</p>
              <button
                className="button button-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} /> Choose PDF file
              </button>
              <span className="upload-caption">or drag & drop anywhere in this area</span>
            </>
          )}
        </section>

        <section className="panel extraction-panel">
          <div className="eyebrow">WHAT HAPPENS NEXT</div>
          <h2>From RFP pages to one clear brief.</h2>
          <div className="extraction-steps">
            <div className="extraction-step">
              <span>01</span>
              <div>
                <strong>Read & structure</strong>
                <p>Metadata, deadlines, fees and clauses become searchable fields.</p>
              </div>
            </div>
            <div className="extraction-step">
              <span>02</span>
              <div>
                <strong>Surface the gates</strong>
                <p>Turnover, years of experience, certificates and local office rules.</p>
              </div>
            </div>
            <div className="extraction-step">
              <span>03</span>
              <div>
                <strong>Build the scorecard</strong>
                <p>100-mark technical matrix becomes a transparent readiness score.</p>
              </div>
            </div>
          </div>
          <div className="extraction-note">
            <Sparkles size={15} />
            <span>AI extraction is connected live to local Groq/Gemini models.</span>
          </div>
        </section>
      </div>

      <section className="panel extracted-preview fade-up delay-2">
        <SectionTitle
          eyebrow="EXTRACTION PREVIEW · LIVE DATA"
          title={activeTender?.title || 'Digital Citizen Services Platform'}
          detail="Review extracted parameters before the rules engine evaluates your profile."
          action={<StatusPill tone="blue">Awaiting confirmation</StatusPill>}
        />
        <div className="preview-grid">
          <div>
            <span className="preview-label">Tender reference</span>
            <strong>{activeTender?.tenderNumber || activeTender?.reference || 'ELE.93/2024/2'}</strong>
          </div>
          <div>
            <span className="preview-label">Authority</span>
            <strong>{activeTender?.organization || activeTender?.authority || 'Electronics & IT Dept.'}</strong>
          </div>
          <div>
            <span className="preview-label">Bid deadline</span>
            <strong>
              {activeTender?.submissionDeadline
                ? new Date(activeTender.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : activeTender?.due || '24 Sep 2026 · 17:00 IST'}
            </strong>
          </div>
          <div>
            <span className="preview-label">EMD amount</span>
            <strong>{activeTender?.emdDisplay || (activeTender?.emdAmountINR ? '₹' + Number(activeTender.emdAmountINR).toLocaleString('en-IN') : '₹50,000')}</strong>
          </div>
          <div>
            <span className="preview-label">Mandatory certificates</span>
            <strong>
              {(activeTender?.eligibilityCriteria?.requiredCertifications || ['ISO 9001', 'ISO 27001']).join(' · ')}
            </strong>
          </div>
          <div>
            <span className="preview-label">Estimated Value</span>
            <strong>{activeTender?.estimatedValueDisplay || '₹2.50 Crore (Estimated)'}</strong>
          </div>
        </div>

        <div className="preview-footer">
          <span>
            <CheckCircle2 size={15} /> {activeTender?.complianceItems?.length || 24} fields structured
          </span>
          <span>
            <FileCheck2 size={15} /> {activeTender?.documentMeta?.detectedSections?.length || 7} sections detected
          </span>
          <button
            className="button button-primary"
            onClick={() => {
              setActive('Eligibility');
              setStage(3);
              toast.success('Confirmed! Evaluating against Tech Solutions Vault.');
            }}
          >
            Confirm & check eligibility <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </>
  );
}

// -------------------------------------------------------------
// 4. ELIGIBILITY VIEW
// -------------------------------------------------------------
function Eligibility({ activeTender, setActive }) {
  const [selected, setSelected] = useState('overview');

  const gates = useMemo(() => {
    if (activeTender?.complianceItems && activeTender.complianceItems.length > 0) {
      return activeTender.complianceItems.map(c => ({
        name: `${c.clauseNo} · ${c.category || 'Compliance'}`,
        requirement: c.requirement,
        result: c.justification || c.status,
        pass: c.status === 'Complied'
      }));
    }
    if (activeTender?.gates) return activeTender.gates;
    return [
      { name: 'Average annual turnover', requirement: `Minimum ${activeTender?.eligibilityCriteria?.minTurnoverDisplay || '₹1.50 Cr'} in last 3 years`, result: '₹16.20 Cr verified', pass: true },
      { name: 'Relevant experience', requirement: `${activeTender?.eligibilityCriteria?.minExperienceYears || 3}+ years in similar IT projects`, result: '8 years verified', pass: true },
      { name: 'Mandatory certificates', requirement: (activeTender?.eligibilityCriteria?.requiredCertifications || ['ISO 9001:2015', 'ISO 27001']).join(' + '), result: 'ISO 27001 expiring soon', pass: false },
      { name: 'Data Sovereignty', requirement: 'MeitY Empanelled Indian Cloud', result: 'AWS/Azure India Tier-III', pass: true },
    ];
  }, [activeTender]);

  const score = activeTender?.goNoGoAnalysis?.overallScore || activeTender?.score || '82.5';
  const preQual = activeTender?.goNoGoAnalysis?.financialFitScore ? (activeTender.goNoGoAnalysis.financialFitScore / 2).toFixed(1) : '37.5';
  const techQual = activeTender?.goNoGoAnalysis?.technicalFitScore ? (activeTender.goNoGoAnalysis.technicalFitScore / 2).toFixed(1) : '45.0';

  return (
    <>
      <div className="page-heading fade-up">
        <div>
          <div className="breadcrumb">
            <span>Bid workspace</span>
            <ChevronRight size={13} />
            <strong>Eligibility</strong>
          </div>
          <h1>Can you win this bid?</h1>
          <p>Transparent, deterministic checks against your verified company vault for <strong>{activeTender?.title}</strong>.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary"
            onClick={() => toast.success('Scorecard exported', { description: 'Eligibility report generated.' })}
          >
            <ExternalLink size={16} /> Export scorecard
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              setActive('Payment Proof');
              toast.success('Moving to payment proof');
            }}
          >
            Continue to payment <ChevronRight size={16} />
          </button>
        </div>
      </div>

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
            <h2>{activeTender?.goNoGoAnalysis?.decision || 'Good to proceed'}</h2>
            <p>{activeTender?.goNoGoAnalysis?.recommendationSummary || 'Pass the gate, close one document gap, then build your proposal.'}</p>
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
                className={`gate-row ${gate.pass ? 'gate-pass' : 'gate-fail'}`}
                key={gate.name + idx}
              >
                <span className="gate-icon">
                  {gate.pass ? <Check size={17} /> : <AlertTriangle size={17} />}
                </span>
                <div>
                  <strong>{gate.name}</strong>
                  <small>{gate.requirement}</small>
                </div>
                <div className="gate-result">
                  <strong>{gate.result}</strong>
                  <StatusPill tone={gate.pass ? 'green' : 'amber'}>
                    {gate.pass ? 'Passed' : 'Review'}
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel gap-panel">
          <SectionTitle eyebrow="RISK & GAP ANALYSIS" title="Key tender risks" />
          <div className="gap-callout">
            <AlertTriangle size={20} />
            <div>
              <strong>{activeTender?.goNoGoAnalysis?.swot?.threats?.[0] || 'Liquidated damages (LD) penalties apply'}</strong>
              <p>{activeTender?.keyRisks?.[0]?.description || '0.5% per week delay up to 10% maximum. Milestone tracking recommended.'}</p>
              <button onClick={() => setSelected('document')}>
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

          {selected === 'document' && (
            <div className="selected-clause">
              <FileText size={15} />
              <span>
                Clause 5.4 · Liquidated damages & milestone delivery governance.
              </span>
              <X size={14} onClick={() => setSelected('overview')} />
            </div>
          )}
        </section>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// 5. PAYMENT PROOF VIEW
// -------------------------------------------------------------
function PaymentProof({ activeTender, setActive }) {
  const [mode, setMode] = useState('Demand Draft (DD)');
  const [saved, setSaved] = useState(true);
  const [utr, setUtr] = useState('DD-849201934');
  const [amount, setAmount] = useState('₹50,000');
  const [bank, setBank] = useState('State Bank of India · Lucknow Branch');
  const [issueDate, setIssueDate] = useState('21 Sep 2026');

  useEffect(() => {
    if (activeTender) {
      if (activeTender.emdDisplay) {
        setAmount(activeTender.emdDisplay);
      } else if (activeTender.emdAmountINR) {
        setAmount(`₹${Number(activeTender.emdAmountINR).toLocaleString('en-IN')}`);
      }
    }
  }, [activeTender]);

  const handleSavePayment = async () => {
    try {
      if (activeTender?.id) {
        await tenderAPI.savePaymentProof(activeTender.id, {
          mode,
          instrumentNumber: utr,
          amountDisplay: amount,
          bank,
          issueDate,
          isSaved: true
        });
      }
      setSaved(true);
      toast.success('Payment proof saved to Cover-1 successfully');
    } catch (err) {
      toast.error('Failed to save payment proof');
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
          <h1>Make the money trail simple.</h1>
          <p>Capture tender fee and EMD proof once. The binder places it in the right cover automatically.</p>
        </div>
        <div className="heading-actions">
          <StatusPill tone={saved ? 'green' : 'amber'}>
            {saved ? 'Proof saved' : 'Proof pending'}
          </StatusPill>
        </div>
      </div>

      <div className="payment-layout fade-up delay-1">
        <section className="panel payment-form">
          <SectionTitle
            eyebrow="COVER 1 · PAYMENT PROOF"
            title="Tender fee & EMD"
            detail={`${activeTender?.tenderNumber || activeTender?.reference || 'TDR-996534'} · ${activeTender?.title || 'RFP Tender'}`}
          />
          <div className="mode-tabs">
            {['Demand Draft (DD)', 'NEFT / RTGS', 'Portal challan', 'MSME exemption'].map((item) => (
              <button
                className={mode === item ? 'active' : ''}
                key={item}
                onClick={() => setMode(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label>
              <span>Instrument / DD / UTR number</span>
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
              />
            </label>
            <label>
              <span>EMD Amount</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label>
              <span>Bank / issuing authority</span>
              <input
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              />
            </label>
            <label>
              <span>Issue date</span>
              <input
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </label>
          </div>

          <div className="receipt-drop">
            <div className="receipt-icon">
              <FileText size={20} />
            </div>
            <div>
              <strong>EMD_DD_Proof_{activeTender?.tenderNumber || 'Scan'}.pdf</strong>
              <span>Uploaded just now · 482 KB</span>
            </div>
            <CheckCircle2 size={18} className="receipt-ok" />
          </div>

          <div className="form-footer">
            <span>
              <ShieldCheck size={15} /> Encrypted in company vault
            </span>
            <button
              className="button button-primary"
              onClick={handleSavePayment}
            >
              Save payment proof <Check size={16} />
            </button>
          </div>
        </section>

        <section className="payment-preview">
          <div className="preview-paper">
            <div className="paper-header">
              <span className="paper-logo">TS</span>
              <span>Tech Solutions Pvt Ltd</span>
              <small>TENDER FEE & EMD PROOF</small>
            </div>
            <div className="paper-rule" />
            <div className="paper-title">Submission Proof Slip</div>
            <div className="paper-fields">
              <span>
                Tender ref.
                <strong>{activeTender?.tenderNumber || activeTender?.reference || 'TDR-996534'}</strong>
              </span>
              <span>
                Instrument
                <strong>{utr}</strong>
              </span>
              <span>
                Amount
                <strong>{amount}</strong>
              </span>
              <span>
                Mode
                <strong>{mode}</strong>
              </span>
            </div>
            <div className="fake-receipt">
              <span>{bank.toUpperCase()}</span>
              <strong>DEMAND DRAFT / PAYMENT ACKNOWLEDGEMENT</strong>
              <small>NO. {utr} · FAVOURING {activeTender?.organization?.slice(0, 30) || 'UPSTDC Ltd.'}</small>
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

// -------------------------------------------------------------
// 6. PROPOSAL DESK VIEW
// -------------------------------------------------------------
function ProposalDesk({ activeTender, setActive }) {
  const [doc, setDoc] = useState('Executive Summary');
  const docs = [
    'Executive Summary',
    'Approach & Methodology',
    'Implementation Plan',
    'Covering Letter',
    'Key Personnel CVs'
  ];

  const handleRequestReview = () => {
    toast.success('Review request sent to Arjun Mehta', {
      description: 'Signatory notified for digital verification.'
    });
  };

  const getDocContent = () => {
    if (doc === 'Executive Summary') {
      return activeTender?.proposals?.executiveSummary || `Tech Solutions Pvt Ltd is pleased to submit this comprehensive technical bid for ${activeTender?.title || 'this project'}.`;
    }
    if (doc === 'Approach & Methodology') {
      return activeTender?.proposals?.technicalApproach || `Our technical approach utilizes modular, cloud-ready architecture designed for high availability and strict security adherence under ${activeTender?.organization || 'the Department'}.`;
    }
    if (doc === 'Implementation Plan') {
      return activeTender?.proposals?.implementationPlan || `Phase 1: System Mobilization (Weeks 1-3)\nPhase 2: Deployment & Configuration (Weeks 4-12)\nPhase 3: Integration & UAT (Weeks 13-16)\nPhase 4: Go-Live & SLA Handover (Weeks 17-20)`;
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
          <p>AI-generated proposal for <strong>{activeTender?.title}</strong>.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary"
            onClick={() => toast.success('Draft version saved locally')}
          >
            <FileCheck2 size={16} /> Save version
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              setActive('PDF Binder');
              toast.success('Draft marked ready for binder');
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
            <button onClick={() => toast('New template added')}>
              <Plus size={15} />
            </button>
          </div>
          {docs.map((item, index) => (
            <button
              key={item}
              className={`editor-doc ${doc === item ? 'active' : ''}`}
              onClick={() => setDoc(item)}
            >
              <span className="editor-doc-num">0{index + 1}</span>
              <span>
                <strong>{item}</strong>
                <small>{index === 1 ? '5 pages · Draft' : 'AI generated'}</small>
              </span>
              <ChevronRight size={15} />
            </button>
          ))}

          <div className="clause-card">
            <div className="eyebrow">RFP CLAUSE</div>
            <p>
              {activeTender?.scopeSummary ? activeTender.scopeSummary.slice(0, 140) + '...' : '“The bidder shall provide an approach that demonstrates delivery governance and SLA adherence.”'}
            </p>
            <button onClick={() => toast.success('Clause text copied to draft paper')}>
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
              <button className="icon-button" onClick={() => toast('Document formatting options')}>
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>

          <div className="editor-paper">
            <div className="editor-watermark">TECH SOLUTIONS</div>
            <div className="document-meta">
              <span>TECH SOLUTIONS PVT LTD</span>
              <span>{activeTender?.tenderNumber || activeTender?.reference}</span>
            </div>
            <h2>{doc}</h2>
            <p className="doc-intro">
              Tailored response for {activeTender?.title} issued by {activeTender?.organization}.
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
              className="button button-primary"
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

// -------------------------------------------------------------
// 7. PDF BINDER VIEW
// -------------------------------------------------------------
function PdfBinder({ activeTender }) {
  const [items, setItems] = useState([
    'Tender fee & EMD proof',
    'Covering letter',
    'Power of Attorney',
    'Non-blacklisting affidavit',
    'Approach & Methodology',
    'Key personnel CVs',
    'CA turnover & financials',
    'GST, PAN & ISO copies'
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
      const tenderId = activeTender?.id || 'tender_ele_93';
      await exportAPI.downloadPackage(tenderId, 'pdf', [
        'executiveSummary',
        'technicalApproach',
        'complianceMatrix',
        'boqSummary'
      ]);
      toast.success('Master PDF Bid Package downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export master PDF');
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
          <p>Continuous stamped compilation for <strong>{activeTender?.title}</strong>.</p>
        </div>
        <div className="heading-actions">
          <StatusPill tone="green">Ready · 44 pages</StatusPill>
          <button
            className="button button-primary"
            onClick={handleExportMasterPDF}
            disabled={exporting}
          >
            <Download size={16} /> {exporting ? 'Generating Master PDF...' : 'Export master PDF'}
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
                className="small-link"
                onClick={() => toast('Auto-sort applied', { description: 'Recommended cover sequence restored.' })}
              >
                Auto-sort <Zap size={14} />
              </button>
            }
          />

          <div className="sequence-list">
            {items.map((item, index) => (
              <button
                className={`sequence-row ${selected === index ? 'selected' : ''}`}
                key={item}
                onClick={() => setSelected(index)}
              >
                <span className="drag-dots">⠿</span>
                <span className="sequence-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="sequence-copy">
                  <strong>{item}</strong>
                  <small>
                    {index === 0 ? 'Cover 1 · 2 pages' : index < 5 ? 'Cover 2 · Letterhead' : 'Cover 2 · Vault document'}
                  </small>
                </span>
                <span className="sequence-pages">
                  {index === 0 ? '02' : index === 4 ? '05' : index === 5 ? '12' : '03'} pp
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
                className="button button-secondary"
                onClick={() => move(-1)}
                disabled={selected === 0}
              >
                Move up
              </button>
              <button
                className="button button-secondary"
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
            <IconButton label="More preview actions" onClick={() => toast('Preview options')}>
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
              {activeTender?.title || 'Adventure & Water Sports Portal'}
            </h3>
            <div className="pdf-cover-meta">
              <span>
                Tender Ref
                <strong>{activeTender?.tenderNumber || activeTender?.reference || 'TDR-996534'}</strong>
              </span>
              <span>
                Client
                <strong>{activeTender?.organization?.slice(0, 28) || 'UPSTDC Ltd.'}</strong>
              </span>
            </div>
            <div className="pdf-cover-stamp">
              MASTER<br />PACKAGE
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
              className="button button-primary"
              onClick={() => toast.success('Table of contents refreshed')}
            >
              Refresh index <Zap size={15} />
            </button>
          </div>
        </aside>
      </div>

      <div className="disclaimer-strip">
        <LockKeyhole size={15} />
        <span>
          Financial BoQ remains separate from this technical package — pricing is always a human decision.
        </span>
        <button onClick={() => toast('BoQ separation is a core compliance rule')}>
          Learn more
        </button>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// MAIN APP COMPONENT
// -------------------------------------------------------------
export default function App() {
  const [active, setActive] = useState('Overview');
  const [stage, setStage] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Backend state
  const [tenders, setTenders] = useState([]);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVaultUploadOpen, setIsVaultUploadOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tendersRes, compRes] = await Promise.all([
        tenderAPI.getAll(),
        companyProfileAPI.get()
      ]);
      const loadedTenders = tendersRes.data.tenders || [];
      setTenders(loadedTenders);
      if (loadedTenders.length > 0 && !selectedTenderId) {
        setSelectedTenderId(loadedTenders[0].id);
      }
      setCompanyProfile(compRes.data.companyProfile || null);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeTender = useMemo(() => {
    if (!tenders || tenders.length === 0) return null;
    if (selectedTenderId) {
      const found = tenders.find((t) => t.id === selectedTenderId);
      if (found) return found;
    }
    return tenders[0] || null;
  }, [tenders, selectedTenderId]);

  const handleSelectTender = (tender) => {
    if (tender && tender.id) {
      setSelectedTenderId(tender.id);
    }
  };

  const handleTenderCreated = (newTender) => {
    setTenders((prev) => [newTender, ...prev.filter(t => t.id !== newTender.id)]);
    setSelectedTenderId(newTender.id);
    setActive('Tender Intake');
    toast.success('New RFP ingested successfully', {
      description: `${newTender.title || newTender.tenderNumber} is now active.`
    });
  };

  const handleSaveProfile = async (updatedData) => {
    const res = await companyProfileAPI.update(updatedData);
    setCompanyProfile(res.data.companyProfile);
  };

  const handleDocumentUploaded = (updatedProfile) => {
    setCompanyProfile(updatedProfile);
    tenderAPI.getAll().then((res) => {
      setTenders(res.data.tenders || []);
    });
  };

  const handleDeleteVaultDoc = async (docId) => {
    try {
      const res = await companyProfileAPI.deleteDocument(docId);
      setCompanyProfile(res.data.companyProfile);
      tenderAPI.getAll().then((r) => setTenders(r.data.tenders || []));
      toast.success('Document removed from Company Vault');
    } catch (err) {
      toast.error('Failed to delete document from vault');
    }
  };

  const pageTitle = useMemo(() => (active === 'Overview' ? 'Overview' : active), [active]);

  let content;
  switch (active) {
    case 'Overview':
      content = (
        <Overview
          tenders={tenders}
          activeTender={activeTender}
          selectedTenderId={selectedTenderId}
          onSelectTender={handleSelectTender}
          setActive={setActive}
          setStage={setStage}
          onOpenUploadModal={() => setIsUploadOpen(true)}
        />
      );
      break;
    case 'Company Vault':
      content = (
        <CompanyVault
          companyProfile={companyProfile}
          onEditProfile={() => setIsProfileModalOpen(true)}
          onUploadDoc={() => setIsVaultUploadOpen(true)}
          onDeleteDoc={handleDeleteVaultDoc}
        />
      );
      break;
    case 'Tender Intake':
      content = (
        <TenderIntake
          tenders={tenders}
          activeTender={activeTender}
          onSelectTender={handleSelectTender}
          setActive={setActive}
          setStage={setStage}
          onTenderCreated={handleTenderCreated}
        />
      );
      break;
    case 'Eligibility':
      content = <Eligibility activeTender={activeTender} setActive={setActive} />;
      break;
    case 'Payment Proof':
      content = <PaymentProof activeTender={activeTender} setActive={setActive} />;
      break;
    case 'Proposal Desk':
      content = <ProposalDesk activeTender={activeTender} setActive={setActive} />;
      break;
    case 'PDF Binder':
      content = <PdfBinder activeTender={activeTender} />;
      break;
    // =========================================================================
    // 🌟 AI AGENT MODE VIEW (Comment this block to HIDE, Uncomment to SHOW)
    // =========================================================================
    case 'AI Mode':
      content = (
        <AIModeWorkspace
          activeTender={activeTender}
          companyProfile={companyProfile}
          onBackToClassic={() => setActive('Overview')}
        />
      );
      break;
    // =========================================================================
    default:
      content = (
        <Overview
          tenders={tenders}
          activeTender={activeTender}
          selectedTenderId={selectedTenderId}
          onSelectTender={handleSelectTender}
          setActive={setActive}
          setStage={setStage}
          onOpenUploadModal={() => setIsUploadOpen(true)}
        />
      );
  }

  return (
    <div className="app-shell flex h-screen max-h-screen overflow-hidden">
      <Toaster richColors position="top-right" />

      {/* SIDEBAR */}
      <aside className={`sidebar sticky top-0 h-screen max-h-screen overflow-y-auto shrink-0 ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-lockup">
            <LogoMark />
            {!isSidebarCollapsed && (
              <div>
                <strong>
                  Tender<span>Flow</span>
                </strong>
                <small>Bid operations OS</small>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse to Icons"}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="workspace-switcher" onClick={() => setIsProfileModalOpen(true)} style={{ cursor: 'pointer' }} title={isSidebarCollapsed ? "Tech Solutions (Admin)" : undefined}>
          <div className="workspace-avatar">TS</div>
          {!isSidebarCollapsed && (
            <>
              <div>
                <strong>Tech Solutions</strong>
                <small>Admin workspace</small>
              </div>
              <ChevronDown size={15} />
            </>
          )}
        </div>

        <nav className="side-nav">
          {['Workspace', 'Bid workspace'].map((section) => (
            <div key={section} className="nav-section">
              {!isSidebarCollapsed && <span className="nav-section-label">{section}</span>}
              {navItems
                .filter((item) => item.section === section)
                .map((item) => {
                  const NavIcon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className={`nav-item ${active === item.label ? 'active' : ''}`}
                      title={isSidebarCollapsed ? item.label : undefined}
                      onClick={() => {
                        setActive(item.label);
                        setSidebarOpen(false);
                        if (item.label === 'Eligibility') setStage(3);
                      }}
                    >
                      <NavIcon size={17} strokeWidth={active === item.label ? 2.2 : 1.8} />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                      {!isSidebarCollapsed && item.badge && <span className="nav-badge">{item.badge}</span>}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        {!isSidebarCollapsed && (
          <div className="sidebar-tip">
            <div className="tip-spark">
              <Sparkles size={15} />
            </div>
            <strong>30 min to bid-ready</strong>
            <p>Your workflow is 41% faster than the team average.</p>
            <button
              onClick={() =>
                toast('Automation insights', {
                  description: 'Time saved is calculated from your workspace activity.'
                })
              }
            >
              See insights <ArrowUpRight size={14} />
            </button>
          </div>
        )}

        <div className="sidebar-footer">
          <button
            className="nav-item"
            title={isSidebarCollapsed ? "Settings" : undefined}
            onClick={() => toast('Settings', { description: 'Workspace configuration opened.' })}
          >
            <Settings2 size={17} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
          <div className="profile-row" onClick={() => setIsProfileModalOpen(true)} style={{ cursor: 'pointer' }} title={isSidebarCollapsed ? "Arjun Mehta (Administrator)" : undefined}>
            <div className="profile-avatar">AM</div>
            {!isSidebarCollapsed && (
              <>
                <div>
                  <strong>Arjun Mehta</strong>
                  <small>Administrator</small>
                </div>
                <MoreHorizontal size={16} />
              </>
            )}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="main-area flex-1 flex flex-col h-screen max-h-screen overflow-y-auto min-w-0">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
              <Menu size={19} />
            </button>
            <div className="topbar-page">
              <Grid2X2 size={15} />
              <span>{pageTitle}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input placeholder="Search tenders, documents..." />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="icon-button"
              aria-label="Tender Copilot AI"
              title="Tender Copilot AI"
              onClick={() => setIsChatOpen((v) => !v)}
            >
              <Sparkles size={18} className="text-[#18794e]" />
            </button>

            <IconButton
              label="Help center"
              onClick={() =>
                toast('Help Center', { description: 'Guidance is available inside each workflow step.' })
              }
            >
              <HelpCircle size={18} />
            </IconButton>

            <button
              className="notification-button"
              aria-label="Notifications"
              onClick={() => toast('Notifications', { description: '3 alerts: ISO 27001 expiring, EMD payment pending, draft ready.' })}
            >
              <Bell size={18} />
              <i />
            </button>

            <div
              className="top-avatar"
              onClick={() => setIsProfileModalOpen(true)}
              style={{ cursor: 'pointer' }}
              title="Arjun Mehta (Tech Solutions)"
            >
              AM
            </div>
          </div>
        </header>

        <div className={`page-content ${active === 'AI Mode' ? '!p-0 !max-w-none !h-[calc(100vh-66px)] !overflow-hidden' : ''}`}>{content}</div>
      </main>

      {/* AI CHAT DRAWER */}
      <TenderAIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        tender={activeTender}
        tenders={tenders}
      />

      {/* UPLOAD TENDER MODAL */}
      <TenderUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onTenderCreated={handleTenderCreated}
      />

      {/* VAULT DOCUMENT UPLOAD MODAL */}
      <VaultDocumentUploadModal
        isOpen={isVaultUploadOpen}
        onClose={() => setIsVaultUploadOpen(false)}
        onDocumentUploaded={handleDocumentUploaded}
      />

      {/* COMPANY PROFILE MODAL */}
      <CompanyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={companyProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
