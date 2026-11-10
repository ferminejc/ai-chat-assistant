import { useState } from "react";
import { Bot, Plus, Sparkles } from "lucide-react";

import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

import { sendChatMessage } from "./services/chatService";

import type { ChatMessage } from "./types/chat";

import "./App.scss";

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date()
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setIsLoading(true);
    setError("");

    try {
      const response = await sendChatMessage({
        messages: updatedMessages.map(({ role, content }) => ({
          role,
          content
        }))
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.message,
        createdAt: new Date()
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage
      ]);

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <Bot size={24} />
          </div>

          <span>AI Assistant</span>
        </div>

        <button
          className="new-chat-button"
          onClick={handleNewChat}
        >
          <Plus size={18} />
          New conversation
        </button>

        <div className="sidebar__footer">
          <Sparkles size={16} />
          <span>Powered by AI</span>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>AI Assistant</h1>
            <p>Your personal AI companion</p>
          </div>

          <div className="header__status">
            <span />
            Online
          </div>
        </header>

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
        />

        <div className="chat-footer">
          {error && (
            <div className="error-message" role="alert">
              {error}
              <button onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}

          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
          />

          <p>
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;