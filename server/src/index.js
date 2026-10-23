import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectMongoDB, isMongoConnected } from './config/db.js';
import projectRoutes from './routes/projects.js';
import batchRoutes from './routes/batches.js';
import facultyRoutes from './routes/faculty.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// --- CORS Configuration ---
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  'http://localhost:5173',
  'http://localhost:4173',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      (NODE_ENV !== 'production' && normalizedOrigin.includes('localhost')) ||
      (normalizedOrigin.endsWith('.vercel.app') && (!process.env.CLIENT_URL || process.env.CLIENT_URL.includes('vercel.app')))
    ) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
}));

// --- Body Parser ---
app.use(express.json({ limit: '1mb' }));

// --- Request Logging ---
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Campus Project Hub API',
    database: isMongoConnected ? 'MongoDB Cloud (Atlas)' : 'Local Persistent Storage',
    timestamp: new Date().toISOString()
  });
});

// --- Global Error Handler ---
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

async function startServer() {
  try {
    // Connect to MongoDB Atlas (falls back gracefully to local JSON storage)
    await connectMongoDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\x1b[32m✔ Campus Project Hub Server running on port ${PORT} [${NODE_ENV}]\x1b[0m`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
