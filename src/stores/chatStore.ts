import { message as antMessage } from "antd";
import { create } from "zustand";
import { dedupeRecent } from "../config/modelRegistry";
import {
  createChatCompletion,
  createStreamingChatCompletion,
  normalizeBaseURL,
  testModelsEndpoint,
} from "../services/openaiClient";
import {
  clearAll,
  getActiveConversationId,
  getConversations,
  getSettings,
  saveActiveConversationId,
  saveConversations,
  saveSettings,
} from "../services/storage";
import type {
  ChatMessage,
  ChatMessageForRequest,
  ChatSettings,
  Conversation,
  ModelTestResult,
} from "../types/chat";
import { getReadableError, UserFacingError } from "../utils/error";
import { createId } from "../utils/id";

interface ChatState {
  settings: ChatSettings;
  conversations: Conversation[];
  activeConversationId?: string;
  isGenerating: boolean;
  currentAbortController?: AbortController;
  createConversation: () => string;
  deleteConversation: (conversationId: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  setActiveConversation: (conversationId: string) => void;
  updateSettings: (patch: Partial<ChatSettings>) => void;
  sendMessage: (content: string, options?: { replaceLastUser?: boolean }) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastAssistant: () => Promise<void>;
  editLastUserAndResend: (content: string) => Promise<void>;
  clearCurrentConversation: () => void;
  clearAllData: () => void;
  testConnection: () => Promise<ModelTestResult>;
}

const initialConversations = getConversations();
const initialActiveConversationId =
  getActiveConversationId() && initialConversations.some((item) => item.id === getActiveConversationId())
    ? getActiveConversationId()
    : initialConversations[0]?.id;

function createEmptyConversation(): Conversation {
  const now = Date.now();
  return {
    id: createId("conversation"),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function persistConversations(conversations: Conversation[], activeConversationId?: string) {
  saveConversations(conversations);
  saveActiveConversationId(activeConversationId);
}

function getActiveConversation(state: ChatState) {
  return state.conversations.find((item) => item.id === state.activeConversationId);
}

function upsertConversation(
  conversations: Conversation[],
  conversationId: string,
  updater: (conversation: Conversation) => Conversation,
) {
  return conversations.map((conversation) =>
    conversation.id === conversationId ? updater(conversation) : conversation,
  );
}

function buildMessagesForRequest(settings: ChatSettings, messages: ChatMessage[]): ChatMessageForRequest[] {
  const visibleMessages = messages
    .filter((message) => message.role !== "system" && message.status !== "error")
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  if (settings.systemPrompt.trim()) {
    return [{ role: "system", content: settings.systemPrompt.trim() }, ...visibleMessages];
  }

  return visibleMessages;
}

function validateSettings(settings: ChatSettings) {
  if (!settings.baseURL.trim()) {
    throw new UserFacingError("API Base URL 不能为空。");
  }
  if (!settings.apiKey.trim()) {
    throw new UserFacingError("API Key 不能为空。");
  }
  if (!settings.model.trim()) {
    throw new UserFacingError("Model Name 不能为空。");
  }
}

function appendOrReplaceUserMessage(
  conversation: Conversation,
  content: string,
  replaceLastUser: boolean,
) {
  const now = Date.now();
  const messages = [...conversation.messages];

  if (replaceLastUser) {
    const lastUserIndex = [...messages].reverse().findIndex((message) => message.role === "user");
    if (lastUserIndex >= 0) {
      const actualIndex = messages.length - 1 - lastUserIndex;
      messages.splice(actualIndex);
    }
  }

  const userMessage: ChatMessage = {
    id: createId("message"),
    role: "user",
    content,
    createdAt: now,
    status: "done",
  };

  const title =
    conversation.title === "New chat" && conversation.messages.length === 0
      ? content.trim().slice(0, 20) || conversation.title
      : conversation.title;

  return {
    ...conversation,
    title,
    updatedAt: now,
    messages: [
      ...messages,
      userMessage,
      {
        id: createId("message"),
        role: "assistant",
        content: "",
        reasoningContent: "",
        createdAt: now,
        status: "streaming",
      },
    ],
  } satisfies Conversation;
}

function updateAssistantMessage(
  conversation: Conversation,
  contentUpdater: (assistant: ChatMessage) => ChatMessage,
) {
  const messages = [...conversation.messages];
  const index = messages.length - 1;
  const current = messages[index];
  if (!current || current.role !== "assistant") {
    return conversation;
  }
  messages[index] = contentUpdater(current);
  return {
    ...conversation,
    updatedAt: Date.now(),
    messages,
  };
}

export const useChatStore = create<ChatState>((set, get) => ({
  settings: getSettings(),
  conversations: initialConversations,
  activeConversationId: initialActiveConversationId,
  isGenerating: false,
  currentAbortController: undefined,

  createConversation: () => {
    const conversation = createEmptyConversation();
    const conversations = [conversation, ...get().conversations];
    set({ conversations, activeConversationId: conversation.id });
    persistConversations(conversations, conversation.id);
    return conversation.id;
  },

  deleteConversation: (conversationId) => {
    const remaining = get().conversations.filter((conversation) => conversation.id !== conversationId);
    const nextActive =
      get().activeConversationId === conversationId ? remaining[0]?.id : get().activeConversationId;
    set({ conversations: remaining, activeConversationId: nextActive });
    persistConversations(remaining, nextActive);
  },

  renameConversation: (conversationId, title) => {
    const nextTitle = title.trim() || "Untitled chat";
    const conversations = upsertConversation(get().conversations, conversationId, (conversation) => ({
      ...conversation,
      title: nextTitle,
      updatedAt: Date.now(),
    }));
    set({ conversations });
    persistConversations(conversations, get().activeConversationId);
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId });
    saveActiveConversationId(conversationId);
  },

  updateSettings: (patch) => {
    const previous = get().settings;
    const normalizedPatch: Partial<ChatSettings> = { ...patch };

    if (typeof normalizedPatch.baseURL === "string") {
      normalizedPatch.baseURL = normalizeBaseURL(normalizedPatch.baseURL);
    }

    if (patch.saveApiKey === false) {
      normalizedPatch.apiKey = "";
    }

    const settings = { ...previous, ...normalizedPatch };
    set({ settings });
    saveSettings(settings);
    document.documentElement.dataset.theme = settings.theme;
  },

  sendMessage: async (content, options) => {
    const trimmed = content.trim();
    if (!trimmed || get().isGenerating) {
      return;
    }

    const stateBefore = get();
    const settings = {
      ...stateBefore.settings,
      baseURL: normalizeBaseURL(stateBefore.settings.baseURL),
    };

    let activeConversationId = stateBefore.activeConversationId;
    let conversations = stateBefore.conversations;
    if (!activeConversationId || !conversations.some((item) => item.id === activeConversationId)) {
      const conversation = createEmptyConversation();
      activeConversationId = conversation.id;
      conversations = [conversation, ...conversations];
    }

    const abortController = new AbortController();
    const updatedConversations = upsertConversation(
      conversations,
      activeConversationId,
      (conversation) => appendOrReplaceUserMessage(conversation, trimmed, Boolean(options?.replaceLastUser)),
    );

    const activeAfterAppend = updatedConversations.find((item) => item.id === activeConversationId);
    if (!activeAfterAppend) {
      return;
    }

    set({
      settings,
      conversations: updatedConversations,
      activeConversationId,
      isGenerating: true,
      currentAbortController: abortController,
    });
    saveSettings(settings);
    persistConversations(updatedConversations, activeConversationId);

    try {
      validateSettings(settings);
      const requestMessages = buildMessagesForRequest(settings, activeAfterAppend.messages).filter(
        (message) => message.content.trim(),
      );

      const finalizeAssistant = (assistant: ChatMessage): ChatMessage => ({
        ...assistant,
        content: assistant.content || "API 返回空内容。",
        status: "done",
      });

      if (settings.stream) {
        await createStreamingChatCompletion(
          settings,
          requestMessages,
          (chunk) => {
            const currentState = get();
            if (!activeConversationId) {
              return;
            }
            const next = upsertConversation(
              currentState.conversations,
              activeConversationId,
              (conversation) =>
                updateAssistantMessage(conversation, (assistant) => ({
                  ...assistant,
                  content: assistant.content + chunk.content,
                  reasoningContent: `${assistant.reasoningContent ?? ""}${chunk.reasoningContent}`,
                  status: "streaming",
                })),
            );
            set({ conversations: next });
            persistConversations(next, activeConversationId);
          },
          abortController.signal,
        );

        const currentState = get();
        const next = upsertConversation(currentState.conversations, activeConversationId, (conversation) =>
          updateAssistantMessage(conversation, finalizeAssistant),
        );
        set({ conversations: next });
        persistConversations(next, activeConversationId);
      } else {
        const result = await createChatCompletion(settings, requestMessages, abortController.signal);
        const next = upsertConversation(get().conversations, activeConversationId, (conversation) =>
          updateAssistantMessage(conversation, (assistant) => ({
            ...assistant,
            content: result.content,
            reasoningContent: result.reasoningContent,
            status: "done",
          })),
        );
        set({ conversations: next });
        persistConversations(next, activeConversationId);
      }

      const nextSettings: ChatSettings = {
        ...settings,
        recentModels: dedupeRecent(settings.model, settings.recentModels),
        recentBaseURLs: dedupeRecent(settings.baseURL, settings.recentBaseURLs),
      };
      set({ settings: nextSettings });
      saveSettings(nextSettings);
    } catch (error) {
      const message = getReadableError(error);
      const wasAbort = error instanceof DOMException && error.name === "AbortError";
      const next = upsertConversation(get().conversations, activeConversationId, (conversation) =>
        updateAssistantMessage(conversation, (assistant) => ({
          ...assistant,
          content: assistant.content || (wasAbort ? "已停止生成。" : ""),
          status: wasAbort ? "done" : "error",
          errorMessage: wasAbort ? undefined : message,
        })),
      );
      set({ conversations: next });
      persistConversations(next, activeConversationId);
      if (!wasAbort) {
        antMessage.error(message);
      }
    } finally {
      set({ isGenerating: false, currentAbortController: undefined });
    }
  },

  stopGeneration: () => {
    get().currentAbortController?.abort();
  },

  regenerateLastAssistant: async () => {
    const active = getActiveConversation(get());
    if (!active || get().isGenerating) {
      return;
    }
    const lastAssistantIndex = [...active.messages]
      .reverse()
      .findIndex((message) => message.role === "assistant");
    if (lastAssistantIndex < 0) {
      return;
    }
    const actualIndex = active.messages.length - 1 - lastAssistantIndex;
    const lastUser = [...active.messages.slice(0, actualIndex)]
      .reverse()
      .find((message) => message.role === "user");
    if (!lastUser) {
      return;
    }

    const conversations = upsertConversation(get().conversations, active.id, (conversation) => ({
      ...conversation,
      messages: conversation.messages.slice(0, actualIndex - 1),
    }));
    set({ conversations });
    persistConversations(conversations, active.id);
    await get().sendMessage(lastUser.content);
  },

  editLastUserAndResend: async (content) => {
    const active = getActiveConversation(get());
    if (!active || get().isGenerating) {
      return;
    }
    await get().sendMessage(content, { replaceLastUser: true });
  },

  clearCurrentConversation: () => {
    const activeConversationId = get().activeConversationId;
    if (!activeConversationId) {
      return;
    }
    const conversations = upsertConversation(get().conversations, activeConversationId, (conversation) => ({
      ...conversation,
      messages: [],
      updatedAt: Date.now(),
    }));
    set({ conversations });
    persistConversations(conversations, activeConversationId);
  },

  clearAllData: () => {
    clearAll();
    set({
      settings: getSettings(),
      conversations: [],
      activeConversationId: undefined,
      isGenerating: false,
      currentAbortController: undefined,
    });
  },

  testConnection: async () => {
    try {
      const result = await testModelsEndpoint(get().settings);
      antMessage.success(result.message);
      return result;
    } catch (error) {
      const message =
        `${getReadableError(error)} 可能原因：API 不支持 /models、CORS 限制、API Key 无效或 Base URL 错误。/models 失败不影响你继续尝试 chat completions。`;
      antMessage.error(message);
      return {
        ok: false,
        message,
        models: [],
      };
    }
  },
}));
