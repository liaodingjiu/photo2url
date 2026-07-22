"use client";

import { Play } from "lucide-react";

export default function DemoVideo() {
  return (
    <div className="w-full lg:w-80 shrink-0">
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 aspect-[3/4] flex flex-col items-center justify-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Play className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          See how it works
        </p>
        <p className="text-xs text-muted-foreground/60">
          Upload → Get Link → Embed
        </p>
      </div>
    </div>
  );
}
