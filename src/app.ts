import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
// import { requestLogger } from './middleware/requestLogger'; // future
import { mountSwagger } from '../config/swagger';
import { env } from './config/env';

const app = express();

// Security & basics
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
app.use(urlencoded({ extended: true }));
app.use(json({ limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));
// app.use(requestLogger);

// Healthcheck
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', env: env.NODE_ENV, time: new Date().toISOString() });
});

// API base (routers later)
// import apiRouter from './routes';
// app.use('/api/v1', apiRouter);

// Swagger
mountSwagger(app);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ status: 'error', message: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const code = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', code, message, err.stack);
  }
  res.status(code).json({ status: 'error', message });
});

export default app;
