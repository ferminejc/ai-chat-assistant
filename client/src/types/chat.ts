export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export interface ChatRequest {
  messages: {
    role: ChatRole;
    content: string;
  }[];
}

export interface ChatResponse {
  message: string;
}