import { Supplier } from "@/shared/store/suppliers/type/supplierType";
import { computeSupplierFuzzyResult } from "./useSupplierFuzzyResult";
import { runMultiopForSupplier } from "./multiopResult";

export type BenchmarkRow = {
  system: "fuzzy" | "multiop";
  iterations: number;
  totalMs: number;
  meanMs: number;
  medianMs: number;
  minMs: number;
  maxMs: number;
};

const median = (arr: number[]): number => {
  const a = [...arr].sort((x, y) => x - y);
  const n = a.length;
  if (n === 0) return 0;
  if (n % 2 === 1) return a[(n - 1) / 2];
  return (a[n / 2 - 1] + a[n / 2]) / 2;
};

const timeRun = (fn: () => void, iterations: number): number[] => {
  // Прогрев: один разогревочный прогон, чтобы JIT успел оптимизировать.
  fn();
  const samples: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    fn();
    samples.push(performance.now() - t0);
  }
  return samples;
};

export function benchmarkSupplier(
  supplier: Supplier,
  iterations = 200,
): BenchmarkRow[] {
  const fuzzySamples = timeRun(() => {
    computeSupplierFuzzyResult(supplier);
  }, iterations);

  const multiopSamples = timeRun(() => {
    runMultiopForSupplier(supplier.id);
  }, iterations);

  const summarise = (
    system: BenchmarkRow["system"],
    samples: number[],
  ): BenchmarkRow => {
    const total = samples.reduce((s, x) => s + x, 0);
    return {
      system,
      iterations: samples.length,
      totalMs: total,
      meanMs: total / samples.length,
      medianMs: median(samples),
      minMs: Math.min(...samples),
      maxMs: Math.max(...samples),
    };
  };

  return [
    summarise("fuzzy", fuzzySamples),
    summarise("multiop", multiopSamples),
  ];
}
