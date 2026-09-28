import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  HelpCircle,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";

import { tenderAPI, companyProfileAPI } from "./services/api";

// Modals
import TenderAIChatDrawer from "./components/TenderAIChatDrawer";
import TenderUploadModal from "./components/TenderUploadModal";
import CompanyProfileModal from "./components/CompanyProfileModal";
import VaultDocumentUploadModal from "./components/VaultDocumentUploadModal";

// Common Primitives
import { LogoMark, IconButton, navItems } from "./components/Common";

// Pages
import Overview from "./pages/Overview";
import CompanyVault from "./pages/CompanyVault";
import TenderIntake from "./pages/TenderIntake";
import Eligibility from "./pages/Eligibility";
import PaymentProof from "./pages/PaymentProof";
import ProposalDesk from "./pages/ProposalDesk";
import PdfBinder from "./pages/PdfBinder";
import AIModeWorkspace from "./ai-mode/AIModeWorkspace";

const ROUTE_MAP = {
  Overview: "/overview",
  "Company Vault": "/vault",
  "Tenders Repository": "/intake",
  "Tender Intake": "/intake",
  Eligibility: "/eligibility",
  "Payment Proof": "/payment-proof",
  "Proposal Desk": "/proposal-desk",
  "PDF Binder": "/pdf-binder",
  "AI Mode": "/ai-mode",
};

