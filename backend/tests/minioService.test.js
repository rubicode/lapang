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

    // Pastikan proteksi path traversal: nama file harus UUID baru, bukan 'lapangan.png'
    assert.notEqual(uploadResult.fileName, 'lapangan.png');
    assert.match(uploadResult.fileName, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/);
  });

  it('[BERHASIL] Upload gambar WebP valid langsung diproses dan dioptimasi', async () => {
    const webpBuffer = await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 3,
        background: { r: 100, g: 150, b: 200 }
      }
    }).webp().toBuffer();

    const res = await MinioService.uploadImage(webpBuffer, MINIO_BUCKETS.REVIEWS, 'review_photo.webp');
    assert.ok(res.success);
    assert.ok(res.fileName.endsWith('.webp'));
    assert.ok(res.sizeBytes > 0);
  });

  it('[BERHASIL] Proteksi Path Traversal: Nama file dengan ../../../etc/passwd dibuang dan diganti UUID acak', async () => {
    const sampleImageBuffer = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      }
    }).png().toBuffer();

    const result = await MinioService.uploadImage(sampleImageBuffer, MINIO_BUCKETS.VENUES, '../../../../etc/shadow');
    assert.ok(result.success);
    assert.ok(!result.fileName.includes('/'));
    assert.ok(!result.fileName.includes('..'));
    assert.match(result.fileName, /^[0-9a-f-]+\.webp$/);
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

  it('[GAGAL] Upload buffer null/undefined harus melempar error', async () => {
    await assert.rejects(
      async () => {
        await MinioService.uploadImage(null, MINIO_BUCKETS.VENUES, 'null.png');
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

  it('[GAGAL] Upload file HTML/SVG berbahaya ditolak oleh magic bytes check', async () => {
    const maliciousSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

    await assert.rejects(
      async () => {
        await MinioService.uploadImage(maliciousSvg, MINIO_BUCKETS.VENUES, 'xss.svg');
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

