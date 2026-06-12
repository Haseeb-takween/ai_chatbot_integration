import type { ChatRole } from "./chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export interface AdminConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface AdminConversationDetail {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { role: ChatRole; content: string; timestamp: string }[];
}

export interface AdminStats {
  totalConversations: number;
  totalMessages: number;
}

export interface AdminConversationsPage {
  conversations: AdminConversationSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class AdminRequestError extends Error {
  constructor(
    message: string,
    public unauthorized = false,
  ) {
    super(message);
  }
}

async function parseError(response: Response): Promise<string> {
  const message = await response
    .json()
    .then((body: { message?: string }) => body.message)
    .catch(() => undefined);

  return message ?? "The server returned an error. Please try again.";
}

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/admin${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new AdminRequestError(
      "Could not reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    const message = await parseError(response);
    throw new AdminRequestError(message, response.status === 401);
  }

  return response;
}

export async function adminLogin(password: string): Promise<void> {
  await adminFetch("/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function adminLogout(): Promise<void> {
  await adminFetch("/logout", { method: "POST" });
}

export async function checkAdminSession(): Promise<void> {
  await adminFetch("/session");
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await adminFetch("/stats");
  return (await response.json()) as AdminStats;
}

export async function fetchAdminConversations(
  page: number,
  limit = 20,
): Promise<AdminConversationsPage> {
  const response = await adminFetch(`/conversations?page=${page}&limit=${limit}`);
  return (await response.json()) as AdminConversationsPage;
}

export async function fetchAdminConversation(id: string): Promise<AdminConversationDetail> {
  const response = await adminFetch(`/conversations/${id}`);
  return (await response.json()) as AdminConversationDetail;
}
