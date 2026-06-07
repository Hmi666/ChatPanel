import {
  CopyOutlined,
  EditOutlined,
  ReloadOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Bubble } from "@ant-design/x";
import { Alert, Button, Collapse, Space, Spin, Tooltip, message } from "antd";
import type { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useChatStore } from "../stores/chatStore";
import type { ChatMessage } from "../types/chat";
import EmptyGuide from "./EmptyGuide";
import MarkdownMessage from "./MarkdownMessage";

function MessageContent({
  item,
  showReasoningContent,
}: {
  item: ChatMessage;
  showReasoningContent: boolean;
}) {
  const { t } = useTranslation();

  if (item.role === "user") {
    return <div className="user-message-text">{item.content}</div>;
  }

  return (
    <div className="assistant-message">
      {item.reasoningContent && showReasoningContent && (
        <Collapse
          size="small"
          ghost
          items={[
            {
              key: "reasoning",
              label: t("messages.reasoning"),
              children: <pre className="reasoning-content">{item.reasoningContent}</pre>,
            },
          ]}
        />
      )}
      {item.errorMessage && (
        <Alert
          type="error"
          showIcon
          message={t("messages.requestFailed")}
          description={item.errorMessage}
          className="message-error"
        />
      )}
      {item.content ? <MarkdownMessage content={item.content} /> : <Spin size="small" />}
    </div>
  );
}

export default function ChatMessages() {
  const { t } = useTranslation();
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const isGenerating = useChatStore((state) => state.isGenerating);
  const showReasoningContent = useChatStore((state) => state.settings.showReasoningContent);
  const regenerateLastAssistant = useChatStore((state) => state.regenerateLastAssistant);
  const editLastUserAndResend = useChatStore((state) => state.editLastUserAndResend);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((conversation) => conversation.id === activeConversationId);
  const messages = active?.messages ?? [];
  const lastUser = [...messages].reverse().find((item) => item.role === "user");
  const latestMessage = messages[messages.length - 1];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, latestMessage?.content, latestMessage?.reasoningContent]);

  const items: BubbleDataType[] = useMemo(
    () =>
      messages.map((item) => ({
        key: item.id,
        role: item.role,
        content: item,
        loading: item.status === "streaming" && !item.content,
        variant: item.role === "user" ? "filled" : "borderless",
        shape: "corner",
        messageRender: () => (
          <MessageContent item={item} showReasoningContent={showReasoningContent} />
        ),
        footer: (
          <Space size={4} className="bubble-actions">
            <Tooltip title={t("messages.copyMessage")}>
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                aria-label={t("messages.copyMessage")}
                onClick={() => {
                  void navigator.clipboard.writeText(item.content);
                  message.success(t("common.copied"));
                }}
              />
            </Tooltip>
            {item.role === "assistant" && item === latestMessage && (
              <Tooltip title={t("messages.regenerate")}>
                <Button
                  size="small"
                  type="text"
                  icon={<ReloadOutlined />}
                  aria-label={t("messages.regenerateAria")}
                  disabled={isGenerating}
                  onClick={() => void regenerateLastAssistant()}
                />
              </Tooltip>
            )}
            {item.role === "user" && item.id === lastUser?.id && (
              <Tooltip title={t("messages.editAndResend")}>
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  aria-label={t("messages.editLastUser")}
                  disabled={isGenerating}
                  onClick={() => {
                    const next = window.prompt(t("messages.editPrompt"), item.content);
                    if (next?.trim()) {
                      void editLastUserAndResend(next);
                    }
                  }}
                />
              </Tooltip>
            )}
          </Space>
        ),
      })),
    [
      editLastUserAndResend,
      isGenerating,
      lastUser?.id,
      latestMessage,
      messages,
      regenerateLastAssistant,
      showReasoningContent,
      t,
    ],
  );

  if (!messages.length) {
    return (
      <section className="messages-scroll" ref={scrollRef}>
        <EmptyGuide />
      </section>
    );
  }

  return (
    <section className="messages-scroll" ref={scrollRef}>
      <div className="messages-inner">
        <Bubble.List
          items={items}
          autoScroll
          roles={{
            user: {
              placement: "end",
              avatar: { icon: <UserOutlined /> },
              classNames: { content: "user-bubble" },
            },
            assistant: {
              placement: "start",
              avatar: { icon: <RobotOutlined /> },
              classNames: { content: "assistant-bubble" },
            },
          }}
        />
      </div>
    </section>
  );
}
