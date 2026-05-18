export type Letter = {
  id: string;
  body: string;
  createdAt: Date;
  from?: string;
};

export type LetterRepository = {
  getPreviousLetter: () => Promise<Letter>;
  sendLetter: (body: string) => Promise<{ id: string }>;
};
