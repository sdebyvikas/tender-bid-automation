import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  TenderIntakeHeader,
  TenderPipelineStepper,
  TenderOverviewStep,
  TenderStepFooter,
  TenderRepositoryTable,
  TenderCopilotDrawer,
} from "../features/tender-intake";

import DocumentPreviewModal from "../components/DocumentPreviewModal";
import TenderUploadModal from "../components/TenderUploadModal";
import ConfirmDialog from "../components/ConfirmDialog";
import Eligibility from "./Eligibility";
import PaymentProof from "./PaymentProof";
import ProposalDesk from "./ProposalDesk";
import PdfBinder from "./PdfBinder";

import { Tender } from "../types/tender";
import { CompanyProfile } from "../types/company";

interface TenderIntakeProps {
  tenders?: Tender[];
  activeTender?: Tender | null;
  onSelectTender: (tender: Tender | null) => void;
  setActive?: (page: string) => void;
  setStage?: (stage: number) => void;
  onTenderCreated: (newTender: Tender) => void;
  onDeleteTender?: (id: string | number) => Promise<void> | void;
  companyProfile?: CompanyProfile | null;
}

export default function TenderIntake({
  tenders = [],
  activeTender,
  onSelectTender,
  setActive,
  onTenderCreated,
  onDeleteTender,
  companyProfile,
}: TenderIntakeProps) {
  const { tenderId } = useParams<{ tenderId?: string }>();
  const navigate = useNavigate();

  const isHubMode = Boolean(tenderId);

  // Active step is internal state inside the tender details route
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);

  // Delete Dialog state
  const [tenderToDelete, setTenderToDelete] = useState<Tender | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Table filtering & search state
  const [tableSearch, setTableSearch] = useState<string>("");
  const [tableFilter, setTableFilter] = useState<string>("All");
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Reset step to 1 whenever tenderId changes
  useEffect(() => {
    setActiveStep(1);
    setIsAIChatOpen(false);
  }, [tenderId]);

  // Match the tender from URL param or fall back to activeTender
  const currentTender = useMemo(() => {
    if (tenderId) {
      return (
        tenders.find(
          (t) =>
            String(t.id) === String(tenderId) ||
            t.tenderNumber === tenderId ||
            t.reference === tenderId,
        ) ||
        activeTender ||
        null
      );
    }
    return activeTender || null;
  }, [tenderId, tenders, activeTender]);

  // Sync with global active tender when accessed via direct URL
  useEffect(() => {
    if (currentTender && currentTender.id !== activeTender?.id) {
      onSelectTender(currentTender);
    }
  }, [currentTender, activeTender?.id, onSelectTender]);

  const goToRepository = () => {
    navigate("/intake");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTenderDetails = (tender: Tender) => {
    if (!tender) return;
    onSelectTender(tender);
    navigate(`/intake/${tender.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(
      `Active focus set to: ${tender.title || tender.tenderNumber}`,
    );
  };

  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const matchSearch =
        !tableSearch ||
        (t.title || "").toLowerCase().includes(tableSearch.toLowerCase()) ||
        (t.tenderNumber || t.reference || "")
          .toLowerCase()
          .includes(tableSearch.toLowerCase()) ||
        (t.organization || t.authority || "")
          .toLowerCase()
          .includes(tableSearch.toLowerCase());

      if (!matchSearch) return false;
      if (tableFilter === "All") return true;
      if (tableFilter === "Active") return t.id === currentTender?.id;
      if (tableFilter === "GO")
        return (
          (t.goNoGoAnalysis?.decision || t.status) === "GO" ||
          (t.score || 0) >= 80
        );
      if (tableFilter === "In Review")
        return (t.status || "In review").toLowerCase().includes("review");
      return true;
    });
  }, [tenders, tableSearch, tableFilter, currentTender?.id]);

  return (
    <>
      {/* 1. TOP PAGE HEADER */}
      <TenderIntakeHeader
        isHubMode={isHubMode}
        currentTender={currentTender}
        activeStep={activeStep}
        totalTendersCount={tenders.length}
        onGoToRepository={goToRepository}
        onOpenActiveHub={openTenderDetails}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* 2. MAIN VIEW SWITCHER */}
      {isHubMode && currentTender ? (
        /* VIEW A: ACTIVE TENDER DETAILS & 5-STEP WORKFLOW */
        <div className="space-y-6 fade-up">
          {/* Top Interactive Pipeline Stepper */}
          <TenderPipelineStepper
            activeStep={activeStep}
            onStepChange={(step) => {
              setActiveStep(step);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          {/* Active Step Content */}
          <div className="step-content-area">
            {activeStep === 1 && (
              <TenderOverviewStep
                tender={currentTender}
                companyProfile={companyProfile}
                onPreviewDoc={(doc) => setPreviewDoc(doc)}
                onNavigateStep={(step) => {
                  setActiveStep(step);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}

            {activeStep === 2 && (
              <div className="fade-up">
                <Eligibility
                  activeTender={currentTender}
                  setActive={setActive}
                  isEmbedded={true}
                  onNextStep={() => {
                    setActiveStep(3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {activeStep === 3 && (
              <div className="fade-up">
                <PaymentProof
                  activeTender={currentTender}
                  setActive={setActive}
                  isEmbedded={true}
                  onNextStep={() => {
                    setActiveStep(4);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {activeStep === 4 && (
              <div className="fade-up">
                <ProposalDesk
                  activeTender={currentTender}
                  setActive={setActive}
                  isEmbedded={true}
                  onNextStep={() => {
                    setActiveStep(5);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {activeStep === 5 && (
              <div className="fade-up">
                <PdfBinder
                  activeTender={currentTender}
                  setActive={setActive}
                  isEmbedded={true}
                />
              </div>
            )}
          </div>

          {/* Bottom Stepper Navigation Footer */}
          <TenderStepFooter
            activeStep={activeStep}
            totalTendersCount={tenders.length}
            onStepChange={(step) => {
              setActiveStep(step);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onGoToRepository={goToRepository}
            onFinishWorkflow={() => {
              toast.success("All 5 workflow stages verified!");
              goToRepository();
            }}
          />
        </div>
      ) : (
        /* VIEW B: ALL TENDERS REPOSITORY TABLE VIEW */
        <TenderRepositoryTable
          tenders={tenders}
          currentTender={currentTender}
          filteredTenders={filteredTenders}
          tableSearch={tableSearch}
          setTableSearch={setTableSearch}
          tableFilter={tableFilter}
          setTableFilter={setTableFilter}
          onOpenTenderDetails={openTenderDetails}
          onDeleteTenderClick={(tender) => setTenderToDelete(tender)}
        />
      )}

      {/* 3. MODALS & SLIDE-OVERS */}
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(tenderToDelete)}
        onClose={() => setTenderToDelete(null)}
        onConfirm={async () => {
          if (tenderToDelete && onDeleteTender) {
            setIsDeleting(true);
            await onDeleteTender(tenderToDelete.id);
            setIsDeleting(false);
            setTenderToDelete(null);
          }
        }}
        title="Delete Tender?"
        description="Are you sure you want to remove this tender from repository? This action cannot be undone."
        itemName={
          tenderToDelete
            ? `${tenderToDelete.tenderNumber || "Tender"} — ${tenderToDelete.title}`
            : ""
        }
        confirmText="Delete Tender"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        companyProfile={companyProfile}
      />

      {/* Upload Tender Modal */}
      <TenderUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTenderCreated={(newTender) => {
          onTenderCreated(newTender);
          setIsUploadModalOpen(false);
          openTenderDetails(newTender);
          toast.success("RFP Ingested successfully!", {
            description: `${newTender.title || newTender.tenderNumber} is now ready in command center.`,
          });
        }}
      />

      {/* Tender Copilot Floating Button & Slide-over Drawer */}
      <TenderCopilotDrawer
        isOpen={isAIChatOpen}
        onOpen={() => setIsAIChatOpen(true)}
        onClose={() => setIsAIChatOpen(false)}
        isHubMode={isHubMode}
        currentTender={currentTender}
        companyProfile={companyProfile}
      />
    </>
  );
}
