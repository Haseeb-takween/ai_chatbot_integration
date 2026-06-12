"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AdminRequestError,
  adminLogout,
  clearAdminToken,
  fetchAdminConversations,
  fetchAdminStats,
  getAdminToken,
  type AdminConversationSummary,
  type AdminStats,
} from "@/lib/admin";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [conversations, setConversations] = useState<AdminConversationSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }

    let cancelled = false;

    void Promise.resolve().then(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [statsData, conversationsData] = await Promise.all([
          fetchAdminStats(),
          fetchAdminConversations(page),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setConversations(conversationsData.conversations);
        setTotalPages(conversationsData.totalPages);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof AdminRequestError && err.unauthorized) {
          clearAdminToken();
          router.replace("/admin/login");
          return;
        }
        const message =
          err instanceof AdminRequestError ? err.message : "Something went wrong. Please try again.";
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [page, router]);

  function handleLogout() {
    adminLogout();
    router.replace("/admin/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="font-mono text-sm tracking-widest text-foreground">
          admin<span className="text-accent">.dashboard</span>
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-error/40 hover:text-error"
        >
          log out
        </button>
      </header>

      {error && (
        <div className="rounded-sm border border-error/40 bg-error/5 px-4 py-3 font-mono text-sm text-error">
          error: {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-border bg-surface p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Total conversations
          </p>
          <p className="mt-2 font-mono text-2xl text-accent">
            {stats?.totalConversations ?? "—"}
          </p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Total messages
          </p>
          <p className="mt-2 font-mono text-2xl text-accent">
            {stats?.totalMessages ?? "—"}
          </p>
        </div>
      </div>

      <div className="border border-border bg-surface">
        {isLoading ? (
          <p className="px-4 py-6 font-mono text-xs text-muted">loading...</p>
        ) : conversations.length === 0 ? (
          <p className="px-4 py-6 font-mono text-xs text-muted">no conversations yet</p>
        ) : (
          <ul className="flex flex-col">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="border-b border-border last:border-b-0">
                <Link
                  href={`/admin/conversations/${conversation.id}`}
                  className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-background sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="truncate font-mono text-sm text-foreground">
                    {conversation.title || "Untitled conversation"}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {conversation.messageCount} msgs · updated {formatDate(conversation.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <button
          type="button"
          onClick={() => setPage((current) => current - 1)}
          disabled={page <= 1 || isLoading}
          className="border border-border px-3 py-1.5 uppercase tracking-widest transition-colors hover:border-accent-dim hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          prev
        </button>
        <span>
          page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          disabled={page >= totalPages || isLoading}
          className="border border-border px-3 py-1.5 uppercase tracking-widest transition-colors hover:border-accent-dim hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          next
        </button>
      </div>
    </div>
  );
}
