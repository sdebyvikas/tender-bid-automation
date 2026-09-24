1. AI PDF Read Kaise Karega?
   Text & Table Extraction: Backend par PDF parser / OCR engine PDF ke saare pages, tables aur clauses ko raw text mein read karta hai.
   AI Semantic Parsing: AI model (LLM) us text ko analyze karke structured information (Tender No, Authority, EMD Amount, Turnover Requirement, Scope of Work, Deadlines) extract kar leta hai.
2. Complete Workflow Ke Steps
   Step 1: RFP Ingestion & Parsing: PDF upload hote hi AI tender ka title, authority, estimated value, aur mandatory conditions extract karta hai.
   Step 2: Eligibility & Qualification Audit: AI tender ki requirements ko aapke Company Vault ke documents (Turnover, GST, ISO certificates, past projects) ke sath match karke Pass/Fail aur Win Probability Score nikalta hai.
   Step 3: Signatory & PoA Binding: Authorized Director (DIN, designation) select hota hai, jo automatically saare cover letters aur annexures par digitally bind ho jata hai.
   Step 4: EMD & Financial Security Desk: System check karta hai ki kya MSME / Udyam Certificate ke basis par EMD 100% exempt ho sakti hai ya bank challan / UTR receipt attach karni hai.
   Step 5: Technical Proposal & Annexures Generation: RFP ke technical scope ke mutabiq AI real-time Methodology, Compliance Matrix, aur Legal Declarations draft kar deta hai.
   Step 6: Master Bid Dossier Compilation: Sabhi pages sequence mein merge hokar Master Cover Page, Dynamic Auto-Index (TOC), aur Numbered Annexures ke sath Word (.docx) aur PDF format mein ready ho jate hain.
3. Rules Kahan Define Hote Hain?
   Company Profile & Vault (Database):

Aapki company ke threshold rules yahan save hote hain (jaise: 3-year average turnover, positive net worth, active ISO certifications, board resolutions).
Procurement & Compliance Rules (Backend / AI Prompts):

Legal aur Government procurement rules (jaise Rule 170 of GFR 2017 for MSME exemption, Public Procurement Preference to Make in India Policy, Integrity Pact clauses) AI backend prompts aur system instructions mein pre-configured hote hain.
Eligibility Matching Engine (Business Logic):

Yeh code-level par check karta hai:
Turnover Match: Company Turnover >= Required Turnover
Certification Match: Active ISO/CMMI Present in Vault
Past Experience Match: Number of completed projects >= Required Count
