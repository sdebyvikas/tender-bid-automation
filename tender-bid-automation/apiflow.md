📋 Complete List of All APIs

1. ⚙️ Health & System Status
   Method Endpoint Description
   GET /api/health Backend server & AI core health check
2. 📑 Tender Management (/api/tenders)
   Method Endpoint Request Type Description
   GET /api/tenders — Sabhi tenders ki list aur status fetch karega
   GET /api/tenders/:id Param Specific tender ki complete details fetch karega
   POST /api/tenders/upload multipart/form-data (document) Tender document (PDF/DOCX) upload, text extraction aur AI parsing
   POST /api/tenders/manual JSON body Manually tender form create karna
   PUT /api/tenders/:id JSON body Tender data update karna
   DELETE /api/tenders/:id Param Tender ko delete karna
3. 🎯 Go / No-Go Decision Analysis (/api/analysis)
   Method Endpoint Description
   POST /api/analysis/gonogo/:tenderId Company profile & eligibility criteria ke basis par Go/No-Go score recalculate karna
4. 📝 Compliance Matrix Engine (/api/compliance)
   Method Endpoint Request Type Description
   GET /api/compliance/:tenderId Param Tender ke sabhi compliance clauses fetch karna
   POST /api/compliance/:tenderId/auto-generate Param AI dwara automatic compliance matrix extract karna
   POST /api/compliance/:tenderId JSON body Naya compliance requirement item add karna
   PUT /api/compliance/:tenderId/items/:itemId JSON body Specific compliance item ka status/justification update karna
   DELETE /api/compliance/:tenderId/items/:itemId Param Compliance clause delete karna
5. ✍️ AI Proposal Generation (/api/proposals)
   Method Endpoint Request Type Description
   GET /api/proposals/:tenderId Param Proposal sections (Executive summary, tech approach, etc.) lana
   POST /api/proposals/:tenderId/generate JSON body (sectionName, customInstructions) AI se specific proposal section generate karwana
   PUT /api/proposals/:tenderId JSON body Edited proposal text ko save karna
6. 💰 Bill of Quantities (BOQ) (/api/boq)
   Method Endpoint Request Type Description
   GET /api/boq/:tenderId Param BOQ items aur cost summary fetch karna
   POST /api/boq/:tenderId/items JSON body Single BOQ deliverable item add karna
   POST /api/boq/:tenderId/batch JSON body Ek sath multiple BOQ items batch update/save karna
   DELETE /api/boq/:tenderId/items/:itemId Param BOQ item delete karna
7. 📜 Statutory Annexures & Undertakings (/api/annexures)
   Method Endpoint Description
   GET /api/annexures/:tenderId Auto-filled forms (Cover Letter, Non-Blacklisting Undertaking, Make in India Certificate, MAF) fetch karna
8. 🏢 Company Profile & Document Vault (/api/company-profile)
   Method Endpoint Request Type Description
   GET /api/company-profile — Company credentials, turnover, certifications aur Vault documents lana
   PUT /api/company-profile JSON body Company profile update karna (automatic score re-calculation across all tenders)
   POST /api/company-profile/documents multipart/form-data (document, name, category, expiryDate) Statutory Vault me document upload karna
   DELETE /api/company-profile/documents/:docId Param Vault se document delete karna
9. 🤖 AI Tender Assistant Chat (/api/chat)
   Method Endpoint Request Type Description
   POST /api/chat/:tenderId JSON body (query, chatHistory) Tender document context ke sath AI assistant se chat/query karna
10. 📦 Bid Package Export (/api/export)
    Method Endpoint Request Type Description
    POST /api/export/:tenderId JSON body (`format: "pdf"	"docx", selectedSections`)
    🚀 Postma
