import KindBossingOnboardingHeader from "./_components/KindBossingOnboardingHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <KindBossingOnboardingHeader />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
