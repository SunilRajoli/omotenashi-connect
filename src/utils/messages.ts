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

  // Business messages
  'business.created': {
    ja: 'ビジネスを作成しました。',
    en: 'Business created successfully.',
  },
  'business.updated': {
    ja: 'ビジネスを更新しました。',
    en: 'Business updated successfully.',
  },
  'business.deleted': {
    ja: 'ビジネスを削除しました。',
    en: 'Business deleted successfully.',
  },
  'business.get': {
    ja: 'ビジネス情報を取得しました。',
    en: 'Business information retrieved successfully.',
  },
  'business.list': {
    ja: 'ビジネス一覧を取得しました。',
    en: 'Business list retrieved successfully.',
  },
  'business.not_found': {
    ja: 'ビジネスが見つかりません。',
    en: 'Business not found.',
  },
  'business.slug_exists': {
    ja: 'このスラッグは既に使用されています。',
    en: 'Business with this slug already exists.',
  },
  'business.forbidden': {
    ja: 'このビジネスにアクセスする権限がありません。',
    en: 'You do not have permission to access this business.',
  },

  // Service messages
  'service.created': {
    ja: 'サービスを作成しました。',
    en: 'Service created successfully.',
  },
  'service.updated': {
    ja: 'サービスを更新しました。',
    en: 'Service updated successfully.',
  },
  'service.deleted': {
    ja: 'サービスを削除しました。',
    en: 'Service deleted successfully.',
  },
  'service.get': {
    ja: 'サービス情報を取得しました。',
    en: 'Service information retrieved successfully.',
  },
  'service.list': {
    ja: 'サービス一覧を取得しました。',
    en: 'Service list retrieved successfully.',
  },
  'service.not_found': {
    ja: 'サービスが見つかりません。',
    en: 'Service not found.',
  },
  'service.forbidden': {
    ja: 'このサービスにアクセスする権限がありません。',
    en: 'You do not have permission to access this service.',
  },

  // Resource messages
  'resource.created': {
    ja: 'リソースを作成しました。',
    en: 'Resource created successfully.',
  },
  'resource.updated': {
    ja: 'リソースを更新しました。',
    en: 'Resource updated successfully.',
  },
  'resource.deleted': {
    ja: 'リソースを削除しました。',
    en: 'Resource deleted successfully.',
  },
  'resource.get': {
    ja: 'リソース情報を取得しました。',
    en: 'Resource information retrieved successfully.',
  },
  'resource.list': {
    ja: 'リソース一覧を取得しました。',
    en: 'Resource list retrieved successfully.',
  },
  'resource.not_found': {
    ja: 'リソースが見つかりません。',
    en: 'Resource not found.',
  },
  'resource.forbidden': {
    ja: 'このリソースにアクセスする権限がありません。',
    en: 'You do not have permission to access this resource.',
  },

  // Business hours messages
  'business_hours.updated': {
    ja: '営業時間を更新しました。',
    en: 'Business hours updated successfully.',
  },
  'business_hours.get': {
    ja: '営業時間を取得しました。',
    en: 'Business hours retrieved successfully.',
  },

  // Business settings messages
  'business_settings.updated': {
    ja: 'ビジネス設定を更新しました。',
    en: 'Business settings updated successfully.',
  },
  'business_settings.get': {
    ja: 'ビジネス設定を取得しました。',
    en: 'Business settings retrieved successfully.',
  },

  // Booking messages
  'booking.created': {
    ja: '予約を作成しました。',
    en: 'Booking created successfully.',
  },
  'booking.updated': {
    ja: '予約を更新しました。',
    en: 'Booking updated successfully.',
  },
  'booking.cancelled': {
    ja: '予約をキャンセルしました。',
    en: 'Booking cancelled successfully.',
  },
  'booking.get': {
    ja: '予約情報を取得しました。',
    en: 'Booking information retrieved successfully.',
  },
  'booking.list': {
    ja: '予約一覧を取得しました。',
    en: 'Booking list retrieved successfully.',
  },
  'booking.not_found': {
    ja: '予約が見つかりません。',
    en: 'Booking not found.',
  },
  'booking.forbidden': {
    ja: 'この予約にアクセスする権限がありません。',
    en: 'You do not have permission to access this booking.',
  },
  'booking.unavailable': {
    ja: 'この時間帯は予約できません。',
    en: 'This time slot is not available.',
  },

  // Waitlist messages
  'waitlist.created': {
    ja: 'ウェイトリストに追加しました。',
    en: 'Added to waitlist successfully.',
  },
  'waitlist.updated': {
    ja: 'ウェイトリストエントリを更新しました。',
    en: 'Waitlist entry updated successfully.',
  },
  'waitlist.cancelled': {
    ja: 'ウェイトリストエントリをキャンセルしました。',
    en: 'Waitlist entry cancelled successfully.',
  },
  'waitlist.get': {
    ja: 'ウェイトリスト情報を取得しました。',
    en: 'Waitlist information retrieved successfully.',
  },
  'waitlist.list': {
    ja: 'ウェイトリスト一覧を取得しました。',
    en: 'Waitlist entries retrieved successfully.',
  },
  'waitlist.not_found': {
    ja: 'ウェイトリストエントリが見つかりません。',
    en: 'Waitlist entry not found.',
  },
  'waitlist.notified': {
    ja: 'ウェイトリストエントリに通知を送信しました。',
    en: 'Notification sent to waitlist entry successfully.',
  },
  'waitlist.converted': {
    ja: 'ウェイトリストエントリを予約に変換しました。',
    en: 'Waitlist entry converted to booking successfully.',
  },

  // Invoice messages
  'invoice.created': {
    ja: '請求書を作成しました。',
    en: 'Invoice created successfully.',
  },
  'invoice.updated': {
    ja: '請求書を更新しました。',
    en: 'Invoice updated successfully.',
  },
  'invoice.get': {
    ja: '請求書情報を取得しました。',
    en: 'Invoice information retrieved successfully.',
  },
  'invoice.list': {
    ja: '請求書一覧を取得しました。',
    en: 'Invoices retrieved successfully.',
  },
  'invoice.not_found': {
    ja: '請求書が見つかりません。',
    en: 'Invoice not found.',
  },
  'invoice.pdf_regenerated': {
    ja: '請求書のPDFを再生成しました。',
    en: 'Invoice PDF regenerated successfully.',
  },

  // Availability messages
  'availability.get': {
    ja: '空き状況を取得しました。',
    en: 'Availability retrieved successfully.',
  },

  // Payment messages
  'payment.created': {
    ja: '支払いインテントを作成しました。',
    en: 'Payment intent created successfully.',
  },
  'payment.confirmed': {
    ja: '支払いを確認しました。',
    en: 'Payment confirmed successfully.',
  },
  'payment.refunded': {
    ja: '支払いを返金しました。',
    en: 'Payment refunded successfully.',
  },
  'payment.get': {
    ja: '支払い情報を取得しました。',
    en: 'Payment information retrieved successfully.',
  },
  'payment.list': {
    ja: '支払い一覧を取得しました。',
    en: 'Payment list retrieved successfully.',
  },
  'payment.not_found': {
    ja: '支払いが見つかりません。',
    en: 'Payment not found.',
  },
  'payment.forbidden': {
    ja: 'この支払いにアクセスする権限がありません。',
    en: 'You do not have permission to access this payment.',
  },
  'payment.failed': {
    ja: '支払いに失敗しました。',
    en: 'Payment failed.',
  },

  // Admin messages
  'admin.approved': {
    ja: 'ビジネスを承認しました。',
    en: 'Business approved successfully.',
  },
  'admin.rejected': {
    ja: 'ビジネスを却下しました。',
    en: 'Business rejected successfully.',
  },
  'admin.suspended': {
    ja: 'ビジネスを停止しました。',
    en: 'Business suspended successfully.',
  },
  'admin.get': {
    ja: 'ビジネス情報を取得しました。',
    en: 'Business information retrieved successfully.',
  },
  'admin.list': {
    ja: 'ビジネス一覧を取得しました。',
    en: 'Business list retrieved successfully.',
  },
  'admin.forbidden': {
    ja: '管理者権限が必要です。',
    en: 'Admin access required.',
  },

  // Review messages
  'review.created': {
    ja: 'レビューを作成しました。',
    en: 'Review created successfully.',
  },
  'review.updated': {
    ja: 'レビューを更新しました。',
    en: 'Review updated successfully.',
  },
  'review.deleted': {
    ja: 'レビューを削除しました。',
    en: 'Review deleted successfully.',
  },
  'review.moderated': {
    ja: 'レビューをモデレートしました。',
    en: 'Review moderated successfully.',
  },
  'review.responded': {
    ja: 'レビューに返信しました。',
    en: 'Review response added successfully.',
  },
  'review.get': {
    ja: 'レビュー情報を取得しました。',
    en: 'Review information retrieved successfully.',
  },
  'review.list': {
    ja: 'レビュー一覧を取得しました。',
    en: 'Review list retrieved successfully.',
  },
  'review.not_found': {
    ja: 'レビューが見つかりません。',
    en: 'Review not found.',
  },
  'review.forbidden': {
    ja: 'このレビューにアクセスする権限がありません。',
    en: 'You do not have permission to access this review.',
  },
  'review.already_exists': {
    ja: 'この予約のレビューは既に存在します。',
    en: 'Review already exists for this booking.',
  },

  // Media messages
  'media.created': {
    ja: 'メディアをアップロードしました。',
    en: 'Media uploaded successfully.',
  },
  'media.updated': {
    ja: 'メディアを更新しました。',
    en: 'Media updated successfully.',
  },
  'media.deleted': {
    ja: 'メディアを削除しました。',
    en: 'Media deleted successfully.',
  },
  'media.reordered': {
    ja: 'メディアの順序を更新しました。',
    en: 'Media reordered successfully.',
  },
  'media.get': {
    ja: 'メディア情報を取得しました。',
    en: 'Media information retrieved successfully.',
  },
  'media.list': {
    ja: 'メディア一覧を取得しました。',
    en: 'Media list retrieved successfully.',
  },
  'media.not_found': {
    ja: 'メディアが見つかりません。',
    en: 'Media not found.',
  },
  'media.forbidden': {
    ja: 'このメディアにアクセスする権限がありません。',
    en: 'You do not have permission to access this media.',
  },
  'media.file_required': {
    ja: 'ファイルが必要です。',
    en: 'File is required.',
  },
  'media.invalid_reorder': {
    ja: '無効な並び替えリクエストです。',
    en: 'Invalid reorder request.',
  },

  // Analytics messages
  'analytics.get': {
    ja: '分析データを取得しました。',
    en: 'Analytics data retrieved successfully.',
  },
  'analytics.list': {
    ja: '分析データ一覧を取得しました。',
    en: 'Analytics list retrieved successfully.',
  },
  'analytics.not_found': {
    ja: '分析データが見つかりません。',
    en: 'Analytics data not found.',
  },
  'analytics.forbidden': {
    ja: 'この分析データにアクセスする権限がありません。',
    en: 'You do not have permission to access this analytics data.',
  },

  // Notification messages
  'notification.created': {
    ja: '通知を作成しました。',
    en: 'Notification created successfully.',
  },
  'notification.updated': {
    ja: '通知を更新しました。',
    en: 'Notification updated successfully.',
  },
  'notification.retried': {
    ja: '通知を再送信しました。',
    en: 'Notification retried successfully.',
  },
  'notification.get': {
    ja: '通知情報を取得しました。',
    en: 'Notification information retrieved successfully.',
  },
  'notification.list': {
    ja: '通知一覧を取得しました。',
    en: 'Notification list retrieved successfully.',
  },
  'notification.not_found': {
    ja: '通知が見つかりません。',
    en: 'Notification not found.',
  },
  'notification.forbidden': {
    ja: 'この通知にアクセスする権限がありません。',
    en: 'You do not have permission to access this notification.',
  },

  // Staff messages
  'staff.created': {
    ja: 'スタッフを追加しました。',
    en: 'Staff assignment created successfully.',
  },
  'staff.updated': {
    ja: 'スタッフ情報を更新しました。',
    en: 'Staff assignment updated successfully.',
  },
  'staff.terminated': {
    ja: 'スタッフを解雇しました。',
    en: 'Staff assignment terminated successfully.',
  },
  'staff.assigned': {
    ja: 'スタッフを予約に割り当てました。',
    en: 'Staff assigned to booking successfully.',
  },
  'staff.get': {
    ja: 'スタッフ情報を取得しました。',
    en: 'Staff information retrieved successfully.',
  },
  'staff.list': {
    ja: 'スタッフ一覧を取得しました。',
    en: 'Staff list retrieved successfully.',
  },
  'staff.not_found': {
    ja: 'スタッフが見つかりません。',
    en: 'Staff not found.',
  },
  'staff.forbidden': {
    ja: 'このスタッフにアクセスする権限がありません。',
    en: 'You do not have permission to access this staff.',
  },
  'staff.already_exists': {
    ja: 'このユーザーは既にスタッフとして登録されています。',
    en: 'User is already assigned as staff.',
  },

  // Customer messages
  'customer.created': {
    ja: '顧客を作成しました。',
    en: 'Customer created successfully.',
  },
  'customer.updated': {
    ja: '顧客情報を更新しました。',
    en: 'Customer updated successfully.',
  },
  'customer.deleted': {
    ja: '顧客を削除しました。',
    en: 'Customer deleted successfully.',
  },
  'customer.get': {
    ja: '顧客情報を取得しました。',
    en: 'Customer information retrieved successfully.',
  },
  'customer.list': {
    ja: '顧客一覧を取得しました。',
    en: 'Customer list retrieved successfully.',
  },
  'customer.not_found': {
    ja: '顧客が見つかりません。',
    en: 'Customer not found.',
  },
  'customer.forbidden': {
    ja: 'この顧客にアクセスする権限がありません。',
    en: 'You do not have permission to access this customer.',
  },
  'customer.already_exists': {
    ja: 'この顧客は既に登録されています。',
    en: 'Customer already exists for this business.',
  },

  // Audit messages
  'audit.get': {
    ja: '監査ログを取得しました。',
    en: 'Audit log retrieved successfully.',
  },
  'audit.list': {
    ja: '監査ログ一覧を取得しました。',
    en: 'Audit log list retrieved successfully.',
  },
  'audit.not_found': {
    ja: '監査ログが見つかりません。',
    en: 'Audit log not found.',
  },
  'audit.forbidden': {
    ja: 'この監査ログにアクセスする権限がありません。',
    en: 'You do not have permission to access this audit log.',
  },

  // Policy messages
  'policy.created': {
    ja: 'キャンセルポリシーを作成しました。',
    en: 'Cancellation policy created successfully.',
  },
  'policy.updated': {
    ja: 'キャンセルポリシーを更新しました。',
    en: 'Cancellation policy updated successfully.',
  },
  'policy.deleted': {
    ja: 'キャンセルポリシーを削除しました。',
    en: 'Cancellation policy deleted successfully.',
  },
  'policy.get': {
    ja: 'キャンセルポリシー情報を取得しました。',
    en: 'Cancellation policy information retrieved successfully.',
  },
  'policy.list': {
    ja: 'キャンセルポリシー一覧を取得しました。',
    en: 'Cancellation policy list retrieved successfully.',
  },
  'policy.not_found': {
    ja: 'キャンセルポリシーが見つかりません。',
    en: 'Cancellation policy not found.',
  },
  'policy.forbidden': {
    ja: 'このキャンセルポリシーにアクセスする権限がありません。',
    en: 'You do not have permission to access this cancellation policy.',
  },
  'policy.in_use': {
    ja: 'このポリシーはサービスで使用されているため削除できません。',
    en: 'Cannot delete policy that is in use by services.',
  },

  // Feature flag messages
  'featureFlag.created': {
    ja: '機能フラグを作成しました。',
    en: 'Feature flag created successfully.',
  },
  'featureFlag.updated': {
    ja: '機能フラグを更新しました。',
    en: 'Feature flag updated successfully.',
  },
  'featureFlag.deleted': {
    ja: '機能フラグを削除しました。',
    en: 'Feature flag deleted successfully.',
  },
  'featureFlag.get': {
    ja: '機能フラグ情報を取得しました。',
    en: 'Feature flag information retrieved successfully.',
  },
  'featureFlag.list': {
    ja: '機能フラグ一覧を取得しました。',
    en: 'Feature flag list retrieved successfully.',
  },
  'featureFlag.not_found': {
    ja: '機能フラグが見つかりません。',
    en: 'Feature flag not found.',
  },
  'featureFlag.forbidden': {
    ja: 'この機能フラグにアクセスする権限がありません。',
    en: 'You do not have permission to access this feature flag.',
  },
  'featureFlag.already_exists': {
    ja: 'この名前の機能フラグは既に存在します。',
    en: 'Feature flag with this name already exists.',
  },

  // QR Code messages
  'qr_code_generated': {
    ja: 'QRコードを生成しました。',
    en: 'QR code generated successfully.',
  },
  'qr_code_retrieved': {
    ja: 'QRコード情報を取得しました。',
    en: 'QR code information retrieved successfully.',
  },
  'check_in_success': {
    ja: 'チェックインが完了しました。',
    en: 'Check-in completed successfully.',
  },
  'qr_code.not_found': {
    ja: 'QRコードが見つかりません。',
    en: 'QR code not found.',
  },
  'qr_code.expired': {
    ja: 'QRコードの有効期限が切れています。',
    en: 'QR code has expired.',
  },
  'qr_code.already_used': {
    ja: 'このQRコードは既に使用されています。',
    en: 'This QR code has already been used.',
  },

  // LINE messages
  'line_account_linked': {
    ja: 'LINEアカウントをリンクしました。',
    en: 'LINE account linked successfully.',
  },
  'line_account_unlinked': {
    ja: 'LINEアカウントのリンクを解除しました。',
    en: 'LINE account unlinked successfully.',
  },
  'line_account_status': {
    ja: 'LINEアカウントの状態を取得しました。',
    en: 'LINE account status retrieved successfully.',
  },
  'line_account.not_found': {
    ja: 'LINEアカウントが見つかりません。',
    en: 'LINE account not found.',
  },
  'line_account.already_linked': {
    ja: 'LINEアカウントは既にリンクされています。',
    en: 'LINE account is already linked.',
  },

  // Deposit messages
  'deposit_info_retrieved': {
    ja: 'デポジット情報を取得しました。',
    en: 'Deposit information retrieved successfully.',
  },
  'deposit_status_retrieved': {
    ja: 'デポジット支払い状態を取得しました。',
    en: 'Deposit payment status retrieved successfully.',
  },
  'deposit.paid': {
    ja: 'デポジットが支払われました。',
    en: 'Deposit paid successfully.',
  },
  'deposit.not_found': {
    ja: 'デポジット情報が見つかりません。',
    en: 'Deposit information not found.',
  },
  'deposit.required': {
    ja: 'デポジットが必要です。',
    en: 'Deposit is required.',
  },
  'deposit.due': {
    ja: 'デポジットの支払い期限が過ぎています。',
    en: 'Deposit payment is due.',
  },

  // Pricing messages
  'pricing_rule_created': {
    ja: '価格ルールを作成しました。',
    en: 'Pricing rule created successfully.',
  },
  'pricing_rule_updated': {
    ja: '価格ルールを更新しました。',
    en: 'Pricing rule updated successfully.',
  },
  'pricing_rule_deleted': {
    ja: '価格ルールを削除しました。',
    en: 'Pricing rule deleted successfully.',
  },
  'pricing_rules_retrieved': {
    ja: '価格ルール一覧を取得しました。',
    en: 'Pricing rules retrieved successfully.',
  },
  'price_preview_retrieved': {
    ja: '価格プレビューを取得しました。',
    en: 'Price preview retrieved successfully.',
  },
  'pricing_rule.not_found': {
    ja: '価格ルールが見つかりません。',
    en: 'Pricing rule not found.',
  },
  'pricing_rule.forbidden': {
    ja: 'この価格ルールにアクセスする権限がありません。',
    en: 'You do not have permission to access this pricing rule.',
  },

  // Group Booking messages
  'group_booking_created': {
    ja: 'グループ予約を作成しました。',
    en: 'Group booking created successfully.',
  },
  'group_booking_updated': {
    ja: 'グループ予約を更新しました。',
    en: 'Group booking updated successfully.',
  },
  'group_booking_retrieved': {
    ja: 'グループ予約情報を取得しました。',
    en: 'Group booking information retrieved successfully.',
  },
  'group_bookings_retrieved': {
    ja: 'グループ予約一覧を取得しました。',
    en: 'Group bookings retrieved successfully.',
  },
  'group_booking_status_updated': {
    ja: 'グループ予約のステータスを更新しました。',
    en: 'Group booking status updated successfully.',
  },
  'participant_added': {
    ja: '参加者を追加しました。',
    en: 'Participant added successfully.',
  },
  'participant_removed': {
    ja: '参加者を削除しました。',
    en: 'Participant removed successfully.',
  },
  'participant_checked_in': {
    ja: '参加者をチェックインしました。',
    en: 'Participant checked in successfully.',
  },
  'participant_payment_recorded': {
    ja: '参加者の支払いを記録しました。',
    en: 'Participant payment recorded successfully.',
  },
  'group_booking.not_found': {
    ja: 'グループ予約が見つかりません。',
    en: 'Group booking not found.',
  },
  'group_booking.full': {
    ja: 'グループ予約が満員です。',
    en: 'Group booking is full.',
  },
  'group_booking.forbidden': {
    ja: 'このグループ予約にアクセスする権限がありません。',
    en: 'You do not have permission to access this group booking.',
  },

  // Membership messages
  'membership_created': {
    ja: 'メンバーシップを作成しました。',
    en: 'Membership created successfully.',
  },
  'membership_updated': {
    ja: 'メンバーシップを更新しました。',
    en: 'Membership updated successfully.',
  },
  'membership_cancelled': {
    ja: 'メンバーシップをキャンセルしました。',
    en: 'Membership cancelled successfully.',
  },
  'membership_retrieved': {
    ja: 'メンバーシップ情報を取得しました。',
    en: 'Membership information retrieved successfully.',
  },
  'memberships_retrieved': {
    ja: 'メンバーシップ一覧を取得しました。',
    en: 'Memberships retrieved successfully.',
  },
  'punch_card_visit_used': {
    ja: 'パンチカードの利用回数を使用しました。',
    en: 'Punch card visit used successfully.',
  },
  'recurring_billing_processed': {
    ja: '定期課金を処理しました。',
    en: 'Recurring billing processed successfully.',
  },
  'active_membership_retrieved': {
    ja: 'アクティブなメンバーシップを取得しました。',
    en: 'Active membership retrieved successfully.',
  },
  'membership_status_checked': {
    ja: 'メンバーシップのステータスを確認しました。',
    en: 'Membership status checked successfully.',
  },
  'membership_discount_applied': {
    ja: 'メンバーシップ割引を適用しました。',
    en: 'Membership discount applied successfully.',
  },
  'membership.not_found': {
    ja: 'メンバーシップが見つかりません。',
    en: 'Membership not found.',
  },
  'membership.forbidden': {
    ja: 'このメンバーシップにアクセスする権限がありません。',
    en: 'You do not have permission to access this membership.',
  },
  'business_id_and_customer_id_required': {
    ja: 'ビジネスIDと顧客IDが必要です。',
    en: 'Business ID and Customer ID are required.',
  },
  'business_id_customer_id_and_price_required': {
    ja: 'ビジネスID、顧客ID、価格が必要です。',
    en: 'Business ID, Customer ID, and price are required.',
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
  // Try auth first, then business, then service
  const authMessage = getMessage(`auth.${action}.success`, locale);
  if (authMessage !== `auth.${action}.success`) {
    return authMessage;
  }
  
  const businessMessage = getMessage(`business.${action}`, locale);
  if (businessMessage !== `business.${action}`) {
    return businessMessage;
  }
  
  const serviceMessage = getMessage(`service.${action}`, locale);
  if (serviceMessage !== `service.${action}`) {
    return serviceMessage;
  }
  
  const resourceMessage = getMessage(`resource.${action}`, locale);
  if (resourceMessage !== `resource.${action}`) {
    return resourceMessage;
  }
  
  const businessHoursMessage = getMessage(`business_hours.${action}`, locale);
  if (businessHoursMessage !== `business_hours.${action}`) {
    return businessHoursMessage;
  }
  
  const businessSettingsMessage = getMessage(`business_settings.${action}`, locale);
  if (businessSettingsMessage !== `business_settings.${action}`) {
    return businessSettingsMessage;
  }
  
  const bookingMessage = getMessage(`booking.${action}`, locale);
  if (bookingMessage !== `booking.${action}`) {
    return bookingMessage;
  }
  
  const waitlistMessage = getMessage(`waitlist.${action}`, locale);
  if (waitlistMessage !== `waitlist.${action}`) {
    return waitlistMessage;
  }
  
        const availabilityMessage = getMessage(`availability.${action}`, locale);
        if (availabilityMessage !== `availability.${action}`) {
          return availabilityMessage;
        }

        const paymentMessage = getMessage(`payment.${action}`, locale);
        if (paymentMessage !== `payment.${action}`) {
          return paymentMessage;
        }

        const adminMessage = getMessage(`admin.${action}`, locale);
        if (adminMessage !== `admin.${action}`) {
          return adminMessage;
        }

        const reviewMessage = getMessage(`review.${action}`, locale);
        if (reviewMessage !== `review.${action}`) {
          return reviewMessage;
        }

        const mediaMessage = getMessage(`media.${action}`, locale);
        if (mediaMessage !== `media.${action}`) {
          return mediaMessage;
        }

        const analyticsMessage = getMessage(`analytics.${action}`, locale);
        if (analyticsMessage !== `analytics.${action}`) {
          return analyticsMessage;
        }

        const notificationMessage = getMessage(`notification.${action}`, locale);
        if (notificationMessage !== `notification.${action}`) {
          return notificationMessage;
        }

        const staffMessage = getMessage(`staff.${action}`, locale);
        if (staffMessage !== `staff.${action}`) {
          return staffMessage;
        }

        const customerMessage = getMessage(`customer.${action}`, locale);
        if (customerMessage !== `customer.${action}`) {
          return customerMessage;
        }

        const auditMessage = getMessage(`audit.${action}`, locale);
        if (auditMessage !== `audit.${action}`) {
          return auditMessage;
        }

        const policyMessage = getMessage(`policy.${action}`, locale);
        if (policyMessage !== `policy.${action}`) {
          return policyMessage;
        }

        const featureFlagMessage = getMessage(`featureFlag.${action}`, locale);
        if (featureFlagMessage !== `featureFlag.${action}`) {
          return featureFlagMessage;
        }

        // Fallback to generic success
        return locale === 'ja' ? '操作が完了しました。' : 'Operation completed successfully.';
      }

/**
 * Get error message
 */
export function getErrorMessage(action: string, locale: Locale = 'ja'): string {
  return getMessage(`auth.${action}.error`, locale);
}

