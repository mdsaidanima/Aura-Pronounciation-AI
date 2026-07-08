const mongoose = require('mongoose');

const mistakeSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
  },
  issue: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  suggestion: {
    type: String,
    required: true,
  },
});

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    audioDuration: {
      type: Number,
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    fluency: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    clarity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    mistakes: [mistakeSchema],
    tips: [
      {
        type: String,
      },
    ],
    dpdpConsent: {
      type: Boolean,
      required: [true, 'DPDP consent agreement is required for audit records'],
      validate: {
        validator: function (v) {
          return v === true;
        },
        message: 'Consent must be granted to generate a pronunciation report.',
      },
    },
    dpdpConsentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
