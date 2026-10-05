import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { tenderPipelineSteps } from "../../../components/Common";

interface TenderPipelineStepperProps {
  activeStep: number;
  onStepChange: (stepId: number) => void;
}

export const TenderPipelineStepper: React.FC<TenderPipelineStepperProps> = ({
  activeStep,
  onStepChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-3 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {tenderPipelineSteps.map((step) => {
          const IconComponent = step.icon;
          const isActive = activeStep === step.id;
          const isPassed = activeStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
                isActive
                  ? "bg-[#173C40] text-white shadow-sm"
                  : isPassed
                    ? "bg-emerald-50/70 text-slate-800 hover:bg-emerald-100/70 border border-emerald-200/60"
                    : "bg-slate-50/60 text-slate-600 hover:bg-slate-100/80 border border-slate-200/50"
              }`}
            >
              {/* Step Icon Badge */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? "bg-emerald-500 text-white font-bold"
                    : isPassed
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                {isPassed ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <IconComponent size={16} />
                )}
              </div>

              {/* Step Labels */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? "text-emerald-300"
                        : isPassed
                          ? "text-emerald-700"
                          : "text-slate-400"
                    }`}
                  >
                    Step {step.id}
                  </span>
                  {isPassed && (
                    <span className="text-[9px] bg-emerald-200/60 text-emerald-800 px-1 rounded font-medium">
                      Done
                    </span>
                  )}
                </div>
                <strong
                  className={`text-xs block truncate ${
                    isActive
                      ? "text-white font-bold"
                      : "text-slate-800 font-semibold"
                  }`}
                >
                  {step.label.replace(/^\d+\.\s*/, "")}
                </strong>
                <span
                  className={`text-[10px] block truncate ${
                    isActive ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {step.subtitle}
                </span>
              </div>

              {/* Active Indicator Chevron */}
              {isActive && (
                <ChevronRight
                  size={15}
                  className="text-emerald-300 shrink-0 hidden lg:block"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
