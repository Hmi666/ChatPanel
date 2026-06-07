import { App as AntApp, ConfigProvider, theme } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import { XProvider } from "@ant-design/x";
import { useTranslation } from "react-i18next";
import AppLayout from "./components/AppLayout";
import { useChatStore } from "./stores/chatStore";
import { useEffect } from "react";

export default function App() {
  const settings = useChatStore((state) => state.settings);
  const { i18n } = useTranslation();
  const mode = settings.theme;

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    void i18n.changeLanguage(settings.language);
  }, [i18n, settings.language]);

  return (
    <ConfigProvider
      locale={settings.language === "zh-CN" ? zhCN : enUS}
      theme={{
        algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#0D9488",
          borderRadius: 8,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
        components: {
          Button: {
            controlHeight: 40,
          },
          Drawer: {
            borderRadiusLG: 0,
          },
        },
      }}
    >
      <XProvider>
        <AntApp>
          <AppLayout />
        </AntApp>
      </XProvider>
    </ConfigProvider>
  );
}
