export function normalizeBaseURL(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const withoutChatPath = trimmed.replace(/\/chat\/completions\/?$/i, "");
  return withoutChatPath.replace(/\/+$/g, "");
}

export function joinEndpoint(baseURL: string, endpoint: string) {
  return `${normalizeBaseURL(baseURL)}/${endpoint.replace(/^\/+/g, "")}`;
}
