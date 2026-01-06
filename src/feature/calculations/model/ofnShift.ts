import { Trend } from "@/shared/config/data/type";

export function ofnShift(
  B: [number, number, number, number],
  DA: number,
  outTrend: Trend,
): [number, number, number, number] {
  const [k, l, _l2, m] = B;
  const abs = Math.abs(DA);

  const toK: [number, number, number, number] = [k, k, k, k];
  const toM: [number, number, number, number] = [m, m, m, m];
 
  const target =
    outTrend === "up"
      ? (DA <= 0 ? toK : toM) // (9)
      : (DA <= 0 ? toM : toK); // (10)

  return [
    k + abs * (target[0] - k),
    l + abs * (target[1] - l),
    l + abs * (target[2] - l),
    m + abs * (target[3] - m),
  ];
}