"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminRequestError, fetchAdminConversation, type AdminConversationDetail } from "@/lib/admin";
import { MessageBubble } from "@/components/MessageBubble";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function AdminConversationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<AdminConversationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminConversation(params.id)
      .then(setConversation)
      .catch((err: unknown) => {
        if (err instanceof AdminRequestError && err.unauthorized) {
          router.replace("/admin/login");
          return;
        }
        const message =
          err instanceof AdminRequestError
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, [params.id, router]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
        >
          ← back to dashboard
        </Link>
        {conversation && (
          <div>
            <h1 className="font-mono text-sm text-foreground">
              {conversation.title || "Untitled conversation"}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted">
              created {formatDate(conversation.createdAt)} · updated{" "}
              {formatDate(conversation.updatedAt)}
            </p>
          </div>
        )}
      </header>

      {error && (
        <div className="rounded-sm border border-error/40 bg-error/5 px-4 py-3 font-mono text-sm text-error">
          error: {error}
        </div>
      )}

      {isLoading ? (
        <p className="font-mono text-xs text-muted">loading...</p>
      ) : conversation && conversation.messages.length === 0 ? (
        <p className="font-mono text-xs text-muted">no messages in this conversation</p>
      ) : (
        <div className="flex flex-col gap-6">
          {conversation?.messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={{ id: String(index), role: message.role, content: message.content }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
