"use client";

import { useState } from "react";
import { X, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { AdminUserDetail } from "./AdminClient";

const VALID_PLANS = ["free", "plus", "enterprise"];

export default function UserDetail({
  detail,
  onClose,
  onRefresh,
}: {
  detail: AdminUserDetail;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [acting, setActing] = useState(false);

  const u = detail.user;

  const doAction = async (url: string, body: any) => {
    setActing(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      toast.success(data.success !== undefined ? "Done" : "Updated");
      onRefresh();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Panel — desktop: right slide, mobile: bottom sheet */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l z-50 overflow-auto
                      max-md:inset-x-0 max-md:top-auto max-md:max-w-full max-md:max-h-[85vh] max-md:rounded-t-2xl max-md:bottom-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold truncate">{u.email}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Identity */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">User</p>
            <p className="text-sm font-medium">{u.email}</p>
            <p className="text-xs text-muted-foreground mt-1">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Plan + Status cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Plan</p>
              <p className="font-semibold text-sm capitalize">{u.planType}</p>
              <div className="relative mt-2">
                <button
                  onClick={() => setShowPlanMenu(!showPlanMenu)}
                  disabled={acting}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  Change Plan
                </button>
                {showPlanMenu && (
                  <div className="absolute top-6 left-0 bg-background border rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                    {VALID_PLANS.filter((p) => p !== u.planType).map((p) => (
                      <button
                        key={p}
                        onClick={() => doAction(`/api/admin/users/${u.id}/plan`, { plan_type: p })}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted capitalize"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className={`font-semibold text-sm ${u.suspendedAt ? "text-red-500" : "text-green-500"}`}>
                {u.suspendedAt ? "Suspended" : "Active"}
              </p>
              {u.suspendedAt ? (
                <button
                  onClick={() => doAction(`/api/admin/users/${u.id}/unsuspend`, {})}
                  disabled={acting}
                  className="mt-2 text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  <ShieldCheck className="h-3 w-3" /> Unsuspend
                </button>
              ) : (
                <button
                  onClick={() => setShowSuspendConfirm(true)}
                  disabled={acting}
                  className="mt-2 text-xs text-red-500 hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  <ShieldOff className="h-3 w-3" /> Suspend
                </button>
              )}
            </div>
          </div>

          {/* Suspend confirmation */}
          {showSuspendConfirm && (
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                Suspend {u.email}?
              </p>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason (required, min 5 characters)..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm mb-2"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowSuspendConfirm(false); setSuspendReason(""); }}
                  className="flex-1 px-3 py-1.5 rounded-lg border text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => doAction(`/api/admin/users/${u.id}/suspend`, { reason: suspendReason })}
                  disabled={suspendReason.length < 5 || acting}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50"
                >
                  Confirm Suspend
                </button>
              </div>
            </div>
          )}

          {/* Usage */}
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Usage</p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="font-semibold">{formatBytes(u.storageUsed)}</p>
                <p className="text-xs text-muted-foreground">Storage</p>
              </div>
              <div>
                <p className="font-semibold">{detail.fileCount}</p>
                <p className="text-xs text-muted-foreground">Files</p>
              </div>
            </div>
          </div>

          {/* Recent files */}
          {detail.files && detail.files.length > 0 && (
            <details className="border rounded-lg p-3">
              <summary className="text-sm font-medium cursor-pointer">Recent Files ({detail.files.length})</summary>
              <div className="mt-2 space-y-1 max-h-40 overflow-auto">
                {detail.files.map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate max-w-[200px]">{f.original_name}</span>
                    <span>{formatBytes(f.file_size)} · {new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Operation logs */}
          {detail.logs && detail.logs.length > 0 && (
            <details className="border rounded-lg p-3">
              <summary className="text-sm font-medium cursor-pointer">Operation Logs ({detail.logs.length})</summary>
              <div className="mt-2 space-y-1.5 max-h-40 overflow-auto">
                {detail.logs.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium">{l.action}</span>
                      {l.detail && (
                        <span className="ml-1">
                          {tryParseDetail(l.detail)}
                        </span>
                      )}
                    </span>
                    <span>{new Date(l.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </>
  );
}

function tryParseDetail(detail: string): string {
  try {
    const d = JSON.parse(detail);
    if (d.reason) return `— ${d.reason}`;
    if (d.before && d.after) return `— ${d.before} → ${d.after}`;
    if (d.role) return `— role: ${d.role}`;
    return "";
  } catch {
    return detail ? `— ${detail}` : "";
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < (1024 * 1024 * 1024)) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
