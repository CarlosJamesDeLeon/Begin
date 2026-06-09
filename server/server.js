require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/store');
const { verifyAccessToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────────

// Helmet sets secure HTTP headers (XSS protection, clickjacking, etc.)
app.use(helmet());

// CORS — allow the configured frontend origin (supports multiple origins via comma separation)
// Example CLIENT_ORIGIN: "https://begin-app.vercel.app,http://localhost:5173"
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim().replace(/\/$/, '')); // Automatically remove trailing slashes

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`[CORS Blocked] Request from origin "${origin}" was blocked. Allowed origins are: ${allowedOrigins.join(', ')}`);
    callback(null, false); // Reject CORS request gracefully
  },
  credentials: true,
}));

// Parse incoming JSON bodies
app.use(express.json());

// Global rate limiter: max 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Strict rate limiter for authentication endpoints: max 20 per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
});

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// Public auth routes (login/register) — apply strict rate limiter
app.use('/api/auth', authLimiter, authRoutes);

// Protected app data routes — require valid JWT
app.use('/api/store', verifyAccessToken, storeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Begin server is running!' });
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error.',
  });
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Begin server running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
});
