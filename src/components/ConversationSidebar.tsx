import {
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MessageOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Conversations } from "@ant-design/x";
import { Button, Input, Modal, Space, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useChatStore } from "../stores/chatStore";

interface ConversationSidebarProps {
  onCloseMobile?: () => void;
  onHideDesktop?: () => void;
  showHideButton?: boolean;
}

export default function ConversationSidebar({
  onCloseMobile,
  onHideDesktop,
  showHideButton = false,
}: ConversationSidebarProps) {
  const { t } = useTranslation();
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const createConversation = useChatStore((state) => state.createConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const renameConversation = useChatStore((state) => state.renameConversation);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);

  const items = useMemo(
    () =>
      conversations.map((conversation) => ({
        key: conversation.id,
        label:
          conversation.title === "New chat"
            ? t("common.newChat")
            : conversation.title === "Untitled chat"
              ? t("common.untitledChat")
              : conversation.title,
        timestamp: conversation.updatedAt,
        icon: <MessageOutlined />,
      })),
    [conversations, t],
  );

  const menu = (conversation: { key: string }): MenuProps => ({
    items: [
      {
        key: "rename",
        icon: <EditOutlined />,
        label: t("sidebar.rename"),
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: t("common.delete"),
        danger: true,
      },
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (key === "delete") {
        Modal.confirm({
          title: t("sidebar.deleteTitle"),
          content: t("sidebar.deleteDescription"),
          okText: t("common.delete"),
          okButtonProps: { danger: true },
          onOk: () => deleteConversation(conversation.key),
        });
      }
      if (key === "rename") {
        const current = conversations.find((item) => item.id === conversation.key);
        let nextTitle = current?.title ?? "";
        Modal.confirm({
          title: t("sidebar.renameTitle"),
          content: (
            <Input
              defaultValue={nextTitle}
              autoFocus
              maxLength={80}
              onChange={(event) => {
                nextTitle = event.target.value;
              }}
            />
          ),
          okText: t("common.save"),
          onOk: () => renameConversation(conversation.key, nextTitle),
        });
      }
    },
  });

  return (
    <div className="conversation-sidebar">
      <div className="sidebar-header">
        <Space className="sidebar-heading" direction="vertical" size={4}>
          <Typography.Title level={4} className="sidebar-title">
            {t("sidebar.title")}
          </Typography.Title>
          <Typography.Text type="secondary">{t("sidebar.subtitle")}</Typography.Text>
        </Space>
        <div className="sidebar-actions">
          {showHideButton && (
            <Tooltip title={t("sidebar.hide")}>
              <Button
                icon={<MenuFoldOutlined />}
                aria-label={t("sidebar.hide")}
                onClick={onHideDesktop}
              />
            </Tooltip>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            aria-label={t("sidebar.newChat")}
            onClick={() => {
              createConversation();
              onCloseMobile?.();
            }}
          />
        </div>
      </div>

      <Conversations
        className="conversation-list"
        items={items}
        activeKey={activeConversationId}
        menu={menu}
        onActiveChange={(value) => {
          setActiveConversation(value);
          onCloseMobile?.();
        }}
      />
    </div>
  );
}
