/**
 * Storage Service
 * Handles file uploads and downloads via S3
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, S3_BUCKET } from '../config/storage';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/httpErrors';

/**
 * Upload file to S3
 */
export async function uploadFile(
  file: Express.Multer.File,
  key: string,
  contentType?: string
): Promise<{ url: string; key: string }> {
  try {
    const client = (await s3.getClient()) as S3Client;

    // Validate file size
    const maxSizeBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestError(
        `File size exceeds maximum allowed size of ${env.MAX_UPLOAD_SIZE_MB}MB`
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    const fileType = contentType || file.mimetype;
    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestError(`File type ${fileType} is not allowed`);
    }

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: fileType,
      ACL: 'public-read', // Make files publicly accessible
    });

    await client.send(command);

    // Generate public URL
    const url = `https://${S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    logger.info({ key, fileType, size: file.size }, 'File uploaded to S3');

    return { url, key };
  } catch (error) {
    logger.error({ error, key }, 'Failed to upload file to S3');
    throw error;
  }
}

/**
 * Get signed URL for file download
 */
export async function getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const client = (await s3.getClient()) as S3Client;

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn });

    return url;
  } catch (error) {
    logger.error({ error, key }, 'Failed to generate signed URL');
    throw new BadRequestError('Failed to generate file URL');
  }
}

/**
 * Delete file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    const client = (await s3.getClient()) as S3Client;

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await client.send(command);

    logger.info({ key }, 'File deleted from S3');
  } catch (error) {
    logger.error({ error, key }, 'Failed to delete file from S3');
    // Don't throw error - file might not exist
  }
}

/**
 * Generate S3 key for business media
 */
export function generateMediaKey(businessId: string, filename: string, type: 'image' | 'video'): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `businesses/${businessId}/media/${type}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Extract S3 key from URL
 */
export function extractKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove leading slash from pathname
    return urlObj.pathname.substring(1);
  } catch {
    // If URL parsing fails, assume it's already a key
    return url;
  }
}

