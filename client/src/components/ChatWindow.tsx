import { useEffect, useRef } from "react";
import type { ChatMessage as Message } from "../types/chat";
import ChatMessage from "./ChatMessage";

interface Props {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatWindow({
  messages,
  isLoading
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="chat-empty">
          <h2>How can I help you today?</h2>
          <p>Ask me anything. I'm here to help.</p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))
      )}

      {isLoading && (
        <div className="typing-indicator">
          <span />
          <span />
          <span />
          <small>AI is thinking...</small>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}