"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChatRequestError,
  deleteConversation,
  fetchConversation,
  fetchConversations,
  sendChatMessage,
  type ChatMessage,
  type ConversationSummary,
} from "@/lib/chat";
import { ConversationSidebar } from "./ConversationSidebar";
import { MessageBubble } from "./MessageBubble";
import { MessageInput, type MessageInputHandle } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";

const NEAR_BOTTOM_THRESHOLD = 80;

function createId() {
  return Math.random().toString(36).slice(2);
}

export function ChatWindow() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<MessageInputHandle>(null);
  const instantScrollRef = useRef(false);

  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isNearBottom) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: instantScrollRef.current ? "auto" : "smooth",
    });
    instantScrollRef.current = false;
  }, [messages, isLoading, isNearBottom]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsNearBottom(distanceFromBottom < NEAR_BOTTOM_THRESHOLD);
  }

  function scrollToBottom() {
    instantScrollRef.current = false;
    setIsNearBottom(true);
  }

  async function handleSelectConversation(id: string) {
    if (id === conversationId) return;
    setError(null);

    try {
      const conversation = await fetchConversation(id);
      instantScrollRef.current = true;
      setIsNearBottom(true);
      setConversationId(conversation.id);
      setMessages(conversation.messages);
    } catch (err) {
      const message =
        err instanceof ChatRequestError
          ? err.message
          : "Could not load that conversation.";
      setError(message);
    }
  }

  function handleNewConversation() {
    instantScrollRef.current = true;
    setIsNearBottom(true);
    setConversationId(null);
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  async function handleDeleteConversation(id: string) {
    setError(null);

    try {
      await deleteConversation(id);
      setConversations((current) => current.filter((conversation) => conversation.id !== id));

      if (id === conversationId) {
        handleNewConversation();
      }
    } catch (err) {
      const message =
        err instanceof ChatRequestError
          ? err.message
          : "Could not delete that conversation.";
      setError(message);
    }
  }

  async function handleSend(content: string) {
    const userMessage: ChatMessage = { id: createId(), role: "user", content };

    setIsNearBottom(true);
    setMessages((current) => [...current, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      const result = await sendChatMessage(conversationId, content);
      setMessages((current) => [
        ...current,
        { id: createId(), role: "assistant", content: result.reply },
      ]);

      const isNewConversation = result.conversationId !== conversationId;
      setConversationId(result.conversationId);

      if (isNewConversation) {
        fetchConversations()
          .then(setConversations)
          .catch(() => undefined);
      } else {
        setConversations((current) => {
          const index = current.findIndex(
            (conversation) => conversation.id === result.conversationId,
          );
          if (index === -1) return current;

          const updated = { ...current[index], updatedAt: new Date().toISOString() };
          const rest = current.filter((_, i) => i !== index);
          return [updated, ...rest];
        });
      }
    } catch (err) {
      const message =
        err instanceof ChatRequestError
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDelete={handleDeleteConversation}
      />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
            {messages.length === 0 && !isLoading && (
              <p className="font-mono text-sm text-muted">
                <span className="caret-blink text-accent">_</span> session
                started. send a message to begin.
              </p>
            )}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            {error && (
              <div className="rounded-sm border border-error/40 bg-error/5 px-4 py-3 font-mono text-sm text-error">
                error: {error}
              </div>
            )}
          </div>
        </div>
        {!isNearBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 border border-border bg-surface px-3 py-1.5 font-mono text-xs text-foreground shadow-lg transition-colors hover:border-accent-dim hover:text-accent"
          >
            ↓ scroll to latest
          </button>
        )}
        <MessageInput ref={inputRef} onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
