/goal

你是一个资深前端架构师、React 工程师和 AI Chat 产品工程师。请在当前空目录中从 0 创建并实现一个完整可运行的项目：local-chat-panel。

项目目标：
实现一个“纯前端本地化 AI Chat 面板”，使用 React + Vite + TypeScript + Ant Design + Ant Design X。项目不能依赖任何后端服务，不能创建后端接口，不能使用数据库，不能使用服务端环境变量保存 API Key。最终必须可以通过 npm run build 构建为纯静态文件，并可部署到 Nginx、Cloudflare Pages、GitHub Pages、Vercel 静态站点或任意静态站点服务。

核心定位：
这是一个本地优先的 AI Chat 面板。用户打开网页后，在浏览器页面中自行填写：
- API Base URL
- API Key
- Model Name
- Provider
- System Prompt
- Temperature
- Max Tokens
- 是否启用流式输出
- 推理模式
- 推理参数类型
- 自定义额外请求体 JSON
- 是否保存 API Key 到本地

所有配置、会话和聊天记录都保存在当前浏览器本地。项目本身不收集、不上传、不中转用户 API Key 和聊天内容。

必须持续工作，直到满足以下验收条件：
1. npm install 成功。
2. npm run typecheck 成功。
3. npm run build 成功。
4. TypeScript 无构建错误。
5. 页面可以通过 npm run dev 正常启动。
6. 实现完整聊天界面、会话列表、设置面板、本地存储、模型选择、推理模式、OpenAI-compatible API 请求、流式输出、停止生成、Markdown 渲染。
7. 不存在后端服务、API Route、Express、Koa、Fastify、NestJS、Spring Boot、Cloudflare Worker 代理等任何服务端代码。
8. README.md 完整说明运行、构建、部署、CORS 限制、隐私说明、模型选择和推理模式说明。
9. 最终输出确认 npm run build 是否通过。

在开始前：
1. 先规划项目结构。
2. 然后直接执行实现。
3. 实现过程中如果 Ant Design X 组件 API 不确定，必须通过查看已安装依赖的类型定义、README 或 node_modules 中的声明文件来确认。
4. 不要凭空猜测 Ant Design X 的组件 API。
5. 如果构建失败，必须阅读错误并继续修改，直到构建成功。
6. 如果某个依赖版本 API 与预期不一致，以当前安装版本的类型定义为准进行适配。

技术栈要求：
- React
- TypeScript
- Vite
- Ant Design
- Ant Design X
- Zustand
- react-markdown
- remark-gfm
- rehype-highlight
- 普通 CSS 或 CSS Modules

禁止事项：
1. 禁止创建后端服务。
2. 禁止使用 Next.js。
3. 禁止使用 Next.js API Route。
4. 禁止使用 Express、Koa、Fastify、NestJS、Spring Boot。
5. 禁止创建 Cloudflare Worker 代理。
6. 禁止把 API Key 写死在代码里。
7. 禁止使用服务端环境变量保存 API Key。
8. 禁止接入数据库。
9. 禁止接入用户登录、注册、权限系统。
10. 禁止接入第三方统计、广告、埋点 SDK。
11. 禁止把聊天记录上传到任何服务器。
12. 禁止为了规避 CORS 内置代理服务。
13. 禁止把纯前端项目变成 BFF 或中转 API 项目。

基础架构：
用户浏览器
  -> React 静态页面
  -> 用户填写的 OpenAI-compatible API Base URL
  -> /chat/completions

API 请求规则：
1. 用户填写 API Base URL，例如：
   - https://api.openai.com/v1
   - https://api.deepseek.com/v1
   - https://dashscope.aliyuncs.com/compatible-mode/v1
   - https://openrouter.ai/api/v1
   - https://api.example.com/v1
2. 实际请求地址应为：
   ${baseURL}/chat/completions
3. normalizeBaseURL 必须处理：
   - 去掉末尾多余 /
   - 如果用户误填 /chat/completions，则自动截断，避免重复拼接
   - 如果用户误填 /v1/，自动规范化为 /v1
4. 请求 Header：
   Authorization: Bearer ${apiKey}
   Content-Type: application/json
5. 请求体兼容 OpenAI chat completions：
   {
     model,
     messages,
     temperature,
     max_tokens,
     stream
   }

项目结构必须如下：

