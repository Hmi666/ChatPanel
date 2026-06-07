import type {
  ChatSettings,
  ModelProvider,
  ReasoningParamType,
} from "../types/chat";

export type { ModelProvider, ReasoningMode, ReasoningParamType } from "../types/chat";

export interface ModelPreset {
  id: string;
  label: string;
  provider: ModelProvider;
  defaultBaseURL?: string;
  supportsReasoning?: boolean;
  supportsStreaming?: boolean;
  supportsTemperature?: boolean;
  supportsMaxTokens?: boolean;
  reasoningParamType?: ReasoningParamType;
  description?: string;
}

export interface ProviderPreset {
  provider: ModelProvider;
  label: string;
  defaultBaseURL?: string;
  models: string[];
}

export const defaultSettings: ChatSettings = {
  provider: "openai",
  baseURL: "/api/openai",
  apiKey: "",
  model: "gpt-4o-mini",
  systemPrompt: "",
  temperature: 0.7,
  maxTokens: 2048,
  stream: true,
  saveApiKey: false,
  theme: "light",
  reasoningMode: "off",
  reasoningParamType: "none",
  reasoningBudgetTokens: undefined,
  showReasoningContent: false,
  customExtraBodyJson: "",
  recentModels: [],
  recentBaseURLs: [],
};

export const providerPresets: ProviderPreset[] = [
  {
    provider: "openai",
    label: "OpenAI Compatible",
    defaultBaseURL: "/api/openai",
    models: ["gpt-5", "gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini"],
  },
  {
    provider: "deepseek",
    label: "DeepSeek Compatible",
    defaultBaseURL: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-reasoner"],
  },
  {
    provider: "qwen",
    label: "Qwen Compatible",
    defaultBaseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: ["qwen-plus", "qwen-turbo", "qwen-max", "qwen3-coder-plus"],
  },
  {
    provider: "openrouter",
    label: "OpenRouter Compatible",
    defaultBaseURL: "https://openrouter.ai/api/v1",
    models: [
      "openai/gpt-4o-mini",
      "openai/gpt-4o",
      "deepseek/deepseek-chat",
      "deepseek/deepseek-r1",
      "qwen/qwen-2.5-72b-instruct",
    ],
  },
  {
    provider: "custom",
    label: "Custom",
    models: [],
  },
];

export const modelPresets: ModelPreset[] = providerPresets.flatMap((provider) =>
  provider.models.map((model) => {
    const isReasoning =
      model.includes("reasoner") ||
      model.includes("deepseek-r1") ||
      model.includes("qwen3");

    return {
      id: model,
      label: model,
      provider: provider.provider,
      defaultBaseURL: provider.defaultBaseURL,
      supportsReasoning: isReasoning,
      supportsStreaming: true,
      supportsTemperature: !model.includes("reasoner"),
      supportsMaxTokens: true,
      reasoningParamType: model.includes("qwen3")
        ? "enable_thinking"
        : model.includes("reasoner") || model.includes("deepseek-r1")
          ? "model_only"
          : "none",
      description: isReasoning
        ? "Reasoning-capable preset. Provider-specific parameters may vary."
        : "General chat model preset.",
    };
  }),
);

export const customModelPreset: ModelPreset = {
  id: "custom",
  label: "Custom model",
  provider: "custom",
  supportsReasoning: false,
  supportsStreaming: true,
  supportsTemperature: true,
  supportsMaxTokens: true,
  reasoningParamType: "none",
  description: "Free-form OpenAI-compatible model name.",
};

export function getProviderPreset(provider: ModelProvider) {
  return providerPresets.find((item) => item.provider === provider);
}

export function getModelPreset(model: string, provider?: ModelProvider): ModelPreset {
  const preset = modelPresets.find(
    (item) => item.id === model && (!provider || item.provider === provider),
  );
  return preset ?? { ...customModelPreset, id: model || "custom", label: model || "Custom model" };
}

export function getProviderLabel(provider: ModelProvider) {
  return getProviderPreset(provider)?.label ?? "Custom";
}

export function getGroupedModelOptions(recentModels: string[] = []) {
  return [
    ...(recentModels.length
      ? [
          {
            label: "Recent",
            options: recentModels.map((model) => ({ value: model, label: model })),
          },
        ]
      : []),
    ...providerPresets
      .filter((preset) => preset.models.length > 0)
      .map((preset) => ({
        label: preset.label,
        options: preset.models.map((model) => ({ value: model, label: model })),
      })),
  ];
}

export function dedupeRecent(value: string, values: string[], max = 8) {
  const trimmed = value.trim();
  if (!trimmed) {
    return values.slice(0, max);
  }
  return [trimmed, ...values.filter((item) => item !== trimmed)].slice(0, max);
}
