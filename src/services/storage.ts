import { defaultSettings } from "../config/modelRegistry";
import type { ChatSettings, Conversation } from "../types/chat";

const STORAGE_VERSION = 1;
const KEYS = {
  version: "local-chat-panel:storageVersion",
  settings: "local-chat-panel:settings",
  conversations: "local-chat-panel:conversations",
  activeConversationId: "local-chat-panel:activeConversationId",
};

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function ensureVersion() {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  try {
    const version = Number(storage.getItem(KEYS.version) ?? "0");
    if (version !== STORAGE_VERSION) {
      storage.setItem(KEYS.version, String(STORAGE_VERSION));
    }
  } catch {
    // localStorage can be unavailable in private or locked-down contexts.
  }
}

export function getSettings(): ChatSettings {
  ensureVersion();
  const storage = getLocalStorage();
  if (!storage) {
    return defaultSettings;
  }

  const stored = safeJsonParse<Partial<ChatSettings>>(storage.getItem(KEYS.settings), {});
  const merged: ChatSettings = {
    ...defaultSettings,
    ...stored,
    apiKey: stored.saveApiKey ? stored.apiKey ?? "" : "",
    recentModels: Array.isArray(stored.recentModels) ? stored.recentModels : [],
    recentBaseURLs: Array.isArray(stored.recentBaseURLs) ? stored.recentBaseURLs : [],
  };

  return merged;
}

export function saveSettings(settings: ChatSettings) {
  ensureVersion();
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    const settingsToSave: ChatSettings = {
      ...settings,
      apiKey: settings.saveApiKey ? settings.apiKey : "",
    };
    storage.setItem(KEYS.settings, JSON.stringify(settingsToSave));
  } catch {
    // Ignore storage quota and privacy-mode failures.
  }
}

export function getConversations(): Conversation[] {
  ensureVersion();
  const storage = getLocalStorage();
  if (!storage) {
    return [];
  }
  const value = safeJsonParse<Conversation[]>(storage.getItem(KEYS.conversations), []);
  return Array.isArray(value) ? value : [];
}

export function saveConversations(conversations: Conversation[]) {
  ensureVersion();
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(KEYS.conversations, JSON.stringify(conversations));
  } catch {
    // Ignore storage quota failures.
  }
}

export function getActiveConversationId() {
  ensureVersion();
  return getLocalStorage()?.getItem(KEYS.activeConversationId) ?? undefined;
}

export function saveActiveConversationId(conversationId?: string) {
  ensureVersion();
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  try {
    if (conversationId) {
      storage.setItem(KEYS.activeConversationId, conversationId);
    } else {
      storage.removeItem(KEYS.activeConversationId);
    }
  } catch {
    // Ignore storage failures.
  }
}

export function clearAll() {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  try {
    Object.values(KEYS).forEach((key) => storage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
}
