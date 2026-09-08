import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectMongoDB, isMongoConnected } from './config/db.js';
import projectRoutes from './routes/projects.js';
import batchRoutes from './routes/batches.js';
import facultyRoutes from './routes/faculty.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Campus Project Hub API',
    database: isMongoConnected ? 'MongoDB Cloud (Atlas)' : 'Local Persistent Storage',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  // Connect to MongoDB Atlas
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`\x1b[32m✔ Campus Project Hub Server running on http://localhost:${PORT}\x1b[0m`);
  });
}

startServer();