const PATH_TO_LABEL_MAP = {
  "/": "Overview",
  "/overview": "Overview",
  "/vault": "Company Vault",
  "/company-vault": "Company Vault",
  "/intake": "Tenders Repository",
  "/tender-intake": "Tenders Repository",
  "/eligibility": "Eligibility",
  "/payment-proof": "Payment Proof",
  "/proposal-desk": "Proposal Desk",
  "/pdf-binder": "PDF Binder",
  "/ai-mode": "AI Mode",
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [stage, setStage] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Backend state
  const [tenders, setTenders] = useState([]);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVaultUploadOpen, setIsVaultUploadOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const activeLabel = useMemo(() => {
    if (
      location.pathname.startsWith("/intake/") ||
      location.pathname.startsWith("/tender-intake/") ||
      location.pathname.startsWith("/tenders/")
    ) {
      return "Tender Command Center";
    }
    return PATH_TO_LABEL_MAP[location.pathname] || "Overview";
  }, [location.pathname]);

  const setActive = useCallback(
    (target) => {
      if (ROUTE_MAP[target]) {
        navigate(ROUTE_MAP[target]);
      } else if (target.startsWith("/")) {
        navigate(target);
      }
    },
    [navigate],
  );

  // Load data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tendersRes, compRes] = await Promise.all([
        tenderAPI.getAll(),
        companyProfileAPI.get(),
      ]);
      const loadedTenders = tendersRes.data.tenders || [];
      setTenders(loadedTenders);
      if (loadedTenders.length > 0 && !selectedTenderId) {
        setSelectedTenderId(loadedTenders[0].id);
      }
      setCompanyProfile(compRes.data.companyProfile || null);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeTender = useMemo(() => {
    if (selectedTenderId) {
      return (
        tenders.find((t) => t.id === selectedTenderId) || tenders[0] || null
      );
    }
    return tenders[0] || null;
  }, [tenders, selectedTenderId]);

  const handleSelectTender = (tender) => {
    if (!tender) return;
    setSelectedTenderId(tender.id);
  };

  const handleTenderCreated = (newTender) => {
    setTenders((prev) => [newTender, ...prev]);
    setSelectedTenderId(newTender.id);
  };

  const handleDeleteTender = async (tenderId) => {
    try {
      await tenderAPI.delete(tenderId);
      setTenders((prev) => prev.filter((t) => t.id !== tenderId));
      if (selectedTenderId === tenderId) {
        const remaining = tenders.filter((t) => t.id !== tenderId);
        setSelectedTenderId(remaining[0]?.id || null);
      }
      toast.success("Tender deleted successfully");
    } catch (err) {
      toast.error("Failed to delete tender");
    }
  };

  const handleUpdateProfile = async (updated) => {
    try {
      const res = await companyProfileAPI.update(updated);
      setCompanyProfile(res.data.companyProfile);
      toast.success("Company profile updated");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteVaultDoc = async (docId) => {
    try {
      await companyProfileAPI.deleteDocument(docId);
      setCompanyProfile((prev) => ({
        ...prev,
        statutoryDocuments: (prev?.statutoryDocuments || []).filter(
          (d) => d.id !== docId,
        ),
      }));
      toast.success("Document removed from vault");
    } catch (err) {
      toast.error("Failed to remove document");
    }
  };

  const groupedNav = useMemo(() => {
    return ["Workspace", "Bid Operations"].map((section) => ({
      section,
      items: navItems.filter((item) => item.section === section),
    }));
  }, []);

  return (
    <div className="app-shell">
      <Toaster position="top-right" richColors />

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""} ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <div className="brand-row">
          <div
            className="brand-lockup cursor-pointer"
            onClick={() => navigate("/overview")}
          >
            <LogoMark />
            {!isSidebarCollapsed && (
              <div>
                <strong>
                  Tender<span>Flow</span>
                </strong>
                <small>Bid operations OS</small>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              className="sidebar-collapse-toggle cursor-pointer"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={
                isSidebarCollapsed ? "Expand Sidebar" : "Collapse to Icons"
              }
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>
            <button
              className="sidebar-close cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          className="workspace-switcher cursor-pointer"
          onClick={() => setIsProfileModalOpen(true)}
          title={isSidebarCollapsed ? "Tech Solutions (Admin)" : undefined}
        >
          <div className="workspace-avatar">TS</div>
          {!isSidebarCollapsed && (
            <>
              <div>
                <strong>{companyProfile?.name || "Tech Solutions"}</strong>
                <small>Admin workspace</small>
              </div>
              <ChevronDown
                size={14}
                style={{ color: "#7890a4", flexShrink: 0, marginLeft: "auto" }}
              />
            </>
          )}
        </div>

        <nav className="side-nav">
          {groupedNav.map((group) => (
            <div className="nav-section" key={group.section}>
              {!isSidebarCollapsed && (
                <span className="nav-section-label">{group.section}</span>
              )}
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const isSelected =
                  location.pathname === item.path ||
                  (item.path === "/overview" &&
                    (location.pathname === "/" ||
                      location.pathname === "/overview")) ||
                  (item.path === "/vault" &&
                    (location.pathname === "/vault" ||
                      location.pathname === "/company-vault")) ||
                  (item.path === "/intake" &&
                    (location.pathname === "/intake" ||
                      location.pathname === "/tender-intake" ||
                      location.pathname.startsWith("/intake/") ||
                      location.pathname.startsWith("/tender-intake/") ||
                      location.pathname.startsWith("/tenders/")));

                const badgeText =
                  item.path === "/intake" && tenders.length > 0
                    ? tenders.length.toString()
                    : item.badge;

                return (
                  <button
                    key={item.label}
                    className={`nav-item cursor-pointer ${isSelected ? "active" : ""}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                  >
                    <ItemIcon size={17} />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                    {!isSidebarCollapsed && badgeText && (
                      <span className="nav-badge">{badgeText}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        {!isSidebarCollapsed && (
          <div className="sidebar-tip">
            <div className="tip-spark">
              <Sparkles size={15} />
            </div>
            <strong>30 min to bid-ready</strong>
            <p>Your workflow is 41% faster than the team average.</p>
            <button
              className="cursor-pointer"
              onClick={() =>
                toast("Automation insights", {
                  description:
                    "Time saved is calculated from your workspace activity.",
                })
              }
            >
              See insights <ArrowUpRight size={14} />
            </button>
          </div>
        )}

        <div className="sidebar-footer">
          <button
            className="nav-item cursor-pointer"
            title={isSidebarCollapsed ? "Settings" : undefined}
            onClick={() =>
              toast("Settings", {
                description: "Workspace configuration opened.",
              })
            }
          >
            <Settings2 size={17} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
          <div
            className="profile-row cursor-pointer"
            onClick={() => setIsProfileModalOpen(true)}
            title={
              isSidebarCollapsed ? "Arjun Mehta (Administrator)" : undefined
            }
          >
            <div className="profile-avatar">AM</div>
            {!isSidebarCollapsed && (
              <>
                <div>
                  <strong>Arjun Mehta</strong>
                  <small>Administrator</small>
                </div>
                <MoreHorizontal size={16} />
              </>
            )}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="main-area flex-1 flex flex-col h-screen max-h-screen overflow-y-auto min-w-0">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div className="topbar-page">
              <Grid2X2 size={15} />
              <span>{activeLabel}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input placeholder="Search tenders, documents..." />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="icon-button cursor-pointer"
              aria-label="Tender Copilot AI"
              title="Tender Copilot AI"
              onClick={() => setIsChatOpen((v) => !v)}
            >
              <Sparkles size={18} className="text-[#18794e]" />
            </button>

            <IconButton
              label="Help center"
              onClick={() =>
                toast("Help Center", {
                  description:
                    "Guidance is available inside each workflow step.",
                })
              }
            >
              <HelpCircle size={18} />
            </IconButton>

            <button
              className="notification-button cursor-pointer"
              aria-label="Notifications"
              onClick={() =>
                toast("Notifications", {
                  description:
                    "3 alerts: ISO 27001 expiring, EMD payment pending, draft ready.",
                })
              }
            >
              <Bell size={18} />
              <i />
            </button>

            <div
              className="top-avatar cursor-pointer"
              onClick={() => setIsProfileModalOpen(true)}
              title="Arjun Mehta (Tech Solutions)"
            >
              AM
            </div>
          </div>
        </header>

        <div
          className={`page-content ${location.pathname === "/ai-mode" ? "!p-0 !max-w-none !h-[calc(100vh-66px)] !overflow-hidden" : ""}`}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Overview
                  tenders={tenders}
                  activeTender={activeTender}
                  selectedTenderId={selectedTenderId}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onOpenUploadModal={() => setIsUploadOpen(true)}
                />
              }
            />
            <Route
              path="/overview"
              element={
                <Overview
                  tenders={tenders}
                  activeTender={activeTender}
                  selectedTenderId={selectedTenderId}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onOpenUploadModal={() => setIsUploadOpen(true)}
                />
              }
            />
            <Route
              path="/vault"
              element={
                <CompanyVault
                  companyProfile={companyProfile}
                  onEditProfile={() => setIsProfileModalOpen(true)}
                  onUploadDoc={() => setIsVaultUploadOpen(true)}
                  onDeleteDoc={handleDeleteVaultDoc}
                />
              }
            />
            <Route
              path="/company-vault"
              element={
                <CompanyVault
                  companyProfile={companyProfile}
                  onEditProfile={() => setIsProfileModalOpen(true)}
                  onUploadDoc={() => setIsVaultUploadOpen(true)}
                  onDeleteDoc={handleDeleteVaultDoc}
                />
              }
            />
            <Route
              path="/intake"
              element={
                <TenderIntake
                  tenders={tenders}
                  activeTender={activeTender}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onTenderCreated={handleTenderCreated}
                  onDeleteTender={handleDeleteTender}
                  companyProfile={companyProfile}
                />
              }
            />
            <Route
              path="/intake/:tenderId"
              element={
                <TenderIntake
                  tenders={tenders}
                  activeTender={activeTender}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onTenderCreated={handleTenderCreated}
                  onDeleteTender={handleDeleteTender}
                  companyProfile={companyProfile}
                />
              }
            />
            <Route
              path="/intake/:tenderId/:stepKey"
              element={
                <TenderIntake
                  tenders={tenders}
                  activeTender={activeTender}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onTenderCreated={handleTenderCreated}
                  onDeleteTender={handleDeleteTender}
                  companyProfile={companyProfile}
                />
              }
            />
            <Route
              path="/tender-intake"
              element={
                <TenderIntake
                  tenders={tenders}
                  activeTender={activeTender}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onTenderCreated={handleTenderCreated}
                  onDeleteTender={handleDeleteTender}
                  companyProfile={companyProfile}
                />
              }
            />
            <Route
              path="/tender-intake/:tenderId"
              element={
                <TenderIntake
                  tenders={tenders}
                  activeTender={activeTender}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onTenderCreated={handleTenderCreated}
                  onDeleteTender={handleDeleteTender}
                  companyProfile={companyProfile}
                />
              }
            />
            <Route
              path="/tender-intake/:tenderId/:stepKey"
              element={
                <TenderIntake
                  tenders={tenders}
                  activeTender={activeTender}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onTenderCreated={handleTenderCreated}
                  onDeleteTender={handleDeleteTender}
                  companyProfile={companyProfile}
                />
              }
            />
            <Route
              path="/tenders/:tenderId"
              element={
                <TenderIntake
                  tenders={tenders}
                  activeTender={activeTender}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onTenderCreated={handleTenderCreated}
                  onDeleteTender={handleDeleteTender}
                  companyProfile={companyProfile}
                />
              }
            />
            <Route
              path="/tenders/:tenderId/:stepKey"
              element={
                <TenderIntake
                  tenders={tenders}
                  activeTender={activeTender}
                  onSelectTender={handleSelectTender}
                  setActive={setActive}
                  setStage={setStage}
                  onTenderCreated={handleTenderCreated}
                  onDeleteTender={handleDeleteTender}
                  companyProfile={companyProfile}
                />
              }
            />
            <Route
              path="/eligibility"
              element={
                <Eligibility
                  activeTender={activeTender}
                  setActive={setActive}
                />
              }
            />
            <Route
              path="/payment-proof"
              element={
                <PaymentProof
                  activeTender={activeTender}
                  setActive={setActive}
                />
              }
            />
            <Route
              path="/proposal-desk"
              element={
                <ProposalDesk
                  activeTender={activeTender}
                  setActive={setActive}
                />
              }
            />
            <Route
              path="/pdf-binder"
              element={<PdfBinder activeTender={activeTender} />}
            />
            <Route
              path="/ai-mode"
              element={
                <AIModeWorkspace
                  activeTender={activeTender}
                  companyProfile={companyProfile}
                  onBackToClassic={() => navigate("/overview")}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* AI CHAT DRAWER */}
      <TenderAIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeTender={activeTender}
        companyProfile={companyProfile}
      />

      {/* TENDER UPLOAD MODAL */}
      <TenderUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onTenderCreated={(newTender) => {
          handleTenderCreated(newTender);
          navigate(`/intake/${newTender.id}/overview`);
        }}
      />

      {/* VAULT DOCUMENT UPLOAD MODAL */}
      <VaultDocumentUploadModal
        isOpen={isVaultUploadOpen}
        onClose={() => setIsVaultUploadOpen(false)}
        onDocumentUploaded={(newDoc) => {
          setCompanyProfile((prev) => ({
            ...prev,
            statutoryDocuments: [newDoc, ...(prev?.statutoryDocuments || [])],
          }));
        }}
      />

      {/* COMPANY PROFILE MODAL */}
      <CompanyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        companyProfile={companyProfile}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}
