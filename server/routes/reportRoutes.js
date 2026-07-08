const express = require('express');
const { getReports, getReportById, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection to all report endpoints
router.use(protect);

// @route   GET /api/reports
router.get('/', getReports);

// @route   GET /api/reports/:id
// @route   DELETE /api/reports/:id
router.route('/:id')
  .get(getReportById)
  .delete(deleteReport);

module.exports = router;
