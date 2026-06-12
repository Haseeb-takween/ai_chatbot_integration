import { useEffect, useRef } from "react";
import type { ConversationSummary } from "@/lib/chat";

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  onDelete,
}: ConversationSidebarProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  useEffect(() => {
    if (!activeId) return;
    itemRefs.current.get(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  useEffect(() => {
    if (conversations[0]?.id === activeId) {
      listRef.current?.scrollTo({ top: 0 });
    }
  }, [conversations, activeId]);

  return (
    <aside className="hidden w-64 flex-col border-r border-border sm:flex">
      <div className="border-b border-border p-3">
        <button
          type="button"
          onClick={onNewConversation}
          className="w-full border border-accent-dim px-3 py-2 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/10"
        >
          + new conversation
        </button>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-3 py-4 font-mono text-xs text-muted">
            no conversations yet
          </p>
        ) : (
          <ul className="flex flex-col">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(conversation.id, el);
                  } else {
                    itemRefs.current.delete(conversation.id);
                  }
                }}
                className="group flex border-b border-border"
              >
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={`min-w-0 flex-1 truncate px-3 py-3 text-left font-mono text-xs transition-colors hover:bg-surface ${
                    conversation.id === activeId
                      ? "bg-surface text-accent"
                      : "text-foreground"
                  }`}
                  title={conversation.title}
                >
                  {conversation.title || "Untitled conversation"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(conversation.id)}
                  aria-label="Delete conversation"
                  title="Delete conversation"
                  className="px-2 font-mono text-xs text-muted opacity-0 transition-colors hover:text-error group-hover:opacity-100"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
