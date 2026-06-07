import {
  ApiOutlined,
  CloudDownloadOutlined,
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
import type { RefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  tourRefs?: {
    baseURL?: RefObject<HTMLDivElement>;
    apiKey?: RefObject<HTMLDivElement>;
    model?: RefObject<HTMLDivElement>;
    fetchModels?: RefObject<HTMLDivElement>;
  };
}

export default function SettingsDrawer({ open, onClose, tourRefs }: SettingsDrawerProps) {
  const { t } = useTranslation();
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

  const modelOptions = useMemo(() => {
    const presetOptions = getGroupedModelOptions(settings.recentModels, t("common.recent")).map(
      (group) => {
        const provider = providerPresets.find((item) => item.label === group.label);
        return {
          ...group,
          label: provider ? t(`providers.${provider.provider}`) : group.label,
        };
      },
    );

    if (!models.length) {
      return presetOptions;
    }

    return [
      {
        label: t("settings.availableModels"),
        options: models.map((model) => ({ value: model, label: model })),
      },
      ...presetOptions,
    ];
  }, [models, settings.recentModels, t]);

  const fetchModels = async () => {
    setTesting(true);
    const result = await testConnection();
    setTesting(false);
    setModels(result.models);
    if (result.models.length && !settings.model.trim()) {
      applyPatch({ model: result.models[0] });
    }
  };

  return (
    <Drawer
      title={t("settings.title")}
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      className="settings-drawer"
    >
      <Form form={form} layout="vertical" initialValues={settings}>
        <Typography.Title level={5}>{t("settings.baseSettings")}</Typography.Title>
        <Form.Item label={t("settings.provider")} name="provider">
          <Select
            options={providerPresets.map((item) => ({
              value: item.provider,
              label: t(`providers.${item.provider}`),
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

        <Form.Item label={t("settings.apiBaseUrl")} required>
          <div ref={tourRefs?.baseURL}>
            <Form.Item name="baseURL" noStyle>
              <AutoComplete
                options={settings.recentBaseURLs.map((value) => ({ value }))}
                placeholder={t("settings.apiBaseUrlPlaceholder")}
                onChange={(value) => applyPatch({ baseURL: value })}
              />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label={t("settings.apiKey")} required>
          <div ref={tourRefs?.apiKey}>
            <Form.Item name="apiKey" noStyle>
              <Input.Password
                autoComplete="off"
                placeholder="sk-..."
                onChange={(event) => applyPatch({ apiKey: event.target.value })}
              />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label={t("settings.modelName")} required>
          <div className="model-name-control" ref={tourRefs?.model}>
            <Form.Item name="model" noStyle>
              <AutoComplete
                className="model-name-input"
                options={modelOptions}
                filterOption={(input, option) => {
                  if (!option || !("value" in option)) {
                    return false;
                  }
                  return String(option.value).toLowerCase().includes(input.toLowerCase());
                }}
                onChange={(value) => applyPatch({ model: value })}
              />
            </Form.Item>
            <div className="model-fetch-target" ref={tourRefs?.fetchModels}>
              <Button
                icon={<CloudDownloadOutlined />}
                loading={testing}
                onClick={() => void fetchModels()}
              >
                {t("settings.fetchModels")}
              </Button>
            </div>
          </div>
        </Form.Item>

        {models.length > 0 && (
          <div className="models-result settings-models-result">
            {models.slice(0, 20).map((model) => (
              <Tag key={model}>{model}</Tag>
            ))}
          </div>
        )}

        <Form.Item label={t("settings.systemPrompt")} name="systemPrompt">
          <Input.TextArea
            rows={4}
            placeholder={t("settings.systemPromptPlaceholder")}
            onChange={(event) => applyPatch({ systemPrompt: event.target.value })}
          />
        </Form.Item>

        <Space className="settings-row" align="center">
          <span>{t("settings.saveApiKey")}</span>
          <Switch
            checked={settings.saveApiKey}
            onChange={(checked) => applyPatch({ saveApiKey: checked })}
          />
        </Space>

        <Form.Item label={t("settings.theme")} name="theme" className="settings-theme-select">
          <Select
            options={[
              { value: "light", label: t("theme.light") },
              { value: "dark", label: t("theme.dark") },
            ]}
            onChange={(theme) => applyPatch({ theme })}
          />
        </Form.Item>

        <Form.Item label={t("settings.language")} name="language">
          <Select
            options={[
              { value: "en", label: "English" },
              { value: "zh-CN", label: "中文" },
            ]}
            onChange={(language) => applyPatch({ language })}
          />
        </Form.Item>

        <Divider />
        <Typography.Title level={5}>{t("settings.generation")}</Typography.Title>
        <Form.Item label={`${t("settings.temperature")}: ${settings.temperature ?? t("common.off")}`}>
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature ?? 0}
            onChange={(temperature) => applyPatch({ temperature })}
          />
        </Form.Item>

        <Form.Item label={t("settings.maxTokens")} name="maxTokens">
          <InputNumber
            min={1}
            max={200000}
            className="full-width"
            onChange={(value) => applyPatch({ maxTokens: value ?? undefined })}
          />
        </Form.Item>

        <Space className="settings-row" align="center">
          <span>{t("settings.streamResponse")}</span>
          <Switch checked={settings.stream} onChange={(stream) => applyPatch({ stream })} />
        </Space>

        <Divider />
        <Typography.Title level={5}>{t("settings.reasoning")}</Typography.Title>
        <Form.Item label={t("settings.reasoningMode")} name="reasoningMode">
          <Select
            options={["off", "auto", "low", "medium", "high", "custom"].map((value) => ({
              value,
              label: t(`reasoningModes.${value}`),
            }))}
            onChange={(reasoningMode) => applyPatch({ reasoningMode })}
          />
        </Form.Item>

        <Form.Item label={t("settings.reasoningParamType")} name="reasoningParamType">
          <Select
            options={["none", "reasoning_effort", "enable_thinking", "model_only", "custom_json"].map(
              (value) => ({ value, label: t(`reasoningParams.${value}`) }),
            )}
            onChange={(reasoningParamType) => applyPatch({ reasoningParamType })}
          />
        </Form.Item>

        <Form.Item label={t("settings.reasoningBudgetTokens")} name="reasoningBudgetTokens">
          <InputNumber
            min={1}
            max={200000}
            className="full-width"
            onChange={(value) => applyPatch({ reasoningBudgetTokens: value ?? undefined })}
          />
        </Form.Item>

        <Space className="settings-row" align="center">
          <span>{t("settings.showReasoningContent")}</span>
          <Switch
            checked={settings.showReasoningContent}
            onChange={(showReasoningContent) => applyPatch({ showReasoningContent })}
          />
        </Space>

        <Form.Item label={t("settings.customExtraBodyJson")} name="customExtraBodyJson">
          <Input.TextArea
            rows={5}
            placeholder='{"top_p":0.9}'
            onChange={(event) => applyPatch({ customExtraBodyJson: event.target.value })}
          />
        </Form.Item>

        <Divider />
        <Typography.Title level={5}>{t("settings.actions")}</Typography.Title>
        <Space wrap>
          <Button
            icon={<ExperimentOutlined />}
            loading={testing}
            onClick={() => void fetchModels()}
          >
            {t("settings.testConnection")}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: t("settings.clearAllTitle"),
                content: t("settings.clearAllContent"),
                okText: t("common.clearAll"),
                okButtonProps: { danger: true },
                onOk: clearAllData,
              });
            }}
          >
            {t("settings.clearAllLocalData")}
          </Button>
        </Space>

        <Alert
          className="privacy-notice"
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined />}
          message={t("settings.privacyNotice")}
          description={t("settings.privacyDescription")}
        />

        <Descriptions
          className="settings-notes"
          size="small"
          column={1}
          items={[
            {
              key: "cors",
              label: t("settings.corsLabel"),
              children: t("settings.corsDescription"),
            },
            {
              key: "endpoint",
              label: t("settings.endpointLabel"),
              children: t("settings.endpointDescription"),
            },
            {
              key: "models",
              label: t("settings.modelsLabel"),
              children: t("settings.modelsDescription"),
            },
          ]}
        />

        <Alert
          type="info"
          showIcon
          icon={<ApiOutlined />}
          message={t("settings.proxyEnabled")}
          description={t("settings.proxyDescription")}
        />
      </Form>
    </Drawer>
  );
}
