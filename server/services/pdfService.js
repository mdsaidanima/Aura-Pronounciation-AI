const PDFDocument = require('pdfkit');

/**
 * Generates a PDF buffer of the pronunciation assessment report.
 * @param {object} report Database report document
 * @param {object} user Database user document
 * @returns {Promise<Buffer>} PDF Buffer
 */
const generateReportPDF = (report, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => {
        reject(err);
      });

      // Colors
      const primaryColor = '#1e1b4b'; // Deep Indigo
      const secondaryColor = '#3b82f6'; // Bright Blue
      const textColor = '#334155'; // Slate
      const mutedColor = '#64748b'; // Muted Slate
      const borderColor = '#e2e8f0'; // Light Gray border
      const lightBgColor = '#f8fafc'; // Off-white Card background
      const accentRed = '#ef4444'; // Red for High severity
      const accentOrange = '#f97316'; // Orange for Medium severity
      const accentGreen = '#22c55e'; // Green for Low severity

      // HEADER
      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Aura Pronunciation AI', 50, 50);

      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica')
        .text('Advanced Pronunciation Assessment Report', 50, 75);

      // Horizontal separator line
      doc
        .strokeColor(borderColor)
        .lineWidth(1)
        .moveTo(50, 95)
        .lineTo(545, 95)
        .stroke();

      // METADATA PANEL
      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('User Details', 50, 115)
        .font('Helvetica')
        .text(`Name: ${user.name}`, 50, 130)
        .text(`Email: ${user.email}`, 50, 145);

      const reportDate = new Date(report.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      doc
        .font('Helvetica-Bold')
        .text('Report Details', 350, 115)
        .font('Helvetica')
        .text(`Date: ${reportDate}`, 350, 130)
        .text(`Duration: ${report.audioDuration} seconds`, 350, 145);

      // Divider
      doc
        .strokeColor(borderColor)
        .moveTo(50, 175)
        .lineTo(545, 175)
        .stroke();

      // SCORES SUMMARY CARDS
      // Box Background
      doc
        .rect(50, 195, 495, 80)
        .fill(lightBgColor)
        .strokeColor(borderColor)
        .stroke();

      // Overall Score Callout
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('OVERALL SCORE', 70, 210)
        .fontSize(28)
        .font('Helvetica-Bold')
        .text(`${report.overallScore}`, 70, 225)
        .fillColor(mutedColor)
        .fontSize(10)
        .font('Helvetica')
        .text('/ 100', 120, 240);

      // Core Metrics grid
      const gridX = 220;
      doc
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Accuracy:', gridX, 212)
        .font('Helvetica')
        .text(`${report.accuracy}%`, gridX + 90, 212)
        
        .font('Helvetica-Bold')
        .text('Fluency:', gridX, 230)
        .font('Helvetica')
        .text(`${report.fluency}%`, gridX + 90, 230)
        
        .font('Helvetica-Bold')
        .text('Clarity:', gridX, 248)
        .font('Helvetica')
        .text(`${report.clarity}%`, gridX + 90, 248);

      // TRANSCRIPT SECTION
      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Speech Transcript', 50, 295);

      doc
        .fillColor(textColor)
        .fontSize(11)
        .font('Helvetica-Oblique')
        .text(`"${report.transcript}"`, 50, 315, {
          width: 495,
          align: 'left',
          lineGap: 4,
        });

      // MISTAKES & ISSUES TABLE
      let currentY = doc.y + 30;

      // Start new page if table starts too low
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Identified Pronunciation Issues', 50, currentY);

      currentY += 20;

      if (report.mistakes.length === 0) {
        doc
          .fillColor(mutedColor)
          .fontSize(10)
          .font('Helvetica')
          .text('No pronunciation issues were flagged. Great job!', 50, currentY);
        currentY += 20;
      } else {
        // Table Headers
        doc
          .fillColor(primaryColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Word', 50, currentY, { width: 100 })
          .text('Issue Details', 150, currentY, { width: 150 })
          .text('Severity', 310, currentY, { width: 60 })
          .text('Correction Suggestion', 380, currentY, { width: 165 });

        // Underline Headers
        currentY += 14;
        doc
          .strokeColor(primaryColor)
          .lineWidth(1)
          .moveTo(50, currentY)
          .lineTo(545, currentY)
          .stroke();

        currentY += 8;

        // Table Rows
        report.mistakes.forEach((mistake) => {
          // Check if space runs out on current page
          if (currentY > 740) {
            doc.addPage();
            currentY = 50;
            // Redraw table headers on new page
            doc
              .fillColor(primaryColor)
              .fontSize(9)
              .font('Helvetica-Bold')
              .text('Word', 50, currentY, { width: 100 })
              .text('Issue Details', 150, currentY, { width: 150 })
              .text('Severity', 310, currentY, { width: 60 })
              .text('Correction Suggestion', 380, currentY, { width: 165 });

            currentY += 14;
            doc
              .strokeColor(primaryColor)
              .moveTo(50, currentY)
              .lineTo(545, currentY)
              .stroke();
            currentY += 8;
          }

          // Choose color for severity
          let sevColor = textColor;
          if (mistake.severity === 'High') sevColor = accentRed;
          else if (mistake.severity === 'Medium') sevColor = accentOrange;
          else if (mistake.severity === 'Low') sevColor = accentGreen;

          doc
            .fillColor(textColor)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text(mistake.word, 50, currentY, { width: 90 })
            .font('Helvetica')
            .text(mistake.issue, 150, currentY, { width: 150 })
            .fillColor(sevColor)
            .font('Helvetica-Bold')
            .text(mistake.severity, 310, currentY, { width: 60 })
            .fillColor(textColor)
            .font('Helvetica')
            .text(mistake.suggestion, 380, currentY, { width: 165 });

          // Row separator line
          currentY += Math.max(
            doc.heightOfString(mistake.issue, { width: 150 }),
            doc.heightOfString(mistake.suggestion, { width: 165 }),
            15
          );

          doc
            .strokeColor(borderColor)
            .lineWidth(0.5)
            .moveTo(50, currentY)
            .lineTo(545, currentY)
            .stroke();

          currentY += 6;
        });
      }

      // ACCENT TIPS SECTION
      if (currentY > 680) {
        doc.addPage();
        currentY = 50;
      } else {
        currentY += 15;
      }

      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Actionable Improvement Tips', 50, currentY);

      currentY += 20;

      report.tips.forEach((tip) => {
        if (currentY > 750) {
          doc.addPage();
          currentY = 50;
        }

        // Draw bullet point
        doc
          .fillColor(secondaryColor)
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('•', 50, currentY);

        doc
          .fillColor(textColor)
          .font('Helvetica')
          .fontSize(10)
          .text(tip, 65, currentY + 1.5, {
            width: 480,
            align: 'left',
          });

        currentY += doc.heightOfString(tip, { width: 480 }) + 10;
      });

      // FOOTER & PAGES STAMPING
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .moveTo(50, 785)
          .lineTo(545, 785)
          .stroke();

        doc
          .fillColor(mutedColor)
          .fontSize(8)
          .font('Helvetica')
          .text('Aura Pronunciation AI is compliant with India\'s Digital Personal Data Protection (DPDP) Act 2023.', 50, 792)
          .text(`Page ${i + 1} of ${range.count}`, 490, 792, { align: 'right' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateReportPDF,
};
