import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import apiRoutes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();

// ------------------------------------------------------------
// Core middleware
// ------------------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------
// Health check
// ------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Healthcare Monitoring Dashboard API is running.' });
});

// ------------------------------------------------------------
// API documentation (Swagger UI) at /api-docs
// ------------------------------------------------------------
try {
  const openApiDocument = YAML.load(path.join(__dirname, '..', 'docs', 'openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
} catch (err) {
  console.warn('[app] Could not load OpenAPI spec for Swagger UI:', (err as Error).message);
}

// ------------------------------------------------------------
// API routes
// ------------------------------------------------------------
app.use('/api', apiRoutes);

// ------------------------------------------------------------
// 404 + centralized error handling (must be registered last)
// ------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
