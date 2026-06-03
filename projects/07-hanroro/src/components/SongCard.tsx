"use client";

import { motion } from "framer-motion";

export interface Song {
  title: string;
  album: string;
  year: string;
  mood: string[];
  description: string;
  color: string; // tailwind gradient class
  youtubeQuery: string;
}

interface SongCardProps {
  song: Song;
  index: number;
}

export default function SongCard({ song, index }: SongCardProps) {
  const handleListen = () => {
    const query = encodeURIComponent(`한로로 ${song.title}`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="song-card relative rounded-2xl border border-white/10 bg-white/5 p-5 cursor-pointer group"
      onClick={handleListen}
    >
      {/* 상단 컬러 바 */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${song.color}`} />

      {/* 제목 */}
      <h3 className="mt-1 text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
        {song.title}
      </h3>

      {/* 앨범 / 연도 */}
      <p className="mt-0.5 text-sm text-white/50">
        {song.album} · {song.year}
      </p>

      {/* 설명 */}
      <p className="mt-2 text-sm text-white/70 leading-relaxed line-clamp-2">
        {song.description}
      </p>

      {/* 무드 태그 */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {song.mood.map((m) => (
          <span
            key={m}
            className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-purple-200"
          >
            {m}
          </span>
        ))}
      </div>

      {/* 들어보기 버튼 */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-white/40 group-hover:text-purple-300 transition-colors">
        <span>▶</span>
        <span>유튜브에서 들어보기</span>
      </div>
    </motion.div>
  );
}
