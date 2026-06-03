"use client";

import IpchunEpisode from "@/components/IpchunEpisode";

export default function Home() {
  const handleQuit = () => {
    window.open(
      "https://www.youtube.com/results?search_query=" + encodeURIComponent("한로로 입춘"),
      "_blank"
    );
  };

  const handleNext = () => {
    // TODO: 다음 에피소드 (파랗게) 구현 후 연결
    alert("다음 에피소드는 준비 중이에요 🌱");
  };

  return <IpchunEpisode onQuit={handleQuit} onNext={handleNext} />;
}
