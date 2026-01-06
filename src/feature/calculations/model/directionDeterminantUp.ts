export function directionDeterminantUp(x: number, params: number[]): number {
   const [a, b, _b2, c] = params;
  if (!(a < b && b < c)) return 0;

  if (x > a && x <= b) return (x - b) / (b - a);
  if (x > b && x < c) return (x - b) / (c - b);
  return 0;
}