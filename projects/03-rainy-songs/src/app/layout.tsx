import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "비 오는 날의 메모",
  description: "빗방울 안에 음악이 숨어 있어요.",
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
