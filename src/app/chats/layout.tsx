"use client";

import "@/styles/globals.css";
import { useAuthStore } from "@/stores/useAuthStore";
import AdminHeader from "@/app/(admin)/_components/AdminHeader";
import KindBossingHeader from "@/app/(kindbossing)/_components/KindBossingHeader";
import KindBossingSidebar from "@/app/(kindbossing)/_components/KindBossingSidebar";
import KindBossingBottomTabs from "@/app/(kindbossing)/_components/KindBossingBottomTabs";
import KindTaoHeader from "@/app/(kindtao)/_components/KindTaoHeader";
import KindTaoSidebar from "@/app/(kindtao)/_components/KindTaoSidebar";
import KindTaoBottomTabs from "@/app/(kindtao)/_components/KindTaoBottomTabs";
import ChatSkeleton from "@/components/common/ChatSkeleton";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthStore();
  const userMetadata = user?.user_metadata;
  const role = (userMetadata as any)?.role as string | undefined;

  // Show skeleton while fetching user data
  if (loading) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      {role === "kindbossing" && <KindBossingSidebar />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {role === "admin" && <AdminHeader />}
        {role === "kindtao" && <KindTaoHeader />}
        {role === "kindbossing" && <KindBossingHeader />}

        {/* Main content */}
        <main className="flex-1 overflow-hidden pb-16 lg:pb-0">{children}</main>
      </div>

      {/* Bottom tabs for mobile */}
      {role === "kindtao" && <KindTaoBottomTabs />}
      {role === "kindbossing" && <KindBossingBottomTabs />}
    </div>
  );
}
