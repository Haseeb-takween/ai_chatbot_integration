export function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        ai
      </span>
      <div className="flex items-center gap-1.5 rounded-sm border border-border bg-surface px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
