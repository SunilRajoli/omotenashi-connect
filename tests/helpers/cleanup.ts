/**
 * Test Cleanup Helpers
 * Helper functions to clean up test data
 */

import { sequelize } from '../../src/config/sequelize';
import { User } from '../../src/models/user.model';
import { RefreshToken } from '../../src/models/refreshToken.model';
import { EmailVerification } from '../../src/models/emailVerification.model';
import { PasswordReset } from '../../src/models/passwordReset.model';
import { Business } from '../../src/models/business.model';

/**
 * Clean all test data
 */
export async function cleanupAll(): Promise<void> {
  // Delete in order to respect foreign key constraints
  await RefreshToken.destroy({ where: {}, force: true });
  await EmailVerification.destroy({ where: {}, force: true });
  await PasswordReset.destroy({ where: {}, force: true });
  await Business.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
}

/**
 * Clean authentication-related data
 */
export async function cleanupAuth(): Promise<void> {
  await RefreshToken.destroy({ where: {}, force: true });
  await EmailVerification.destroy({ where: {}, force: true });
  await PasswordReset.destroy({ where: {}, force: true });
}

/**
 * Clean users
 */
export async function cleanupUsers(): Promise<void> {
  await User.destroy({ where: {}, force: true });
}

/**
 * Reset database (drop and recreate all tables)
 */
export async function resetDatabase(): Promise<void> {
  await sequelize.sync({ force: true });
}
