import React, { ReactNode } from "react";
import {
  Sparkles,
  LayoutDashboard,
  FolderLock,
  FileText,
  ShieldCheck,
  CreditCard,
  PenLine,
  Library,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  section: string;
  badge?: string;
}

export const navItems: NavItem[] = [
  {
    label: "Overview",
    path: "/overview",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "Company Vault",
    path: "/vault",
    icon: FolderLock,
    section: "Workspace",
    badge: "96%",
  },
  {
    label: "Tenders Repository",
    path: "/intake",
    icon: FileText,
    section: "Bid Operations",
  },
  {
    label: "AI Mode",
    path: "/ai-mode",
    icon: Sparkles,
    section: "Bid Operations",
    badge: "AI 2.0",
  },
];

export interface PipelineStep {
  id: number;
  key: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
}

export const tenderPipelineSteps: PipelineStep[] = [
  {
    id: 1,
    key: "overview",
    label: "1. Overview & Scope",
    subtitle: "Parameters & AI Copilot",
    icon: FileText,
  },
  {
    id: 2,
    key: "eligibility",
    label: "2. Eligibility & Gates",
    subtitle: "Scorecard & Rules",
    icon: ShieldCheck,
  },
  {
    id: 3,
    key: "payment",
    label: "3. Payment Proof",
    subtitle: "EMD & Cover-1 Slip",
    icon: CreditCard,
  },
  {
    id: 4,
    key: "proposal",
    label: "4. Proposal Desk",
    subtitle: "AI Technical Drafts",
    icon: PenLine,
  },
  {
    id: 5,
    key: "binder",
    label: "5. PDF Binder",
    subtitle: "Master Pack & Export",
    icon: Library,
  },
];

export interface PipelineItem {
  id: number;
  label: string;
  path: string;
  sub: string;
  icon: LucideIcon;
  state: "done" | "current" | "next" | string;
}

export const pipeline: PipelineItem[] = [
  {
    id: 1,
    label: "Company Vault",
    path: "/vault",
    sub: "Profile & documents",
    icon: FolderLock,
    state: "done",
  },
  {
    id: 2,
    label: "Tender Intake",
    path: "/intake",
    sub: "Upload & extract",
    icon: FileText,
    state: "done",
  },
  {
    id: 3,
    label: "Eligibility",
    path: "/eligibility",
    sub: "Rules & score",
    icon: ShieldCheck,
    state: "current",
  },
  {
    id: 4,
    label: "Payment Proof",
    path: "/payment-proof",
    sub: "Fee & EMD",
    icon: CreditCard,
    state: "next",
  },
  {
    id: 5,
    label: "Proposal Desk",
    path: "/proposal-desk",
    sub: "Draft & review",
    icon: PenLine,
    state: "next",
  },
  {
    id: 6,
    label: "PDF Binder",
    path: "/pdf-binder",
    sub: "Assemble & export",
    icon: Library,
    state: "next",
  },
];

export function LogoMark() {
  return (
    <div className="logo-mark" aria-label="TenderFlow logo">
      <span className="logo-mark-orbit" />
      <span className="logo-mark-core">T</span>
    </div>
  );
}

interface StatusPillProps {
  children: ReactNode;
  tone?: "slate" | "green" | "emerald" | "amber" | "red" | "blue" | "purple" | string;
}

export function StatusPill({ children, tone = "slate" }: StatusPillProps) {
  return (
    <span className={`status-pill status-${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}

interface IconButtonProps {
  label: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function IconButton({ label, children, onClick }: IconButtonProps) {
  return (
    <button
      className="icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}

export function SectionTitle({ eyebrow, title, detail, action }: SectionTitleProps) {
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
