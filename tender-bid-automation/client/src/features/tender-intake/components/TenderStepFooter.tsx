import React from "react";
import { ChevronLeft, ChevronRight, FileText, Check } from "lucide-react";
import { tenderPipelineSteps } from "../../../components/Common";

interface TenderStepFooterProps {
  activeStep: number;
  totalTendersCount: number;
  onStepChange: (step: number) => void;
  onGoToRepository: () => void;
  onFinishWorkflow: () => void;
}

export const TenderStepFooter: React.FC<TenderStepFooterProps> = ({
  activeStep,
  totalTendersCount,
  onStepChange,
  onGoToRepository,
  onFinishWorkflow,
}) => {
  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
      <div>
        {activeStep > 1 ? (
          <button
            type="button"
            className="button button-secondary text-xs cursor-pointer flex items-center gap-1.5"
            onClick={() => {
              onStepChange(Math.max(1, activeStep - 1));
            }}
          >
            <ChevronLeft size={14} /> Back to Step {activeStep - 1}:{" "}
            {tenderPipelineSteps[activeStep - 2]?.label.replace(/^\d+\.\s*/, "")}
          </button>
        ) : (
          <button
            type="button"
            className="button button-secondary text-xs cursor-pointer flex items-center gap-1.5"
            onClick={onGoToRepository}
          >
            <FileText size={14} /> View All Tenders ({totalTendersCount})
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Step {activeStep} of 5
        </span>

        {activeStep < 5 ? (
          <button
            type="button"
            className="button button-primary cursor-pointer flex items-center gap-1.5 shadow-sm"
            onClick={() => {
              onStepChange(Math.min(5, activeStep + 1));
            }}
          >
            Proceed to Step {activeStep + 1}:{" "}
            {tenderPipelineSteps[activeStep]?.label.replace(/^\d+\.\s*/, "")}{" "}
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary bg-emerald-700 hover:bg-emerald-600 cursor-pointer flex items-center gap-1.5 shadow-sm"
            onClick={onFinishWorkflow}
          >
            <Check size={16} /> Finish &amp; Return to Repository
          </button>
        )}
      </div>
    </div>
  );
};
