import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

import { env } from './config/env.js';
import { logger } from './config/logger.js';

/** Simple request ID (can swap for @fastify/request-id or uuid later) */
function requestId(req: Request, _res: Response, next: NextFunction) {
  (req as any).id = (Date.now().toString(36) + Math.random().toString(36).slice(2)).toUpperCase();
  next();
}

/** Locale negotiation (EN/JA) */
function localeMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers['accept-language'] || '';
  const raw = Array.isArray(header) ? header.join(',') : header;
  const pick = raw.toLowerCase().startsWith('en') ? 'en' : 'ja';
  (req as any).locale = pick || env.DEFAULT_LOCALE;
  next();
}

/** Basic error type */
class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Global error handler */
function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) logger.error({ err }, '[HTTP] 5xx error');
  else logger.warn({ err }, '[HTTP] error');
  res.status(status).json({ ok: false, error: message });
}

/** Health handlers */
function healthRoutes(app: Application) {
  app.get('/health', (_req, res) => res.status(200).json({ ok: true }));
  app.get('/ready', (_req, res) => res.status(200).json({ ok: true }));
}

/** Swagger loader */
function swagger(app: Application) {
  try {
    const specPath = path.resolve(process.cwd(), 'swagger', 'openapi.yaml');
    const file = fs.readFileSync(specPath, 'utf8');
    const spec = YAML.parse(file);
    app.use(env.SWAGGER_PATH, swaggerUi.serve, swaggerUi.setup(spec));
    logger.info(`[Swagger] UI mounted at ${env.SWAGGER_PATH}`);
  } catch (e) {
    logger.warn({ e }, '[Swagger] Failed to load OpenAPI spec — skipping UI');
  }
}

/** Mount feature routes (we’ll plug real modules as we implement them) */
function mountRoutes(app: Application) {
  // Example placeholder route
  app.get('/api/v1/ping', (_req, res) => res.json({ pong: true }));
  // TODO: app.use('/api/v1/auth', authRoutes);
  // TODO: app.use('/api/v1/businesses', businessRoutes);
  // TODO: app.use('/api/v1/services', serviceRoutes);
  // TODO: app.use('/api/v1/staff', staffRoutes);
  // TODO: app.use('/api/v1/bookings', bookingRoutes);
  // TODO: app.use('/api/v1/payments', paymentRoutes);
}

/** Build and configure the Express app */
export function createApp(): Application {
  const app = express();

  // Security / Core
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestId);
  app.use(localeMiddleware);

  // Health & Docs
  healthRoutes(app);
  swagger(app);

  // API Routes
  mountRoutes(app);

  // 404
  app.use((_req, _res, next) => next(new ApiError(404, 'Not Found')));

  // Errors
  app.use(errorHandler);

  return app;
}
