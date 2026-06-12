"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminRequestError, adminLogin } from "@/lib/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await adminLogin(password);
      router.push("/admin");
    } catch (err) {
      const message =
        err instanceof AdminRequestError ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-border bg-surface p-6"
      >
        <h1 className="mb-1 font-mono text-sm tracking-widest text-foreground">
          admin<span className="text-accent">.login</span>
        </h1>
        <p className="mb-6 font-mono text-xs text-muted">
          Enter the admin password to continue.
        </p>

        <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          className="mb-4 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent-dim focus:outline-none"
        />

        {error && (
          <div className="mb-4 rounded-sm border border-error/40 bg-error/5 px-3 py-2 font-mono text-xs text-error">
            error: {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !password}
          className="w-full border border-accent-dim px-3 py-2 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "checking..." : "log in"}
        </button>
      </form>
    </div>
  );
}
