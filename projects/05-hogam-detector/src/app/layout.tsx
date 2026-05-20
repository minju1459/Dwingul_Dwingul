import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoveSignal",
  description: "걔가 너 좋아하는지 AI가 진지하게 분석해줌. 결과는 보통 팩폭임.",
  openGraph: {
    title: "LoveSignal",
    description: "걔 행동 입력하면 AI가 차갑게 분석해줌.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "LoveSignal",
    description: "걔 행동 입력하면 AI가 차갑게 분석해줌.",
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
