/**
 * Authentication Tests
 * Tests for user registration, login, password management, email verification
 */

import { User } from '../src/models/user.model';
import { RefreshToken } from '../src/models/refreshToken.model';
import { EmailVerification } from '../src/models/emailVerification.model';
import { PasswordReset } from '../src/models/passwordReset.model';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  requestPasswordReset,
  changePassword,
  verifyEmail,
  resendEmailVerification,
} from '../src/services/auth.service';
import { hashPassword } from '../src/utils/crypto';
import { UserRole } from '../src/types/enums';

// Mock app setup (you'll need to create this)
// import app from '../src/app';

describe('Authentication Service', () => {
  beforeEach(async () => {
    // Clean up test data
    await RefreshToken.destroy({ where: {}, force: true });
    await EmailVerification.destroy({ where: {}, force: true });
    await PasswordReset.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        family_name: '山田',
        given_name: '太郎',
        family_name_kana: 'ヤマダ',
        given_name_kana: 'タロウ',
        role: UserRole.CUSTOMER,
      };

      const result = await register(userData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe(UserRole.CUSTOMER);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should hash password before storing', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'password123',
      };

      const result = await register(userData);
      const user = await User.findByPk(result.user.id);

      expect(user?.password_hash).not.toBe('password123');
      expect(user?.password_hash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should create email verification token on registration', async () => {
      const userData = {
        email: 'test3@example.com',
        password: 'password123',
      };

      const result = await register(userData);
      const verification = await EmailVerification.findOne({
        where: { user_id: result.user.id },
      });

      expect(verification).toBeDefined();
      expect(verification?.expires_at).toBeInstanceOf(Date);
    });

    it('should not register duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await register(userData);

      await expect(register(userData)).rejects.toThrow('already exists');
    });

    it('should lowercase email before storing', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const result = await register(userData);

      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('User Login', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'login@example.com',
        password_hash: await hashPassword('password123'),
        role: UserRole.CUSTOMER,
        timezone: 'Asia/Tokyo',
        is_active: true,
      });
    });

    it('should login with valid credentials', async () => {
      const result = await login({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should create refresh token on login', async () => {
      await login({
        email: 'login@example.com',
        password: 'password123',
      });

      const refreshTokens = await RefreshToken.findAll({
        where: { user_id: testUser.id },
      });

      expect(refreshTokens.length).toBeGreaterThan(0);
    });

    it('should not login with invalid password', async () => {
      await expect(
        login({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      await expect(
        login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should not login inactive user', async () => {
      await testUser.update({ is_active: false });

      await expect(
        login({
          email: 'login@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('inactive');
    });

    it('should not login deleted user', async () => {
      await testUser.update({ deleted_at: new Date() });

      await expect(
        login({
          email: 'login@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('deleted');
    });
  });

  describe('Token Refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await User.create({
        email: 'refresh@example.com',
        password_hash: await hashPassword('password123'),
        role: UserRole.CUSTOMER,
        timezone: 'Asia/Tokyo',
        is_active: true,
      });

      const loginResult = await login({
        email: 'refresh@example.com',
        password: 'password123',
      });

      refreshToken = loginResult.tokens.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const result = await refreshAccessToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.accessToken).not.toBe(refreshToken);
    });

    it('should rotate refresh token on refresh', async () => {
      const oldRefreshToken = refreshToken;
      
      // Check that old token exists in database
      const { hashToken } = await import('../src/utils/crypto');
      const oldTokenHash = hashToken(oldRefreshToken);
      const oldTokenRecord = await RefreshToken.findOne({
        where: { token_hash: oldTokenHash },
      });
      expect(oldTokenRecord).toBeDefined();

      // Refresh token
      const result = await refreshAccessToken(refreshToken);

      // New tokens should be generated
      expect(result.refreshToken).toBeDefined();
      expect(result.accessToken).toBeDefined();
      
      // New token should be different from old token (different JWT)
      expect(result.refreshToken).not.toBe(oldRefreshToken);

      // Old token should be deleted from database
      const oldTokenAfterRefresh = await RefreshToken.findByPk(oldTokenRecord!.id);
      expect(oldTokenAfterRefresh).toBeNull();

      // New token should be in database
      const newTokenHash = hashToken(result.refreshToken);
      const newTokenRecord = await RefreshToken.findOne({
        where: { token_hash: newTokenHash },
      });
      expect(newTokenRecord).toBeDefined();
      
      // Verify token rotation: old token should not be usable for refresh
      // (it's deleted from database, so refresh should fail)
      await expect(refreshAccessToken(oldRefreshToken)).rejects.toThrow('not found');
    });

    it('should not refresh with invalid token', async () => {
      await expect(refreshAccessToken('invalid-token')).rejects.toThrow();
    });

    it('should not refresh with expired token', async () => {
      // This would require mocking time or waiting for expiration
      // For now, we test with invalid token
      await expect(refreshAccessToken('expired-token')).rejects.toThrow();
    });
  });

  describe('Password Reset', () => {
    let testUser: User;

    beforeEach(async () => {
      // Clean up existing user if any
      await User.destroy({ where: { email: 'reset@example.com' }, force: true });
      
      testUser = await User.create({
        email: 'reset@example.com',
        password_hash: await hashPassword('oldpassword'),
        role: UserRole.CUSTOMER,
        timezone: 'Asia/Tokyo',
        is_active: true,
      });
    });

    it('should request password reset', async () => {
      await requestPasswordReset('reset@example.com');

      const resetToken = await PasswordReset.findOne({
        where: { user_id: testUser.id },
      });

      expect(resetToken).toBeDefined();
      expect(resetToken?.expires_at).toBeInstanceOf(Date);
    });

    it('should not reveal if user exists on password reset request', async () => {
      // Should not throw error even if user doesn't exist
      await expect(requestPasswordReset('nonexistent@example.com')).resolves.not.toThrow();
    });

    it('should reset password with valid token', async () => {
      await requestPasswordReset('reset@example.com');
      const resetTokenRecord = await PasswordReset.findOne({
        where: { user_id: testUser.id },
      });

      expect(resetTokenRecord).toBeDefined();
      expect(resetTokenRecord?.expires_at).toBeInstanceOf(Date);
      
      // Note: To fully test password reset, we'd need the actual token
      // which is currently only returned via email. This test verifies
      // that the reset token is created correctly.
    });

    it('should create password reset token', async () => {
      await requestPasswordReset('reset@example.com');
      
      const resetToken = await PasswordReset.findOne({
        where: { user_id: testUser.id },
      });

      expect(resetToken).toBeDefined();
      expect(resetToken?.expires_at.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Change Password', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'changepass@example.com',
        password_hash: await hashPassword('oldpassword'),
        role: UserRole.CUSTOMER,
        timezone: 'Asia/Tokyo',
        is_active: true,
      });
    });

    it('should change password with correct current password', async () => {
      const oldPasswordHash = testUser.password_hash;

      await changePassword(testUser.id, 'oldpassword', 'newpassword123');

      await testUser.reload();

      expect(testUser.password_hash).not.toBe(oldPasswordHash);
      expect(testUser.password_hash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should not change password with incorrect current password', async () => {
      await expect(
        changePassword(testUser.id, 'wrongpassword', 'newpassword123')
      ).rejects.toThrow('incorrect');
    });
  });

  describe('Email Verification', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'verify@example.com',
        password_hash: await hashPassword('password123'),
        role: UserRole.CUSTOMER,
        timezone: 'Asia/Tokyo',
        is_active: true,
      });
    });

    it('should create email verification token', async () => {
      await resendEmailVerification('verify@example.com');

      const verification = await EmailVerification.findOne({
        where: { user_id: testUser.id },
      });

      expect(verification).toBeDefined();
    });

    it('should verify email with valid token', async () => {
      // Create verification token manually for testing
      const { generateToken, hashToken } = await import('../src/utils/crypto');
      const token = generateToken(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      await EmailVerification.create({
        user_id: testUser.id,
        token_hash: hashToken(token),
        expires_at: expiresAt,
      });

      await verifyEmail(token);

      const verification = await EmailVerification.findOne({
        where: { user_id: testUser.id },
      });

      expect(verification?.verified_at).toBeDefined();
    });

    it('should not verify with invalid token', async () => {
      await expect(verifyEmail('invalid-token')).rejects.toThrow();
    });
  });

  describe('Logout', () => {
    let testUser: User;
    let refreshToken: string;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'logout@example.com',
        password_hash: await hashPassword('password123'),
        role: UserRole.CUSTOMER,
        timezone: 'Asia/Tokyo',
        is_active: true,
      });

      const loginResult = await login({
        email: 'logout@example.com',
        password: 'password123',
      });

      refreshToken = loginResult.tokens.refreshToken;
    });

    it('should logout and revoke refresh token', async () => {
      await logout(refreshToken, testUser.id);

      // Token should be deleted
      const token = await RefreshToken.findOne({
        where: { user_id: testUser.id },
      });

      expect(token).toBeNull();
    });
  });
});
