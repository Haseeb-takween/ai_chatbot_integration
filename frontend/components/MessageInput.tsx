"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
} from "react";

export interface MessageInputHandle {
  focus: () => void;
}

interface MessageInputProps {
  onSend: (value: string) => void;
  disabled?: boolean;
}

export const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(
  function MessageInput({ onSend, disabled }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }));

    function submit() {
      const value = textareaRef.current?.value.trim();
      if (!value || disabled) return;
      onSend(value);
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
      }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    }

    function handleInput() {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }

    return (
      <div className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-end gap-3 px-4 py-4">
          <span className="pb-2 font-mono text-accent">{">"}</span>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent py-2 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled}
            className="border border-accent-dim px-3 py-2 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            send
          </button>
        </div>
      </div>
    );
  },
);
