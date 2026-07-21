"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      className="gap-2 flex-1 justify-start font-mono text-xs"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 shrink-0 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </Button>
  );
}

interface Props {
  imageUrl: string;
  previewUrl: string;
  fileName: string;
}

export default function CopyButtons({ imageUrl, previewUrl, fileName }: Props) {
  const markdown = `![${fileName}](${imageUrl})`;
  const html = `<img src="${imageUrl}" alt="${fileName}" />`;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Copy Link</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Direct URL</span>
          <CopyButton text={imageUrl} label="Direct URL" />
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Markdown</span>
          <CopyButton text={markdown} label="Markdown" />
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">HTML</span>
          <CopyButton text={html} label="HTML" />
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Preview Page</span>
          <CopyButton text={previewUrl} label="Preview Page" />
        </div>
      </div>
    </div>
  );
}
