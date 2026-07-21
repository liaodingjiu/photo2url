"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 flex-1 justify-start font-mono text-xs truncate"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="truncate">{text}</span>
    </Button>
  );
}

export default function ResultCard({ result }: { result: UploadResult }) {
  return (
    <Card className="w-full lg:w-80 shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
      <CardContent className="p-4 space-y-3">
        {/* Thumbnail Preview */}
        <div className="overflow-hidden rounded-lg border bg-muted">
          <img
            src={result.url}
            alt={result.file.name}
            className="w-full h-40 object-cover"
            loading="lazy"
          />
        </div>

        {/* File Info */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{result.file.name}</span>
          {" · "}
          {formatSize(result.file.size)}
          {" · "}
          {result.file.type.split("/")[1]?.toUpperCase()}
        </div>

        {/* Copy Buttons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
              Direct
            </span>
            <CopyButton text={result.url} label="Direct URL" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
              Markdown
            </span>
            <CopyButton text={result.markdown} label="Markdown" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
              HTML
            </span>
            <CopyButton text={result.html} label="HTML" />
          </div>
        </div>

        {/* Preview Link */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1.5"
          onClick={() => window.open(result.preview, "_blank")}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Preview Page
        </Button>
      </CardContent>
    </Card>
  );
}
