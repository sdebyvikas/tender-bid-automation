import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  GripVertical,
  Download,
  Printer,
  FileCheck2,
  ShieldCheck,
  Check,
  Layers,
  ArrowUp,
  ArrowDown,
  FileQuestion,
  Building2,
  Calendar,
  Landmark,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ListTree,
  PlusCircle,
  Trash2,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  X,
  FileDown,
  Stamp,
  Sparkles,
  MoveDown,
  HelpCircle,
  Award,
  Crown,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { STAMP_PRESETS, Signatory, StampPreset } from "./mockData";

// Utility: convert text/markdown to valid clean HTML while preserving existing HTML
function formatToHTML(raw?: string) {
  if (!raw) return "";

  // If already has rich HTML tags, only convert any loose markdown tokens
  if (
    /<(p|div|h1|h2|h3|strong|b|em|i|u|ul|ol|li|table|br)[\s\S]*>/i.test(raw)
  ) {
    return raw
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/__([^_]+)__/g, "<u>$1</u>");
  }

  // Convert raw text into paragraphs, headings, and lists
  let cleaned = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/__([^_]+)__/g, "<u>$1</u>");

  const lines = cleaned.split("\n");
  let htmlOutput = "";
  let inList = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        htmlOutput += "</ul>";
        inList = false;
      }
      htmlOutput += "<p><br></p>";
      return;
    }

    if (trimmed.startsWith("# ")) {
      if (inList) {
        htmlOutput += "</ul>";
        inList = false;
      }
      htmlOutput += `<h1>${trimmed.slice(2)}</h1>`;
    } else if (trimmed.startsWith("## ")) {
      if (inList) {
        htmlOutput += "</ul>";
        inList = false;
      }
      htmlOutput += `<h2>${trimmed.slice(3)}</h2>`;
    } else if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
      if (!inList) {
        htmlOutput += '<ul style="margin: 4pt 0 8pt 20pt; padding: 0;">';
        inList = true;
      }
      htmlOutput += `<li style="margin-bottom: 3pt;">${trimmed.slice(2)}</li>`;
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (inList) {
        htmlOutput += "</ul>";
        inList = false;
      }
      htmlOutput += `<p style="margin: 0 0 6pt 0; line-height: 1.6;">${trimmed}</p>`;
    } else {
      if (inList) {
        htmlOutput += "</ul>";
        inList = false;
      }
      htmlOutput += `<p style="margin: 0 0 6pt 0; line-height: 1.6;">${line}</p>`;
    }
  });

  if (inList) {
    htmlOutput += "</ul>";
  }

  return htmlOutput;
}

interface A4RichPageEditorProps {
  sectionId: string;
  content: string;
  onContentChange: (id: string, newContent: string) => void;
  placeholder?: string;
}

// WYSIWYG Editable Rich Document Body Component
function A4RichPageEditor({
  sectionId,
  content,
  onContentChange,
  placeholder,
}: A4RichPageEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUserTyping = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUserTyping.current) {
      const formattedHTML = formatToHTML(content);
      if (editorRef.current.innerHTML !== formattedHTML) {
        editorRef.current.innerHTML = formattedHTML;
      }
    }
    isUserTyping.current = false;
  }, [sectionId, content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isUserTyping.current = true;
    onContentChange(sectionId, e.currentTarget.innerHTML);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    isUserTyping.current = false;
    onContentChange(sectionId, e.currentTarget.innerHTML);
  };

  return (
    <div
      ref={editorRef}
      id={`editor-${sectionId}`}
      data-sec-id={sectionId}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      className="aimode-a4-editable-rich-body"
      data-placeholder={
        placeholder || "Click here to edit text directly on this A4 sheet..."
      }
    />
  );
}

interface AICanvasPreviewProps {
  currentStep: number;
  sections: any[];
  onSectionsChange: (sections: any[]) => void;
  selectedSignatory: Signatory;
  emdMode: 'msme' | 'paid';
  paymentData?: any;
  activeTender?: any;
  eligibilityMode?: 'PASS' | 'FAIL';
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onStartProcess?: () => void;
}

