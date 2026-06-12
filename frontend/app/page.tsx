import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <header className="border-b border-border px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="font-mono text-sm tracking-widest text-foreground">
            console<span className="text-accent">.chat</span>
          </h1>
          <span className="font-mono text-xs text-muted">v0.1</span>
        </div>
      </header>
      <ChatWindow />
    </div>
  );
}
