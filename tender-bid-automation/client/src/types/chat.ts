export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  sources?: string[];
  meta?: Record<string, any>;
}

export interface ChatHistoryItem {
  sender: "user" | "assistant" | "system";
  text: string;
}
