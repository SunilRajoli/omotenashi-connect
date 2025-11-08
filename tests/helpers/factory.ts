/**
 * Test Data Factory
 * Helper functions to create test data
 */

import { User } from '../../src/models/user.model';
import { Business } from '../../src/models/business.model';
import { hashPassword } from '../../src/utils/crypto';
import { UserRole, BusinessStatus, OnboardingStatus } from '../../src/types/enums';

/**
 * Create a test user
 */
export async function createTestUser(overrides: Partial<{
  email: string;
  password: string;
  role: UserRole;
  family_name: string;
  given_name: string;
  is_active: boolean;
}> = {}): Promise<User> {
  const defaults = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    role: UserRole.CUSTOMER,
    family_name: 'テスト',
    given_name: 'ユーザー',
    is_active: true,
  };

  const data = { ...defaults, ...overrides };
  const passwordHash = await hashPassword(data.password);

  return User.create({
    email: data.email,
    password_hash: passwordHash,
    role: data.role,
    family_name: data.family_name,
    given_name: data.given_name,
    timezone: 'Asia/Tokyo',
    is_active: data.is_active,
  });
}

/**
 * Create a test business
 */
export async function createTestBusiness(overrides: Partial<{
  owner_id: string;
  slug: string;
  display_name_ja: string;
  display_name_en: string;
  status: BusinessStatus;
  onboarding_status: OnboardingStatus;
}> = {}): Promise<Business> {
  const owner = overrides.owner_id
    ? await User.findByPk(overrides.owner_id)
    : await createTestUser({ role: UserRole.OWNER });

  if (!owner) {
    throw new Error('Owner not found when creating test business');
  }

  const defaults = {
    owner_id: owner.id,
    slug: `test-business-${Date.now()}`,
    display_name_ja: 'テストビジネス',
    display_name_en: 'Test Business',
    status: BusinessStatus.APPROVED,
    onboarding_status: OnboardingStatus.LIVE,
    timezone: 'Asia/Tokyo',
  };

  const data = { ...defaults, ...overrides };

  return Business.create(data);
}

/**
 * Create test user with business
 */
export async function createTestUserWithBusiness(): Promise<{
  user: User;
  business: Business;
}> {
  const user = await createTestUser({ role: UserRole.OWNER });
  const business = await createTestBusiness({ owner_id: user.id });

  return { user, business };
}
