import { App as AntApp, ConfigProvider, theme } from "antd";
import { XProvider } from "@ant-design/x";
import AppLayout from "./components/AppLayout";
import { useChatStore } from "./stores/chatStore";
import { useEffect } from "react";

export default function App() {
  const mode = useChatStore((state) => state.settings.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <ConfigProvider
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
