import { Drawer, Grid } from "antd";
import { useMemo, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ConversationSidebar from "./ConversationSidebar";
import SettingsDrawer from "./SettingsDrawer";

export default function AppLayout() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = useMemo(
    () => <ConversationSidebar onCloseMobile={() => setSidebarOpen(false)} />,
    [],
  );

  return (
    <div className="app-shell">
      {!isMobile && <aside className="app-sidebar">{sidebar}</aside>}

      <Drawer
        title={null}
        placement="left"
        open={isMobile && sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={300}
        className="mobile-sidebar-drawer"
        styles={{ body: { padding: 0 } }}
      >
        {sidebar}
      </Drawer>

      <main className="chat-main">
        <ChatHeader
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
          showMenuButton={isMobile}
        />
        <ChatMessages />
        <ChatInput onOpenSettings={() => setSettingsOpen(true)} />
      </main>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
