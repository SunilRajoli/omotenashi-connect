import * as http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDB, closeDB } from './config/db';
import { ensureRedis } from './config/redis';

async function bootstrap() {
  console.log('🚀 Starting Omotenashi Connect API...\n');

  // Database connection check
  console.log('📦 Connecting to database...');
  try {
    await connectDB();
    console.log(); // Empty line for spacing
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  // Redis connection check
  console.log('🔴 Connecting to Redis...');
  try {
    await ensureRedis();
    console.log('✅ Redis connection established successfully\n');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    console.warn('⚠️  Continuing without Redis (some features may be unavailable)\n');
  }

  // Start HTTP server
  const server = http.createServer(app);
  server.listen(env.PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Omotenashi API listening on http://localhost:${env.PORT}`);
    console.log(`📚 API Documentation: http://localhost:${env.PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${env.PORT}/health`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${env.PORT} is already in use`);
      console.error(`   Please use a different port or stop the process using port ${env.PORT}`);
    } else {
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });

  // Graceful shutdown handlers
  const shutdown = (signal: string) => async () => {
    console.log(`\n${signal} received. Shutting down gracefully...\n`);
    
    // Close HTTP server
    console.log('🛑 Closing HTTP server...');
    server.close(() => {
      console.log('✅ HTTP server closed');
    });

    // Close database connection
    console.log('🛑 Closing database connection...');
    try {
      await closeDB();
      console.log('✅ Database connection closed');
    } catch (err) {
      console.error('❌ Error closing database:', err);
    }

    // Close Redis connection
    console.log('🛑 Closing Redis connection...');
    try {
      const { redis } = await import('./config/redis');
      if (redis.isOpen) {
        await redis.quit();
        console.log('✅ Redis connection closed');
      }
    } catch (err) {
      console.error('❌ Error closing Redis:', err);
    }

    console.log('\n👋 Shutdown complete. Goodbye!');
    process.exit(0);
  };

  process.on('SIGINT', shutdown('SIGINT'));
  process.on('SIGTERM', shutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    shutdown('uncaughtException')();
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
