import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WAKPPU — ASMR 왁뿌 시뮬레이터",
  description: "딱딱한 겉면을 누르면 오도독 부서지는 ASMR 왁뿌. 직접 색깔도 조합해서 만들 수 있어요.",
  openGraph: {
    title: "WAKPPU — ASMR 왁뿌 시뮬레이터",
    description: "딱딱한 겉면, 오도독 부서지는 균열, 출렁이는 슬라임.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "WAKPPU — ASMR 왁뿌 시뮬레이터",
    description: "딱딱한 겉면, 오도독 부서지는 균열, 출렁이는 슬라임.",
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
