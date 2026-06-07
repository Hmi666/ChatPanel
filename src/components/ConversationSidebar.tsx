import {
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Conversations } from "@ant-design/x";
import { Button, Input, Modal, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { useMemo } from "react";
import { useChatStore } from "../stores/chatStore";

interface ConversationSidebarProps {
  onCloseMobile?: () => void;
}

export default function ConversationSidebar({ onCloseMobile }: ConversationSidebarProps) {
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
        label: conversation.title,
        timestamp: conversation.updatedAt,
        icon: <MessageOutlined />,
      })),
    [conversations],
  );

  const menu = (conversation: { key: string }): MenuProps => ({
    items: [
      {
        key: "rename",
        icon: <EditOutlined />,
        label: "Rename",
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete",
        danger: true,
      },
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (key === "delete") {
        Modal.confirm({
          title: "Delete conversation",
          content: "This removes the conversation and its local messages from this browser.",
          okText: "Delete",
          okButtonProps: { danger: true },
          onOk: () => deleteConversation(conversation.key),
        });
      }
      if (key === "rename") {
        const current = conversations.find((item) => item.id === conversation.key);
        let nextTitle = current?.title ?? "";
        Modal.confirm({
          title: "Rename conversation",
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
          okText: "Save",
          onOk: () => renameConversation(conversation.key, nextTitle),
        });
      }
    },
  });

  return (
    <div className="conversation-sidebar">
      <div className="sidebar-header">
        <Space direction="vertical" size={4}>
          <Typography.Title level={4} className="sidebar-title">
            Local Chat Panel
          </Typography.Title>
          <Typography.Text type="secondary">Stored in this browser</Typography.Text>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          aria-label="New chat"
          onClick={() => {
            createConversation();
            onCloseMobile?.();
          }}
        />
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
