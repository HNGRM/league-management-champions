import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "리그 매니지먼트: 챔피언스",
  description: "세로형 LoL e스포츠 팀 매니지먼트 시뮬레이션 게임",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full bg-slate-950">
      <body className="min-h-full flex justify-center items-center bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