src/
├─ main.tsx
├─ App.tsx
├─ config/
│  └─ modelRegistry.ts
├─ types/
│  └─ chat.ts
├─ services/
│  ├─ openaiClient.ts
│  └─ storage.ts
├─ stores/
│  └─ chatStore.ts
├─ components/
│  ├─ AppLayout.tsx
│  ├─ ConversationSidebar.tsx
│  ├─ ChatHeader.tsx
│  ├─ ChatMessages.tsx
│  ├─ ChatInput.tsx
│  ├─ SettingsDrawer.tsx
│  ├─ MarkdownMessage.tsx
│  └─ EmptyGuide.tsx
├─ utils/
│  ├─ id.ts
│  ├─ url.ts
│  └─ error.ts
└─ styles/
   └─ global.css

页面布局要求：
整体为 100vh 应用布局。

桌面端：
1. 左侧会话栏，宽度约 280px。
2. 中间聊天区域，最大内容宽度约 900px。
3. 设置面板使用 Drawer。
4. 顶部显示当前模型名、Provider、设置按钮、主题切换按钮。

移动端：
1. 小于 768px 时，左侧会话栏改为抽屉。
2. 聊天输入框固定在底部。
3. 设置面板使用 Drawer。
4. 顶部显示菜单按钮。

UI 风格：
1. 简洁、现代、专业。
2. 类似轻量版 ChatGPT / LobeChat。
3. 不要花哨渐变。
4. 有足够留白。
5. 支持亮色 / 暗色主题切换。
6. 暗色主题需要整体可读。
7. 页面不要显得廉价。
8. 禁止使用蓝紫色渐变
9. 企业级简约白色风格/

Ant Design X 使用要求：
1. 使用 Ant Design X 的 Bubble 或 Bubble.List 实现消息展示。
2. 使用 Ant Design X 的 Sender 实现输入区域。
3. 使用 Ant Design X 的 Conversations 实现会话列表。
4. 如果某些 API 与当前安装版本不一致，必须以本地 node_modules 的类型定义为准进行适配。
5. 不要因为组件 API 不确定就绕开 Ant Design X，除非构建确实无法通过；若绕开，必须保留 Ant Design X 的核心使用。

页面功能一：会话管理
1. 新建会话。
2. 删除会话，删除前二次确认。
3. 重命名会话。
4. 当前会话高亮。
5. 自动保存 activeConversationId。
6. 发送第一条用户消息后，用用户消息前 20 个字符自动生成会话标题。
7. 支持清空当前会话消息。
8. 支持复制单条消息。
9. 支持重新生成最后一条 assistant 回复。
10. 支持编辑最后一条 user 消息并重新发送。

会话数据结构：

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

消息数据结构：

interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  reasoningContent?: string;
  createdAt: number;
  status?: "sending" | "streaming" | "done" | "error";
  errorMessage?: string;
}

页面功能二：聊天功能
1. 支持多轮对话。
2. 发送时把当前会话历史作为 messages 传给 API。
3. 如果设置了 System Prompt，则作为第一条 system 消息传入，但不要重复显示在可见消息列表中。
4. 支持流式响应。
5. 支持非流式响应。
6. 流式响应需要用 fetch + ReadableStream + TextDecoder 解析 SSE。
7. 需要逐行解析 data:。
8. 遇到 [DONE] 停止。
9. 提取 choices[0].delta.content 并实时追加到 assistant 消息。
10. 同时尝试提取 choices[0].delta.reasoning_content、choices[0].delta.reasoning、choices[0].delta.thinking。
11. 支持 AbortController 停止生成。
12. AI 回复过程中，发送按钮变成停止按钮。
13. 请求失败时，assistant 消息显示错误状态和错误信息。
14. 用户主动停止生成时，消息状态应正常结束或显示“已停止生成”，不要当作严重错误。

页面功能三：设置面板
SettingsDrawer 中必须包含：

基础设置：
1. Provider Select
2. API Base URL Input
3. API Key Input.Password
4. Model AutoComplete
5. System Prompt TextArea
6. 保存 API Key 到本地 Switch
7. Theme Select：light / dark

生成参数：
1. Temperature Slider，范围 0 到 2
2. Max Tokens InputNumber
3. Stream Switch

推理参数：
1. Reasoning Mode Select
   - off
   - auto
   - low
   - medium
   - high
   - custom
