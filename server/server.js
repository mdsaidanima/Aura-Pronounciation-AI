require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Controller for PDF download
const { downloadPdf } = require('./controllers/reportController');
const { protect } = require('./middleware/authMiddleware');

// Initialize database
connectDB();

const app = express();

// SECURITY MIDDLEWARES
// 1. Helmet to secure headers
app.use(helmet());

// 2. CORS configuration
// In development, reflect the request origin to avoid CORS issues with varying dev ports.
if (process.env.NODE_ENV === 'production') {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const vercelOriginPattern = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i;

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin) || vercelOriginPattern.test(origin)) {
          callback(null, true);
        } else {
          console.error('CORS blocked origin:', origin);
          callback(new Error('Blocked by CORS policy'));
        }
      },
      credentials: true,
    })
  );
} else {
  // Development: allow the browser origin dynamically (while keeping credentials)
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
}

// 3. Express body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Rate Limiting (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all api routes
app.use('/api', apiLimiter);

// REGISTER ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportRoutes);
// Health/status endpoint for /api root must be registered before routes
// that apply auth (e.g. uploadRoutes) so it isn't intercepted.
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    message: 'Aura Pronunciation AI Assessment Server API is operational.',
    dpdpVersion: '2023 Compliant',
  });
});

app.use('/api', uploadRoutes); // Register /upload and /analyze

// Top-level direct download route for reports
app.get('/api/download/pdf', protect, downloadPdf);

// Root route for status check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Aura Pronunciation AI Assessment Server API is operational.',
    dpdpVersion: '2023 Compliant',
  });
});

// (api root handler is registered earlier to avoid being blocked by routers)

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Requested API endpoint not found' });
});

// CENTRAL GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
