import { env } from './env';

// Lazy-load S3 client only when needed (AWS SDK is large)
// Install with: npm install @aws-sdk/client-s3
let s3Client: unknown = null;

async function getS3Client() {
  if (!s3Client) {
    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      s3Client = new S3Client({
        region: env.AWS_REGION,
        credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY
        } : undefined
      });
    } catch {
      throw new Error('AWS SDK not installed. Run: npm install @aws-sdk/client-s3');
    }
  }
  return s3Client;
}

export const s3 = {
  getClient: getS3Client
};

export const S3_BUCKET = env.S3_BUCKET;
