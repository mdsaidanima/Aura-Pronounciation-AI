const { body, validationResult } = require('express-validator');

// Error handling middleware helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginRules = [
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileRules = [
  body('name').trim().notEmpty().withMessage('Name cannot be empty').escape(),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  profileRules,
  changePasswordRules,
};
