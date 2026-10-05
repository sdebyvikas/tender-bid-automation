import React, { useEffect } from "react";
import { AlertTriangle, Trash2, Info, X, LucideIcon } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

interface VariantStyle {
  icon: LucideIcon;
  iconBg: string;
  btnClass: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently remove the item.",
  itemName = "",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Variants styling
  const variantConfig: Record<string, VariantStyle> = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100 text-red-600 border-red-200",
      btnClass: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100 text-amber-600 border-amber-200",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-amber-500",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100 text-blue-600 border-blue-200",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500",
    },
  };

  const currentVariant = variantConfig[variant] || variantConfig.danger;
  const IconComponent = currentVariant.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 p-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}

        {/* Content Header */}
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${currentVariant.iconBg}`}
          >
            <IconComponent size={20} />
          </div>

          <div className="space-y-1 pr-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Highlighted item details */}
        {itemName && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 font-mono flex items-center gap-2 break-all">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="truncate">{itemName}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 cursor-pointer ${currentVariant.btnClass}`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
