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
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

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
