const express = require('express');
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { profileRules, changePasswordRules, validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply auth protection to all profile endpoints
router.use(protect);

// @route   GET /api/profile
// @route   PUT /api/profile
router.route('/')
  .get(getProfile)
  .put(profileRules, validate, updateProfile);

// @route   PUT /api/profile/password
router.put('/password', changePasswordRules, validate, changePassword);

module.exports = router;
