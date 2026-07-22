"use client";

import type { Dictionary } from "@/lib/i18n";

export default function PostUploadSignup({ dict }: { dict: Dictionary }) {
  return (
    <div className="mt-4 p-4 rounded-lg border bg-muted/30 text-center animate-in fade-in duration-300">
      <p className="text-sm font-medium">{dict.upload.signupTitle}</p>
      <p className="text-xs text-muted-foreground mt-1 mb-3">
        {dict.upload.signupDesc}
      </p>
      <a
        href="/sign-up"
        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
      >
        {dict.upload.signupCta} →
      </a>
    </div>
  );
}
