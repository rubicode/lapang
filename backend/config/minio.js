import * as Minio from 'minio';
import { ENV } from './environment.js';
import { MINIO_BUCKETS } from '../constants/index.js';

export const minioClient = new Minio.Client({
  endPoint: ENV.MINIO_ENDPOINT,
  port: ENV.MINIO_PORT,
  useSSL: ENV.MINIO_USE_SSL,
  accessKey: ENV.MINIO_ACCESS_KEY,
  secretKey: ENV.MINIO_SECRET_KEY
});

/**
 * Inisialisasi otomatis bucket MinIO jika belum ada
 */
export async function initMinioBuckets() {
  try {
    const bucketsToCreate = [
      MINIO_BUCKETS.VENUES,
      MINIO_BUCKETS.REVIEWS,
      MINIO_BUCKETS.DOCUMENTS
    ];

    for (const bucket of bucketsToCreate) {
      const exists = await minioClient.bucketExists(bucket).catch(() => false);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'ap-southeast-1');
        console.log(`📦 [MinIO] Bucket '${bucket}' berhasil dibuat.`);

        // Set policy publik untuk bucket foto venue dan review
        if (bucket === MINIO_BUCKETS.VENUES || bucket === MINIO_BUCKETS.REVIEWS) {
          const publicPolicy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucket}/*`]
              }
            ]
          };
          await minioClient.setBucketPolicy(bucket, JSON.stringify(publicPolicy)).catch(() => {});
        }
      }
    }
    console.log('✅ [MinIO] Inisialisasi bucket selesai.');
    return true;
  } catch (error) {
    console.warn(`⚠️ [MinIO] MinIO server offline atau belum berjalan (${error.message}). Media service berjalan dengan fallback direct URL.`);
    return false;
  }
}
