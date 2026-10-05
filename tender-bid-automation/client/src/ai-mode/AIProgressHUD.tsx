import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, FileText, Library, Cpu, Layers } from 'lucide-react';

interface AIProgressHUDProps {
  activeStep?: number;
  latency?: string;
  tokens?: string;
}

export default function AIProgressHUD({ activeStep = 4, latency = '1.1s', tokens = '3,480' }: AIProgressHUDProps) {
  const pipeline = [
    { id: 1, label: '1. Ingestion', status: 'done', icon: FileText },
    { id: 2, label: '2. PoA & MSME', status: 'done', icon: ShieldCheck },
    { id: 3, label: '3. Compliance 100%', status: 'done', icon: CheckCircle2 },
    { id: 4, label: '4. AI Proposal Studio', status: 'active', icon: Sparkles },
    { id: 5, label: '5. Master PDF Binder', status: 'ready', icon: Library },
  ];

  return (
    <footer className="aimode-hud">
      <div className="aimode-hud-steps">
        <span style={{ fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Agent Pipeline:
        </span>
        {pipeline.map((p) => {
          const Icon = p.icon;
          const isDone = p.id < activeStep;
          const isActive = p.id === activeStep;
          return (
            <div
              key={p.id}
              className={`aimode-hud-step-pill ${
                isDone ? 'aimode-hud-done' : isActive ? 'aimode-hud-active' : ''
              }`}
            >
              <Icon size={12} />
              <span>{p.label}</span>
            </div>
          );
        })}
      </div>

      <div className="aimode-hud-metrics">
        <span title="Active Agent Orchestrator">
          <Cpu size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#10b981' }} />
          Model: <strong>Claude 3.7 Sonnet / Gemini Flash</strong>
        </span>
        <span title="Context Window Tokens">
          Tokens: <strong>{tokens}</strong>
        </span>
        <span title="Execution Latency">
          Latency: <strong>{latency}</strong>
        </span>
        <span title="PDF Merge Sandbox">
          <Layers size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#38bdf8' }} />
          Sandbox: <strong style={{ color: '#34d399' }}>Live Ready</strong>
        </span>
      </div>
    </footer>
  );
}
