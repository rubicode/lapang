import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { MinioService } from '../services/minioService.js';
import { MINIO_BUCKETS } from '../constants/index.js';

describe('MinioService Unit Tests (Skenario Berhasil & Gagal / Security Hardening)', () => {
  it('[BERHASIL] Upload gambar JPEG/PNG valid dikonversi ke WebP dan disimpan ke MinIO', async () => {
    // Generate valid 100x100 PNG image buffer using sharp
    const sampleImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 27, g: 94, b: 32, alpha: 1 }
      }
    }).png().toBuffer();

    const uploadResult = await MinioService.uploadImage(sampleImageBuffer, MINIO_BUCKETS.VENUES, 'lapangan.png');

    assert.ok(uploadResult.success, 'Upload harus berhasil');
    assert.ok(uploadResult.fileName.endsWith('.webp'), 'File harus dikonversi ke format .webp');
    assert.ok(uploadResult.url, 'Harus menghasilkan URL publik MinIO');
    assert.ok(uploadResult.sizeBytes > 0, 'Ukuran file harus > 0');
  });

  it('[GAGAL] Upload buffer kosong harus melempar error', async () => {
    await assert.rejects(
      async () => {
        await MinioService.uploadImage(Buffer.from([]), MINIO_BUCKETS.VENUES, 'empty.png');
      },
      {
        message: /Buffer file kosong/
      }
    );
  });

  it('[GAGAL] Upload file non-gambar (Magic Bytes check: text/sh/exe) harus ditolak', async () => {
    const maliciousTextPayload = Buffer.from('<?php echo "hack"; ?> console.log("evil");');

    await assert.rejects(
      async () => {
        await MinioService.uploadImage(maliciousTextPayload, MINIO_BUCKETS.VENUES, 'exploit.php');
      },
      {
        message: /Format file tidak diizinkan/
      }
    );
  });

  it('[GAGAL] Upload file melebihi batas 5 MB harus ditolak', async () => {
    // Buffer dummy 6 MB
    const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024);

    await assert.rejects(
      async () => {
        await MinioService.uploadImage(oversizedBuffer, MINIO_BUCKETS.VENUES, 'huge.jpg');
      },
      {
        message: /Ukuran file melebihi batas maksimum 5 MB/
      }
    );
  });
});
