/**
 * 케이크 이미지(cake-base.png) 위에 그릴 5개 촛불의 상대 좌표.
 * x, y 는 이미지 가로/세로 대비 0~1 비율. 심지 끝(불꽃이 시작되는 지점).
 * 이미지 교체 시 이 좌표를 다시 측정해서 맞춰야 함.
 */
export type CandleAnchor = {
  id: number;
  x: number;
  y: number;
  hue: number;
  scale: number;
};

export const CANDLE_ANCHORS: CandleAnchor[] = [
  { id: 0, x: 0.305, y: 0.108, hue: 28, scale: 1.0 },
  { id: 1, x: 0.405, y: 0.082, hue: 30, scale: 1.05 },
  { id: 2, x: 0.5, y: 0.075, hue: 32, scale: 1.1 },
  { id: 3, x: 0.595, y: 0.082, hue: 30, scale: 1.05 },
  { id: 4, x: 0.69, y: 0.115, hue: 28, scale: 1.0 },
];

export const CAKE_IMAGE_SRC = "/cake-base.png";
export const CAKE_IMAGE_ASPECT = 1394 / 1147;
