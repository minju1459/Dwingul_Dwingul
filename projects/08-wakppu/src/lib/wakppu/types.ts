/**
 * 왁뿌(왁스+뽀로로) 한 개의 정의.
 * shell 형태에 따라 본체 그리기 / 균열 색 / 슬라임 노출 색이 결정됨.
 */

export type DonutShell = {
  kind: "donut";
  /** 도넛 본체에 깔리는 무지개 그라데이션 색상들(최소 3개). */
  innerColors: string[];
  /** 도넛 표면을 덮는 하얀 막(왁스 코팅) 톤. */
  glaze: string;
  /** 스프링클 색 풀. */
  sprinkles: string[];
};

export type SolidShell = {
  kind: "solid";
  /** 겉면 왁스 색상. */
  outerColor: string;
  /** 부서지면 보이는 슬라임 색상. */
  innerColor: string;
};

export type WakppuShell = DonutShell | SolidShell;

export type ToneHint = "light" | "medium" | "heavy";

export type WakppuVariant = {
  id: string;
  name: string;
  shell: WakppuShell;
  /** 사운드 합성 시 필터 대역/길이 등에 영향. */
  toneHint: ToneHint;
  /** 작은 안내 색상 (썸네일 테두리 등). */
  accent: string;
};

export type CrackStage = 0 | 1 | 2 | 3 | 4 | 5;
// 0 idle / 1 작은 균열 / 2 균열 확대 / 3 파편 일부 / 4 슬라임 노출 / 5 완파
