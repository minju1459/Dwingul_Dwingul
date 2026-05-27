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

// 좌표는 detect_wicks.py 로 실제 이미지에서 심지 위치를 자동 탐지해 얻음.
// 이미지를 교체하면 동일 스크립트로 다시 측정해 갱신.
export const CANDLE_ANCHORS: CandleAnchor[] = [
  { id: 0, x: 0.317, y: 0.121, hue: 28, scale: 1.0 },
  { id: 1, x: 0.407, y: 0.104, hue: 30, scale: 1.05 },
  { id: 2, x: 0.503, y: 0.091, hue: 32, scale: 1.1 },
  { id: 3, x: 0.59, y: 0.104, hue: 30, scale: 1.05 },
  { id: 4, x: 0.682, y: 0.119, hue: 28, scale: 1.0 },
];

export const CAKE_IMAGE_SRC = "/cake_base.png";
export const CAKE_IMAGE_ASPECT = 1536 / 1024;