2. Reasoning Param Type Select
   - none
   - reasoning_effort
   - enable_thinking
   - model_only
   - custom_json
3. Reasoning Budget Tokens InputNumber
4. Show Reasoning Content Switch
5. Custom Extra Body JSON TextArea

操作区：
1. 测试连接按钮
2. 清空所有本地数据按钮
3. 隐私说明

默认配置：

const defaultSettings = {
  provider: "openai",
  baseURL: "https://api.openai.com/v1",
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
  recentBaseURLs: []
};

页面功能四：模型选择
需要实现专业的模型选择与推理配置能力，不要只做一个简单的 model 输入框。

模型选择器要求：
1. 用户可以手动输入任意模型名。
2. 提供常用模型快捷选项，但不限制用户只能选择内置模型。
3. 支持按 Provider 分组展示模型。
4. Provider 只作为前端预设，不代表必须绑定固定 API。
5. 用户选择 Provider 预设时，可以自动填充推荐的 Base URL 和常用模型，但用户仍然可以自由修改。
6. 模型选择器支持搜索。
7. 最近使用过的模型需要保存到本地。
8. 最近使用过的 Base URL 也需要保存到本地。

内置 Provider 预设：

1. OpenAI Compatible
   - provider: openai
   - baseURL: https://api.openai.com/v1
   - models:
     - gpt-4o-mini
     - gpt-4o
     - gpt-4.1
     - gpt-4.1-mini

2. DeepSeek Compatible
   - provider: deepseek
   - baseURL: https://api.deepseek.com/v1
   - models:
     - deepseek-chat
     - deepseek-reasoner

3. Qwen Compatible
   - provider: qwen
   - baseURL: https://dashscope.aliyuncs.com/compatible-mode/v1
   - models:
     - qwen-plus
     - qwen-turbo
     - qwen-max
     - qwen3-coder-plus

4. OpenRouter Compatible
   - provider: openrouter
   - baseURL: https://openrouter.ai/api/v1
   - models:
     - openai/gpt-4o-mini
     - openai/gpt-4o
     - deepseek/deepseek-chat
     - deepseek/deepseek-r1
     - qwen/qwen-2.5-72b-instruct

5. Custom
   - provider: custom
   - baseURL: 用户自己填写
   - model: 用户自己填写

注意：
1. 不要强绑定模型和 Base URL。
2. 用户可以自由编辑 Base URL、API Key、Model Name。
3. 选择 Provider 只用于快速填充。
4. 模型能力只作为前端提示和默认配置。
5. 不要假设所有 OpenAI-compatible API 都支持相同字段。
6. 如果模型能力未知，则按 Custom 模型处理。

新增文件：

src/config/modelRegistry.ts

数据结构：

export type ModelProvider = "openai" | "deepseek" | "qwen" | "openrouter" | "custom";

export type ReasoningMode = "off" | "auto" | "low" | "medium" | "high" | "custom";

export type ReasoningParamType =
  | "none"
  | "reasoning_effort"
  | "enable_thinking"
  | "model_only"
  | "custom_json";

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

自定义模型默认能力：
- supportsReasoning: false
- supportsStreaming: true
- supportsTemperature: true
- supportsMaxTokens: true
- reasoningParamType: "none"

页面功能五：推理模式
推理模式不是 OpenAI-compatible API 的统一标准字段，因此必须设计成可配置、可扩展，而不是写死。

推理字段含义：
1. reasoningMode = off
   - 不向请求体添加任何推理相关参数。
2. reasoningMode = auto
   - 根据模型预设自动选择推理参数。
3. reasoningMode = low / medium / high
   - 如果 reasoningParamType 是 reasoning_effort，则发送 reasoning_effort。
4. reasoningMode = custom
   - 允许用户通过 Custom Extra Body JSON 自定义额外请求体字段。
5. reasoningParamType = model_only
   - 不添加额外参数，仅依靠模型名区分是否推理，例如 deepseek-reasoner。
6. reasoningParamType = enable_thinking
   - 向请求体添加 enable_thinking: true。
7. reasoningParamType = custom_json
   - 把用户填写的 Custom Extra Body JSON 合并进请求体。

页面功能六：请求体构建
在 src/services/openaiClient.ts 中新增：

buildRequestBody()

职责：
根据 settings、messages 和模型能力构造最终请求体。

基础请求体：

