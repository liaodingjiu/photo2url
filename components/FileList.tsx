"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, ExternalLink, Check, Search, Upload, ArrowUpDown, LayoutList, LayoutGrid, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n";

export interface FileRecord {
  id: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  expires_at: string | null;
  r2_key: string;
}

type SortKey = "name" | "size" | "date";
type SortDir = "asc" | "desc";
type ViewMode = "list" | "grid";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileUrl(file: FileRecord): string {
  const cdnDomain = "cdn.photo2url.com";
  return `https://${cdnDomain}/${file.r2_key}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getViewPreference(): ViewMode {
  if (typeof window === "undefined") return "list";
  try {
    const stored = localStorage.getItem("filelist-view");
    if (stored === "grid" || stored === "list") return stored;
  } catch { /* localStorage not available */ }
  return "list";
}

function saveViewPreference(mode: ViewMode) {
  try {
    localStorage.setItem("filelist-view", mode);
  } catch { /* localStorage not available */ }
}

// =============== Copy Button (button-level feedback) ===============

function CopyButton({ text, label, variant = "ghost" }: { text: string; label: string; variant?: "default" | "ghost" | "outline" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={`gap-1.5 text-xs transition-all duration-200 ${
        copied ? "bg-green-500 text-white hover:bg-green-500" : ""
      }`}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {label}
        </>
      )}
    </Button>
  );
}

// =============== Skeleton ===============

function ListSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-medium w-0" />
              <th className="text-left px-4 py-3 font-medium">File</th>
              <th className="text-left px-4 py-3 font-medium">Size</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Uploaded</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Expires</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b last:border-0 animate-pulse">
                <td className="px-4 py-3">
                  <div className="h-12 w-12 bg-muted rounded-md" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-32 bg-muted rounded" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-12 bg-muted rounded" />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="h-4 w-20 bg-muted rounded" />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="h-4 w-16 bg-muted rounded" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 bg-muted rounded ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border bg-card animate-pulse overflow-hidden">
          <div className="aspect-[4/3] bg-muted" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded mx-auto" />
            <div className="h-3 w-1/2 bg-muted rounded mx-auto" />
            <div className="border-t pt-2 mt-2 flex gap-1">
              <div className="h-7 flex-1 bg-muted rounded" />
              <div className="h-7 flex-1 bg-muted rounded" />
              <div className="h-7 flex-1 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============== Main Component ===============

export default function FileList({ files: initialFiles, dict }: { files?: FileRecord[]; dict?: Dictionary }) {
  const [files, setFiles] = useState<FileRecord[]>(initialFiles || []);
  const [loading, setLoading] = useState(!initialFiles);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);

  // Search + Sort
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setViewMode(getViewPreference());
    setMounted(true);
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    saveViewPreference(mode);
  };

  const d = dict?.dashboard?.overview;

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      if (data.files) setFiles(data.files);
    } catch {
      // Files API not yet implemented — show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFiles) return;
    fetchFiles();
  }, [initialFiles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/files/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        toast.success("File deleted");
      } else {
        toast.error("Failed to delete file");
      }
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeleteTarget(null);
    }
  };

  const openPreview = (file: FileRecord) => {
    const appUrl = window.location.origin;
    window.open(`${appUrl}/i/${file.id}`, "_blank");
  };

  // Filtered + sorted files
  const displayedFiles = useMemo(() => {
    let result = [...files];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((f) => f.original_name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.original_name.localeCompare(b.original_name);
      } else if (sortKey === "size") {
        cmp = a.file_size - b.file_size;
      } else if (sortKey === "date") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [files, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return <span className="ml-1 text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  // =========== Loading State ===========

  if (loading) {
    return (
      <div>
        {viewMode === "list" ? <ListSkeleton /> : <GridSkeleton />}
      </div>
    );
  }

  // =========== Empty State ===========
  // No toolbar — no files means nothing to search/sort/toggle

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-1">{d?.noFiles ?? "No photos uploaded yet"}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {d?.noFilesHint ?? "Upload your first photo to get started."}
        </p>
        <a href="/#upload">
          <Button>
            <Upload className="h-4 w-4" />
            {d?.uploadCta ?? "Upload Your First Photo"}
          </Button>
        </a>
      </div>
    );
  }

  // =========== Toolbar ===========

  const showingText = d?.showingFiles
    ? d.showingFiles.replace("{count}", String(displayedFiles.length))
    : `Showing ${displayedFiles.length} files`;

  const toolbar = (
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">
        {showingText}
      </span>

      {/* View toggle */}
      {mounted && (
        <div className="flex rounded-lg border overflow-hidden shrink-0">
          <button
            onClick={() => handleViewChange("list")}
            className={`p-1.5 transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label="List view"
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleViewChange("grid")}
            className={`p-1.5 transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => toggleSort("date")}
        className="gap-1.5 shrink-0"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        Sort{sortIndicator("date")}
      </Button>
    </div>
  );

  // =========== List View ===========

  const listView = (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-medium w-0" />
              <th
                className="text-left px-4 py-3 font-medium cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("name")}
              >
                File{sortIndicator("name")}
              </th>
              <th
                className="text-left px-4 py-3 font-medium cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("size")}
              >
                Size{sortIndicator("size")}
              </th>
              <th
                className="text-left px-4 py-3 font-medium cursor-pointer hover:text-foreground transition-colors hidden sm:table-cell"
                onClick={() => toggleSort("date")}
              >
                Uploaded{sortIndicator("date")}
              </th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                Expires
              </th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedFiles.length === 0 && query.trim() ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {d?.noMatch ?? `No files match "${query}"`}
                </td>
              </tr>
            ) : (
              displayedFiles.map((file) => {
                const url = getFileUrl(file);
                const markdown = `![${file.original_name}](${url})`;
                const html = `<img src="${url}" alt="${file.original_name}">`;
                return (
                  <tr key={file.id} className="border-b last:border-0 hover:bg-muted/30">
                    {/* Thumbnail */}
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openPreview(file)}
                        className="block w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0 hover:ring-2 hover:ring-primary/50 transition-all"
                      >
                        <Thumbnail url={url} name={file.original_name} />
                      </button>
                    </td>
                    {/* File name */}
                    <td className="px-4 py-3">
                      <span
                        className="text-sm truncate max-w-[160px] sm:max-w-[200px] block"
                        title={file.original_name}
                      >
                        {file.original_name}
                      </span>
                    </td>
                    {/* Size */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatSize(file.file_size)}
                    </td>
                    {/* Uploaded */}
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {formatDate(file.created_at)}
                    </td>
                    {/* Expires */}
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {file.expires_at ? (
                        formatDate(file.expires_at)
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Never
                        </span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <CopyButton text={url} label="URL" variant="default" />
                        <CopyButton text={markdown} label="MD" />
                        <CopyButton text={html} label="<>" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openPreview(file)}
                          title="Open Preview"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(file)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // =========== Grid View ===========

  const gridView = (
    <>
      {displayedFiles.length === 0 && query.trim() ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {d?.noMatch ?? `No files match "${query}"`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedFiles.map((file) => {
            const url = getFileUrl(file);
            const markdown = `![${file.original_name}](${url})`;
            const html = `<img src="${url}" alt="${file.original_name}">`;
            return (
              <div
                key={file.id}
                className="rounded-xl border bg-card overflow-hidden group hover:shadow-md transition-shadow duration-200"
              >
                {/* Thumbnail */}
                <button
                  onClick={() => openPreview(file)}
                  className="relative block w-full aspect-[4/3] bg-muted overflow-hidden"
                >
                  <Thumbnail url={url} name={file.original_name} className="w-full h-full" />
                  {/* Hover overlay for desktop */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 hidden sm:block" />
                </button>

                {/* Info */}
                <div className="px-3 pt-2 pb-1 text-center">
                  <p
                    className="text-sm font-medium truncate"
                    title={file.original_name}
                  >
                    {file.original_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatSize(file.file_size)} · {formatDate(file.created_at)}
                  </p>
                </div>

                {/* Separator */}
                <div className="border-t mx-3" />

                {/* Actions — always visible */}
                <div className="px-3 py-2 flex items-center gap-1">
                  <CopyButton text={url} label="URL" variant="default" />
                  <CopyButton text={markdown} label="MD" />
                  <CopyButton text={html} label="<>" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setDeleteTarget(file)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // =========== Render ===========

  return (
    <>
      {toolbar}

      {/* View container with crossfade */}
      <div
        key={viewMode}
        className="animate-in fade-in duration-200"
      >
        {viewMode === "list" ? listView : gridView}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.original_name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =============== Thumbnail (with error handling) ===============

function Thumbnail({ url, name, className }: { url: string; name: string; className?: string }) {
  const [error, setError] = useState(false);

  // Local dev / mock data fallback: cycle through sample images
  const SAMPLES = ["/sample-photo.png", "/sample-photo-2.png", "/sample-photo-3.png", "/sample-photo-4.png"];
  const fallbackSrc = SAMPLES[Math.abs(hashCode(name)) % SAMPLES.length];

  const src = error ? fallbackSrc : url;

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      className={`object-cover ${className || "w-full h-full"}`}
      onError={(e) => {
        if (!error) {
          setError(true);
        } else {
          // Both CDN and fallback failed — show placeholder
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).parentElement?.classList.add("flex", "items-center", "justify-center", "bg-muted");
        }
      }}
    />
  );
}

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
