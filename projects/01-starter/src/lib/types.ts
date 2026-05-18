export type Letter = {
  id: string;
  body: string;
  createdAt: Date;
  /** 글로벌 체인에서 이 편지의 순번 (1번부터 시작) */
  chainNumber: number;
  from?: string;
};

export type LetterRepository = {
  getPreviousLetter: () => Promise<Letter>;
  sendLetter: (body: string) => Promise<{ id: string }>;
};
