import Tender from "../models/Tender.js";
import CompanyProfile from "../models/CompanyProfile.js";
import { readDB } from "../config/db.js";

export async function getAnnexuresForTender(req, res) {
  try {
    let tender = await Tender.findOne({ id: req.params.tenderId }).lean();
    const db = readDB();
    if (!tender) {
      tender = db.tenders.find((t) => t.id === req.params.tenderId);
    }
    if (!tender)
      return res.status(404).json({ success: false, error: "Tender not found" });

    let comp = await CompanyProfile.findOne().lean();
    if (!comp) {
      comp = db.companyProfile || {
        name: "Tech Solutions Pvt Ltd",
        headquarters: "India",
        gstin: "18AABCT1234F1ZP",
        pan: "AABCT1234F",
      };
    }

    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const annexures = [
      {
        id: "annex_cover_letter",
        title: "Bid Submission Cover Letter",
        formNumber: "Form-1",
        description:
          "Formal letter of bid transmission to the procuring authority",
        content: `To,\nThe Procurement Officer / Tender Inviting Authority,\n${tender.organization || "Procuring Authority"}\n\nSubject: Submission of Technical & Commercial Bid for Tender Ref No: ${tender.tenderNumber || tender.reference} - "${tender.title}".\n\nDear Sir/Madam,\n\nHaving examined the Tender Documents, Terms & Conditions, and Technical Specifications, we, the undersigned ${comp.name}, offer to execute and complete the whole of the works in conformity with the said Tender documents for the sum indicated in the Financial Bid.\n\nWe confirm that:\n1. Our bid is valid for a period of 180 days from the date of submission.\n2. We have submitted the requisite EMD of ${tender.emdDisplay || "applicable amount"}.\n3. All information and statements submitted in our bid are true and correct.\n\nYours faithfully,\n\nFor ${comp.name}\n\n_______________________\nName: ${comp.authorizedSignatory?.name || "Authorized Signatory"}\nDesignation: ${comp.authorizedSignatory?.designation || "Director"}\nDate: ${todayStr}\nPlace: ${comp.headquarters || "Registered Office"}`,
      },
      {
        id: "annex_non_blacklisting",
        title: "Non-Blacklisting & Debarment Undertaking",
        formNumber: "Annexure-II",
        description:
          "Self-declaration confirming clean legal and non-debarment status",
        content: `UNDERTAKING FOR NON-BLACKLISTING / NON-DEBARMENT\n\n(To be executed on Company Letterhead)\n\nWe, M/s ${comp.name}, having registered office at ${comp.headquarters || "Registered Office"}, (GSTIN: ${comp.gstin || "N/A"}, PAN: ${comp.pan || "N/A"}), hereby solemnly declare and affirm that:\n\n1. As on date of submission of this bid (${todayStr}), we are not blacklisted, debarred, suspended, or prohibited from participating in tenders by any Central Government Ministry, State Government Department, Public Sector Undertaking (PSU), or Autonomous body in India.\n2. There is no pending litigation or inquiry involving moral turpitude or fraudulent practices against the company or its directors.\n3. In case any false declaration is detected at any stage, the authority shall be free to cancel our bid and forfeit the EMD.\n\nSigned & Stamped:\n\n_______________________\nAuthorized Signatory: ${comp.authorizedSignatory?.name || "Authorized Signatory"}\n${comp.name}`,
      },
      {
        id: "annex_make_in_india",
        title: "Make In India (MII) & Local Content Certificate",
        formNumber: "Annexure-III",
        description:
          "Class-I / Class-II Local Supplier percentage certification under DPIIT Order",
        content: `LOCAL CONTENT & MAKE IN INDIA COMPLIANCE CERTIFICATE\n\n(In accordance with DPIIT Order No. P-45021/2/2017-PP (BE-II))\n\nTender Ref: ${tender.tenderNumber || tender.reference}\nProject: ${tender.title}\nProcuring Authority: ${tender.organization || "Procuring Authority"}\n\nWe hereby certify that M/s ${comp.name} is a **Class-I Local Supplier** having more than 50% local value addition for the deliverables specified in the above tender.\n\n1. Percentage of Local Content: 85%\n2. Location of Local Value Addition: Facilities in India.\n3. Nature of Local Value Addition: Architecture, design, development, SLA delivery, testing, and deployment.\n\nVerified & Certified,\n\nFor ${comp.name}\n\n_______________________\n${comp.authorizedSignatory?.name || "Authorized Signatory"}\nAuthorized Signatory`,
      },
      {
        id: "annex_maf",
        title: "Manufacturer Authorization Form (MAF)",
        formNumber: "Annexure-IV",
        description:
          "OEM authorization certifying warranty support and genuine hardware/software supply",
        content: `MANUFACTURER AUTHORIZATION FORM (MAF)\n\nTo,\n${tender.organization || "Procuring Authority"}\n\nSubject: Manufacturer Authorization for Tender Ref: ${tender.tenderNumber || tender.reference}\n\nWe, [OEM Manufacturer Name], having factories/offices at [Factory Address], do hereby authorize M/s ${comp.name} (${comp.headquarters || "India"}) to submit a bid, negotiate, and conclude the contract with you against the above referenced tender.\n\nWe hereby extend our full comprehensive OEM warranty and back-to-back technical support for the goods and services offered by ${comp.name}.\n\nFor [OEM Manufacturer Entity],\n\n_______________________\nAuthorized Signatory of OEM`,
      },
    ];

    res.json({ success: true, source: "MongoDB", annexures });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
