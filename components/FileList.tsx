"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, Copy, ExternalLink, Check, Search, Upload, ArrowUpDown } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

function CopyRow({ label, text }: { label: string; text: string }) {
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
      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 text-muted-foreground" />
      )}
      <span className="font-medium w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate font-mono">{text}</span>
    </button>
  );
}

// P2 #18: Skeleton loader
function SkeletonRow() {
  return (
    <tr className="border-b last:border-0 animate-pulse">
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
  );
}

export default function FileList({ files: initialFiles }: { files?: FileRecord[] }) {
  const [files, setFiles] = useState<FileRecord[]>(initialFiles || []);
  const [loading, setLoading] = useState(!initialFiles);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);

  // P2 #17: Search + Sort
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
    if (initialFiles) return; // Controlled mode: skip fetch
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

  // P2 #17: Filtered + sorted files
  const displayedFiles = useMemo(() => {
    let result = [...files];

    // Client-side search by original name
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((f) => f.original_name.toLowerCase().includes(q));
    }

    // Sort
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

  // P2 #18: Loading state — skeleton
  if (loading) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-3 font-medium">File</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Uploaded</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Expires</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // P2 #15: Empty state with upload CTA
  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-1">No photos uploaded yet</p>
        <p className="text-sm text-muted-foreground mb-4">
          Upload your first photo to get started.
        </p>
        <a href="/#upload">
          <Button>
            <Upload className="h-4 w-4" />
            Upload Your First Photo
          </Button>
        </a>
      </div>
    );
  }

  return (
    <>
      {/* P2 #17: Search bar + sort controls */}
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSort("date")}
          className="gap-1.5"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort{sortIndicator("date")}
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
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
              {/* P2 #17: Empty search results */}
              {displayedFiles.length === 0 && query.trim() && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No files match &quot;{query}&quot;
                  </td>
                </tr>
              )}
              {displayedFiles.map((file) => {
                const url = getFileUrl(file);
                const markdown = `![${file.original_name}](${url})`;
                const html = `<img src="${url}" alt="${file.original_name}">`;
                return (
                  <tr key={file.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="text-sm truncate max-w-[200px] block">
                        {file.original_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatSize(file.file_size)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {file.expires_at ? (
                        formatDate(file.expires_at)
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Never
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Copy link"
                              type="button"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-80">
                            <CopyRow label="Direct" text={url} />
                            <CopyRow label="Markdown" text={markdown} />
                            <CopyRow label="HTML" text={html} />
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(file)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
