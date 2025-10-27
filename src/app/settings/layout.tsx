"use client";
import KindTaoHeader from "../(kindtao)/_components/KindTaoHeader";
import KindTaoSidebar from "../(kindtao)/_components/KindTaoSidebar";
import KindTaoBottomTabs from "../(kindtao)/_components/KindTaoBottomTabs";
import { useAuthStore } from "@/stores/useAuthStore";
import KindBossingHeader from "../(kindbossing)/_components/KindBossingHeader";
import KindBossingSidebar from "../(kindbossing)/_components/KindBossingSidebar";
import KindBossingBottomTabs from "../(kindbossing)/_components/KindBossingBottomTabs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthStore();
  const userMetadata = user?.user_metadata;
  const role = (userMetadata as any)?.role as string | undefined;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      {role === "kindbossing" && <KindBossingSidebar />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {role === "kindtao" && <KindTaoHeader />}
        {role === "kindbossing" && <KindBossingHeader />}

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>
      </div>

      {/* Bottom tabs for mobile */}
      {role === "kindtao" && <KindTaoBottomTabs />}
      {role === "kindbossing" && <KindBossingBottomTabs />}
    </div>
  );
}
