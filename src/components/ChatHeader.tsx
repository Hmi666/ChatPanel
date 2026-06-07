import {
  ClearOutlined,
  MenuOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from "antd";
import { getProviderLabel } from "../config/modelRegistry";
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
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const settings = useChatStore((state) => state.settings);
  const updateSettings = useChatStore((state) => state.updateSettings);
  const clearCurrentConversation = useChatStore((state) => state.clearCurrentConversation);

  const active = conversations.find((conversation) => conversation.id === activeConversationId);
  const isDark = settings.theme === "dark";

  return (
    <header className="chat-header">
      <div className="header-left">
        {showMenuButton && (
          <Tooltip title="Open conversations">
            <Button
              icon={<MenuOutlined />}
              aria-label="Open conversations"
              onClick={onOpenSidebar}
            />
          </Tooltip>
        )}
        <div className="header-title-group">
          <Typography.Title level={4} className="chat-title">
            {active?.title ?? "New chat"}
          </Typography.Title>
          <Space size={6} wrap>
            <Tag bordered={false}>{getProviderLabel(settings.provider)}</Tag>
            <Tag bordered={false}>{settings.model || "No model"}</Tag>
          </Space>
        </div>
      </div>

      <Space size={8}>
        <Tooltip title={isDark ? "Switch to light theme" : "Switch to dark theme"}>
          <Button
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            aria-label="Toggle theme"
            onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
          />
        </Tooltip>
        <Popconfirm
          title="Clear current conversation?"
          description="This removes local messages in the active conversation."
          okText="Clear"
          okButtonProps={{ danger: true }}
          onConfirm={clearCurrentConversation}
        >
          <Button icon={<ClearOutlined />} aria-label="Clear current conversation" />
        </Popconfirm>
        <Tooltip title="Settings">
          <Button
            type="primary"
            icon={<SettingOutlined />}
            aria-label="Open settings"
            onClick={onOpenSettings}
          />
        </Tooltip>
      </Space>
    </header>
  );
}
