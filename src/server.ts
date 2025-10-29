import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { sequelize } from './config/sequelize.js';
import { initI18n } from './config/i18n.js';
// import { initModels } from './models/index.js';
// If/when you add workers: import { Queues } from '../config/bullmq.js';

async function start() {
  try {
    // 1) Initialize i18n (EN/JA)
    await initI18n();

    // 2) Connect to Postgres
    await sequelize.authenticate();
    logger.info('[DB] Connected to PostgreSQL');

    // 3) Init Sequelize models and associations
    // initModels(sequelize);
    logger.info('[DB] Models initialized');

    // (Optional) Ensure extensions exist when using migrations later
    // await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    // await sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');

    // 4) Build Express app
    const app = createApp();
    const server = http.createServer(app);

    // 5) Start HTTP server
    server.listen(env.PORT, () => {
      logger.info(`🚀 Omotenashi API listening on http://localhost:${env.PORT}`);
      logger.info(`Docs at ${env.SWAGGER_PATH}`);
    });

    // 6) Graceful shutdown
    const shutdown = async (signal: string) => {
      try {
        logger.info(`[Shutdown] Received ${signal}`);
        server.close(() => logger.info('[HTTP] Server closed'));
        await sequelize.close();
        logger.info('[DB] Connection closed');
        process.exit(0);
      } catch (e) {
        logger.error({ e }, '[Shutdown] error');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (e) {
    logger.error({ e }, '[Boot] Failed to start server');
    process.exit(1);
  }
}

start();
