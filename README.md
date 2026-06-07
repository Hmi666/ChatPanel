# Local Chat Panel

Local Chat Panel is a local-first AI chat panel built with React, Vite, TypeScript, Ant Design, Ant Design X, Zustand, Markdown rendering libraries, and a narrow Node proxy server for Docker deployment.

The app does not include a database, login system, analytics SDK, or cloud sync. In strict static mode, requests can be sent directly from the browser to the OpenAI-compatible API Base URL configured by the user. Docker deployment uses a Node same-origin proxy so browser CORS preflight failures do not block chat requests.

## Features

- Conversation list, create, rename, delete, and active conversation persistence.
- OpenAI-compatible `/chat/completions` requests.
- Streaming responses via `fetch`, `ReadableStream`, `TextDecoder`, and SSE `data:` parsing.
- Non-streaming responses.
- Stop generation with `AbortController`.
- Markdown rendering with tables, lists, code blocks, and code copy.
- Reasoning content capture from `reasoning_content`, `reasoning`, or `thinking`.
- Configurable provider, Base URL, API key, model, system prompt, temperature, max tokens, stream mode, and reasoning mode.
- Local storage for conversations, active conversation, settings, recent models, and recent Base URLs.
- API Key is not saved by default. It is written to `localStorage` only after enabling "Save API Key to localStorage".
- Light and dark themes.
- Responsive layout with desktop sidebar and mobile drawer.
- Docker deployment with Node static hosting and same-origin API proxy.

## Local Run

```bash
npm install
npm run dev
```

## Type Check

```bash
npm run typecheck
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Static Deployment

`npm run build` outputs static files to `dist/`. Deploy that folder to any static hosting service, including Nginx, Cloudflare Pages, GitHub Pages, Vercel static hosting, Netlify, or another static file server.

No server-side environment variable is required for API configuration. In pure frontend mode, API settings mainly come from the in-page Settings drawer.

## Docker Deployment

This Docker setup does not run `npm run build` inside the Docker image. It serves the already-built `dist/` directory with a small Node server, which is friendlier to low-spec machines.

Before building the Docker image, make sure `dist/` exists and is committed:

```bash
npm install
npm run build
git add dist
```

Build and start with Docker Compose:

```bash
docker compose up -d
```

The container serves the app with Node:

- Host port: `10002`
- Container port: `6001`
- URL: `http://localhost:10002`

### Same-Origin API Proxy

Docker deployment exposes a same-origin proxy path:

```text
/api/openai/
```

By default, `docker-compose.yml` forwards that path to:

```text
https://ai.netclip.cloud
```

Use this Base URL in the app Settings drawer to avoid browser CORS failures:

```text
/api/openai
```

If the browser Network tab still shows direct requests to `https://ai.netclip.cloud/...`, the page is still using an old saved Base URL. Open Settings and set API Base URL to `/api/openai`, or clear all local data and refresh.

Then chat requests are sent by the browser to:

```text
/api/openai/chat/completions
```

Node forwards them to:

```text
https://ai.netclip.cloud/chat/completions
```

To change the upstream API, edit `AI_API_BASE_URL` in `docker-compose.yml`. Use a base URL without a trailing slash.

Stop the service:

```bash
docker compose down
```

## API Base URL Rules

Enter the OpenAI-compatible base URL, for example:

- `https://api.openai.com/v1`
- `https://api.deepseek.com/v1`
- `https://dashscope.aliyuncs.com/compatible-mode/v1`
- `https://openrouter.ai/api/v1`

The app normalizes trailing slashes and prevents duplicate `/chat/completions` paths. The actual chat endpoint is:

```text
${baseURL}/chat/completions
```

The models test endpoint is:

```text
${baseURL}/models
```

`/models` test failure does not mean chat completions are definitely unavailable. Some providers do not expose `/models`, or block it with CORS while still supporting chat requests.

## CORS Limitations

Pure frontend mode cannot bypass browser CORS restrictions.

If the configured API does not allow browser cross-origin requests, the browser will block the call before the app can read the response. Use an API endpoint that supports browser CORS, or use a proxy service that you trust and operate separately.

Docker deployment includes a Node same-origin proxy at `/api/openai/`. Use `/api/openai` as the in-page API Base URL to avoid browser CORS failures. The deployed Node container relays API traffic to `AI_API_BASE_URL`.

## Privacy

All conversations and settings are stored in the current browser only.

API Key behavior:

- Default: API Key is kept only in current page memory.
- If "Save API Key to localStorage" is enabled, the API Key is saved in this browser's `localStorage`.
- If saving is disabled, the app removes the saved API Key from stored settings.
- Do not save keys on public or shared computers.

The app does not collect, upload, sync, or relay API keys or chat content.

## Static Mode Without Backend

For personal local-first use, the browser can directly call an OpenAI-compatible API if that API supports browser CORS. The app only needs static assets, local state, and browser storage.

If the API does not support browser CORS, use the Docker Node proxy mode.

## When A Backend Is Required

A backend is required if you need:

- Hidden shared API keys
- Account system
- Cloud synchronization
- Billing
- RAG knowledge base
- File upload and parsing
- Central audit logging
- CORS mediation through a service you operate

## Model Selection

Provider presets are only frontend shortcuts. They can fill a recommended Base URL and common model names, but they do not lock the user to that provider. You can manually edit Base URL, API Key, and Model Name at any time.

Built-in provider presets include OpenAI Compatible, DeepSeek Compatible, Qwen Compatible, OpenRouter Compatible, and Custom.

Recent models and Base URLs are saved locally for faster reuse.

## Models And Reasoning Modes

This project uses OpenAI-compatible chat completions format by default.

Different providers use different reasoning parameters. Reasoning mode is configurable because there is no single universal OpenAI-compatible reasoning field.

- If a provider distinguishes normal and reasoning models through the model name itself, such as `deepseek-chat` and `deepseek-reasoner`, choose the corresponding model and keep reasoning mode `off` or use `model_only`.
- If a provider supports `reasoning_effort`, choose `low`, `medium`, or `high`.
- If a provider supports `enable_thinking`, choose `enable_thinking` as the reasoning parameter type.
- If a provider uses non-standard parameters, use Custom Extra Body JSON.
- Pure frontend mode cannot bypass CORS.
- `/models` test failure does not mean chat completions are definitely unavailable.

## Custom Extra Body JSON

Custom Extra Body JSON must be a JSON object, for example:

```json
{
  "top_p": 0.9,
  "presence_penalty": 0.1
}
```

When enabled through `custom` reasoning mode or `custom_json` parameter type, the custom object is merged into the request body with the highest priority. Invalid JSON is shown as an error and the request is not sent.

## Main Files

- `src/services/openaiClient.ts`: URL normalization, request body construction, streaming and non-streaming chat requests, SSE parsing, `/models` test.
- `src/services/storage.ts`: localStorage wrapper, storage version, safe JSON parsing, API Key save rules.
- `src/stores/chatStore.ts`: global state, conversation operations, send/stop/regenerate/edit logic.
- `src/config/modelRegistry.ts`: provider presets, model presets, capabilities, recent model helpers.
- `src/components/`: app layout, sidebar, header, message list, sender, settings drawer, Markdown renderer, empty guide.
