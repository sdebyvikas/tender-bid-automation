import JSZip from "jszip";
import { useState } from "react";
import { useSelector } from "react-redux";
import Editor from "@monaco-editor/react";
import { detectLanguage } from "../utils/detectLanguage";
import {
  Code2,
  Eye,
  PanelRightClose,
  PanelRightOpen,
  X,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  FileCode2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ArtifactPanel() {
  const [tab, setTab]                 = useState("preview"); // Default to live preview for instant WOW
  const [activeFile, setActiveFile]   = useState(0);
  const [collapsed, setCollapsed]     = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [copied, setCopied]           = useState(false);
  const [deviceView, setDeviceView]   = useState("desktop"); // desktop | tablet | mobile
  const [previewKey, setPreviewKey]   = useState(0); // For live iframe reload

  const { artifacts } = useSelector(state => state.message);
  const artifact = artifacts?.[0];

  if (!artifact) return null;

  const file       = artifact?.files?.[activeFile] || artifact?.files?.[0];
  const htmlFile   = artifact?.files?.find(f => f.name.endsWith(".html") || f.name === "index.html");
  const cssFile    = artifact?.files?.find(f => f.name.endsWith(".css") || f.name === "style.css");
  const jsFile     = artifact?.files?.find(f => f.name.endsWith(".js") || f.name === "script.js");
  const canPreview = Boolean(htmlFile);

  // Sandboxed HTML document assembly for live iframe preview
  const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Preview</title>
  <style>
    ${cssFile?.content || ""}
  </style>
</head>
<body>
  ${htmlFile?.content || ""}
  <script>
    try {
      ${jsFile?.content || ""}
    } catch(err) {
      console.error("Preview script error:", err);
    }
  <\/script>
</body>
</html>`;

  // 1-Click file download helper
  // 1-Click Complete Project ZIP Download
  const handleDownload = async () => {
    if (!artifact?.files || artifact.files.length === 0) return;

    try {
      const zip = new JSZip();

      // Saari generated files (HTML, CSS, JS) ko ZIP folder mein add karein
      artifact.files.forEach((f) => {
        zip.file(f.name, f.content || "");
      });

      // Browser mein ZIP file generate karein
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;

      // Project title se clean file name create karein (e.g. card-project.zip)
      const cleanTitle = (artifact.title || "project")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 25);
      link.download = `${cleanTitle || "cortex-project"}.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP creation failed:", err);
    }
  };


  const handleCopy = () => {
    navigator.clipboard.writeText(file?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  // Device viewports width mapping
  const getDeviceWidth = () => {
    if (deviceView === "mobile") return "375px";
    if (deviceView === "tablet") return "768px";
    return "100%";
  };

  /* ── Shared code & preview panel content ── */
  const PanelContent = ({ onClose }) => (
    <div className="flex flex-col h-full bg-[#0a0c10] border-l border-white/[0.08] relative select-none">
      
      {/* Top Header Bar */}
      <div className="h-14 px-4 border-b border-white/[0.08] bg-[#0d1017]/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        
        {/* Left: Close/Collapse & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose ?? (() => setCollapsed(true))}
            title={onClose ? "Close panel" : "Collapse panel"}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
          >
            {onClose ? <X size={15} /> : <PanelRightClose size={15} />}
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/30 shrink-0">
              <FileCode2 className="text-indigo-400" size={13} />
            </div>
            <h2 className="text-[13px] font-semibold text-slate-200 truncate">
              {artifact.title || "Generated Code"}
            </h2>
          </div>
        </div>

        {/* Center: Code / Preview Segmented Switch */}
        {canPreview && (
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl shrink-0">
            <button
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium rounded-lg transition-all duration-150 border-none cursor-pointer
                ${tab === "preview" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "text-slate-400 hover:text-slate-200 bg-transparent"}`}
            >
              <Eye size={12} /> Live Preview
            </button>
            <button
              onClick={() => setTab("code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium rounded-lg transition-all duration-150 border-none cursor-pointer
                ${tab === "code" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "text-slate-400 hover:text-slate-200 bg-transparent"}`}
            >
              <Code2 size={12} /> Code Editor
            </button>
          </div>
        )}

        {/* Right: Actions (Download, Copy, Refresh, Fullscreen) */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Refresh button in preview mode */}
          {tab === "preview" && canPreview && (
            <button
              onClick={handleRefreshPreview}
              title="Reload preview"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors border-none bg-transparent cursor-pointer"
            >
              <RotateCcw size={13} />
            </button>
          )}

          {/* Copy code button */}
          <button
            onClick={handleCopy}
            title="Copy current file code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11.5px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Download file button */}
          <button
            onClick={handleDownload}
            title={`Download ${file?.name || "file"}`}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors border-none bg-transparent cursor-pointer"
          >
            <Download size={13} />
          </button>

          {/* Fullscreen Expand / Collapse Toggle (Desktop only) */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors border-none bg-transparent cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Sub-Header: File Tabs (Code Tab) OR Device Switcher (Preview Tab) */}
      <div className="h-10 px-4 border-b border-white/[0.06] bg-[#0c0e14] flex items-center justify-between shrink-0 overflow-x-auto [scrollbar-width:none]">
        {tab === "code" ? (
          /* File Tabs */
          <div className="flex items-center gap-1">
            {artifact.files?.map((f, index) => {
              const isActive = activeFile === index;
              return (
                <button
                  key={f.name}
                  onClick={() => setActiveFile(index)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11.5px] font-medium transition-all duration-150 border-none cursor-pointer relative
                    ${isActive 
                      ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] bg-transparent"}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-indigo-400" : "bg-slate-500"}`} />
                  {f.name}
                </button>
              );
            })}
          </div>
        ) : (
          /* Device Viewport Switcher */
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-400 font-medium">
              Viewport: <span className="text-slate-200 capitalize">{deviceView}</span>
            </span>

            <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => setDeviceView("desktop")}
                title="Desktop View (100%)"
                className={`p-1 rounded-md transition-colors border-none cursor-pointer ${
                  deviceView === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white bg-transparent"
                }`}
              >
                <Monitor size={12} />
              </button>
              <button
                onClick={() => setDeviceView("tablet")}
                title="Tablet View (768px)"
                className={`p-1 rounded-md transition-colors border-none cursor-pointer ${
                  deviceView === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white bg-transparent"
                }`}
              >
                <Tablet size={12} />
              </button>
              <button
                onClick={() => setDeviceView("mobile")}
                title="Mobile View (375px)"
                className={`p-1 rounded-md transition-colors border-none cursor-pointer ${
                  deviceView === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white bg-transparent"
                }`}
              >
                <Smartphone size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace: Monaco Code Editor OR Live Responsive Iframe Preview */}
      <div className="flex-1 overflow-hidden bg-[#07090e] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {tab === "preview" && canPreview ? (
            <motion.div
              key={`preview-box-${previewKey}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex items-center justify-center p-3 overflow-auto bg-[#07090e]"
            >
              <div
                style={{ width: getDeviceWidth() }}
                className={`h-full transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-white/[0.1] bg-white ${
                  deviceView !== "desktop" ? "max-h-[720px] ring-8 ring-white/[0.05]" : ""
                }`}
              >
                <iframe
                  key={previewKey}
                  title="Live Artifact Preview"
                  sandbox="allow-scripts allow-modals allow-forms"
                  srcDoc={previewDoc}
                  className="w-full h-full border-none bg-white"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`code-${activeFile}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <Editor
                theme="vs-dark"
                language={detectLanguage(file?.name || "")}
                value={file?.content || ""}
                options={{
                  readOnly: false,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  smoothScrolling: true,
                  cursorBlinking: "smooth"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating View Code Pill for Mobile screens */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-[12px] font-semibold shadow-xl shadow-indigo-600/30 border border-indigo-400/20 cursor-pointer transition-all duration-150"
      >
        <FileCode2 size={14} />
        Live Studio
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              key="mob-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden fixed inset-y-0 right-0 z-50 w-[92vw] max-w-[460px] border-l border-white/[0.08] overflow-hidden"
            >
              <PanelContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Panel (Split screen OR Fullscreen) */}
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.div
            key="open"
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: isFullscreen ? "100%" : "clamp(380px, 46%, 760px)",
              opacity: 1
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className={`hidden lg:flex h-full flex-col overflow-hidden shrink-0 z-30 ${
              isFullscreen ? "fixed inset-0" : "relative"
            }`}
          >
            <PanelContent />
          </motion.div>
        ) : (
          /* Collapsed Strip */
          <motion.div
            key="collapsed"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 44, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="hidden lg:flex h-full border-l border-white/[0.06] bg-[#0a0c10] flex-col items-center py-4 gap-3 shrink-0"
          >
            <button
              onClick={() => setCollapsed(false)}
              title="Open Artifact Studio"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors border-none bg-transparent cursor-pointer"
            >
              <PanelRightOpen size={16} />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <p
                className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase whitespace-nowrap"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {artifact.title || "Live Studio"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
