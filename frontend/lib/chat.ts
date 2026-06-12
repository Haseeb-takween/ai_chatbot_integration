export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export class ChatRequestError extends Error {}

async function parseError(response: Response): Promise<string> {
  const message = await response
    .json()
    .then((body: { message?: string }) => body.message)
    .catch(() => undefined);

  return message ?? "The server returned an error. Please try again.";
}

export async function sendChatMessage(
  conversationId: string | null,
  message: string,
  signal?: AbortSignal,
): Promise<{ conversationId: string; reply: string }> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, message }),
      signal,
    });
  } catch {
    throw new ChatRequestError(
      "Could not reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new ChatRequestError(await parseError(response));
  }

  return (await response.json()) as { conversationId: string; reply: string };
}

export async function deleteConversation(id: string): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/conversations/${id}`, { method: "DELETE" });
  } catch {
    throw new ChatRequestError(
      "Could not reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new ChatRequestError(await parseError(response));
  }
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/conversations`);
  } catch {
    throw new ChatRequestError(
      "Could not reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new ChatRequestError(await parseError(response));
  }

  const data = (await response.json()) as { conversations: ConversationSummary[] };
  return data.conversations;
}

export async function fetchConversation(
  id: string,
): Promise<{ id: string; title: string; messages: ChatMessage[] }> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/conversations/${id}`);
  } catch {
    throw new ChatRequestError(
      "Could not reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new ChatRequestError(await parseError(response));
  }

  const data = (await response.json()) as {
    id: string;
    title: string;
    messages: { role: ChatRole; content: string }[];
  };

  return {
    id: data.id,
    title: data.title,
    messages: data.messages.map((message, index) => ({
      id: `${data.id}-${index}`,
      role: message.role,
      content: message.content,
    })),
  };
}
