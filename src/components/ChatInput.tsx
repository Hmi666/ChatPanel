import { ApiOutlined } from "@ant-design/icons";
import { Sender } from "@ant-design/x";
import { Alert, Button, Space } from "antd";
import { useState } from "react";
import { useChatStore } from "../stores/chatStore";

interface ChatInputProps {
  onOpenSettings: () => void;
}

export default function ChatInput({ onOpenSettings }: ChatInputProps) {
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
          message="API Key is not configured"
          action={
            <Button size="small" icon={<ApiOutlined />} onClick={onOpenSettings}>
              Settings
            </Button>
          }
        />
      )}
      <div className="chat-input-inner">
        <Sender
          value={value}
          onChange={setValue}
          loading={isGenerating}
          placeholder="Message the model"
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
              <span>Enter to send</span>
              <span>Shift + Enter for newline</span>
            </Space>
          )}
        />
      </div>
    </footer>
  );
}
