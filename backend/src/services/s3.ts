import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Region = process.env.S3_REGION ?? 'us-east-1';
const s3Bucket = process.env.S3_BUCKET_NAME ?? 'talentforge-submissions';

// Configure S3 client mapping to MinIO local development endpoint or S3 Production
export const s3 = new S3Client({
  region: s3Region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
  },
  // If S3_ENDPOINT is specified (like local MinIO), use it, otherwise default to AWS S3.
  endpoint: process.env.S3_ENDPOINT ?? 'http://127.0.0.1:9000',
  forcePathStyle: true, // Required for MinIO compatibility
});

/**
 * Generate a presigned URL to PUT (upload) an object into S3
 * @param key The destination path/filename in S3
 * @param contentType The MIME content type of the file
 * @param expiresIn Time in seconds until the URL expires (default 15 mins)
 */
export async function getUploadUrl(key: string, contentType: string, expiresIn = 900): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ContentType: contentType,
  });
  
  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Generate a presigned URL to GET (download) an object from S3
 * @param key The path/filename in S3
 * @param expiresIn Time in seconds until the URL expires (default 1 hour)
 */
export async function getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn });
}
