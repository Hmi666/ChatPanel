import { ApiOutlined, CloudServerOutlined, KeyOutlined, RobotOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { useChatStore } from "../stores/chatStore";

export default function EmptyGuide() {
  const createConversation = useChatStore((state) => state.createConversation);

  return (
    <div className="empty-guide">
      <div className="empty-guide-inner">
        <Typography.Title level={2}>Start a local-first chat</Typography.Title>
        <Typography.Paragraph>
          Configure an OpenAI-compatible endpoint in Settings, then chat directly from this browser.
        </Typography.Paragraph>

        <div className="guide-steps">
          <div className="guide-step">
            <CloudServerOutlined />
            <span>Fill API Base URL</span>
          </div>
          <div className="guide-step">
            <KeyOutlined />
            <span>Enter API Key</span>
          </div>
          <div className="guide-step">
            <RobotOutlined />
            <span>Choose or type a model</span>
          </div>
          <div className="guide-step">
            <ApiOutlined />
            <span>Browser CORS must be allowed by the API</span>
          </div>
        </div>

        <Space>
          <Button type="primary" onClick={createConversation}>
            New chat
          </Button>
        </Space>
      </div>
    </div>
  );
}
