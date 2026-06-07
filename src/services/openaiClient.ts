import { getModelPreset } from "../config/modelRegistry";
import i18n from "../i18n";
import type {
  ChatCompletionChunk,
  ChatCompletionResult,
  ChatMessageForRequest,
  ChatSettings,
  ModelTestResult,
} from "../types/chat";
import { getHttpErrorMessage, UserFacingError } from "../utils/error";
import { joinEndpoint, normalizeBaseURL } from "../utils/url";

type JsonRecord = Record<string, unknown>;

interface OpenAIChoiceDelta {
  content?: string;
  reasoning_content?: string;
  reasoning?: string;
  thinking?: string;
}

interface OpenAIStreamChunk {
  choices?: Array<{
    delta?: OpenAIChoiceDelta;
  }>;
}

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
      reasoning_content?: string;
      reasoning?: string;
      thinking?: string;
    };
  }>;
}

interface ModelsResponse {
  data?: Array<{ id?: string } | string>;
}

type OpenAIMessage = NonNullable<NonNullable<OpenAIChatResponse["choices"]>[number]["message"]>;

export { normalizeBaseURL };

function buildAuthHeaders(settings: ChatSettings, includeContentType = false) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${settings.apiKey}`,
    "X-API-Key": settings.apiKey,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function buildChatCompletionsURL(baseURL: string) {
  return joinEndpoint(baseURL, "chat/completions");
}

export function buildModelsURL(baseURL: string) {
  return joinEndpoint(baseURL, "models");
}

function parseCustomExtraBody(value: string): JsonRecord {
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    throw new UserFacingError(
      i18n.t("errors.customJsonParseFailed", {
        message: error instanceof Error ? error.message : i18n.t("errors.invalidJson"),
      }),
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new UserFacingError(i18n.t("errors.customJsonMustBeObject"));
  }

  return parsed as JsonRecord;
}

export function buildRequestBody(settings: ChatSettings, messages: ChatMessageForRequest[]) {
  const preset = getModelPreset(settings.model, settings.provider);
  const requestBody: JsonRecord = {
    model: settings.model,
    messages,
    stream: settings.stream,
  };

  if (typeof settings.temperature === "number" && preset.supportsTemperature !== false) {
    requestBody.temperature = settings.temperature;
  }

  if (typeof settings.maxTokens === "number" && preset.supportsMaxTokens !== false) {
    requestBody.max_tokens = settings.maxTokens;
  }

  const requestedReasoningParam =
    settings.reasoningMode === "auto" && settings.reasoningParamType === "none"
      ? preset.reasoningParamType ?? "none"
      : settings.reasoningParamType;

  if (settings.reasoningMode !== "off") {
    if (requestedReasoningParam === "reasoning_effort") {
      requestBody.reasoning_effort =
        settings.reasoningMode === "auto" || settings.reasoningMode === "custom"
          ? "medium"
          : settings.reasoningMode;
    }

    if (
      requestedReasoningParam === "enable_thinking" &&
      ["auto", "low", "medium", "high", "custom"].includes(settings.reasoningMode)
    ) {
      requestBody.enable_thinking = true;
    }

    if (typeof settings.reasoningBudgetTokens === "number") {
      requestBody.reasoning_budget_tokens = settings.reasoningBudgetTokens;
    }
  }

  if (settings.reasoningMode === "custom" || requestedReasoningParam === "custom_json") {
    return {
      ...requestBody,
      ...parseCustomExtraBody(settings.customExtraBodyJson),
    };
  }

  return requestBody;
}

function extractReasoning(source?: OpenAIChoiceDelta | OpenAIMessage) {
  return source?.reasoning_content ?? source?.reasoning ?? source?.thinking ?? "";
}

async function assertResponse(response: Response) {
  if (response.ok) {
    return;
  }

  let bodyText = "";
  try {
    bodyText = await response.text();
  } catch {
    bodyText = "";
  }
  throw new UserFacingError(getHttpErrorMessage(response.status, bodyText));
}

export async function createChatCompletion(
  settings: ChatSettings,
  messages: ChatMessageForRequest[],
  signal?: AbortSignal,
): Promise<ChatCompletionResult> {
  const response = await fetch(buildChatCompletionsURL(settings.baseURL), {
    method: "POST",
    headers: buildAuthHeaders(settings, true),
    body: JSON.stringify(buildRequestBody({ ...settings, stream: false }, messages)),
    signal,
  });

  await assertResponse(response);
  const json = (await response.json()) as OpenAIChatResponse;
  const message = json.choices?.[0]?.message;
  const content = message?.content ?? "";
  const reasoningContent = extractReasoning(message);

  if (!content && !reasoningContent) {
    throw new UserFacingError(i18n.t("errors.apiEmptyContent"));
  }

  return { content, reasoningContent };
}

export async function parseSSEStream(
  response: Response,
  onChunk: (chunk: ChatCompletionChunk) => void,
) {
  if (!response.body) {
    throw new UserFacingError(i18n.t("errors.readableStreamUnsupported"));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) {
        continue;
      }

      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") {
        return;
      }

      try {
        const json = JSON.parse(payload) as OpenAIStreamChunk;
        const delta = json.choices?.[0]?.delta;
        onChunk({
          content: delta?.content ?? "",
          reasoningContent: extractReasoning(delta),
        });
      } catch (error) {
        throw new UserFacingError(
          i18n.t("errors.sseParseFailed", {
            message: error instanceof Error ? error.message : i18n.t("errors.invalidSse"),
          }),
        );
      }
    }
  }
}

export async function createStreamingChatCompletion(
  settings: ChatSettings,
  messages: ChatMessageForRequest[],
  onChunk: (chunk: ChatCompletionChunk) => void,
  signal?: AbortSignal,
) {
  const response = await fetch(buildChatCompletionsURL(settings.baseURL), {
    method: "POST",
    headers: buildAuthHeaders(settings, true),
    body: JSON.stringify(buildRequestBody({ ...settings, stream: true }, messages)),
    signal,
  });

  await assertResponse(response);
  await parseSSEStream(response, onChunk);
}

export async function testModelsEndpoint(settings: ChatSettings): Promise<ModelTestResult> {
  if (!settings.baseURL.trim()) {
    throw new UserFacingError(i18n.t("errors.apiBaseUrlRequired"));
  }
  if (!settings.apiKey.trim()) {
    throw new UserFacingError(i18n.t("errors.apiKeyRequired"));
  }

  const response = await fetch(buildModelsURL(settings.baseURL), {
    method: "GET",
    headers: buildAuthHeaders(settings),
  });

  await assertResponse(response);
  const json = (await response.json()) as ModelsResponse;
  const models =
    json.data
      ?.map((model) => (typeof model === "string" ? model : model.id))
      .filter((id): id is string => Boolean(id)) ?? [];

  return {
    ok: true,
    message: models.length
      ? i18n.t("errors.modelsFound", { count: models.length })
      : i18n.t("errors.modelsEmpty"),
    models,
  };
}
