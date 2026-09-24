import React from "react";
import {
  BarChart3,
  Target,
  Layers,
  TrendingUp,
  Award,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export default function Analytics({ tenders = [] }) {
  const totalTenders = tenders.length;
  const goCount = tenders.filter(
    (t) => t.goNoGoAnalysis?.decision === "GO",
  ).length;
  const condCount = tenders.filter(
    (t) => t.goNoGoAnalysis?.decision === "CONDITIONAL GO",
  ).length;
  const nogoCount = tenders.filter(
    (t) => t.goNoGoAnalysis?.decision === "NO-GO",
  ).length;

  const totalValueINR = tenders.reduce(
    (acc, t) => acc + (Number(t.estimatedValueINR) || 0),
    0,
  );
  const avgWinProb =
    totalTenders > 0
      ? Math.round(
          tenders.reduce(
            (acc, t) => acc + (t.goNoGoAnalysis?.winProbability || 70),
            0,
          ) / totalTenders,
        )
      : 0;

  const categoryCounts = tenders.reduce((acc, t) => {
    const cat = t.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-7 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[11.5px] font-mono text-slate-400">
          Workspace <span className="text-slate-300">&gt;</span>{" "}
          <strong className="text-slate-600 font-semibold">Analytics</strong>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Bid Portfolio Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Real-time metrics on qualification efficiency, win probability
          scoring, and category distribution.
        </p>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="tf-card p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tracked Tenders
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {totalTenders}
          </div>
          <p className="text-[11px] text-[#0D5C52] font-semibold">
            Across GeM, CPPP &amp; PSUs
          </p>
        </div>

        <div className="tf-card p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Gross Pipeline Value
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹{(totalValueINR / 10000000).toFixed(1)}Cr
          </div>
          <p className="text-[11px] text-slate-400">
            Cumulative opportunity value
          </p>
        </div>

        <div className="tf-card p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Win Probability
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {avgWinProb}%
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            High qualification match
          </p>
        </div>

        <div className="tf-card p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Qualified GO Rate
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {totalTenders > 0 ? Math.round((goCount / totalTenders) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-400">
            {goCount} bids qualified to proceed
          </p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Qualification Distribution */}
        <div className="tf-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-[#0D5C52]">
            <Target size={17} />
            <h3 className="font-extrabold text-sm text-slate-900">
              AI Qualification Distribution
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Strong GO ({goCount})</span>
                </span>
                <span className="font-bold text-emerald-700">
                  {totalTenders > 0
                    ? Math.round((goCount / totalTenders) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${totalTenders > 0 ? (goCount / totalTenders) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Conditional GO ({condCount})</span>
                </span>
                <span className="font-bold text-amber-700">
                  {totalTenders > 0
                    ? Math.round((condCount / totalTenders) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${totalTenders > 0 ? (condCount / totalTenders) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>NO-GO Disqualified ({nogoCount})</span>
                </span>
                <span className="font-bold text-red-700">
                  {totalTenders > 0
                    ? Math.round((nogoCount / totalTenders) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${totalTenders > 0 ? (nogoCount / totalTenders) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="tf-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-[#0D5C52]">
            <Layers size={17} />
            <h3 className="font-extrabold text-sm text-slate-900">
              Tenders by Sector
            </h3>
          </div>

          <div className="space-y-2 pt-1">
            {Object.entries(categoryCounts).map(([cat, count], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-bold text-slate-800">{cat}</span>
                <span className="font-mono font-bold text-[#0D5C52]">
                  {count} {count === 1 ? "tender" : "tenders"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
