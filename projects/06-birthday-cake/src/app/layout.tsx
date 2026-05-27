import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "생일 축하해 🎂",
  description: "박수를 치면 촛불이 꺼져요. 소원 빌 준비 됐어?",
  openGraph: {
    title: "생일 축하해 🎂",
    description: "박수를 치면 촛불이 꺼져요. 소원 빌 준비 됐어?",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "생일 축하해 🎂",
    description: "박수를 치면 촛불이 꺼져요.",
  },
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
