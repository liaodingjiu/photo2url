"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const SAMPLES = [
  {
    url: "https://cdn.photo2url.com/demo/screenshot-github.png",
    markdown: "![screenshot](https://cdn.photo2url.com/demo/screenshot-github.png)",
    html: "<img src=\"https://cdn.photo2url.com/demo/screenshot-github.png\" alt=\"screenshot\" />",
    label: "GitHub README",
  },
  {
    url: "https://cdn.photo2url.com/demo/screenshot-notion.png",
    markdown: "![notion](https://cdn.photo2url.com/demo/screenshot-notion.png)",
    html: "<img src=\"https://cdn.photo2url.com/demo/screenshot-notion.png\" alt=\"notion\" />",
    label: "Notion Page",
  },
  {
    url: "https://cdn.photo2url.com/demo/screenshot-design.png",
    markdown: "![design](https://cdn.photo2url.com/demo/screenshot-design.png)",
    html: "<img src=\"https://cdn.photo2url.com/demo/screenshot-design.png\" alt=\"design\" />",
    label: "Design Mockup",
  },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {label}
    </button>
  );
}

export default function DemoResultCard() {
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground mb-2 font-medium">
        Try it — click Copy to see how it works
      </p>
      <div className="grid grid-cols-3 gap-3">
        {SAMPLES.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border bg-card overflow-hidden"
          >
            <div className="aspect-video bg-muted/50 flex items-center justify-center">
              <img
                src={s.url}
                alt={s.label}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2 space-y-1">
              <p className="text-xs font-medium truncate">{s.label}</p>
              <div className="flex gap-1 flex-wrap">
                <CopyButton text={s.url} label="URL" />
                <CopyButton text={s.markdown} label="MD" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
