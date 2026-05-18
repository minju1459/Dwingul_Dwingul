import { Desktop } from "@/components/desktop/Desktop";
import { pickRandomLetter } from "@/lib/mock-letters";

export const dynamic = "force-dynamic";

export default function Home() {
  const previousLetter = pickRandomLetter();

  const serializableLetter = {
    ...previousLetter,
    createdAt: previousLetter.createdAt,
  };

  return <Desktop previousLetter={serializableLetter} />;
}
