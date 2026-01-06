import { MU_DEFUZZ } from "./const";

export function defuzzify(Bp: [number, number, number, number], mu = MU_DEFUZZ): number {
  const [a1, b1, _b2, c1] = Bp;
  return (mu * a1 + b1 + (2 - mu) * c1) / 3;
}