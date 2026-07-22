"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";

export interface UploadResult {
  url: string;
  preview: string;
  markdown: string;
  html: string;
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
  };
}

import type { Dictionary } from "@/lib/i18n";

const SAMPLE_URL = "/sample-photo.png";

export default function UploadZone({
  dict,
  onUploadSuccess,
  onUploadResult,
}: {
  dict: Dictionary;
  onUploadSuccess?: () => void;
  onUploadResult?: (result: UploadResult) => void;
}) {
  const u = dict.upload;
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [, setTurnstileToken] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const uploadCountRef = useRef(uploadCount);
  uploadCountRef.current = uploadCount;
  const pendingFileRef = useRef(pendingFile);
  pendingFileRef.current = pendingFile;

  const doUpload = useCallback(
    async (file: File, tToken?: string) => {
      setUploading(true);
      setError(null);
      setPendingFile(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (tToken) formData.append("cf-turnstile-response", tToken);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Upload failed");
          toast.error(data.message || "Upload failed");
          return;
        }

        setUploadCount((c) => c + 1);
        onUploadSuccess?.();
        onUploadResult?.(data);
        toast.success("Upload successful!");
      } catch {
        setError("Network error. Please try again.");
        toast.error("Network error. Please try again.");
      } finally {
        setUploading(false);
        setTurnstileToken(null);
        setShowTurnstile(false);
        if (turnstileWidgetId.current && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
      }
    },
    []
  );

  // Load Turnstile script
  useEffect(() => {
    if (showTurnstile) {
      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      if (!siteKey) return;
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
      if (window.turnstile) {
        turnstileWidgetId.current = window.turnstile.render(
          "#turnstile-container",
          {
            sitekey: siteKey,
            callback: (token: string) => {
              setTurnstileToken(token);
              const file = pendingFileRef.current;
              if (file) doUpload(file, token);
            },
          }
        );
        return;
      }
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.onload = () => {
        if (window.turnstile) {
          turnstileWidgetId.current = window.turnstile.render(
            "#turnstile-container",
            {
              sitekey: siteKey,
              callback: (token: string) => {
                setTurnstileToken(token);
                const file = pendingFileRef.current;
                if (file) doUpload(file, token);
              },
            }
          );
        }
      };
      document.body.appendChild(script);
    }
  }, [showTurnstile, doUpload]);

  useEffect(() => {
    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
      }
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (uploadCountRef.current >= 5) {
        setShowTurnstile(true);
        setPendingFile(file);
        return;
      }
      await doUpload(file);
    },
    [doUpload]
  );

  const handleSample = async () => {
    try {
      const res = await fetch(SAMPLE_URL);
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Detect real MIME type from magic bytes, not server Content-Type header
      let mimeType = "image/png";
      if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) mimeType = "image/jpeg";
      else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) mimeType = "image/gif";
      else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46) mimeType = "image/webp";
      const ext = mimeType.split("/")[1];
      const blob = new Blob([buffer], { type: mimeType });
      const file = new File([blob], `sample-photo.${ext}`, { type: mimeType });
      await handleFile(file);
    } catch {
      toast.error("Failed to load sample image");
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  };

  const handleFileRef = useRef(handleFile);
  handleFileRef.current = handleFile;

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleFileRef.current(file);
          break;
        }
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 cursor-pointer
          shadow-2xl bg-gradient-to-br from-white to-muted/30
          ${dragActive
            ? "border-primary bg-primary/10 scale-[1.02] shadow-xl"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"}
          ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground text-sm">{u.uploading}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            {dragActive ? (
              <p className="font-medium text-sm text-primary">{u.dropHere}</p>
            ) : (
              <>
                <p className="font-medium text-sm">{u.dragDrop}</p>
                <p className="text-xs text-muted-foreground">
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">Ctrl+V</kbd>
                  {" / "}
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">Cmd+V</kbd>
                  {" "}{u.pasteHint} · {u.maxSize}
                </p>
                <ClipboardPaste className="h-4 w-4 text-muted-foreground/50 mt-1" />
              </>
            )}
          </div>
        )}
      </div>

      {/* No image? Try one of these. */}
      {!uploading && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground mb-2">{u.trySample}</p>
          <button
            onClick={(e) => { e.stopPropagation(); handleSample(); }}
            className="inline-block rounded-lg border border-muted-foreground/20 hover:border-primary cursor-pointer overflow-hidden transition-colors"
          >
            <img
              src="/sample-photo.png"
              alt="Sample photo"
              className="w-40 h-auto object-cover"
            />
          </button>
        </div>
      )}

      {/* Error */}
      {error && !uploading && (
        <div className="mt-3 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Turnstile */}
      {showTurnstile && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">{u.verify}</p>
          <div id="turnstile-container" />
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    turnstile: {
      render: (container: string, options: { sitekey: string; callback: (token: string) => void }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
