export type ButtonStateSnapshot = {
  awakeCount: number;
  totalPresses: number;
  lastPressedAt: Date;
};

export type PressOrigin = "self" | "remote";

export type PressEvent = {
  at: Date;
  origin: PressOrigin;
};