{
  model,
  messages,
  stream
}

可选字段：
- temperature
- max_tokens
- reasoning_effort
- enable_thinking
- reasoning_budget_tokens
- extra body json

规则：
1. 如果 temperature 为空或模型不支持 temperature，则不发送 temperature。
2. 如果 maxTokens 为空或模型不支持 max_tokens，则不发送 max_tokens。
3. 如果 reasoningMode 为 off，则不发送任何推理参数。
4. 如果 reasoningParamType 为 reasoning_effort：
   - low -> reasoning_effort: "low"
   - medium -> reasoning_effort: "medium"
   - high -> reasoning_effort: "high"
   - auto -> reasoning_effort: "medium"
5. 如果 reasoningParamType 为 enable_thinking：
   - auto / low / medium / high 都发送 enable_thinking: true
6. 如果 reasoningParamType 为 model_only：
   - 不添加额外推理字段。
7. 如果 reasoningBudgetTokens 有值，可以加入 reasoning_budget_tokens。
8. 如果 reasoningMode 为 custom 或 reasoningParamType 为 custom_json：
   - 解析 customExtraBodyJson
   - 合并到请求体
   - 如果 JSON 解析失败，需要在页面提示错误，不要发送请求。
9. customExtraBodyJson 的优先级最高，可以覆盖普通字段。
10. 合并请求体前要做类型检查，避免用户输入非对象 JSON。
11. 如果用户输入了危险或无效 JSON，需要显示清楚错误。

页面功能七：推理内容展示
部分 API 可能会返回 reasoning_content、reasoning、thinking 或类似字段。

要求：
1. 在流式解析时，除了 choices[0].delta.content，也尝试读取：
   - choices[0].delta.reasoning_content
   - choices[0].delta.reasoning
   - choices[0].delta.thinking
2. 在非流式解析时，也尝试读取：
   - choices[0].message.reasoning_content
   - choices[0].message.reasoning
   - choices[0].message.thinking
3. ChatMessage 增加 reasoningContent?: string。
4. 如果 showReasoningContent 为 true，则在 assistant 消息上方用可折叠区域展示 reasoningContent。
5. 如果 showReasoningContent 为 false，则不要展示 reasoningContent，但可以保存到当前消息对象。
6. 不要把 reasoningContent 混入普通 assistant content。
7. 如果没有 reasoningContent，则不显示推理区域。

页面功能八：测试连接
SettingsDrawer 中需要有“测试连接”按钮。

测试连接规则：
1. 不需要后端。
2. 直接在浏览器请求：
   ${baseURL}/models
3. Header 中携带 Authorization: Bearer ${apiKey}。
4. 如果成功，展示可用模型列表。
5. 如果失败，提示可能原因：
   - API 不支持 /models
   - CORS 限制
   - API Key 无效
   - Base URL 错误
6. 测试失败不影响用户手动使用 chat completions。
7. 不要因为 /models 失败就禁止用户继续聊天。

页面功能九：本地存储
使用 localStorage 实现即可，必须封装 storage service。

保存内容：
1. conversations
2. activeConversationId
3. settings
4. storageVersion

API Key 保存规则：
1. 默认不保存 API Key 到 localStorage，只保存在当前页面运行时状态中。
2. 只有用户开启“保存 API Key 到本地”后，才写入 localStorage。
3. 关闭“保存 API Key 到本地”时，必须从 localStorage 中移除 apiKey。
4. 页面刷新后，如果没有保存 API Key，则 API Key 为空。
5. 页面要明确提示：
   API Key 仅保存在当前浏览器本地；纯前端模式无法完全防止本机浏览器环境泄露，请不要在公共电脑保存 Key。

storage service 必须实现：
- getSettings()
- saveSettings()
- getConversations()
- saveConversations()
- getActiveConversationId()
- saveActiveConversationId()
- clearAll()
- safeJsonParse()
- storageVersion 检查
- localStorage 异常处理

页面功能十：错误处理
需要识别并展示以下错误：
1. API Base URL 为空。
2. API Key 为空。
3. Model Name 为空。
4. 网络请求失败。
5. CORS 错误。
6. 401 Unauthorized。
7. 403 Forbidden。
8. 429 Too Many Requests。
9. 500 服务端错误。
10. 流式解析失败。
11. 自定义 JSON 解析失败。
12. 用户主动停止生成。
13. API 返回空内容。

