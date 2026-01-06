export function directionDeterminantDown(x: number, params: number[], rho: number): number {
   const [d, e, _e2, f] = params; 
  const dd = Math.max(d, e, f);
  const ff = Math.min(d, e, f);
  const ee = [d, e, f].sort((p, q) => p - q)[1];

  if (!(ff < ee && ee < dd)) return 0;

  if (x > ff && x <= ee) return (x - ee) / (ee - ff) - rho;
  if (x > ee && x < dd) return (x - ee) / (dd - ee) - rho;
  return 0;
}