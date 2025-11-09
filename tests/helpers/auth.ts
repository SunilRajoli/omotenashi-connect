/**
 * Authentication Test Helpers
 * Helper functions for authentication testing
 */

import { User } from '../../src/models/user.model';
import {
  register,
  login,
} from '../../src/services/auth.service';
import { UserRole } from '../../src/types/enums';

/**
 * Register and login a test user
 */
export async function createAuthenticatedUser(overrides: {
  email?: string;
  password?: string;
  role?: UserRole;
} = {}): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {
  const email = overrides.email || `auth-${Date.now()}@example.com`;
  const password = overrides.password || 'password123';

  const result = await register({
    email,
    password,
    role: overrides.role || UserRole.CUSTOMER,
  });

  return {
    user: result.user,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  };
}

/**
 * Login an existing user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {
  const result = await login({ email, password });

  return {
    user: result.user,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  };
}

/**
 * Get auth headers for API requests
 */
export function getAuthHeaders(accessToken: string): {
  Authorization: string;
} {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

/**
 * Create a test user and get auth headers
 */
export async function getAuthHeadersForUser(overrides: {
  email?: string;
  password?: string;
  role?: UserRole;
} = {}): Promise<{
  user: User;
  headers: { Authorization: string };
}> {
  const { user, accessToken } = await createAuthenticatedUser(overrides);

  return {
    user,
    headers: getAuthHeaders(accessToken),
  };
}
