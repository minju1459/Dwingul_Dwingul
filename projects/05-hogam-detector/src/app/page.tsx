import { DetectorCard } from "@/components/DetectorCard";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-between px-5 py-10 sm:py-14">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-[36px] font-black leading-[1.05] tracking-[-0.02em] text-[var(--ink)]">
            LoveSignal
          </h1>
          <p className="text-[15px] leading-relaxed text-[var(--ink-soft)]">
            당신의 호감이 진짜인지 아닌지 판독해드립니다.
          </p>
        </header>

        <DetectorCard />
      </div>

      <footer className="mt-10 flex flex-col gap-1 text-center text-[11px] text-[var(--ink-soft)]">
        <span>※ 이 서비스는 정확한 연애 분석 서비스가 아닙니다.</span>
        <span>그냥 웃자고 만든 거니까 진심으로 받아들이지 마셈.</span>
      </footer>
    </main>
  );
}
