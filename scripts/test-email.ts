/**
 * Test Email Sending
 * Simple script to test SendGrid email configuration
 */

import dotenv from 'dotenv';
dotenv.config();

// Set NODE_ENV to avoid pino-pretty issues in test script
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import { sendEmail } from '../src/services/email.service';
import { Locale } from '../src/types/enums';
import { env } from '../src/config/env';

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');

  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.TEST_EMAIL || 'test@example.com';
  const testName = 'Test User';

  console.log(`📧 Test email: ${testEmail}`);
  console.log(`📤 From: ${env.FROM_NAME} <${env.FROM_EMAIL}>`);
  console.log(`🔑 SendGrid API Key: ${env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🌐 App URL: ${env.APP_URL}\n`);

  if (!env.SENDGRID_API_KEY) {
    console.log('⚠️  Warning: SENDGRID_API_KEY not configured.');
    console.log('   Emails will be logged instead of sent.\n');
  }

  try {
    // Test 1: Email Verification (direct send)
    console.log('1️⃣ Testing Email Verification Email...');
    const verificationUrl = `${env.APP_URL}/api/v1/auth/verify-email?token=test-token-12345`;
    
    await sendEmail({
      to: testEmail,
      subject: 'メールアドレス確認 - Omotenashi Connect (Test)',
      template: 'verify_email',
      locale: Locale.JA,
      data: {
        user_name: testName,
        verification_url: verificationUrl,
      },
    });
    console.log('   ✅ Email verification sent successfully\n');

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Password Reset (direct send)
    console.log('2️⃣ Testing Password Reset Email...');
    const resetUrl = `${env.APP_URL}/reset-password?token=test-token-12345`;
    
    await sendEmail({
      to: testEmail,
      subject: 'パスワードリセット - Omotenashi Connect (Test)',
      template: 'reset_password',
      locale: Locale.JA,
      data: {
        user_name: testName,
        reset_url: resetUrl,
      },
    });
    console.log('   ✅ Password reset email sent successfully\n');

    console.log('✅ Email tests completed!');
    if (env.SENDGRID_API_KEY) {
      console.log('\n📬 Check your email inbox for the test emails.');
      console.log('📊 Check SendGrid dashboard for delivery status: https://app.sendgrid.com/activity\n');
    } else {
      console.log('\n📝 Note: Emails were logged (SendGrid not configured).');
      console.log('   Check the logs above for email content.\n');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      if (error.message.includes('Forbidden')) {
        console.error('\n💡 Tip: Make sure your SendGrid API key has "Mail Send" permissions.');
        console.error('   Also verify your sender email in SendGrid dashboard.\n');
      }
    }
    process.exit(1);
  }
}

// Run test
testEmail()
  .then(() => {
    console.log('✨ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });

