import { Level, Trend } from "@/shared/config/data/type";
import { CriterionTerm } from "./getActiveTermsForCriterion";

export type FiredRule = {
  no: number;
  assessment: { level: Level; trend: Trend };
  localHiring: CriterionTerm;
  completeness: CriterionTerm;
  defects: CriterionTerm;
  firingStrength: number;
  crispAssessment: number;
};

export type Zone = "red" | "yellow" | "green";

export type SupplierEvaluation = {
  finalScore: number;
  zone: Zone;
  zoneLabel: string;
  zoneDescription: string;
  activatedRules: number;
  entropy: number;
  trendShare: { positive: number; negative: number };
};

const ZONE_META: Record<Zone, { label: string; description: string }> = {
  red: {
    label: "Red group",
    description: "Immediate supplier rejection",
  },
  yellow: {
    label: "Yellow group",
    description: "Potential problems",
  },
  green: {
    label: "Green group",
    description: "Reliable supplier",
  },
};

export function classifyZone(score: number): Zone {
  if (score <= 33.33) return "red";
  if (score <= 66.66) return "yellow";
  return "green";
}

export function aggregateSupplierScore(rules: FiredRule[]): SupplierEvaluation {
  const N = rules.length;

  // Formula (13): y* = Σ φ(B'_n) / N — простое арифметическое среднее.
  const score =
    N > 0 ? rules.reduce((s, r) => s + r.crispAssessment, 0) / N : 0;

  // Formula (12): Shannon-entropy of normalized crisp values, scaled to [0,1].
  let entropy = 0;
  if (N > 1) {
    const sum = rules.reduce((s, r) => s + Math.max(0, r.crispAssessment), 0);
    if (sum > 0) {
      const lnN = Math.log(N);
      let h = 0;
      for (const r of rules) {
        const p = Math.max(0, r.crispAssessment) / sum;
        if (p > 0) h += p * Math.log(p);
      }
      entropy = -h / lnN;
    }
  }

  // Trend share — доля правил с положительным/отрицательным направлением вывода.
  let pos = 0;
  let neg = 0;
  for (const r of rules) {
    if (r.assessment.trend === "up") pos += 1;
    else neg += 1;
  }
  const trendShare =
    N > 0
      ? { positive: pos / N, negative: neg / N }
      : { positive: 0, negative: 0 };

  const clamped = Math.max(0, Math.min(100, score));
  const zone = classifyZone(clamped);

  return {
    finalScore: clamped,
    zone,
    zoneLabel: ZONE_META[zone].label,
    zoneDescription: ZONE_META[zone].description,
    activatedRules: N,
    entropy,
    trendShare,
  };
}