CORS 错误提示文案必须清楚：
“当前 API 地址可能不允许浏览器跨域访问。纯前端模式无法绕过 CORS。请更换支持 CORS 的 API 地址，或使用你信任的中转服务。”

页面功能十一：Markdown 渲染
1. assistant 回复支持 Markdown。
2. 支持代码块。
3. 支持表格。
4. 支持列表。
5. 支持复制代码块内容。
6. 使用 react-markdown、remark-gfm、rehype-highlight。
7. 用户消息可以保持纯文本，但需要保留换行。
8. Markdown 样式要和聊天气泡协调。
9. 暗色主题下代码块和表格必须可读。

页面功能十二：状态管理
使用 Zustand 实现 src/stores/chatStore.ts。

必须实现：
- settings
- conversations
- activeConversationId
- isGenerating
- currentAbortController
- createConversation()
- deleteConversation()
- renameConversation()
- setActiveConversation()
- updateSettings()
- sendMessage()
- stopGeneration()
- regenerateLastAssistant()
- editLastUserAndResend()
- clearCurrentConversation()
- clearAllData()
- testConnection()

sendMessage() 要求：
1. 校验 baseURL、apiKey、model。
2. 创建 user 消息。
3. 创建 assistant 占位消息。
4. 根据 stream 开关选择流式或非流式请求。
5. 实时更新 assistant 消息。
6. 保存 conversations 到 localStorage。
7. 更新 recentModels 和 recentBaseURLs。
8. 失败时写入 assistant.errorMessage。
9. 请求结束后清理 AbortController。

页面组件要求：

1. src/components/AppLayout.tsx
负责整体布局、响应式侧边栏、设置抽屉开关。

2. src/components/ConversationSidebar.tsx
必须使用 Ant Design X Conversations。
要求：
- 新建会话
- 删除会话
- 重命名会话
- 当前会话高亮
- 移动端适配

3. src/components/ChatHeader.tsx
显示：
- 当前会话标题
- 当前模型名
- 当前 Provider
- 设置按钮
- 主题切换按钮
- 清空当前会话按钮

4. src/components/ChatMessages.tsx
必须支持：
- 使用 Ant Design X Bubble 或 Bubble.List
- Markdown 渲染
- reasoningContent 折叠展示
- 消息复制
- 错误状态
- streaming 状态
- 自动滚动到底部
- 空会话时显示 EmptyGuide

5. src/components/ChatInput.tsx
必须使用 Ant Design X Sender。
要求：
- Enter 发送
- Shift + Enter 换行
- 生成中可停止
- 未配置 API Key 时提示打开设置
- 输入为空时不能发送

6. src/components/SettingsDrawer.tsx
必须包含所有设置项：
- Provider Select
- API Base URL
- API Key
- Model Name
- System Prompt
- Temperature
- Max Tokens
- Stream
- Reasoning Mode
- Reasoning Param Type
- Reasoning Budget Tokens
- Show Reasoning Content
- Custom Extra Body JSON
- Save API Key
- Theme
- Recent Models
- Recent Base URLs
- Test Connection
- Clear All Data
- Privacy Notice

7. src/components/MarkdownMessage.tsx
必须负责：
- Markdown 渲染
- 代码块复制
- 表格样式
- 暗色主题兼容

8. src/components/EmptyGuide.tsx
显示首次使用引导：
- 填写 API Base URL
- 填写 API Key
- 选择模型
- 说明纯前端和 CORS 限制

重点实现文件：

1. src/services/openaiClient.ts
必须实现：
- normalizeBaseURL()
- buildChatCompletionsURL()
- buildModelsURL()
- buildRequestBody()
- createChatCompletion()
- createStreamingChatCompletion()
- parseSSEStream()
- testModelsEndpoint()

要求：
- 使用 fetch。
- 支持 AbortSignal。
- 支持 OpenAI-compatible 响应。
- 支持流式和非流式。
- 不使用后端代理。
- 不写死任何 API Key。
- 错误信息需要可读。
- 类型定义完整。
- 不要滥用 any。

2. src/services/storage.ts
必须实现：
- getSettings()
- saveSettings()
- getConversations()
- saveConversations()
- getActiveConversationId()
- saveActiveConversationId()
- clearAll()
- safeJsonParse()
- storageVersion 检查
- localStorage 异常处理
- saveApiKey 逻辑处理

