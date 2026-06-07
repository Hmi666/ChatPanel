const netclipHost = "ai.netclip.cloud";

export function normalizeBaseURL(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const withoutEndpointPath = trimmed
    .replace(/\/(?:v1\/)?chat\/completions\/?$/i, "")
    .replace(/\/(?:v1\/)?models\/?$/i, "");
  const normalized = withoutEndpointPath.replace(/\/+$/g, "");

  try {
    const url = new URL(normalized);
    if (url.hostname === netclipHost && !url.pathname.replace(/\/+$/g, "").endsWith("/v1")) {
      url.pathname = `${url.pathname.replace(/\/+$/g, "")}/v1`;
      return url.toString().replace(/\/+$/g, "");
    }
  } catch {
    // Relative base URLs such as /api/openai are expected here.
  }

  return normalized;
}

export function joinEndpoint(baseURL: string, endpoint: string) {
  return `${normalizeBaseURL(baseURL)}/${endpoint.replace(/^\/+/g, "")}`;
}
