"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  visible: boolean;
  onClick: () => void;
  rare?: boolean;
};

export default function RebuildButton({ visible, onClick, rare }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="rebuild"
          initial={{ opacity: 0, y: 14, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 230, damping: 22 }}
          onClick={onClick}
          className={`absolute left-1/2 -translate-x-1/2 bottom-[148px] sm:bottom-[160px] z-30 px-6 py-3 rounded-full text-[13.5px] font-medium tracking-tight border ${
            rare
              ? "bg-gradient-to-r from-[#fff066] via-[#ffd089] to-[#ff9ec7] text-black border-white/30 golden-pulse"
              : "bg-white/8 text-white border-white/15 hover:bg-white/15"
          }`}
        >
          다시 만들기
        </motion.button>
      )}
    </AnimatePresence>
  );
}
