const Report = require('../models/Report');
const User = require('../models/User');
const { generateReportPDF } = require('../services/pdfService');

/**
 * @desc    Get user's reports with sorting, filtering & pagination
 * @route   GET /api/reports
 * @access  Private
 */
const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { user: req.user._id };

    // Search query on transcript text
    if (search) {
      query.transcript = { $regex: search, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Execute paginated queries
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reports = await Report.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalReports = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: {
        total: totalReports,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalReports / limitNum),
      },
    });
  } catch (error) {
    console.error('Get reports history error:', error.message);
    res.status(500).json({ message: 'Server error retrieving reports history' });
  }
};

/**
 * @desc    Get details of a single report
 * @route   GET /api/reports/:id
 * @access  Private
 */
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Access control check (Must own the report)
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this report' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report details error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error retrieving report details' });
  }
};

/**
 * @desc    Delete a report
 * @route   DELETE /api/reports/:id
 * @access  Private
 */
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Access control check (Must own the report)
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this report' });
    }

    await report.deleteOne();

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error deleting report' });
  }
};

/**
 * @desc    Download PDF assessment report
 * @route   GET /api/download/pdf
 * @access  Private
 */
const downloadPdf = async (req, res) => {
  try {
    const reportId = req.query.id || req.query.reportId;

    if (!reportId) {
      return res.status(400).json({ message: 'Report ID is required in query parameters' });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Access control check
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this report' });
    }

    const user = await User.findById(req.user._id);

    // Generate PDF buffer
    console.log(`Generating PDF report for ${reportId}...`);
    const pdfBuffer = await generateReportPDF(report, user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="AuraReport-${reportId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download PDF error:', error.message);
    res.status(500).json({ message: 'Server error generating PDF report' });
  }
};

module.exports = {
  getReports,
  getReportById,
  deleteReport,
  downloadPdf,
};
