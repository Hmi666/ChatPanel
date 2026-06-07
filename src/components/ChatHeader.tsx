import {
  ClearOutlined,
  MenuOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useChatStore } from "../stores/chatStore";

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onOpenSidebar: () => void;
  showMenuButton: boolean;
}

export default function ChatHeader({
  onOpenSettings,
  onOpenSidebar,
  showMenuButton,
}: ChatHeaderProps) {
  const { t } = useTranslation();
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const settings = useChatStore((state) => state.settings);
  const updateSettings = useChatStore((state) => state.updateSettings);
  const clearCurrentConversation = useChatStore((state) => state.clearCurrentConversation);

  const active = conversations.find((conversation) => conversation.id === activeConversationId);
  const isDark = settings.theme === "dark";
  const nextLanguage = settings.language === "en" ? "zh-CN" : "en";
  const getTitle = (title?: string) => {
    if (!title || title === "New chat") {
      return t("common.newChat");
    }
    if (title === "Untitled chat") {
      return t("common.untitledChat");
    }
    return title;
  };

  return (
    <header className="chat-header">
      <div className="header-left">
        {showMenuButton && (
          <Tooltip title={t("header.openConversations")}>
            <Button
              icon={<MenuOutlined />}
              aria-label={t("header.openConversations")}
              onClick={onOpenSidebar}
            />
          </Tooltip>
        )}
        <div className="header-title-group">
          <Typography.Title level={4} className="chat-title">
            {getTitle(active?.title)}
          </Typography.Title>
          <Space size={6} wrap>
            <Tag bordered={false}>{t(`providers.${settings.provider}`)}</Tag>
            <Tag bordered={false}>{settings.model || t("common.noModel")}</Tag>
          </Space>
        </div>
      </div>

      <Space size={8}>
        <Tooltip
          title={t("language.switchTo", {
            language: t(nextLanguage === "zh-CN" ? "language.zh" : "language.en"),
          })}
        >
          <Button
            className="language-toggle-button"
            icon={<TranslationOutlined />}
            aria-label={t("header.switchLanguage")}
            onClick={() => updateSettings({ language: nextLanguage })}
          >
            {settings.language === "en" ? "中" : "EN"}
          </Button>
        </Tooltip>
        <Tooltip title={isDark ? t("header.switchLight") : t("header.switchDark")}>
          <Button
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            aria-label={t("header.toggleTheme")}
            onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
          />
        </Tooltip>
        <Popconfirm
          title={t("header.clearTitle")}
          description={t("header.clearDescription")}
          okText={t("common.clear")}
          okButtonProps={{ danger: true }}
          onConfirm={clearCurrentConversation}
        >
          <Button icon={<ClearOutlined />} aria-label={t("header.clearCurrent")} />
        </Popconfirm>
        <Tooltip title={t("common.settings")}>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            aria-label={t("header.openSettings")}
            onClick={onOpenSettings}
          />
        </Tooltip>
      </Space>
    </header>
  );
}
