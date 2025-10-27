import KindBossingSidebar from "./_components/KindBossingSidebar";
import KindBossingBottomTabs from "./_components/KindBossingBottomTabs";
import KindBossingHeader from "./_components/KindBossingHeader";

export default function KindBossingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <KindBossingSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <KindBossingHeader />

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>
      </div>

      {/* Bottom tabs for mobile */}
      <KindBossingBottomTabs />
    </div>
  );
}
