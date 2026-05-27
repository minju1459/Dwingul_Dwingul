"use client";

type Props = {
  visible: boolean;
  onClick: () => void;
};

export default function ReplayButton({ visible, onClick }: Props) {
  if (!visible) return null;
  return (
    <div className="absolute inset-x-0 bottom-10 sm:bottom-14 flex justify-center z-30 px-6">
      <button
        onClick={onClick}
        className="fade-up px-6 py-3 rounded-full bg-white/10 backdrop-blur text-white text-[14px] font-medium border border-white/15 hover:bg-white/20 active:scale-[0.98] transition"
        style={{ animationDelay: "1.4s" }}
      >
        다시 불 켜기
      </button>
    </div>
  );
}
