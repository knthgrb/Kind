import KindTaoOnboardingHeader from "./_components/KindTaoOnboardingHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <KindTaoOnboardingHeader />
      <div className="flex-1 overflow-auto">
        <div className="min-h-full flex items-center justify-center px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
