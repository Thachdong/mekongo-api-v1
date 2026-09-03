import { randomUUID } from 'crypto';

export const TMP_STORAGE_PREFIX = 'TMP';

export function buildTmpObjectKey(fileName: string): string {
  return `${TMP_STORAGE_PREFIX}/${randomUUID()}-${fileName}`;
}
