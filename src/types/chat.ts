export type Role = "system" | "user" | "assistant";

export type MessageStatus = "sending" | "streaming" | "done" | "error";

export type ThemeMode = "light" | "dark";

export type LanguageMode = "en" | "zh-CN";

export type ModelProvider = "openai" | "deepseek" | "qwen" | "openrouter" | "custom";

export type ReasoningMode = "off" | "auto" | "low" | "medium" | "high" | "custom";

export type ReasoningParamType =
  | "none"
  | "reasoning_effort"
  | "enable_thinking"
  | "model_only"
  | "custom_json";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  reasoningContent?: string;
  createdAt: number;
  status?: MessageStatus;
  errorMessage?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ChatSettings {
  provider: ModelProvider;
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stream: boolean;
  saveApiKey: boolean;
  theme: ThemeMode;
  language: LanguageMode;
  reasoningMode: ReasoningMode;
  reasoningParamType: ReasoningParamType;
  reasoningBudgetTokens?: number;
  showReasoningContent: boolean;
  customExtraBodyJson: string;
  recentModels: string[];
  recentBaseURLs: string[];
}

export interface ModelTestResult {
  ok: boolean;
  message: string;
  models: string[];
}

export interface ChatCompletionChunk {
  content: string;
  reasoningContent: string;
}

export interface ChatCompletionResult {
  content: string;
  reasoningContent: string;
}

export type ChatMessageForRequest = Pick<ChatMessage, "role" | "content">;
