"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n";
import type { AdminLog } from "./AdminClient";

const ACTION_LABELS: Record<string, string> = {
  suspend: "Suspend",
  unsuspend: "Unsuspend",
  plan_change: "Plan Change",
  role_change: "Role Change",
};

export default function LogsTab({ dict: _dict }: { dict: Dictionary }) {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      const res = await fetch(`/api/admin/logs?${params}`, { credentials: "include" });
      if (res.status === 403) { toast.error("Access denied"); return; }
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Operation Logs</h1>
      <p className="text-sm text-muted-foreground mb-6">{total} entries (90-day retention)</p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No logs yet.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Action</th>
                  <th className="text-left px-4 py-2.5 font-medium">Target</th>
                  <th className="text-left px-4 py-2.5 font-medium">Detail</th>
                  <th className="text-left px-4 py-2.5 font-medium">IP</th>
                  <th className="text-right px-4 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                        {ACTION_LABELS[l.action] || l.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground truncate max-w-[150px]">
                      {l.target_user_id || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">
                      {formatDetail(l.detail)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                      {l.ip_address || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground text-right">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {logs.map((l, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                    {ACTION_LABELS[l.action] || l.action}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  Target: {l.target_user_id || "—"}
                </p>
                {l.detail && (
                  <p className="text-xs text-muted-foreground mt-1">{formatDetail(l.detail)}</p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground">{page} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatDetail(detail: string | null): string {
  if (!detail) return "—";
  try {
    const d = JSON.parse(detail);
    if (d.reason) return d.reason;
    if (d.before && d.after) return `${d.before} → ${d.after}`;
    return JSON.stringify(d);
  } catch {
    return detail;
  }
}
