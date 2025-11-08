import { sequelize } from './sequelize';

/**
 * Initialize and test the database connection.
 * This is separate from sequelize.ts so you can reuse it in CLI scripts.
 */
export async function connectDB(): Promise<void> {
  await sequelize.authenticate();
  console.log('✅ Database connection established successfully.');
}

/**
 * Sync all models if needed (dev only)
 */
export async function syncDB(force = false): Promise<void> {
  try {
    await sequelize.sync({ force });
    console.log(force ? '⚠️  DB synced (force=true)' : '✅ DB synced');
  } catch (err) {
    console.error('❌ DB sync failed:', err);
  }
}

/**
 * Close DB connection gracefully (used in shutdown handlers or tests)
 */
export async function closeDB(): Promise<void> {
  try {
    await sequelize.close();
    console.log('🛑 Database connection closed.');
  } catch (err) {
    console.error('❌ Error closing DB connection:', err);
  }
}

export { sequelize };
