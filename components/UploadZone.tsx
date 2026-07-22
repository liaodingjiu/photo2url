"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import ResultCard from "./ResultCard";

interface UploadResult {
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

export default function UploadZone({
  dict,
  onUploadSuccess,
}: {
  dict: Dictionary;
  onUploadSuccess?: () => void;
}) {
  const u = dict.upload;
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [, setTurnstileToken] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const turnstileRef = useRef<string | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  // Refs to keep latest values accessible in stale closures (e.g. Turnstile callback)
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
        if (tToken) {
          formData.append("cf-turnstile-response", tToken);
        }

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

        setResult(data);
        setUploadCount((c) => c + 1);
        onUploadSuccess?.();
        toast.success("Upload successful!");
      } catch {
        setError("Network error. Please try again.");
        toast.error("Network error. Please try again.");
      } finally {
        setUploading(false);
        setTurnstileToken(null);
        setShowTurnstile(false);
        // Reset Turnstile for next use
        if (turnstileWidgetId.current && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
      }
    },
    []
  );

  // Load Turnstile script dynamically
  useEffect(() => {
    if (showTurnstile) {
      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      if (!siteKey) return;

      // Destroy previous widget if exists
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }

      // If script already loaded, just render
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

      // Load script fresh
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
      turnstileRef.current = "loaded";
    }
  }, [showTurnstile, doUpload]);

  // Cleanup Turnstile widget
  useEffect(() => {
    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
      }
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      // Check if Turnstile is needed (after 5 free uploads)
      if (uploadCountRef.current >= 5) {
        setShowTurnstile(true);
        setPendingFile(file);
        return; // Wait for Turnstile callback
      }

      await doUpload(file);
    },
    [doUpload]
  );

  // Drag handlers
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

  // Click upload
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

  // Paste handler — use ref for handleFile to avoid re-registering listener
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
  }, []); // Only attach once — use ref to always get latest handleFile

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Upload Area */}
        <div className="flex-1 w-full">
          <div
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer
              ${dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
              ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">{u.uploading}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-muted p-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {u.dragDrop}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">
                      Ctrl+V
                    </kbd>{" "}
                    /{" "}
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">
                      Cmd+V
                    </kbd>{" "}
                    {u.pasteHint} · {u.maxSize}
                  </p>
                </div>
                <ClipboardPaste className="h-5 w-5 text-muted-foreground/50 mt-1" />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && !uploading && (
            <div className="mt-3 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Turnstile Widget */}
          {showTurnstile && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Please verify you&apos;re human to continue uploading
              </p>
              <div id="turnstile-container" />
            </div>
          )}
        </div>

        {/* Result Card (appears after successful upload) */}
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}

// Type declarations for Turnstile
declare global {
  interface Window {
    turnstile: {
      render: (
        container: string,
        options: { sitekey: string; callback: (token: string) => void }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
