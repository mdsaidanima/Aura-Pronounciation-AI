const express = require('express');
const { signup, login } = require('../controllers/authController');
const { signupRules, loginRules, validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// @route   POST /api/auth/signup
router.post('/signup', signupRules, validate, signup);

// @route   POST /api/auth/login
router.post('/login', loginRules, validate, login);

module.exports = router;
