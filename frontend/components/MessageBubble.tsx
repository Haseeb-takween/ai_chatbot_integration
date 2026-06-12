import type { ChatMessage } from "@/lib/chat";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        {isUser ? "you" : "ai"}
      </span>
      <div
        className={`max-w-[80ch] whitespace-pre-wrap rounded-sm border px-4 py-3 text-sm leading-relaxed sm:max-w-[65ch] ${
          isUser
            ? "border-accent-dim bg-accent/5 text-foreground"
            : "border-border bg-surface text-foreground"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
