import { notFound } from "next/navigation";
import CopyButtons from "./CopyButtons";

export const runtime = "edge";

interface FileRecord {
  id: string;
  r2_key: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  expires_at: string | null;
}

async function getFileData(id: string): Promise<FileRecord | null> {
  // In production: query D1
  // For now (no D1 binding in build), return placeholder logic
  // The actual query happens at runtime in Cloudflare Pages
  try {
    const db = (process.env as any).DB;
    if (!db) return null;

    const result = await db
      .prepare("SELECT * FROM files WHERE id = ?")
      .bind(id)
      .first();

    return result || null;
  } catch {
    return null;
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const file = await getFileData(id);

  if (!file) {
    notFound();
  }

  const cdnDomain = process.env.CDN_DOMAIN || "cdn.photo2url.com";
  const imageUrl = `https://${cdnDomain}/${file.r2_key}`;
  const appUrl = process.env.APP_URL || "https://photo2url.com";
  const previewUrl = `${appUrl}/i/${id}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back link */}
        <a
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
        >
          &larr; Back to photo2url
        </a>

        {/* Image display */}
        <div className="rounded-lg border overflow-hidden bg-muted/20 mb-6">
          <img
            src={imageUrl}
            alt={file.original_name || "Uploaded image"}
            className="w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* File info */}
        <div className="mb-6 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {file.original_name}
          </span>
          {" · "}
          {formatSize(file.file_size)}
          {" · "}
          {file.mime_type.split("/")[1]?.toUpperCase()}
          {" · "}
          Uploaded {file.created_at}
          {file.expires_at && (
            <>
              {" · "}
              <span className="text-orange-500">
                Expires {file.expires_at}
              </span>
            </>
          )}
        </div>

        {/* Copy buttons */}
        <CopyButtons
          imageUrl={imageUrl}
          previewUrl={previewUrl}
          fileName={file.original_name || "image"}
        />
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
