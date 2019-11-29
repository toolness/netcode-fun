export const VEC2_ZERO: Vec2 = { x: 0, y: 0 };

export interface Vec2 {
  x: number;
  y: number;
}

export function vec2Equals(a: Vec2, b: Vec2): boolean {
  return a.x === b.x && a.y === b.y;
}

export function vec2Add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vec2Subtract(a: Vec2, b: Vec2): Vec2 {
  return vec2Add(a, vec2Scale(b, -1));
}

export function vec2Scale(v: Vec2, amount: number): Vec2 {
  return { x: amount * v.x, y: amount * v.y };
}
