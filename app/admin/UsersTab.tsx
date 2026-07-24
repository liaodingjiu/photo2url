"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n";
import type { AdminUser, AdminUserDetail } from "./AdminClient";
import UserDetail from "./UserDetail";

export default function UsersTab({ dict: _dict }: { dict: Dictionary }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (planFilter) params.set("plan", planFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
      if (res.status === 403) { toast.error("Access denied"); return; }
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, statusFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDetail = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { credentials: "include" });
      const data = await res.json();
      setSelectedUser(data);
      setShowDetail(true);
    } catch {
      toast.error("Failed to load user detail");
    }
  };

  const views = [
    { label: "All Users", plan: "", status: "" },
    { label: "Active", plan: "", status: "active" },
    { label: "Suspended", plan: "", status: "suspended" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/admin/sync-users", { method: "POST", credentials: "include" });
              const data = await res.json();
              if (data.success) {
                toast.success(`Synced: ${data.created} new, ${data.skipped} existing`);
                fetchUsers();
              } else {
                toast.error(data.error || "Sync failed");
              }
            } catch { toast.error("Sync failed"); }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/70 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync from Clerk
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {total} user{total !== 1 ? "s" : ""} total
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {views.map((v) => (
          <button
            key={v.label}
            onClick={() => { setPlanFilter(v.plan); setStatusFilter(v.status); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${planFilter === v.plan && statusFilter === v.status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
          >
            {v.label}
          </button>
        ))}
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg text-xs bg-muted border-0"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="plus">Plus</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by email or ID..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm"
        />
      </div>

      {/* User list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">User</th>
                  <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                  <th className="text-left px-4 py-2.5 font-medium">Storage</th>
                  <th className="text-left px-4 py-2.5 font-medium">Files</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => fetchDetail(u.id)}
                    className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${u.suspendedAt ? "bg-red-500" : "bg-green-500"}`} />
                        <span className="truncate max-w-[200px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground capitalize">{u.planType}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{formatBytes(u.storageUsed)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{u.fileCount}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.suspendedAt ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                        {u.suspendedAt ? "Suspended" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => fetchDetail(u.id)}
                className="border rounded-lg p-4 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${u.suspendedAt ? "bg-red-500" : "bg-green-500"}`} />
                  <span className="font-medium text-sm truncate">{u.email}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="capitalize">{u.planType}</span>
                  <span>{formatBytes(u.storageUsed)}</span>
                  <span>{u.fileCount} files</span>
                  <span className={u.suspendedAt ? "text-red-500 font-medium" : "text-green-500"}>
                    {u.suspendedAt ? "Suspended" : "Active"}
                  </span>
                </div>
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
              <span className="text-sm text-muted-foreground">
                {page} / {pages}
              </span>
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

      {/* User detail panel */}
      {showDetail && selectedUser && (
        <UserDetail
          detail={selectedUser}
          onClose={() => { setShowDetail(false); setSelectedUser(null); }}
          onRefresh={() => { fetchUsers(); }}
        />
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < (1024 * 1024 * 1024)) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
