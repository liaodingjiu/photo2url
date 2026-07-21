import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// This is a placeholder — in Cloudflare Workers/Pages,
// the D1 binding is injected via platformProxy or getRequestContext()
// See: https://developers.cloudflare.com/pages/functions/bindings/#d1-databases

// D1 type is injected by Cloudflare Pages at runtime, not available at build time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDb(d1Binding: any) {
  return drizzle(d1Binding, { schema });
}

// For use in Next.js API routes on Cloudflare Pages
// Access D1 via process.env or platform proxy
export type DbClient = ReturnType<typeof createDb>;
