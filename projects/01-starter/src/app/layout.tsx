import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모르는편지",
  description: "오늘, 모르는 사람이 보낸 편지를 받았어요.",
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
