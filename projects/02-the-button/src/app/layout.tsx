import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이 세상에 하나뿐인 버튼",
  description: "지금도 누군가는 누르고 있습니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
