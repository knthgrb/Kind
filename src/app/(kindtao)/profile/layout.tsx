import "@/styles/globals.css";
import KindTaoHeader from "../_components/KindTaoHeader";
import KindTaoBottomTabs from "../_components/KindTaoBottomTabs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <KindTaoHeader />
      {children}
      <KindTaoBottomTabs />
    </>
  );
}
