import { v4 as uuidv4 } from "uuid";

/** Generate a unique file ID (UUID v4) */
export function generateFileId(): string {
  return uuidv4();
}

/** Generate a cookie ID for guest tracking */
export function generateCookieId(): string {
  return uuidv4();
}