3. src/stores/chatStore.ts
必须完整管理全局状态和业务逻辑，不要把核心请求逻辑散落在组件中。

4. src/config/modelRegistry.ts
必须维护 Provider、ModelPreset、默认 baseURL、模型能力和工具函数。

类型定义要求：

src/types/chat.ts 至少包含：

export type Role = "system" | "user" | "assistant";

export type MessageStatus = "sending" | "streaming" | "done" | "error";

export type ThemeMode = "light" | "dark";

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

  reasoningMode: ReasoningMode;
  reasoningParamType: ReasoningParamType;
  reasoningBudgetTokens?: number;
  showReasoningContent: boolean;
  customExtraBodyJson: string;

  recentModels: string[];
  recentBaseURLs: string[];
}

package.json 要包含：
1. npm run dev
2. npm run build
3. npm run preview
4. npm run typecheck

README.md 必须包含：
1. 项目介绍。
2. 功能列表。
3. 本地运行：
   npm install
   npm run dev
4. 类型检查：
   npm run typecheck
5. 构建：
   npm run build
6. 预览：
   npm run preview
7. 静态部署说明。
8. API Base URL 填写规则。
9. CORS 限制说明。
10. 隐私说明。
11. 为什么不需要后端。
12. 什么情况下必须使用后端：
   - 隐藏统一 API Key
   - 账号系统
   - 云同步
   - 计费
   - RAG 知识库
   - 文件上传和解析
   - 统一审计
13. 模型选择说明。
14. 推理模式说明。
15. Custom Extra Body JSON 使用说明。
16. /models 测试接口失败不代表 chat completions 一定不可用。

README 中“模型与推理模式说明”必须包含：
1. 本项目默认使用 OpenAI-compatible chat completions 格式。
2. 不同服务商的推理参数不完全一致。
3. 如果模型通过模型名本身区分普通模式和推理模式，例如 deepseek-chat 与 deepseek-reasoner，则选择对应模型即可，推理模式可以保持 off 或 model_only。
4. 如果服务商支持 reasoning_effort，可以选择 low、medium、high。
5. 如果服务商支持 enable_thinking，可以选择 enable_thinking。
6. 如果服务商使用非标准参数，可以使用 Custom Extra Body JSON。
7. 纯前端模式无法绕过 CORS。
8. /models 测试接口失败不代表 chat completions 一定不可用。

.env.example 要求：
1. 可以提供 VITE_APP_TITLE=Local Chat Panel。
2. 不要提供 API Key。
3. 不要让用户误以为 API Key 应写在环境变量中。
4. 注释说明：纯前端模式下 API 配置主要来自网页设置。

样式要求：
1. 整体高度 100vh。
2. 左侧会话栏宽度 280px。
3. 中间聊天区域最大宽度 900px 左右。
4. 输入框固定在底部。
5. 消息区域可滚动。
6. 页面不要显得廉价。
7. 兼容暗色主题。
8. 移动端宽度小于 768px 时，侧边栏收起。
9. Markdown 表格、代码块、列表需要有清晰样式。
10. 错误提示要清楚，不要只有红色文本。

额外要求：
1. 页面标题设为 Local Chat Panel。
2. 项目名设为 local-chat-panel。
3. 不要使用 any，除非确实无法避免；如使用 any，需要尽量局部化。
4. 不要只给伪代码。
5. 不要省略核心文件。
6. 实现后必须运行 npm run typecheck。
7. 实现后必须运行 npm run build。
8. 如果 typecheck 或 build 报错，必须继续修复。
9. 如果 Ant Design X 组件类型报错，必须读取类型定义后修复。
10. 如果某个功能实现会破坏纯前端约束，必须放弃该实现并说明限制。

最终输出格式：
1. 简要说明项目已完成。
2. 列出主要实现文件。
3. 说明如何运行：
   npm install
   npm run dev
4. 说明如何构建：
   npm run build
5. 说明如何静态部署。
6. 说明已知限制：
   - 纯前端无法绕过 CORS
   - API Key 默认只保存在当前页面内存中
   - 开启保存后才写入 localStorage
   - 没有账号系统和云同步
7. 明确确认：
   - npm run typecheck 是否通过
   - npm run build 是否通过

现在开始创建并实现完整项目，直到 npm run typecheck 和 npm run build 都成功为止。