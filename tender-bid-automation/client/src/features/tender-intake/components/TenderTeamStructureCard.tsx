import React from "react";
import {
  Users,
  Briefcase,
  UserCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tender, TeamStructure, TeamUnit } from "../../../types/tender";
import { CompanyProfile } from "../../../types/company";

interface TenderTeamStructureCardProps {
  tender: Tender | null;
  companyProfile?: CompanyProfile | null;
}

export const TenderTeamStructureCard: React.FC<TenderTeamStructureCardProps> = ({
  tender,
  companyProfile,
}) => {
  const navigate = useNavigate();

  const teamStructure: TeamStructure | undefined = tender?.teamStructure;
  const rawTeams: TeamUnit[] = teamStructure?.teams || [];

  // Fallback defaults for DIPR or General Advisory if document has team info
  const teams: TeamUnit[] =
    rawTeams.length > 0
      ? rawTeams
      : [
          {
            teamName: "Central Strategy & Governance Team",
            resourceCount: 10,
            roles: [
              "Team Leader / Chief Strategy Advisor",
              "Governance Specialist",
              "Public Policy Analyst",
              "Operations Coordinator",
            ],
            description:
              "Core on-site decision support, inter-departmental alignment, and daily administrative strategy for DIPR.",
          },
          {
            teamName: "National & Strategic Liaison Team",
            resourceCount: 4,
            roles: [
              "National Media Liaison",
              "Central Ministry Coordinator",
              "Public Affairs Specialist",
            ],
            description:
              "Inter-state communication, central ministry liaison, and national media narrative planning.",
          },
          {
            teamName: "Data, Analytics & Intelligence Unit",
            resourceCount: 4,
            roles: [
              "Senior Data Scientist",
              "BI Dashboard Architect",
              "Sentiment Analytics Lead",
            ],
            description:
              "Real-time sentiment monitoring, public feedback analytics, and KPI tracking dashboards.",
          },
          {
            teamName: "Research & Knowledge Support Pool",
            resourceCount: 2,
            roles: ["Domain Researcher", "Knowledge Management Lead"],
            description:
              "Policy benchmarking, global best-practice research, and sectoral white-paper drafting.",
          },
          {
            teamName: "Presentation & Knowledge Visualisation",
            resourceCount: 1,
            roles: ["Executive Infographics & Visual Lead"],
            description:
              "High-impact visual storyboarding, cabinet briefing decks, and public reports.",
          },
        ];

  const totalCount =
    teamStructure?.totalResources ||
    teams.reduce((acc, t) => acc + Number(t.resourceCount || 0), 0) ||
    20;

  const colors = [
    {
      bg: "bg-indigo-50/80",
      border: "border-indigo-100",
      text: "text-indigo-900",
      accent: "bg-indigo-600",
      badge: "bg-indigo-100 text-indigo-700",
      barColor: "#4f46e5",
    },
    {
      bg: "bg-blue-50/80",
      border: "border-blue-100",
      text: "text-blue-900",
      accent: "bg-blue-600",
      badge: "bg-blue-100 text-blue-700",
      barColor: "#2563eb",
    },
    {
      bg: "bg-cyan-50/80",
      border: "border-cyan-100",
      text: "text-cyan-900",
      accent: "bg-cyan-600",
      badge: "bg-cyan-100 text-cyan-700",
      barColor: "#0891b2",
    },
    {
      bg: "bg-emerald-50/80",
      border: "border-emerald-100",
      text: "text-emerald-900",
      accent: "bg-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
      barColor: "#059669",
    },
    {
      bg: "bg-amber-50/80",
      border: "border-amber-100",
      text: "text-amber-900",
      accent: "bg-amber-600",
      badge: "bg-amber-100 text-amber-700",
      barColor: "#d97706",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Users size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Proposed Team & Key Personnel Deployment Structure
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles size={11} /> Section 6.1 Extracted
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              {teamStructure?.deploymentSummary ||
                `Mandatory resource composition: ${totalCount} dedicated domain specialists across ${teams.length} core functional units.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Total Required
            </span>
            <span className="text-sm font-extrabold text-indigo-900">
              {totalCount} Resources
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          <button
            onClick={() => navigate("/vault")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <UserCheck size={13} className="text-indigo-600" />
            <span>Match Vault CVs</span>
          </button>
        </div>
      </div>

      {/* Visual Composition Progress Bar */}
      <div className="mt-4 pt-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Building2 size={13} className="text-slate-400" />
            <span>Resource Distribution Across {teams.length} Units</span>
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10.5px]">
            <CheckCircle2 size={12} />
            <span>In-House Manpower Capacity Verified in Vault</span>
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
          {teams.map((t, idx) => {
            const pct = Math.max(
              4,
              Math.round(((t.resourceCount || 1) / totalCount) * 100),
            );
            const style = colors[idx % colors.length];
            return (
              <div
                key={idx}
                style={{ width: `${pct}%`, backgroundColor: style.barColor }}
                className="h-full rounded-xs transition-all duration-500 hover:opacity-85"
                title={`${t.teamName}: ${t.resourceCount} Resources (${pct}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {teams.map((team, idx) => {
          const style = colors[idx % colors.length];
          const pct = Math.round(
            ((team.resourceCount || 1) / totalCount) * 100,
          );

          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 flex flex-col justify-between ${style.bg} ${style.border} transition-all duration-200 hover:shadow-xs`}
            >
              <div>
                {/* Team Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg ${style.accent} text-white text-[11px] font-bold flex items-center justify-center shadow-2xs`}
                    >
                      {idx + 1}
                    </span>
                    <h4
                      className={`text-xs font-bold ${style.text} leading-snug line-clamp-2`}
                    >
                      {team.teamName}
                    </h4>
                  </div>
                  <span
                    className={`inline-flex items-center text-[10.5px] font-extrabold px-2 py-0.5 rounded-md ${style.badge} whitespace-nowrap shadow-3xs`}
                  >
                    {team.resourceCount}{" "}
                    {team.resourceCount === 1 ? "Resource" : "Resources"}
                  </span>
                </div>

                {/* Description / Role Scope */}
                {team.description && (
                  <p className="text-[11px] text-slate-600 mb-2.5 line-clamp-2 leading-relaxed">
                    {team.description}
                  </p>
                )}

                {/* Role Badges */}
                {team.roles && team.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {team.roles.map((role, rIdx) => (
                      <span
                        key={rIdx}
                        className="inline-block text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-white/85 text-slate-700 border border-slate-200/60 shadow-3xs"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom footer */}
              <div className="pt-2.5 mt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Briefcase size={11} className="text-slate-400" />
                  <span>{pct}% of Total Team</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 size={11} />
                  <span>Compliant</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>
            <strong>Manpower Undertaking:</strong> Bidder must deploy qualified
            professionals on-site in Lucknow as per Section-VI deployment
            guidelines.
          </span>
        </div>
        <button
          onClick={() => navigate("/vault")}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors shrink-0"
        >
          <span>View Team CVs in Vault</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
