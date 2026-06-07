import { ApiOutlined, CloudServerOutlined, KeyOutlined, RobotOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useChatStore } from "../stores/chatStore";

export default function EmptyGuide() {
  const { t } = useTranslation();
  const createConversation = useChatStore((state) => state.createConversation);

  return (
    <div className="empty-guide">
      <div className="empty-guide-inner">
        <Typography.Title level={2}>{t("emptyGuide.title")}</Typography.Title>
        <Typography.Paragraph>
          {t("emptyGuide.description")}
        </Typography.Paragraph>

        <div className="guide-steps">
          <div className="guide-step">
            <CloudServerOutlined />
            <span>{t("emptyGuide.fillBaseUrl")}</span>
          </div>
          <div className="guide-step">
            <KeyOutlined />
            <span>{t("emptyGuide.enterApiKey")}</span>
          </div>
          <div className="guide-step">
            <RobotOutlined />
            <span>{t("emptyGuide.chooseModel")}</span>
          </div>
          <div className="guide-step">
            <ApiOutlined />
            <span>{t("emptyGuide.corsRequired")}</span>
          </div>
        </div>

        <Space>
          <Button type="primary" onClick={createConversation}>
            {t("common.newChat")}
          </Button>
        </Space>
      </div>
    </div>
  );
}
