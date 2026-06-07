import { MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Drawer, Grid, Tooltip, Tour } from "antd";
import type { TourProps } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveOnboardingComplete, shouldShowOnboarding } from "../services/storage";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ConversationSidebar from "./ConversationSidebar";
import SettingsDrawer from "./SettingsDrawer";

export default function AppLayout() {
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarHidden, setDesktopSidebarHidden] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const baseURLTourRef = useRef<HTMLDivElement>(null);
  const apiKeyTourRef = useRef<HTMLDivElement>(null);
  const modelTourRef = useRef<HTMLDivElement>(null);
  const fetchModelsTourRef = useRef<HTMLDivElement>(null);

  const openSidebar = () => {
    if (isMobile) {
      setSidebarOpen(true);
      return;
    }
    setDesktopSidebarHidden(false);
  };

  const completeOnboarding = () => {
    setOnboardingOpen(false);
    saveOnboardingComplete();
  };

  const onboardingSteps: TourProps["steps"] = useMemo(
    () => [
      {
        title: t("onboarding.baseURLTitle"),
        description: t("onboarding.baseURLDescription"),
        target: () => baseURLTourRef.current ?? document.body,
      },
      {
        title: t("onboarding.apiKeyTitle"),
        description: t("onboarding.apiKeyDescription"),
        target: () => apiKeyTourRef.current ?? document.body,
      },
      {
        title: t("onboarding.modelTitle"),
        description: t("onboarding.modelDescription"),
        target: () => modelTourRef.current ?? document.body,
      },
      {
        title: t("onboarding.fetchModelsTitle"),
        description: t("onboarding.fetchModelsDescription"),
        target: () => fetchModelsTourRef.current ?? document.body,
      },
    ],
    [t],
  );

  useEffect(() => {
    if (!shouldShowOnboarding()) {
      return;
    }

    setSettingsOpen(true);
    const timer = window.setTimeout(() => setOnboardingOpen(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="app-shell">
      {!isMobile &&
        (desktopSidebarHidden ? (
          <aside className="app-sidebar-rail" aria-label={t("sidebar.collapsedLabel")}>
            <Tooltip title={t("sidebar.expand")} placement="right">
              <Button
                className="sidebar-rail-button"
                icon={<MenuUnfoldOutlined />}
                aria-label={t("sidebar.expand")}
                onClick={() => setDesktopSidebarHidden(false)}
              />
            </Tooltip>
          </aside>
        ) : (
          <aside className="app-sidebar">
            <ConversationSidebar
              showHideButton
              onHideDesktop={() => setDesktopSidebarHidden(true)}
            />
          </aside>
        ))}

      <Drawer
        title={null}
        placement="left"
        open={isMobile && sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={300}
        className="mobile-sidebar-drawer"
        styles={{ body: { padding: 0 } }}
      >
        <ConversationSidebar onCloseMobile={() => setSidebarOpen(false)} />
      </Drawer>

      <main className="chat-main">
        <ChatHeader
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenSidebar={openSidebar}
          showMenuButton={isMobile}
        />
        <ChatMessages />
        <ChatInput onOpenSettings={() => setSettingsOpen(true)} />
      </main>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tourRefs={{
          baseURL: baseURLTourRef,
          apiKey: apiKeyTourRef,
          model: modelTourRef,
          fetchModels: fetchModelsTourRef,
        }}
      />
      <Tour open={onboardingOpen} steps={onboardingSteps} onClose={completeOnboarding} />
    </div>
  );
}
