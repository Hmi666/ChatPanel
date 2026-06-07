import {
  ApiOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  Alert,
  AutoComplete,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Slider,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  getGroupedModelOptions,
  getProviderPreset,
  providerPresets,
} from "../config/modelRegistry";
import { useChatStore } from "../stores/chatStore";
import type { ChatSettings, ModelProvider } from "../types/chat";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const settings = useChatStore((state) => state.settings);
  const updateSettings = useChatStore((state) => state.updateSettings);
  const clearAllData = useChatStore((state) => state.clearAllData);
  const testConnection = useChatStore((state) => state.testConnection);
  const [testing, setTesting] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [form] = Form.useForm<ChatSettings>();

  useEffect(() => {
    form.setFieldsValue(settings);
  }, [form, settings]);

  const applyPatch = (patch: Partial<ChatSettings>) => {
    updateSettings(patch);
    form.setFieldsValue({ ...settings, ...patch });
  };

  return (
    <Drawer
      title="Settings"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      className="settings-drawer"
    >
      <Form form={form} layout="vertical" initialValues={settings}>
        <Typography.Title level={5}>Base settings</Typography.Title>
        <Form.Item label="Provider" name="provider">
          <Select
            options={providerPresets.map((item) => ({
              value: item.provider,
              label: item.label,
            }))}
            onChange={(provider: ModelProvider) => {
              const preset = getProviderPreset(provider);
              applyPatch({
                provider,
                baseURL: preset?.defaultBaseURL ?? settings.baseURL,
                model: preset?.models[0] ?? settings.model,
              });
            }}
          />
        </Form.Item>

        <Form.Item label="API Base URL" name="baseURL" required>
          <AutoComplete
            options={settings.recentBaseURLs.map((value) => ({ value }))}
            onChange={(value) => applyPatch({ baseURL: value })}
          />
        </Form.Item>

        <Form.Item label="API Key" name="apiKey" required>
          <Input.Password
            autoComplete="off"
            placeholder="sk-..."
            onChange={(event) => applyPatch({ apiKey: event.target.value })}
          />
        </Form.Item>

        <Form.Item label="Model Name" name="model" required>
          <AutoComplete
            options={getGroupedModelOptions(settings.recentModels)}
            filterOption={(input, option) => {
              if (!option || !("value" in option)) {
                return false;
              }
              return String(option.value).toLowerCase().includes(input.toLowerCase());
            }}
            onChange={(value) => applyPatch({ model: value })}
          />
        </Form.Item>

        <Form.Item label="System Prompt" name="systemPrompt">
          <Input.TextArea
            rows={4}
            placeholder="Optional system instruction"
            onChange={(event) => applyPatch({ systemPrompt: event.target.value })}
          />
        </Form.Item>

        <Space className="settings-row" align="center">
          <span>Save API Key to localStorage</span>
          <Switch
            checked={settings.saveApiKey}
            onChange={(checked) => applyPatch({ saveApiKey: checked })}
          />
        </Space>

        <Form.Item label="Theme" name="theme" className="settings-theme-select">
          <Select
            options={[
              { value: "light", label: "light" },
              { value: "dark", label: "dark" },
            ]}
            onChange={(theme) => applyPatch({ theme })}
          />
        </Form.Item>

        <Divider />
        <Typography.Title level={5}>Generation</Typography.Title>
        <Form.Item label={`Temperature: ${settings.temperature ?? "off"}`}>
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature ?? 0}
            onChange={(temperature) => applyPatch({ temperature })}
          />
        </Form.Item>

        <Form.Item label="Max Tokens" name="maxTokens">
          <InputNumber
            min={1}
            max={200000}
            className="full-width"
            onChange={(value) => applyPatch({ maxTokens: value ?? undefined })}
          />
        </Form.Item>

        <Space className="settings-row" align="center">
          <span>Stream response</span>
          <Switch checked={settings.stream} onChange={(stream) => applyPatch({ stream })} />
        </Space>

        <Divider />
        <Typography.Title level={5}>Reasoning</Typography.Title>
        <Form.Item label="Reasoning Mode" name="reasoningMode">
          <Select
            options={["off", "auto", "low", "medium", "high", "custom"].map((value) => ({
              value,
              label: value,
            }))}
            onChange={(reasoningMode) => applyPatch({ reasoningMode })}
          />
        </Form.Item>

        <Form.Item label="Reasoning Param Type" name="reasoningParamType">
          <Select
            options={["none", "reasoning_effort", "enable_thinking", "model_only", "custom_json"].map(
              (value) => ({ value, label: value }),
            )}
            onChange={(reasoningParamType) => applyPatch({ reasoningParamType })}
          />
        </Form.Item>

        <Form.Item label="Reasoning Budget Tokens" name="reasoningBudgetTokens">
          <InputNumber
            min={1}
            max={200000}
            className="full-width"
            onChange={(value) => applyPatch({ reasoningBudgetTokens: value ?? undefined })}
          />
        </Form.Item>

        <Space className="settings-row" align="center">
          <span>Show reasoning content</span>
          <Switch
            checked={settings.showReasoningContent}
            onChange={(showReasoningContent) => applyPatch({ showReasoningContent })}
          />
        </Space>

        <Form.Item label="Custom Extra Body JSON" name="customExtraBodyJson">
          <Input.TextArea
            rows={5}
            placeholder='{"top_p":0.9}'
            onChange={(event) => applyPatch({ customExtraBodyJson: event.target.value })}
          />
        </Form.Item>

        <Divider />
        <Typography.Title level={5}>Actions</Typography.Title>
        <Space wrap>
          <Button
            icon={<ExperimentOutlined />}
            loading={testing}
            onClick={async () => {
              setTesting(true);
              const result = await testConnection();
              setTesting(false);
              setModels(result.models);
            }}
          >
            Test connection
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Clear all local data",
                content: "This removes settings, conversations, and local chat history from this browser.",
                okText: "Clear all",
                okButtonProps: { danger: true },
                onOk: clearAllData,
              });
            }}
          >
            Clear all local data
          </Button>
        </Space>

        {models.length > 0 && (
          <div className="models-result">
            {models.slice(0, 20).map((model) => (
              <Tag key={model}>{model}</Tag>
            ))}
          </div>
        )}

        <Alert
          className="privacy-notice"
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined />}
          message="Privacy notice"
          description="API Key 仅保存在当前浏览器本地；纯前端模式无法完全防止本机浏览器环境泄露，请不要在公共电脑保存 Key。"
        />

        <Descriptions
          className="settings-notes"
          size="small"
          column={1}
          items={[
            {
              key: "cors",
              label: "CORS",
              children: "纯前端模式无法绕过 API 服务的浏览器跨域限制。",
            },
            {
              key: "endpoint",
              label: "Chat endpoint",
              children: "${baseURL}/chat/completions",
            },
            {
              key: "models",
              label: "/models",
              children: "/models 测试失败不代表 chat completions 一定不可用。",
            },
          ]}
        />

        <Alert
          type="warning"
          showIcon
          icon={<ApiOutlined />}
          message="No backend proxy"
          description="This app sends requests directly from the browser to the Base URL you configure."
        />
      </Form>
    </Drawer>
  );
}
