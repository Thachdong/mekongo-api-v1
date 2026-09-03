import { registerAs } from '@nestjs/config';

export const firebaseConfig = registerAs('firebase', () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  uploadUrlTtlMs: Number(process.env.FIREBASE_UPLOAD_URL_TTL_MS ?? 900000),
  downloadUrlTtlMs: Number(process.env.FIREBASE_DOWNLOAD_URL_TTL_MS ?? 3600000),
}));
