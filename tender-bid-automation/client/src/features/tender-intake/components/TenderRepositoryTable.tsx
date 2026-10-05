import React from "react";
import {
  ChevronRight,
  Search,
  X,
  FileText,
  CalendarDays,
  Trash2,
} from "lucide-react";
import { StatusPill } from "../../../components/Common";
import { Tender } from "../../../types/tender";

interface TenderRepositoryTableProps {
  tenders: Tender[];
  currentTender: Tender | null;
  filteredTenders: Tender[];
  tableSearch: string;
  setTableSearch: (val: string) => void;
  tableFilter: string;
  setTableFilter: (val: string) => void;
  onOpenTenderDetails: (tender: Tender) => void;
  onDeleteTenderClick?: (tender: Tender) => void;
}

export const TenderRepositoryTable: React.FC<TenderRepositoryTableProps> = ({
  tenders,
  currentTender,
  filteredTenders,
  tableSearch,
  setTableSearch,
  tableFilter,
  setTableFilter,
  onOpenTenderDetails,
  onDeleteTenderClick,
}) => {
  const avgReadiness =
    tenders.length > 0
      ? Math.round(
          tenders.reduce(
            (acc, t) => acc + (t.goNoGoAnalysis?.overallScore || t.score || 80),
            0,
          ) / tenders.length,
        )
      : 0;

  return (
    <div className="space-y-6 fade-up">
      {/* Active Tender Banner in Table View */}
      {currentTender && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold bg-[#18794e] text-white px-2 py-0.5 rounded-full tracking-wider">
                  Currently In Focus
                </span>
                <strong className="text-sm font-bold text-[#173C40] truncate block">
                  {currentTender.title || currentTender.tenderNumber}
                </strong>
              </div>
              <p className="text-xs text-emerald-800 font-mono mt-0.5">
                {currentTender.tenderNumber || currentTender.reference} ·{" "}
                {currentTender.organization ||
                  currentTender.authority ||
                  "Govt Authority"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-[#173C40] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-colors"
            onClick={() => onOpenTenderDetails(currentTender)}
          >
            Open Active Hub <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Total Ingested
          </span>
          <strong className="text-xl font-bold text-slate-900">
            {tenders.length}
          </strong>
          <span className="text-[10.5px] text-slate-500 block mt-0.5">
            RFPs in repository
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Active Focus
          </span>
          <strong className="text-sm font-bold text-[#18794e] truncate block">
            {currentTender?.tenderNumber ||
              currentTender?.reference ||
              "None Selected"}
          </strong>
          <span className="text-[10.5px] text-slate-500 block mt-0.5">
            Primary workspace context
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Avg Readiness
          </span>
          <strong className="text-xl font-bold text-emerald-700">
            {avgReadiness}%
          </strong>
          <span className="text-[10.5px] text-emerald-600 block mt-0.5">
            High eligibility match
          </span>
        </div>
      </div>

      {/* Table Container Panel */}
      <section className="panel tenders-panel bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="search-box">
              <Search size={15} />
              <input
                placeholder="Search tender title, authority, reference..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
              {tableSearch && (
                <button
                  onClick={() => setTableSearch("")}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </label>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {["All", "Active", "GO", "In Review"].map((filt) => (
                <button
                  key={filt}
                  type="button"
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    tableFilter === filt
                      ? "bg-white text-[#173C40] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 cursor-pointer"
                  }`}
                  onClick={() => setTableFilter(filt)}
                >
                  {filt}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredTenders.length} of {tenders.length} RFPs
          </div>
        </div>

        {/* The Table */}
        <div className="table-wrap mt-3 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Tender Ref &amp; Title</th>
                <th>Authority</th>
                <th>Bid Deadline</th>
                <th>Estimated Value &amp; EMD</th>
                <th>Readiness Score</th>
                <th>Decision Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenders.length > 0 ? (
                filteredTenders.map((row) => {
                  const isCurrent = currentTender?.id === row.id;
                  const deadlineFormatted = row.submissionDeadline
                    ? new Date(row.submissionDeadline).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : row.due || "-";

                  const readinessVal =
                    row.goNoGoAnalysis?.overallScore || row.score || 80;

                  return (
                    <tr
                      key={row.id || row.reference}
                      className={
                        isCurrent
                          ? "bg-emerald-50/60 font-medium"
                          : "hover:bg-slate-50/80"
                      }
                    >
                      <td>
                        <div className="tender-name">
                          <span
                            className={`tender-file ${isCurrent ? "bg-[#173C40] text-white" : ""}`}
                          >
                            <FileText size={15} />
                          </span>
                          <div>
                            <strong className="flex items-center gap-1.5 text-slate-800">
                              {row.title || "Untitled Tender"}
                              {isCurrent && (
                                <span className="text-[9px] bg-[#18794e] text-white px-1.5 py-0.2 rounded-full uppercase font-bold tracking-wider">
                                  Active Focus
                                </span>
                              )}
                            </strong>
                            <small className="text-slate-500 font-mono">
                              {row.tenderNumber || row.reference || "REF-N/A"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="text-xs text-slate-700 font-medium">
                          {row.organization || row.authority || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="date-cell text-xs text-slate-600">
                          <CalendarDays size={13} className="text-slate-400" />
                          {deadlineFormatted}
                        </span>
                      </td>

                      <td>
                        <div className="text-xs">
                          <strong className="text-slate-800 block">
                            {row.estimatedValueDisplay || "-"}
                          </strong>
                          <small className="text-slate-500 block">
                            EMD: {row.emdDisplay || "-"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="readiness">
                          <span className="readiness-bar">
                            <i style={{ width: `${readinessVal}%` }} />
                          </span>
                          <strong className="text-xs">
                            {readinessVal.toFixed
                              ? readinessVal.toFixed(1)
                              : readinessVal}
                            %
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#173C40] rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                            onClick={() => onOpenTenderDetails(row)}
                            title="Open Tender Command Center"
                          >
                            Open
                          </button>

                          {onDeleteTenderClick && (
                            <button
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTenderClick(row);
                              }}
                              title="Delete tender"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    <FileText
                      size={28}
                      className="mx-auto text-slate-300 mb-2"
                    />
                    <p className="text-xs font-semibold text-slate-700">
                      No tenders match your search criteria
                    </p>
                    <button
                      type="button"
                      className="button button-secondary text-xs mt-2 cursor-pointer"
                      onClick={() => {
                        setTableSearch("");
                        setTableFilter("All");
                      }}
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