export default function AICanvasPreview({
  currentStep,
  sections,
  onSectionsChange,
  selectedSignatory,
  emdMode,
  paymentData,
  activeTender,
  eligibilityMode,
  isFocusMode,
  onToggleFocusMode,
  onStartProcess,
}: AICanvasPreviewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showOutline, setShowOutline] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [coverEditMode, setCoverEditMode] = useState(false);

  // Image & Stamp Modal State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [stampTargetSecId, setStampTargetSecId] = useState<string | null>(null);

  const isGenerated = currentStep >= 1;
  const visibleSections = isGenerated ? sections : [];

  // Dynamic Table of Contents calculation based on current order
  const computedPageMapping = useMemo(() => {
    let currentPage = 1;
    const mapping: Record<string, { startPage: number; endPage: number; label: string }> = {};
    sections.forEach((sec) => {
      const pageCount = sec.pageCount || 1;
      const startPage = currentPage;
      const endPage = currentPage + pageCount - 1;
      currentPage += pageCount;
      mapping[sec.id] = {
        startPage,
        endPage,
        label:
          startPage === endPage
            ? `Page ${startPage}`
            : `Pages ${startPage} - ${endPage}`,
      };
    });
    return mapping;
  }, [sections]);

  const totalPagesCount = isGenerated
    ? Object.values(computedPageMapping).slice(-1)[0]?.endPage ||
      sections.length
    : 0;

  // Generate dynamic Table of Contents text (for docx / plain copy)
  const generateDynamicTOC = () => {
    let tocText =
      "=======================================================================\n";
    tocText += "INDEX OF DOCUMENTS IN SUBMITTED BID DOSSIER\n";
    tocText +=
      "=======================================================================\n\n";

    sections.forEach((sec, idx) => {
      if (sec.id === "sec-toc") return;
      const pageInfo = computedPageMapping[sec.id]?.label || `Page ${idx + 1}`;
      const dots = ".".repeat(Math.max(4, 52 - sec.title.length));
      tocText += `${idx + 1}. ${sec.title} ${dots} ${pageInfo}\n`;
    });

    tocText +=
      "\n=======================================================================\n";
    tocText += `Total Dossier Volume: ${totalPagesCount} Printed A4 Pages (Sequential 1 to ${totalPagesCount})\n`;
    tocText +=
      "=======================================================================";
    return tocText;
  };

  // Generate EMD Proof Content
  const generateEMDContent = () => {
    if (emdMode === "msme") {
      return `EARNEST MONEY DEPOSIT (EMD) EXEMPTION UNDER RULE 170 OF GFR 2017

Tender Ref: ${activeTender?.tenderNumber || "NIT-2026/099"}
EMD Amount: ₹5,00,000/- (Five Lakh Rupees Only)

We hereby declare that Tech Solutions Private Limited is a registered Micro & Small Enterprise (MSE) with the Ministry of MSME, Government of India.

1. UDYAM Registration Number: UDYAM-DL-02-0098412
2. Enterprise Category: Small Enterprise (Services & IT Solutions)
3. National Industry Classification (NIC): 6201 - Computer Programming & Video Analytics
4. Statutory Exemption: Rule 170 of General Financial Rules (GFR) 2017 & Public Procurement Policy for MSEs Order 2012.

We have attached our self-attested UDYAM Registration Certificate as Annexure 3-A.

For Tech Solutions Private Limited
[SignatoryPlaceholder]`;
    }

    return `PROOF OF EARNEST MONEY DEPOSIT (EMD) PAYMENT VIA BANK NEFT / RTGS

Tender Ref: ${activeTender?.tenderNumber || "NIT-2026/099"}
EMD Amount: ₹5,00,000/- | Tender Fee: ₹5,000/-

We hereby submit the online electronic fund transfer details in favor of "Delhi Municipal Corporation - EMD Account":

1. Transaction UTR / Reference No: ${paymentData?.utr || "HDFC99018231924"}
2. Remitting Bank Name: ${paymentData?.bank || "HDFC Bank, Okhla Industrial Branch"}
3. Date of Fund Transfer: ${paymentData?.date || "22nd September 2026"}
4. Attached Receipt File: ${paymentData?.receiptFileName || "EMD_Challan_Receipt_HDFC_990182.pdf"}

The bank transaction acknowledgement advice with official bank seal has been enclosed herewith.

For Tech Solutions Private Limited
[SignatoryPlaceholder]`;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...sections];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onSectionsChange(updated);
    toast.success(
      `Reordered "${movedItem.title.slice(0, 22)}..." to Position ${targetIndex + 1} (Index Updated!)`,
    );
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ADD NEW BLANK A4 PAGE (ALWAYS WORKS ON ALL STEPS)
  const handleAddNewPage = (insertIndex: number | null = null) => {
    if (currentStep === 0 && onStartProcess) {
      onStartProcess();
    }
    const pageNum = sections.length + 1;
    const newSectionId = `sec-custom-${Date.now()}`;
    const newSection = {
      id: newSectionId,
      title: `Annexure ${pageNum}: Custom Document / Declaration`,
      type: "custom",
      badge: "Custom Page",
      pageCount: 1,
      isDeletable: true,
      images: [],
      content: `ANNEXURE ${pageNum}: ADDITIONAL BIDDER DECLARATION / CERTIFICATE\n\n(Click here to edit this text. Use the formatting toolbar above for Bold, Italic, Headings, or click "+ Image / Stamp" to insert official seals and certificates.)\n\nTender Ref: ${activeTender?.tenderNumber || "NIT-2026/099"}\n\nWe, Tech Solutions Private Limited, hereby affirm that all attached supplementary documentation and declarations strictly comply with the tender guidelines.\n\n[SignatoryPlaceholder]`,
    };

    let updated = [];
    if (insertIndex !== null && insertIndex >= 0) {
      updated = [...sections];
      updated.splice(insertIndex + 1, 0, newSection);
    } else {
      updated = [...sections, newSection];
    }

    onSectionsChange(updated);
    setActiveSectionId(newSectionId);
    toast.success(`Added New A4 Page ${pageNum} to Bid Dossier! (TOC Updated)`);

    setTimeout(() => {
      const el = document.getElementById(newSectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        const editor = el.querySelector('[contenteditable="true"]') as HTMLElement | null;
        if (editor) editor.focus();
      }
    }, 150);
  };

  // Delete custom page
  const handleDeletePage = (secId: string, secTitle: string) => {
    const updated = sections.filter((s) => s.id !== secId);
    onSectionsChange(updated);
    toast.success(`Removed "${secTitle.slice(0, 22)}..."`);
  };

  // Scroll directly to page on outline item click
  const scrollToPage = (secId: string) => {
    setActiveSectionId(secId);
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // High-performance Rich Document Formatting Handler (Direct DOM ExecCommand)
  const applyFormatting = (secId: string, formatType: string, value: string | null = null) => {
    const editorEl = document.getElementById(`editor-${secId}`);
    if (!editorEl) return;

    // Keep focus in editor
    editorEl.focus();

    try {
      if (formatType === "bold") {
        document.execCommand("bold", false, null);
      } else if (formatType === "italic") {
        document.execCommand("italic", false, null);
      } else if (formatType === "underline") {
        document.execCommand("underline", false, null);
      } else if (formatType === "heading1") {
        document.execCommand("formatBlock", false, "<h1>");
      } else if (formatType === "heading2") {
        document.execCommand("formatBlock", false, "<h2>");
      } else if (formatType === "bullet") {
        document.execCommand("insertUnorderedList", false, null);
      } else if (formatType === "numbered") {
        document.execCommand("insertOrderedList", false, null);
      } else if (formatType === "alignLeft") {
        document.execCommand("justifyLeft", false, null);
      } else if (formatType === "alignCenter") {
        document.execCommand("justifyCenter", false, null);
      } else if (formatType === "alignRight") {
        document.execCommand("justifyRight", false, null);
      } else {
        document.execCommand(formatType, false, value);
      }

      handleContentChange(secId, editorEl.innerHTML);
      toast.success(`Applied ${formatType} formatting`);
    } catch (err) {
      console.error("Format command error:", err);
    }
  };

  // Open Stamp / Image insertion modal
  const openStampModal = (secId: string) => {
    setStampTargetSecId(secId);
    setShowStampModal(true);
  };

  // Insert selected Stamp Preset
  const handleInsertPresetStamp = (preset: StampPreset) => {
    if (!stampTargetSecId) return;

    const updated = sections.map((sec) => {
      if (sec.id === stampTargetSecId) {
        const currentImgs = sec.images || [];
        return {
          ...sec,
          images: [
            ...currentImgs,
            {
              id: `img-${Date.now()}`,
              name: preset.title,
              url: preset.url,
              size: "medium",
              align: "right",
            },
          ],
        };
      }
      return sec;
    });

    onSectionsChange(updated);
    setShowStampModal(false);
    toast.success(`Inserted "${preset.title}" into A4 Sheet!`);
  };

  // Custom Image Upload trigger
  const handleCustomImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !stampTargetSecId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgDataUrl = event.target?.result as string;
      const updated = sections.map((sec) => {
        if (sec.id === stampTargetSecId) {
          const currentImgs = sec.images || [];
          return {
            ...sec,
            images: [
              ...currentImgs,
              {
                id: `img-${Date.now()}`,
                name: file.name,
                url: imgDataUrl,
                size: "medium",
                align: "center",
              },
            ],
          };
        }
        return sec;
      });

      onSectionsChange(updated);
      setShowStampModal(false);
      toast.success(`Uploaded & Inserted "${file.name}"!`);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Remove image from A4 sheet
  const handleRemoveImage = (secId: string, imgId: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === secId) {
        return {
          ...sec,
          images: (sec.images || []).filter((im: any) => im.id !== imgId),
        };
      }
      return sec;
    });
    onSectionsChange(updated);
    toast("Image removed from A4 sheet");
  };

  // Change image alignment / size
  const handleUpdateImageStyle = (secId: string, imgId: string, newProps: any) => {
    const updated = sections.map((sec) => {
      if (sec.id === secId) {
        return {
          ...sec,
          images: (sec.images || []).map((im: any) =>
            im.id === imgId ? { ...im, ...newProps } : im,
          ),
        };
      }
      return sec;
    });
    onSectionsChange(updated);
  };

  const handleContentChange = (id: string, newContent: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, content: newContent } : sec,
    );
    onSectionsChange(updated);
  };

  const renderFormattedContent = (sec: any) => {
    if (sec.id === "sec-toc") {
      return generateDynamicTOC();
    }
    if (sec.id === "sec-emd") {
      return generateEMDContent();
    }

    return (sec.content || "")
      .replace(
        /\[SignatoryPlaceholder\]/g,
        `Authorized Signatory:\n${selectedSignatory.name}\n${selectedSignatory.designation}\nDIN: ${selectedSignatory.din}`,
      )
      .replace(
        /\[SignatoryDetailsPlaceholder\]/g,
        `Shri ${selectedSignatory.name}, ${selectedSignatory.designation} (DIN: ${selectedSignatory.din})`,
      );
  };

  // DOWNLOAD REAL MICROSOFT WORD (.doc / .docx) WITH OFFICIAL COVER & DYNAMIC INDEX
  const handleDownloadWord = () => {
    if (!isGenerated || sections.length === 0) {
      toast.error("Document is empty", {
        description:
          "Please ingest or process an RFP first on the left panel to generate the bid document.",
      });
      return;
    }

    const docTitle = `NIT-2026-099_Master_Bid_${selectedSignatory.name.replace(/\s+/g, "_")}`;

    let bodyHTML = "";
    sections.forEach((sec, idx) => {
      const pageInfo = computedPageMapping[sec.id]?.label || `Page ${idx + 1}`;

      if (sec.id === "sec-cover") {
        // OFFICIAL COVER PAGE WORD FORMAT
        bodyHTML += `
          <div class="WordSection">
            <div style="border: 3pt double #0f172a; padding: 24pt; min-height: 700pt; box-sizing: border-box;">
              <div style="text-align: center; border-bottom: 2pt solid #0f172a; padding-bottom: 12pt; margin-bottom: 16pt;">
                <p style="font-size: 11pt; font-weight: bold; letter-spacing: 2pt; color: #475569; margin: 0;">GOVERNMENT OF NCT OF DELHI</p>
                <p style="font-size: 14pt; font-weight: bold; color: #0f172a; margin: 4pt 0 0 0;">DELHI MUNICIPAL CORPORATION & TRAFFIC POLICE AUTHORITY</p>
              </div>

              <div style="background-color: #0f172a; color: #ffffff; padding: 10pt; text-align: center; margin-bottom: 16pt;">
                <p style="font-size: 14pt; font-weight: bold; color: #38bdf8; margin: 0; text-transform: uppercase;">TECHNICAL & COMMERCIAL BID SUBMISSION DOSSIER</p>
                <p style="font-size: 10pt; color: #e2e8f0; margin: 4pt 0 0 0;">Tender Notice Reference: NIT-2026/099</p>
              </div>

              <div style="border-left: 4pt solid #0284c7; background: #f8fafc; padding: 10pt; margin-bottom: 16pt;">
                <p style="font-size: 9pt; font-weight: bold; color: #64748b; margin: 0; text-transform: uppercase;">NAME OF WORK / PROJECT SCOPE:</p>
                <p style="font-size: 11pt; font-weight: bold; color: #0f172a; margin: 4pt 0 0 0;">Implementation of AI Video Management & Integrated Traffic Surveillance System</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20pt;">
                <tr>
                  <td style="width: 50%; vertical-align: top; border: 1pt solid #cbd5e1; padding: 10pt; background: #ffffff;">
                    <p style="font-size: 10pt; font-weight: bold; color: #0f172a; border-bottom: 1pt solid #0f172a; padding-bottom: 3pt; margin: 0 0 6pt 0;">SUBMITTED BY (BIDDER):</p>
                    <p style="font-size: 9.5pt; color: #1e293b; margin: 2pt 0;"><strong>Tech Solutions Private Limited</strong></p>
                    <p style="font-size: 8.5pt; color: #475569; margin: 2pt 0;">CIN: U72200DL2018PTC334912</p>
                    <p style="font-size: 8.5pt; color: #475569; margin: 2pt 0;">GSTIN: 07AAACT9921M1ZR | PAN: AAACT9921M</p>
                    <p style="font-size: 8.5pt; color: #475569; margin: 2pt 0;">Tech Tower, Okhla Ind. Area Phase-III, New Delhi</p>
                  </td>
                  <td style="width: 50%; vertical-align: top; border: 1pt solid #cbd5e1; padding: 10pt; background: #ffffff;">
                    <p style="font-size: 10pt; font-weight: bold; color: #0f172a; border-bottom: 1pt solid #0f172a; padding-bottom: 3pt; margin: 0 0 6pt 0;">SUBMITTED TO (AUTHORITY):</p>
                    <p style="font-size: 9.5pt; color: #1e293b; margin: 2pt 0;"><strong>The Executive Engineer (E&M)</strong></p>
                    <p style="font-size: 8.5pt; color: #475569; margin: 2pt 0;">Delhi Municipal Corporation & Traffic Police</p>
                    <p style="font-size: 8.5pt; color: #475569; margin: 2pt 0;">Municipal Building, New Delhi - 110002</p>
                    <p style="font-size: 8.5pt; color: #059669; font-weight: bold; margin: 2pt 0;">Date of Submission: 22nd September 2026</p>
                  </td>
                </tr>
              </table>

              <div style="border-top: 2pt solid #0f172a; padding-top: 12pt; display: flex; justify-content: space-between;">
                <div>
                  <p style="font-size: 9pt; color: #64748b; margin: 0;">Bid Validity: 180 Days from Deadline</p>
                  <p style="font-size: 9pt; color: #059669; font-weight: bold; margin: 2pt 0;">100% GFR 2017 & Public Procurement Compliant</p>
                </div>
                <div style="text-align: right; float: right;">
                  <p style="font-size: 9pt; font-weight: bold; color: #0f172a; margin: 0;">Authorized Signatory:</p>
                  <p style="font-size: 10pt; font-weight: bold; color: #0284c7; margin: 2pt 0;">${selectedSignatory.name}</p>
                  <p style="font-size: 8.5pt; color: #475569; margin: 0;">${selectedSignatory.designation} (DIN: ${selectedSignatory.din})</p>
                </div>
              </div>
            </div>
          </div>
          <br clear="all" style="mso-special-character:line-break;page-break-before:always" />
        `;
        return;
      }

      if (sec.id === "sec-toc") {
        // OFFICIAL TABLE OF CONTENTS WORD FORMAT
        let tocRowsHTML = "";
        sections.forEach((item, itemIdx) => {
          if (item.id === "sec-toc") return;
          const targetPage =
            computedPageMapping[item.id]?.label || `Page ${itemIdx + 1}`;
          tocRowsHTML += `
            <tr style="border-bottom: 1pt solid #cbd5e1;">
              <td style="padding: 6pt; font-size: 9.5pt; text-align: center; border: 1pt solid #e2e8f0;">${itemIdx + 1}</td>
              <td style="padding: 6pt; font-size: 9.5pt; font-weight: bold; border: 1pt solid #e2e8f0;">${item.title}</td>
              <td style="padding: 6pt; font-size: 8.5pt; color: #475569; border: 1pt solid #e2e8f0;">${item.badge || "Document"}</td>
              <td style="padding: 6pt; font-size: 9.5pt; text-align: right; font-weight: bold; border: 1pt solid #e2e8f0; color: #0284c7;">${targetPage}</td>
            </tr>
          `;
        });

        bodyHTML += `
          <div class="WordSection">
            <div style="border-bottom: 1pt solid #94a3b8; padding-bottom: 6pt; margin-bottom: 18pt; font-size: 8.5pt; color: #64748b; display: flex; justify-content: space-between;">
              <span>CONFIDENTIAL • BID REF: ${activeTender?.tenderNumber || "NIT-2026/099"}</span>
              <span style="float: right;">TECH SOLUTIONS PRIVATE LIMITED</span>
            </div>

            <h2 style="font-size: 14pt; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 2pt solid #0f172a; padding-bottom: 6pt; margin-bottom: 14pt; text-align: center;">
              TABLE OF CONTENTS / INDEX OF BID DOSSIER
            </h2>

            <p style="font-size: 9.5pt; color: #64748b; margin-bottom: 12pt; text-align: center;">
              Sequential Index of all Enclosures, Legal Declarations, EMD Proof & Technical Proposal
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20pt;">
              <thead>
                <tr style="background-color: #0f172a; color: #ffffff;">
                  <th style="padding: 6pt; font-size: 9pt; width: 8%;">S.No</th>
                  <th style="padding: 6pt; font-size: 9pt; width: 55%; text-align: left;">Document / Annexure Description</th>
                  <th style="padding: 6pt; font-size: 9pt; width: 22%; text-align: left;">Enclosure Type</th>
                  <th style="padding: 6pt; font-size: 9pt; width: 15%; text-align: right;">Page Ref</th>
                </tr>
              </thead>
              <tbody>
                ${tocRowsHTML}
              </tbody>
            </table>

            <div style="border: 1pt dashed #0284c7; background: #f0f9ff; padding: 8pt; text-align: center; margin-top: 14pt;">
              <p style="font-size: 9.5pt; font-weight: bold; color: #0369a1; margin: 0;">
                Total Volume: ${totalPagesCount} Printed A4 Pages (Sequential 1 to ${totalPagesCount}) • Complete Submission
              </p>
            </div>

            <div style="border-top: 1pt solid #cbd5e1; padding-top: 8pt; margin-top: 24pt; font-size: 8.5pt; color: #64748b; display: flex; justify-content: space-between;">
              <span>Authorized Signatory: ${selectedSignatory.name} (DIN: ${selectedSignatory.din})</span>
              <span style="float: right; font-weight: bold; color: #0f172a;">Page 2 of ${totalPagesCount}</span>
            </div>
          </div>
          <br clear="all" style="mso-special-character:line-break;page-break-before:always" />
        `;
        return;
      }

      // STANDARD PAGES WORD FORMAT
      const rawText = renderFormattedContent(sec);
      const htmlText = formatToHTML(rawText);

      let imagesHTML = "";
      if (sec.images && sec.images.length > 0) {
        imagesHTML =
          '<div style="margin: 15pt 0; text-align: right;">' +
          sec.images
            .map(
              (img: any) =>
                `<img src="${img.url}" width="160" alt="${img.name}" style="margin: 5pt; border: 1pt solid #cbd5e1; vertical-align: middle;" />`,
            )
            .join(" ") +
          "</div>";
      }

      bodyHTML += `
        <div class="WordSection">
          <div style="border-bottom: 1pt solid #94a3b8; padding-bottom: 6pt; margin-bottom: 18pt; font-size: 8.5pt; color: #64748b; font-family: 'Calibri', Arial, sans-serif; display: flex; justify-content: space-between;">
            <span>CONFIDENTIAL • BID REF: ${activeTender?.tenderNumber || "NIT-2026/099"}</span>
            <span style="text-align: right; float: right;">TECH SOLUTIONS PRIVATE LIMITED</span>
          </div>

          <h2 style="font-family: 'Arial', sans-serif; font-size: 14pt; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 2pt solid #0f172a; padding-bottom: 6pt; margin-bottom: 14pt;">
            ${sec.title}
          </h2>

          <div style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #1e293b;">
            ${htmlText}
          </div>

          ${imagesHTML}

          <div style="border-top: 1pt solid #cbd5e1; padding-top: 8pt; margin-top: 24pt; font-size: 8.5pt; color: #64748b; font-family: 'Calibri', Arial, sans-serif; display: flex; justify-content: space-between;">
            <span>Authorized Signatory: ${selectedSignatory.name} (DIN: ${selectedSignatory.din})</span>
            <span style="float: right; font-weight: bold; color: #0f172a;">${pageInfo} of ${totalPagesCount}</span>
          </div>
        </div>
        <br clear="all" style="mso-special-character:line-break;page-break-before:always" />
      `;
    });

    const fullDocHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <style>
          @page WordSection {
            size: 595.3pt 841.9pt; /* A4 size */
            margin: 54pt 54pt 54pt 54pt;
            mso-header-margin: 36pt;
            mso-footer-margin: 36pt;
          }
          div.WordSection { page: WordSection; }
          body { font-family: 'Times New Roman', Georgia, serif; }
        </style>
      </head>
      <body>
        ${bodyHTML}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", fullDocHTML], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${docTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Downloaded Microsoft Word Document (.doc/.docx)!", {
      description: `Saved "${docTitle}.doc" with Master Cover Page, Auto-Index & ${totalPagesCount} A4 pages.`,
    });
  };

  // HIGH FIDELITY PDF PRINT ENGINE
  const handleDownloadPDF = () => {
    if (!isGenerated || sections.length === 0) {
      toast.error("Document is empty", {
        description:
          "Please ingest or process an RFP first on the left panel to generate the bid document.",
      });
      return;
    }

    toast.success("Opening Print-to-PDF Dialog...", {
      description: 'Select "Save as PDF" in destination dropdown.',
    });
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div
      className={`aimode-canvas-pane ${isFocusMode ? "fullscreen-focus" : ""}`}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomImageFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        style={{ display: "none" }}
      />

      {/* MS WORD STYLE STUDIO TOOLBAR */}
      <div className="aimode-word-toolbar">
        <div className="aimode-word-tool-group">
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "#0284c7",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "12px",
            }}
          >
            W
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#f8fafc",
              whiteSpace: "nowrap",
            }}
          >
            A4 Bid Studio
          </span>
          <span
            style={{
              fontSize: "11px",
              color: isGenerated ? "#94a3b8" : "#eab308",
              background: "rgba(255, 255, 255, 0.05)",
              padding: "2px 6px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              fontWeight: 600,
            }}
          >
            {isGenerated ? `${totalPagesCount} Pages` : "0 Pages (Empty)"}
          </span>

          <button
            type="button"
            className={`aimode-word-btn ${showOutline ? "active" : ""}`}
            onClick={() => setShowOutline(!showOutline)}
            style={{ marginLeft: 6 }}
            title="Toggle Side Navigation Outline"
          >
            <ListTree size={13} />
            <span>Outline Pane</span>
          </button>

          {/* Direct + Add Page in Main Toolbar */}
          <button
            type="button"
            className="aimode-word-btn"
            style={{
              background: "rgba(56, 189, 248, 0.15)",
              borderColor: "#38bdf8",
              color: "#38bdf8",
              fontWeight: 700,
            }}
            onClick={() => handleAddNewPage()}
            title="Add a new blank A4 page to document"
          >
            <PlusCircle size={13} />
            <span>+ Add A4 Page</span>
          </button>
        </div>

        {/* Zoom, Word/PDF Download & Focus Mode Actions */}
        <div className="aimode-word-tool-group">
          <button
            type="button"
            className="aimode-word-btn"
            onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span
            style={{
              fontSize: "11px",
              color: "#cbd5e1",
              width: "38px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {zoomLevel}%
          </span>
          <button
            type="button"
            className="aimode-word-btn"
            onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>

          <span style={{ color: "rgba(255, 255, 255, 0.15)", margin: "0 4px" }}>
            |
          </span>

          {/* Fullscreen Focus Toggle */}
          <button
            type="button"
            className={`aimode-word-btn ${isFocusMode ? "active" : ""}`}
            onClick={onToggleFocusMode}
            title={
              isFocusMode ? "Exit Fullscreen" : "Open Fullscreen Word Studio"
            }
          >
            {isFocusMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFocusMode ? "Exit Focus" : "Focus Mode"}</span>
          </button>

          {/* Download Word (.docx / .doc) Button */}
          <button
            className="aimode-word-btn"
            style={{
              background: "#0369a1",
              color: "#ffffff",
              fontWeight: 700,
              borderColor: "#0284c7",
            }}
            onClick={handleDownloadWord}
            title="Download formatted Microsoft Word document (.doc/.docx) with Master Cover & Index"
          >
            <FileDown size={13} />
            <span>Download .docx</span>
          </button>

          {/* Download PDF Button */}
          <button
            className="aimode-btn-primary"
            style={{ padding: "6px 14px", fontSize: "11.5px", marginLeft: 4 }}
            onClick={handleDownloadPDF}
            title="Download Print-Ready PDF Dossier"
          >
            <Download size={13} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* DUAL SUB-PANES LAYOUT: (1. OUTLINE PANEL + 2. A4 WORKBENCH) */}
      <div className="aimode-canvas-inner-layout">
        {/* SUB-PANE 1: NAVIGATION OUTLINE PANE */}
        {showOutline && (
          <aside className="aimode-outline-pane">
            <div className="aimode-outline-header">
              <span>Document Outline</span>
              <span
                style={{
                  color: isGenerated ? "#38bdf8" : "#64748b",
                  fontWeight: 800,
                }}
              >
                {isGenerated ? `${visibleSections.length} Pages` : "0 Pages"}
              </span>
            </div>

            {/* TOP ADD PAGE BUTTON IN OUTLINE */}
            <button
              type="button"
              className="aimode-add-page-btn"
              onClick={() => handleAddNewPage()}
              title="Add a new A4 page at the bottom"
            >
              <PlusCircle size={14} />
              <span>+ Add New A4 Page</span>
            </button>

            <div className="aimode-outline-list">
              {!isGenerated ? (
                <div
                  style={{
                    padding: "36px 14px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "11.5px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FileQuestion size={26} color="#475569" />
                  <span>
                    Outline will populate automatically once tender is
                    processed.
                  </span>
                </div>
              ) : (
                visibleSections.map((sec, index) => {
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;
                  const pageInfo =
                    computedPageMapping[sec.id]?.label || `Page ${index + 1}`;

                  return (
                    <div
                      key={sec.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      onClick={() => scrollToPage(sec.id)}
                      className={`aimode-outline-item ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""} ${activeSectionId === sec.id ? "active" : ""}`}
                      title="Click to jump to page • Drag to reorder"
                    >
                      <div className="aimode-outline-drag-handle">
                        <GripVertical size={13} />
                        <span className="aimode-outline-title">
                          {index + 1}.{" "}
                          {sec.title.replace(
                            /^Annexure\s*\d+:\s*|^Section\s*\d+:\s*/i,
                            "",
                          )}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span className="aimode-outline-badge">{pageInfo}</span>

                        {sec.isDeletable && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(sec.id, sec.title);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#f87171",
                              padding: 2,
                              cursor: "pointer",
                            }}
                            title="Delete this custom page"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* SUB-PANE 2: FLOATING A4 SHEETS WORKBENCH */}
        <div className="aimode-canvas-viewport">
          {!isGenerated ? (
            <div className="aimode-empty-canvas-container">
              <div className="aimode-empty-canvas-card">
                <div className="aimode-empty-canvas-icon-wrap">
                  <FileText size={38} className="aimode-empty-icon" />
                  <div className="aimode-empty-sparkle-badge">
                    <Sparkles size={15} />
                  </div>
                </div>

                <h3 className="aimode-empty-title">
                  A4 Bid Studio • Awaiting Tender Ingestion
                </h3>
                <p className="aimode-empty-subtitle">
                  The document canvas is currently empty. Ingest an RFP or click{" "}
                  <strong>"Select &amp; Test (NIT-2026/099)"</strong> on the
                  left panel to automatically generate and compile the complete{" "}
                  <strong>
                    Master Cover Page, Dynamic Index, Power of Attorney &amp;
                    Compliance Dossier
                  </strong>{" "}
                  in real-time.
                </p>

                <div className="aimode-empty-features-grid">
                  <div className="aimode-empty-feature-item">
                    <div className="aimode-empty-feature-dot" />
                    <span>
                      <strong>Page 1:</strong> Official Emblem Master Cover Page
                      (Double-Border Frame)
                    </span>
                  </div>
                  <div className="aimode-empty-feature-item">
                    <div className="aimode-empty-feature-dot" />
                    <span>
                      <strong>Page 2:</strong> Dynamic Auto-Calculated Index
                      Table (TOC)
                    </span>
                  </div>
                  <div className="aimode-empty-feature-item">
                    <div className="aimode-empty-feature-dot" />
                    <span>
                      <strong>Page 3–9+:</strong> PoA, EMD Exemption/Proof,
                      Technical Proposal &amp; Annexures
                    </span>
                  </div>
                </div>

                <div className="aimode-empty-actions">
                  {onStartProcess && (
                    <button
                      type="button"
                      className="aimode-btn-primary"
                      onClick={onStartProcess}
                      style={{
                        padding: "9px 20px",
                        fontSize: "12.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Sparkles size={15} />
                      <span>Process NIT-2026/099 RFP to Generate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "36px",
                paddingBottom: "80px",
                width: "100%",
              }}
            >
              {/* SEPARATE GENUINE A4 PAGES */}
              {visibleSections.map((sec, index) => {
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;
                const pageInfo =
                  computedPageMapping[sec.id]?.label || `Page ${index + 1}`;

                // ========================================================
                // CASE 1: MASTER OFFICIAL COVER PAGE (PAGE 1)
                // ========================================================
                if (sec.id === "sec-cover") {
                  return (
                    <div
                      id={sec.id}
                      key={sec.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`aimode-a4-sheet ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""} ${activeSectionId === sec.id ? "active-a4-sheet" : ""}`}
                      onClick={() => setActiveSectionId(sec.id)}
                    >
                      {/* Running Header */}
                      <div className="aimode-a4-running-header">
                        <span>
                          CONFIDENTIAL • BID REF:{" "}
                          {activeTender?.tenderNumber || "NIT-2026/099"}
                        </span>
                        <span>TECH SOLUTIONS PRIVATE LIMITED</span>
                      </div>

                      {/* OFFICIAL ORNAMENTAL DOUBLE BORDER FRAME */}
                      <div className="aimode-cover-frame">
                        {/* Top Emblem & Govt Authority Header */}
                        <div className="aimode-cover-header">
                          <div className="aimode-cover-emblem">
                            <Crown size={24} />
                          </div>
                          <div className="aimode-cover-authority-sub">
                            GOVERNMENT OF NCT OF DELHI
                          </div>
                          <div className="aimode-cover-authority-main">
                            DELHI MUNICIPAL CORPORATION &amp; TRAFFIC POLICE
                            AUTHORITY
                          </div>
                        </div>

                        {/* Dossier Banner Box */}
                        <div className="aimode-cover-dossier-banner">
                          <span className="aimode-cover-dossier-title">
                            TECHNICAL &amp; COMMERCIAL BID SUBMISSION DOSSIER
                          </span>
                          <div className="aimode-cover-tender-ref">
                            Tender Notice Reference:{" "}
                            <strong>
                              {activeTender?.tenderNumber || "NIT-2026/099"}
                            </strong>{" "}
                            • GeM Portal
                          </div>
                        </div>

                        {/* Work Name & Description */}
                        <div className="aimode-cover-work-box">
                          <span className="aimode-cover-work-label">
                            Name of Work / Project Scope:
                          </span>
                          <div className="aimode-cover-work-text">
                            "
                            {activeTender?.title ||
                              "Implementation of AI Video Management & Integrated Traffic Surveillance System"}
                            "
                          </div>
                        </div>

                        {/* 2-Column Info Grid: Bidder & Authority */}
                        <div className="aimode-cover-grid">
                          {/* Column 1: Submitted By */}
                          <div className="aimode-cover-card">
                            <div className="aimode-cover-card-header">
                              <Building2 size={13} color="#0284c7" />
                              <span>SUBMITTED BY (BIDDER):</span>
                            </div>
                            <div className="aimode-cover-card-body">
                              <strong
                                style={{
                                  color: "#0f172a",
                                  fontSize: "13px",
                                  display: "block",
                                  marginBottom: 2,
                                }}
                              >
                                Tech Solutions Private Limited
                              </strong>
                              <div>
                                <strong>CIN:</strong> U72200DL2018PTC334912
                              </div>
                              <div>
                                <strong>GSTIN:</strong> 07AAACT9921M1ZR |{" "}
                                <strong>PAN:</strong> AAACT9921M
                              </div>
                              <div>
                                <strong>Registered Office:</strong> Tech Tower,
                                Okhla Ind. Area Phase-III, New Delhi - 110020
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Submitted To */}
                          <div className="aimode-cover-card">
                            <div className="aimode-cover-card-header">
                              <Landmark size={13} color="#059669" />
                              <span>SUBMITTED TO (AUTHORITY):</span>
                            </div>
                            <div className="aimode-cover-card-body">
                              <strong
                                style={{
                                  color: "#0f172a",
                                  fontSize: "13px",
                                  display: "block",
                                  marginBottom: 2,
                                }}
                              >
                                The Executive Engineer (E&amp;M)
                              </strong>
                              <div>
                                Delhi Municipal Corporation &amp; Traffic Police
                              </div>
                              <div>Municipal Building, New Delhi - 110002</div>
                              <div
                                style={{
                                  color: "#059669",
                                  fontWeight: 700,
                                  marginTop: 4,
                                }}
                              >
                                Submission Date: 22nd September 2026
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Footer Row with Signatory & Official Seal */}
                        <div className="aimode-cover-footer">
                          <div>
                            <span
                              style={{
                                fontSize: "10px",
                                color: "#64748b",
                                display: "block",
                              }}
                            >
                              Official Bid Validity: 180 Days
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#059669",
                                fontWeight: 800,
                              }}
                            >
                              ● 100% GFR 2017 &amp; MSME Compliant
                            </span>
                          </div>

                          {/* Signatory Seal Box */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "#64748b",
                                  display: "block",
                                }}
                              >
                                Authorized Signatory:
                              </span>
                              <strong
                                style={{
                                  fontSize: "13px",
                                  color: "#0f172a",
                                  display: "block",
                                }}
                              >
                                {selectedSignatory.name}
                              </strong>
                              <span
                                style={{
                                  fontSize: "10.5px",
                                  color: "#0284c7",
                                  fontWeight: 600,
                                }}
                              >
                                {selectedSignatory.designation} (DIN:{" "}
                                {selectedSignatory.din})
                              </span>
                            </div>

                            {/* Render Corporate Seal Stamp Preview */}
                            <div
                              style={{
                                width: 68,
                                height: 68,
                                border: "1px solid #cbd5e1",
                                borderRadius: "50%",
                                background: "#fff",
                                padding: 2,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              }}
                            >
                              <img
                                src={STAMP_PRESETS[0].url}
                                alt="Official Seal"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Running Footer */}
                      <div className="aimode-a4-running-footer">
                        <span>
                          Authorized Signatory: {selectedSignatory.name} (
                          {selectedSignatory.din})
                        </span>
                        <strong style={{ color: "#0f172a" }}>
                          Page 1 of {totalPagesCount}
                        </strong>
                      </div>
                    </div>
                  );
                }

                // ========================================================
                // CASE 2: AUTO-GENERATED DYNAMIC INDEX / TABLE OF CONTENTS (PAGE 2)
                // ========================================================
                if (sec.id === "sec-toc") {
                  return (
                    <div
                      id={sec.id}
                      key={sec.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`aimode-a4-sheet ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""} ${activeSectionId === sec.id ? "active-a4-sheet" : ""}`}
                      onClick={() => setActiveSectionId(sec.id)}
                    >
                      {/* Running Header */}
                      <div className="aimode-a4-running-header">
                        <span>
                          CONFIDENTIAL • BID REF:{" "}
                          {activeTender?.tenderNumber || "NIT-2026/099"}
                        </span>
                        <span>TECH SOLUTIONS PRIVATE LIMITED</span>
                      </div>

                      {/* A4 BODY - DYNAMIC TOC */}
                      <div className="aimode-a4-body">
                        <div className="aimode-toc-container">
                          <div
                            className="aimode-a4-doc-title"
                            style={{ marginBottom: 4 }}
                          >
                            TABLE OF CONTENTS / DOCUMENT INDEX
                          </div>

                          <div className="aimode-toc-header-box">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: "11.5px",
                                color: "#0f172a",
                                fontWeight: 700,
                              }}
                            >
                              <Sparkles size={14} color="#0284c7" />
                              <span>
                                Auto-Generated Live Index (Synced with Outline
                                Pane)
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: "10.5px",
                                color: "#059669",
                                background: "#dcfce7",
                                padding: "2px 8px",
                                borderRadius: 999,
                                fontWeight: 800,
                              }}
                            >
                              ● Real-Time Calculated
                            </span>
                          </div>

                          {/* LIVE DYNAMIC TOC TABLE */}
                          <table className="aimode-toc-table">
                            <thead>
                              <tr>
                                <th
                                  style={{ width: "8%", textAlign: "center" }}
                                >
                                  S.No
                                </th>
                                <th style={{ width: "56%" }}>
                                  Document / Annexure Description
                                </th>
                                <th style={{ width: "20%" }}>Classification</th>
                                <th
                                  style={{ width: "16%", textAlign: "right" }}
                                >
                                  Page Ref
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleSections.map((item, itemIdx) => {
                                if (item.id === "sec-toc") return null;
                                const targetPage =
                                  computedPageMapping[item.id]?.label ||
                                  `Page ${itemIdx + 1}`;

                                return (
                                  <tr
                                    key={item.id}
                                    className="aimode-toc-row"
                                    onClick={() => scrollToPage(item.id)}
                                    title={`Click to jump to ${item.title}`}
                                  >
                                    <td
                                      style={{
                                        textAlign: "center",
                                        fontWeight: 700,
                                        color: "#64748b",
                                      }}
                                    >
                                      {itemIdx + 1}
                                    </td>
                                    <td>
                                      <div className="aimode-toc-title-cell">
                                        <span>{item.title}</span>
                                        <span className="aimode-toc-leader-dots" />
                                      </div>
                                    </td>
                                    <td>
                                      <span
                                        style={{
                                          fontSize: "10.5px",
                                          color: "#475569",
                                          background: "#f1f5f9",
                                          padding: "2px 6px",
                                          borderRadius: 4,
                                          fontWeight: 600,
                                        }}
                                      >
                                        {item.badge || "Annexure"}
                                      </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      <span className="aimode-toc-page-badge">
                                        {targetPage}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {/* Summary Box */}
                          <div className="aimode-toc-summary-box">
                            <div>
                              <strong>Total Dossier Volume:</strong>{" "}
                              {totalPagesCount} Printed A4 Pages (Sequential 1
                              to {totalPagesCount})
                            </div>
                            <span style={{ fontWeight: 700 }}>
                              100% Complete &amp; Formatted
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Running Footer */}
                      <div className="aimode-a4-running-footer">
                        <span>
                          Authorized Signatory: {selectedSignatory.name} (
                          {selectedSignatory.din})
                        </span>
                        <strong style={{ color: "#0f172a" }}>
                          Page 2 of {totalPagesCount}
                        </strong>
                      </div>
                    </div>
                  );
                }

                // ========================================================
                // CASE 3: STANDARD ANNEXURES & SECTIONS (PAGE 3+)
                // ========================================================
                return (
                  <div
                    id={sec.id}
                    key={sec.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`aimode-a4-sheet ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""} ${activeSectionId === sec.id ? "active-a4-sheet" : ""}`}
                    onClick={() => setActiveSectionId(sec.id)}
                  >
                    {/* A4 RUNNING HEADER */}
                    <div className="aimode-a4-running-header">
                      <span>
                        CONFIDENTIAL • BID REF:{" "}
                        {activeTender?.tenderNumber || "NIT-2026/099"}
                      </span>
                      <span>TECH SOLUTIONS PRIVATE LIMITED</span>
                    </div>

                    {/* A4 DOCUMENT BODY */}
                    <div className="aimode-a4-body">
                      {/* Document Title Row with Complete MS Word Formatting Ribbon */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "2px solid #0f172a",
                          paddingBottom: "8px",
                          marginBottom: "16px",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          className="aimode-a4-doc-title"
                          style={{
                            borderBottom: "none",
                            paddingBottom: 0,
                            marginBottom: 0,
                            textAlign: "left",
                            flex: "1 1 auto",
                          }}
                        >
                          {sec.title}
                        </div>

                        {/* MS WORD FORMATTING MINI RIBBON */}
                        <div
                          className="aimode-word-mini-ribbon"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            background: "#f8fafc",
                            padding: "3px 6px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          {/* Bold Button */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting(sec.id, "bold");
                            }}
                            className="aimode-ribbon-btn"
                            title="Make Selection Bold (**text**)"
                          >
                            <Bold size={13} strokeWidth={3} />
                          </button>

                          {/* Italic Button */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting(sec.id, "italic");
                            }}
                            className="aimode-ribbon-btn"
                            title="Make Selection Italic (*text*)"
                          >
                            <Italic size={13} />
                          </button>

                          {/* Underline Button */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting(sec.id, "underline");
                            }}
                            className="aimode-ribbon-btn"
                            title="Underline (__text__)"
                          >
                            <Underline size={13} />
                          </button>

                          <span style={{ color: "#cbd5e1", margin: "0 2px" }}>
                            |
                          </span>

                          {/* Heading 1 */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting(sec.id, "heading1");
                            }}
                            className="aimode-ribbon-btn"
                            title="Section Heading (# Title)"
                          >
                            <Heading1 size={13} />
                          </button>

                          {/* Heading 2 */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting(sec.id, "heading2");
                            }}
                            className="aimode-ribbon-btn"
                            title="Subsection Heading (## Title)"
                          >
                            <Heading2 size={13} />
                          </button>

                          {/* Bullet List */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting(sec.id, "bullet");
                            }}
                            className="aimode-ribbon-btn"
                            title="Bullet List (• Item)"
                          >
                            <List size={13} />
                          </button>

                          {/* Numbered List */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting(sec.id, "numbered");
                            }}
                            className="aimode-ribbon-btn"
                            title="Numbered List (1. Item)"
                          >
                            <ListOrdered size={13} />
                          </button>

                          <span style={{ color: "#cbd5e1", margin: "0 2px" }}>
                            |
                          </span>

                          {/* Insert Image / Stamp / Seal Button */}
                          <button
                            type="button"
                            onClick={() => openStampModal(sec.id)}
                            style={{
                              background: "#e0f2fe",
                              border: "1px solid #bae6fd",
                              color: "#0369a1",
                              padding: "3px 8px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: 800,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            title="Insert Company Seal, Signature, ISO Certificate or Custom Image"
                          >
                            <Stamp size={12} />
                            <span>+ Image / Stamp</span>
                          </button>

                          {/* Quick Add Page Below */}
                          <button
                            type="button"
                            onClick={() => handleAddNewPage(index)}
                            style={{
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              color: "#475569",
                              padding: "3px 6px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: "11px",
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                            title="Insert New A4 Page directly after this page"
                          >
                            <PlusCircle size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Rendered Images / Stamps inside A4 Sheet */}
                      {sec.images && sec.images.length > 0 && (
                        <div
                          className="aimode-a4-images-container"
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            marginBottom: 16,
                          }}
                        >
                          {sec.images.map((img: any) => (
                            <div
                              key={img.id}
                              style={{
                                position: "relative",
                                border: "1px solid #cbd5e1",
                                borderRadius: 8,
                                background: "#f8fafc",
                                padding: 6,
                                maxWidth:
                                  img.size === "small"
                                    ? "140px"
                                    : img.size === "full"
                                      ? "100%"
                                      : "240px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                              }}
                            >
                              <img
                                src={img.url}
                                alt={img.name}
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  maxHeight: "140px",
                                  objectFit: "contain",
                                  display: "block",
                                }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginTop: 4,
                                  borderTop: "1px solid #e2e8f0",
                                  paddingTop: 2,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "9.5px",
                                    color: "#64748b",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "120px",
                                  }}
                                >
                                  {img.name}
                                </span>
                                <div style={{ display: "flex", gap: 2 }}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateImageStyle(sec.id, img.id, {
                                        size:
                                          img.size === "small"
                                            ? "medium"
                                            : img.size === "medium"
                                              ? "full"
                                              : "small",
                                      })
                                    }
                                    style={{
                                      background: "#e2e8f0",
                                      border: "none",
                                      borderRadius: 3,
                                      fontSize: "8.5px",
                                      padding: "1px 4px",
                                      cursor: "pointer",
                                    }}
                                    title="Toggle Size"
                                  >
                                    {img.size === "small"
                                      ? "S"
                                      : img.size === "full"
                                        ? "Full"
                                        : "M"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveImage(sec.id, img.id)
                                    }
                                    style={{
                                      background: "#fee2e2",
                                      color: "#ef4444",
                                      border: "none",
                                      borderRadius: 3,
                                      width: 16,
                                      height: 16,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                    }}
                                    title="Delete Image"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Full WYSIWYG Rich A4 Document Body Editor */}
                      <A4RichPageEditor
                        sectionId={sec.id}
                        content={renderFormattedContent(sec)}
                        onContentChange={handleContentChange}
                        placeholder="Type or paste your text here. Select text to Bold, Italic, or Underline directly..."
                      />
                    </div>

                    {/* A4 RUNNING FOOTER */}
                    <div className="aimode-a4-running-footer">
                      <span>
                        Authorized Signatory: {selectedSignatory.name} (
                        {selectedSignatory.din})
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        {pageInfo} of {totalPagesCount}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* STAMP & IMAGE INSERTION MODAL */}
      {showStampModal && (
        <div
          className="aimode-modal-overlay"
          onClick={() => setShowStampModal(false)}
        >
          <div
            className="aimode-stamp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aimode-stamp-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Stamp size={18} color="#38bdf8" />
                <strong>Insert Official Stamp, Seal, or Custom Image</strong>
              </div>
              <button
                type="button"
                onClick={() => setShowStampModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="aimode-stamp-modal-body">
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#38bdf8",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                1. Official Verified Presets (1-Click Insert):
              </span>

              <div className="aimode-stamp-presets-grid">
                {STAMP_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="aimode-stamp-preset-card"
                    onClick={() => handleInsertPresetStamp(preset)}
                  >
                    <div className="aimode-stamp-preset-img-box">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "60px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 2,
                        }}
                      >
                        <strong style={{ fontSize: "12px", color: "#f8fafc" }}>
                          {preset.title}
                        </strong>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#34d399",
                            background: "rgba(16, 185, 129, 0.15)",
                            padding: "1px 5px",
                            borderRadius: 4,
                            fontWeight: 700,
                          }}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          margin: 0,
                        }}
                      >
                        {preset.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: 14,
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#cbd5e1",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  2. Or Upload Custom Image from Your Computer:
                </span>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aimode-btn-secondary"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderStyle: "dashed",
                    borderColor: "#38bdf866",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Upload size={16} color="#38bdf8" />
                  <span>
                    Choose Image / Logo / Certificate File (PNG, JPG, SVG, WebP)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
