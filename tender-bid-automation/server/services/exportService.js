import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import fs from 'fs';
import path from 'path';

/**
 * Generate PDF Bid Document Package
 */
export async function generateBidPDF({ tender, companyProfile, selectedSections, outputPath }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 45,
        bufferPages: true
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // --- COVER PAGE ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0F172A'); // Deep Navy Blue
      
      doc.fillColor('#38BDF8').fontSize(14).text('OFFICIAL BID SUBMISSION PACKAGE', 50, 80, { align: 'center', characterSpacing: 2 });
      doc.moveDown(2);

      doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text(tender.title || 'Technical & Commercial Proposal', 50, 140, { align: 'center', lineGap: 6 });
      doc.moveDown(1.5);

      doc.fillColor('#94A3B8').fontSize(12).font('Helvetica').text(`TENDER / RFP REF: ${tender.tenderNumber || 'N/A'}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.text(`ISSUED BY: ${tender.organization || 'Procuring Authority'}`, { align: 'center' });
      doc.moveDown(4);

      // Bidder Card on Cover
      doc.rect(80, doc.y, doc.page.width - 160, 180).fillAndStroke('#1E293B', '#334155');
      const cardY = doc.y - 170;
      doc.fillColor('#38BDF8').fontSize(12).font('Helvetica-Bold').text('SUBMITTED BY:', 105, cardY);
      doc.fillColor('#FFFFFF').fontSize(16).text(companyProfile.name || 'Bidder Entity', 105, cardY + 22);
      doc.fillColor('#CBD5E1').fontSize(10).font('Helvetica').text(`GSTIN: ${companyProfile.gstin || 'N/A'} | PAN: ${companyProfile.pan || 'N/A'}`, 105, cardY + 50);
      doc.text(`HQ: ${companyProfile.headquarters || 'India'}`, 105, cardY + 68);
      doc.text(`Authorized Signatory: ${companyProfile.authorizedSignatory?.name || 'Authorized Signatory'} (${companyProfile.authorizedSignatory?.designation || ''})`, 105, cardY + 86);
      doc.text(`Contact: ${companyProfile.authorizedSignatory?.email || ''} | ${companyProfile.authorizedSignatory?.phone || ''}`, 105, cardY + 104);
      doc.text(`Submission Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 105, cardY + 124);

      doc.addPage();
      doc.fillColor('#000000');

      // Helper for Section Headers
      const renderSectionHeader = (title, num) => {
        doc.fillColor('#0F172A').fontSize(16).font('Helvetica-Bold').text(`${num}. ${title}`);
        doc.strokeColor('#0284C7').lineWidth(2).moveTo(45, doc.y + 4).lineTo(doc.page.width - 45, doc.y + 4).stroke();
        doc.moveDown(1);
        doc.font('Helvetica').fontSize(10).fillColor('#334155');
      };

      let secCounter = 1;

      // SECTION 1: EXECUTIVE SUMMARY
      if (selectedSections.includes('executiveSummary')) {
        renderSectionHeader('Executive Summary & Bidder Credentials', secCounter++);
        const execSummary = tender.proposals?.executiveSummary || 'Executive summary proposal text.';
        doc.text(execSummary, { align: 'justify', lineGap: 4 });
        doc.moveDown(1.5);

        // Company Snapshot Box
        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('Bidder Financial & Quality Highlights:');
        doc.font('Helvetica').fontSize(9.5).fillColor('#475569');
        doc.text(`• Average Annual Turnover: ₹${(companyProfile.averageTurnoverINR / 10000000).toFixed(2)} Crore`);
        doc.text(`• Quality & Security Accreditations: ${(companyProfile.certifications || []).join(', ')}`);
        doc.text(`• Key Delivered Projects: ${(companyProfile.pastProjects || []).map(p => `${p.title} (${p.valueDisplay})`).join('; ')}`);
        doc.moveDown(2);
      }

      // SECTION 2: TECHNICAL APPROACH
      if (selectedSections.includes('technicalApproach')) {
        renderSectionHeader('Technical Solution Architecture & Methodology', secCounter++);
        const techApproach = tender.proposals?.technicalApproach || 'Detailed technical solution overview.';
        doc.text(techApproach, { align: 'justify', lineGap: 4 });
        doc.moveDown(1.5);

        if (tender.proposals?.implementationPlan) {
          doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('Implementation & Rollout Plan:');
          doc.font('Helvetica').fontSize(9.5).fillColor('#475569');
          doc.text(tender.proposals.implementationPlan, { align: 'justify', lineGap: 3 });
          doc.moveDown(2);
        }
      }

      // SECTION 3: COMPLIANCE MATRIX TABLE
      if (selectedSections.includes('complianceMatrix') && tender.complianceItems?.length > 0) {
        renderSectionHeader('Clause-by-Clause Compliance Matrix', secCounter++);
        doc.fontSize(9).font('Helvetica');

        // Table Header
        let y = doc.y;
        doc.rect(45, y, doc.page.width - 90, 22).fill('#0F172A');
        doc.fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('Clause', 50, y + 6, { width: 55 });
        doc.text('RFP Requirement', 110, y + 6, { width: 170 });
        doc.text('Status', 285, y + 6, { width: 65 });
        doc.text('Compliance Justification / Remarks', 355, y + 6, { width: 180 });
        y += 24;

        tender.complianceItems.slice(0, 8).forEach((item, idx) => {
          if (y > doc.page.height - 80) {
            doc.addPage();
            y = 50;
          }
          const rowBg = idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
          doc.rect(45, y, doc.page.width - 90, 32).fill(rowBg);
          doc.fillColor('#0F172A').font('Helvetica-Bold').text(item.clauseNo || `Sec ${idx + 1}`, 50, y + 5, { width: 55 });
          doc.fillColor('#334155').font('Helvetica').text(item.requirement.slice(0, 75) + (item.requirement.length > 75 ? '...' : ''), 110, y + 5, { width: 170 });
          doc.fillColor(item.status === 'Complied' ? '#059669' : '#D97706').font('Helvetica-Bold').text(item.status, 285, y + 5, { width: 65 });
          doc.fillColor('#475569').font('Helvetica').text(item.justification.slice(0, 85) + (item.justification.length > 85 ? '...' : ''), 355, y + 5, { width: 180 });
          y += 34;
        });

        doc.y = y + 15;
        doc.moveDown(1.5);
      }

      // SECTION 4: COMMERCIAL BOQ
      if (selectedSections.includes('boq') && tender.boqItems?.length > 0) {
        if (doc.y > doc.page.height - 200) doc.addPage();
        renderSectionHeader('Commercial Schedule & Bill of Quantities (BOQ)', secCounter++);
        
        let y = doc.y;
        doc.rect(45, y, doc.page.width - 90, 22).fill('#0F172A');
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
        doc.text('Item Description', 50, y + 6, { width: 220 });
        doc.text('Category', 275, y + 6, { width: 65 });
        doc.text('Qty', 345, y + 6, { width: 45, align: 'right' });
        doc.text('Rate (INR)', 395, y + 6, { width: 65, align: 'right' });
        doc.text('Total (INR)', 465, y + 6, { width: 70, align: 'right' });
        y += 24;

        let grandTotal = 0;
        tender.boqItems.forEach((item, idx) => {
          if (y > doc.page.height - 80) {
            doc.addPage();
            y = 50;
          }
          const rowBg = idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
          doc.rect(45, y, doc.page.width - 90, 24).fill(rowBg);
          doc.fillColor('#0F172A').font('Helvetica').fontSize(8.5).text(item.item, 50, y + 6, { width: 220 });
          doc.fillColor('#64748B').text(item.category || 'General', 275, y + 6, { width: 65 });
          doc.fillColor('#0F172A').text(`${item.quantity} ${item.unit || ''}`, 345, y + 6, { width: 45, align: 'right' });
          doc.text(`₹${Number(item.unitPrice).toLocaleString('en-IN')}`, 395, y + 6, { width: 65, align: 'right' });
          doc.font('Helvetica-Bold').text(`₹${Number(item.total).toLocaleString('en-IN')}`, 465, y + 6, { width: 70, align: 'right' });
          grandTotal += (item.total || 0);
          y += 26;
        });

        // Grand Total Box
        doc.rect(45, y, doc.page.width - 90, 26).fill('#E2E8F0');
        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10);
        doc.text('TOTAL BASE COMMERCIAL OFFER (EXCL. TAXES):', 50, y + 8);
        doc.text(`₹${grandTotal.toLocaleString('en-IN')}`, 440, y + 8, { width: 95, align: 'right' });
        doc.y = y + 40;
      }

      // SECTION 5: ANNEXURES & UNDERTAKINGS
      if (selectedSections.includes('annexures')) {
        doc.addPage();
        renderSectionHeader('Mandatory Undertakings & Declarations', secCounter++);
        
        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('Annexure I: Non-Blacklisting Certificate & Integrity Pact');
        doc.font('Helvetica').fontSize(9.5).fillColor('#334155');
        doc.text(`We, ${companyProfile.name}, hereby solemnly declare and affirm that we have not been debarred, blacklisted, or disqualified by any Central / State Government Department, Public Sector Undertaking (PSU), or autonomous body in India as on the date of submission. We further affirm compliance with all local laws, Anti-Bribery regulations, and fair competition norms.`, { align: 'justify', lineGap: 3 });
        doc.moveDown(1.5);

        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('Annexure II: Make In India (MII) & Local Content Compliance');
        doc.font('Helvetica').fontSize(9.5).fillColor('#334155');
        doc.text(`We confirm that the services and components offered under Tender ${tender.tenderNumber} meet the minimum local content requirements prescribed under the Public Procurement (Preference to Make in India) Order issued by DPIIT, Govt. of India.`, { align: 'justify', lineGap: 3 });
        doc.moveDown(3);

        // Signature Block
        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10).text('For and on behalf of:', 350, doc.y);
        doc.text(companyProfile.name, 350, doc.y + 14);
        doc.font('Helvetica').fontSize(9.5).fillColor('#475569');
        doc.text(`[Digital / Physical Signature]`, 350, doc.y + 40);
        doc.text(`${companyProfile.authorizedSignatory?.name || 'Vikas Kumar'}`, 350, doc.y + 54);
        doc.text(`${companyProfile.authorizedSignatory?.designation || 'Authorized Signatory'}`, 350, doc.y + 68);
      }

      // Page numbers on all pages
      const range = doc.bufferedPageRange();
      for (let i = 1; i < range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#94A3B8').text(
          `Page ${i + 1} of ${range.count} | Tender Bid Package: ${tender.tenderNumber}`,
          45,
          doc.page.height - 35,
          { align: 'center' }
        );
      }

      doc.end();
      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate DOCX Bid Document Package
 */
export async function generateBidDOCX({ tender, companyProfile, selectedSections, outputPath }) {
  const docChildren = [
    new Paragraph({
      text: "TECHNICAL & COMMERCIAL BID PROPOSAL",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Project: ${tender.title}\n`, bold: true }),
        new TextRun({ text: `Tender Ref: ${tender.tenderNumber}\n` }),
        new TextRun({ text: `Client: ${tender.organization}\n` }),
        new TextRun({ text: `Bidder: ${companyProfile.name}\n` }),
        new TextRun({ text: `Submission Date: ${new Date().toLocaleDateString('en-IN')}\n\n` })
      ],
      alignment: AlignmentType.CENTER
    })
  ];

  if (selectedSections.includes('executiveSummary')) {
    docChildren.push(
      new Paragraph({ text: "1. Executive Summary", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: tender.proposals?.executiveSummary || "Executive Summary Content" })
    );
  }

  if (selectedSections.includes('technicalApproach')) {
    docChildren.push(
      new Paragraph({ text: "2. Technical Solution & Methodology", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: tender.proposals?.technicalApproach || "Technical Approach Content" })
    );
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}
