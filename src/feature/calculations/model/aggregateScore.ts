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
  contributingRules: number;
  weightSum: number;
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
  let num = 0;
  let den = 0;
  let contributing = 0;

  for (const r of rules) {
    const w = Math.abs(r.firingStrength);
    if (w <= 0) continue;
    num += w * r.crispAssessment;
    den += w;
    contributing += 1;
  }

  let score: number;
  if (den > 0) {
    score = num / den;
  } else if (rules.length > 0) {
    score = rules.reduce((s, r) => s + r.crispAssessment, 0) / rules.length;
    contributing = rules.length;
  } else {
    score = 0;
  }

  const clamped = Math.max(0, Math.min(100, score));
  const zone = classifyZone(clamped);

  return {
    finalScore: clamped,
    zone,
    zoneLabel: ZONE_META[zone].label,
    zoneDescription: ZONE_META[zone].description,
    contributingRules: contributing,
    weightSum: den,
  };
}
