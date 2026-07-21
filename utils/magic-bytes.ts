/**
 * Magic Bytes validation — verify file headers to prevent MIME spoofing.
 * Each entry: [byte offset, hex bytes to match]
 */
const MAGIC_BYTES: Record<string, { offset: number; bytes: number[] }[]> = {
  "image/jpeg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  "image/png": [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }],
  "image/gif": [
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF89a or GIF87a
  ],
  "image/webp": [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // WEBP
  ],
};

/**
 * Validate that a file's magic bytes match its claimed MIME type.
 * Reads only the first few bytes — efficient for large files.
 */
export function validateMagicBytes(
  buffer: ArrayBuffer,
  mimeType: string
): boolean {
  const patterns = MAGIC_BYTES[mimeType];
  if (!patterns) return false; // Unknown MIME type

  const bytes = new Uint8Array(buffer);

  for (const pattern of patterns) {
    if (pattern.offset + pattern.bytes.length > bytes.length) return false;
    for (let i = 0; i < pattern.bytes.length; i++) {
      if (bytes[pattern.offset + i] !== pattern.bytes[i]) return false;
    }
  }

  return true;
}

/** Allowed MIME types for upload */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Extract file extension from MIME type */
export function mimeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType] || "bin";
}
