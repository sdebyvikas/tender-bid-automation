import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument({
  pdfVersion: '1.4',
  compress: false,
  margin: 50,
  info: {
    Title: 'NIT-2026-IT-901',
    Author: 'State Government'
  }
});

const writeStream = fs.createWriteStream('sample-tender-notice.pdf');
doc.pipe(writeStream);

doc.fontSize(18).text('NOTICE INVITING TENDER (NIT)', { align: 'center' });
doc.moveDown(1);

doc.fontSize(12).text('Tender Reference: NIT-2026-IT-901');
doc.text('Organization: State E-Governance Mission Authority');
doc.text('Publish Date: 24/09/2026');
doc.text('Submission Deadline: 15/10/2026');
doc.moveDown(0.8);

doc.fontSize(14).text('Project: Digital Citizen Grievance Redressal System');
doc.fontSize(11).text('Estimated Contract Value: Rs. 250000000 (INR 25.00 Crore)');
doc.text('Earnest Money Deposit (EMD): Rs. 500000');
doc.text('Tender Fee: Rs. 10000');
doc.moveDown(1);

doc.fontSize(13).text('Key Eligibility Criteria:');
doc.fontSize(10)
  .text('1. Minimum average annual turnover of Rs. 120000000 in last 3 financial years.')
  .text('2. Mandatory ISO 9001 and ISO 27001 certifications required.')
  .text('3. Minimum 5 years of experience in state e-governance systems.')
  .text('4. Official contact for queries: procurement@stategov.in | Phone: +919876543210');

doc.moveDown(1);
doc.fontSize(9).text('--- End of Notice ---', { align: 'center' });

doc.end();

writeStream.on('finish', () => {
  console.log('✅ sample-tender-notice.pdf created successfully with compress: false!');
});
