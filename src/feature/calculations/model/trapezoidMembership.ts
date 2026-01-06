export function trapezoidMembership(x: number, params: number[]): number {
  let [a, b, c, d] = params;

  if (d < a) {
    [a, d] = [d, a];
    [b, c] = [c, b];
  }

  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0;
}