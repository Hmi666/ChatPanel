import { ApiOutlined } from "@ant-design/icons";
import { Sender } from "@ant-design/x";
import { Alert, Button, Space } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useChatStore } from "../stores/chatStore";

interface ChatInputProps {
  onOpenSettings: () => void;
}

export default function ChatInput({ onOpenSettings }: ChatInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const settings = useChatStore((state) => state.settings);
  const isGenerating = useChatStore((state) => state.isGenerating);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const stopGeneration = useChatStore((state) => state.stopGeneration);

  const hasKey = Boolean(settings.apiKey.trim());

  return (
    <footer className="chat-input-shell">
      {!hasKey && (
        <Alert
          className="config-alert"
          type="warning"
          showIcon
          message={t("chatInput.apiKeyMissing")}
          action={
            <Button size="small" icon={<ApiOutlined />} onClick={onOpenSettings}>
              {t("common.settings")}
            </Button>
          }
        />
      )}
      <div className="chat-input-inner">
        <Sender
          value={value}
          onChange={setValue}
          loading={isGenerating}
          placeholder={t("chatInput.placeholder")}
          submitType="enter"
          autoSize={{ minRows: 1, maxRows: 6 }}
          onSubmit={(message) => {
            if (!message.trim()) {
              return;
            }
            void sendMessage(message);
            setValue("");
          }}
          onCancel={stopGeneration}
          footer={() => (
            <Space className="sender-footer" size={8}>
              <span>{t("chatInput.enterToSend")}</span>
              <span>{t("chatInput.shiftEnterNewline")}</span>
            </Space>
          )}
        />
      </div>
    </footer>
  );
}
