/**
 * Localized Messages
 * Success and error messages for Japanese and English
 */

type Locale = 'ja' | 'en';

interface Messages {
  [key: string]: {
    ja: string;
    en: string;
  };
}

const messages: Messages = {
  // Auth messages
  'auth.register.success': {
    ja: 'ユーザー登録が完了しました。メールアドレスを確認してください。',
    en: 'User registered successfully. Please verify your email address.',
  },
  'auth.login.success': {
    ja: 'ログインに成功しました。',
    en: 'Login successful.',
  },
  'auth.logout.success': {
    ja: 'ログアウトしました。',
    en: 'Logged out successfully.',
  },
  'auth.refresh.success': {
    ja: 'トークンを更新しました。',
    en: 'Token refreshed successfully.',
  },
  'auth.forgot_password.success': {
    ja: 'パスワードリセットのメールを送信しました。',
    en: 'If an account with that email exists, a password reset link has been sent.',
  },
  'auth.reset_password.success': {
    ja: 'パスワードをリセットしました。',
    en: 'Password reset successfully.',
  },
  'auth.change_password.success': {
    ja: 'パスワードを変更しました。',
    en: 'Password changed successfully.',
  },
  'auth.verify_email.success': {
    ja: 'メールアドレスを確認しました。',
    en: 'Email verified successfully.',
  },
  'auth.resend_verification.success': {
    ja: '確認メールを再送信しました。',
    en: 'Verification email sent.',
  },
  'auth.me.success': {
    ja: 'ユーザー情報を取得しました。',
    en: 'User information retrieved successfully.',
  },

  // Error messages
  'auth.register.error': {
    ja: 'ユーザー登録に失敗しました。',
    en: 'User registration failed.',
  },
  'auth.login.error': {
    ja: 'ログインに失敗しました。',
    en: 'Login failed.',
  },
  'auth.logout.error': {
    ja: 'ログアウトに失敗しました。',
    en: 'Logout failed.',
  },
  'auth.refresh.error': {
    ja: 'トークンの更新に失敗しました。',
    en: 'Token refresh failed.',
  },
  'auth.forgot_password.error': {
    ja: 'パスワードリセットのリクエストに失敗しました。',
    en: 'Password reset request failed.',
  },
  'auth.reset_password.error': {
    ja: 'パスワードのリセットに失敗しました。',
    en: 'Password reset failed.',
  },
  'auth.change_password.error': {
    ja: 'パスワードの変更に失敗しました。',
    en: 'Password change failed.',
  },
  'auth.verify_email.error': {
    ja: 'メールアドレスの確認に失敗しました。',
    en: 'Email verification failed.',
  },
  'auth.resend_verification.error': {
    ja: '確認メールの再送信に失敗しました。',
    en: 'Failed to resend verification email.',
  },
  'auth.me.error': {
    ja: 'ユーザー情報の取得に失敗しました。',
    en: 'Failed to retrieve user information.',
  },

  // Validation errors
  'auth.email.required': {
    ja: 'メールアドレスは必須です。',
    en: 'Email is required.',
  },
  'auth.email.invalid': {
    ja: '有効なメールアドレスを入力してください。',
    en: 'Please enter a valid email address.',
  },
  'auth.password.required': {
    ja: 'パスワードは必須です。',
    en: 'Password is required.',
  },
  'auth.password.weak': {
    ja: 'パスワードは8文字以上で、英字と数字を含む必要があります。',
    en: 'Password must be at least 8 characters and contain letters and numbers.',
  },
  'auth.token.required': {
    ja: 'トークンは必須です。',
    en: 'Token is required.',
  },
  'auth.token.invalid': {
    ja: '無効または期限切れのトークンです。',
    en: 'Invalid or expired token.',
  },
  'auth.refresh_token.required': {
    ja: 'リフレッシュトークンは必須です。',
    en: 'Refresh token is required.',
  },
  'auth.current_password.required': {
    ja: '現在のパスワードは必須です。',
    en: 'Current password is required.',
  },
  'auth.new_password.required': {
    ja: '新しいパスワードは必須です。',
    en: 'New password is required.',
  },

  // Authentication errors
  'auth.unauthorized': {
    ja: '認証が必要です。',
    en: 'Authentication required.',
  },
  'auth.invalid_credentials': {
    ja: 'メールアドレスまたはパスワードが正しくありません。',
    en: 'Invalid email or password.',
  },
  'auth.user_not_found': {
    ja: 'ユーザーが見つかりません。',
    en: 'User not found.',
  },
  'auth.user_inactive': {
    ja: 'ユーザーアカウントが無効です。',
    en: 'User account is inactive.',
  },
  'auth.user_deleted': {
    ja: 'ユーザーアカウントが削除されています。',
    en: 'User account has been deleted.',
  },
  'auth.email_exists': {
    ja: 'このメールアドレスは既に登録されています。',
    en: 'User with this email already exists.',
  },
  'auth.password_incorrect': {
    ja: 'パスワードが正しくありません。',
    en: 'Current password is incorrect.',
  },
  'auth.token_expired': {
    ja: 'トークンの有効期限が切れています。',
    en: 'Token has expired.',
  },
  'auth.token_invalid': {
    ja: '無効なトークンです。',
    en: 'Invalid token.',
  },
  'auth.error.internal': {
    ja: '内部サーバーエラーが発生しました。',
    en: 'Internal server error.',
  },
};

/**
 * Get localized message
 */
export function getMessage(key: string, locale: Locale = 'ja'): string {
  const message = messages[key];
  if (!message) {
    return key; // Return key if message not found
  }
  return message[locale] || message.ja; // Fallback to Japanese
}

/**
 * Get message for both locales
 */
export function getMessages(key: string): { ja: string; en: string } {
  const message = messages[key];
  if (!message) {
    return { ja: key, en: key };
  }
  return message;
}

/**
 * Get success message
 */
export function getSuccessMessage(action: string, locale: Locale = 'ja'): string {
  return getMessage(`auth.${action}.success`, locale);
}

/**
 * Get error message
 */
export function getErrorMessage(action: string, locale: Locale = 'ja'): string {
  return getMessage(`auth.${action}.error`, locale);
}

