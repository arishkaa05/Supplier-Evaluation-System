export const pearsonCorrelation = (x: number[], y: number[]): number | null => {
  if (x.length !== y.length || x.length === 0) return null;

  const mean = (arr: number[]) =>
    arr.reduce((sum, v) => sum + v, 0) / arr.length;

  const mx = mean(x);
  const my = mean(y);

  let num = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    sumXX += dx * dx;
    sumYY += dy * dy;
  }

  const denom = Math.sqrt(sumXX * sumYY);
  if (denom === 0) return null;

  return  Math.round(num / denom * 100) / 100;
};