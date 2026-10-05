import React from "react";
import { ChevronRight, FileText, ArrowLeft, Plus } from "lucide-react";
import { tenderPipelineSteps } from "../../../components/Common";
import { Tender } from "../../../types/tender";

interface TenderIntakeHeaderProps {
  isHubMode: boolean;
  currentTender: Tender | null;
  activeStep: number;
  totalTendersCount: number;
  onGoToRepository: () => void;
  onOpenActiveHub: (tender: Tender) => void;
  onOpenUploadModal: () => void;
}

export const TenderIntakeHeader: React.FC<TenderIntakeHeaderProps> = ({
  isHubMode,
  currentTender,
  activeStep,
  totalTendersCount,
  onGoToRepository,
  onOpenActiveHub,
  onOpenUploadModal,
}) => {
  return (
    <div className="page-heading fade-up mb-6">
      <div>
        <div className="breadcrumb">
          <span>Bid workspace</span>
          <ChevronRight size={13} />
          {isHubMode && currentTender ? (
            <>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
                onClick={onGoToRepository}
              >
                Tenders Repository
              </button>
              <ChevronRight size={13} />
              <span className="text-emerald-800 font-mono font-medium">
                {currentTender.tenderNumber ||
                  currentTender.reference ||
                  "Active Hub"}
              </span>
              <ChevronRight size={13} />
              <strong className="text-emerald-900">
                {tenderPipelineSteps.find((s) => s.id === activeStep)?.label ||
                  "Step"}
              </strong>
            </>
          ) : (
            <strong>Tenders Repository</strong>
          )}
        </div>
        <h1>
          {isHubMode && currentTender
            ? "Tender Details & Operations"
            : "All Ingested Tenders"}
        </h1>
      </div>

      <div className="heading-actions flex items-center gap-2.5">
        {isHubMode && currentTender ? (
          <button
            type="button"
            className="button button-secondary shadow-xs cursor-pointer"
            onClick={onGoToRepository}
            title="Browse all tenders in repository"
          >
            <FileText size={15} /> All Tenders ({totalTendersCount})
          </button>
        ) : currentTender ? (
          <button
            type="button"
            className="button button-secondary shadow-xs text-emerald-800 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 cursor-pointer"
            onClick={() => onOpenActiveHub(currentTender)}
            title={`Return to active tender: ${currentTender.title || currentTender.tenderNumber}`}
          >
            <ArrowLeft size={15} className="text-[#18794e]" /> Back to Active Hub
          </button>
        ) : null}

        <button
          type="button"
          className="button button-primary shadow-sm cursor-pointer"
          onClick={onOpenUploadModal}
        >
          <Plus size={15} /> Upload New RFP
        </button>
      </div>
    </div>
  );
};
