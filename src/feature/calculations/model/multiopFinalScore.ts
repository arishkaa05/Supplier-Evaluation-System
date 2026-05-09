import { knowledgeBase } from "@/shared/config";
import { Level } from "@/shared/config/data/type";
import { Zone, classifyZone } from "./aggregateScore";
import { MultiopArea } from "./multiopResult";

const LEVEL_SCORE: Record<Level, number> = {
  L: 6.25,
  M: 50,
  H: 93.75,
};

// Вес статуса при агрегации (статус 4 = «потенциально применимо, нужно уточнение» —
// учитываем со значимым весом, чтобы supplier с неопределённой метрикой получал оценку).
const STATUS_WEIGHT: Record<string, number> = {
  "2": 1.0,
  "6": 0.7,
  "5": 0.3,
  "4": 0.4,
  "3": 0.2,
  "1": 0,
  "0": 0,
  "7": 0,
};

const ZONE_META: Record<Zone, { label: string; description: string }> = {
  red: { label: "Красная зона", description: "Отказ от поставщика" },
  yellow: { label: "Жёлтая зона", description: "Возможны проблемы" },
  green: { label: "Зелёная зона", description: "Надёжный поставщик" },
};

export type MultiopEvaluation = {
  finalScore: number;
  zone: Zone;
  zoneLabel: string;
  zoneDescription: string;
  contributingRules: number;
  totalActivated: number;
  weightSum: number;
};

export function aggregateMultiopScore(
  areas: MultiopArea[],
): MultiopEvaluation | null {
  let num = 0;
  let den = 0;
  let contributing = 0;
  let totalActivated = 0;

  for (const area of areas) {
    const status = String(area.status ?? "");
    if (status === "" || status === "0") continue;
    totalActivated += 1;
    const w = STATUS_WEIGHT[status] ?? 0;
    if (w <= 0) continue;
    const rule = knowledgeBase.find((r) => r.no === Number(area.id));
    if (!rule) continue;
    const score = LEVEL_SCORE[rule.assessment.level];
    num += w * score;
    den += w;
    contributing += 1;
  }

  if (den <= 0) return null;

  const finalScore = Math.max(0, Math.min(100, num / den));
  const zone = classifyZone(finalScore);

  return {
    finalScore,
    zone,
    zoneLabel: ZONE_META[zone].label,
    zoneDescription: ZONE_META[zone].description,
    contributingRules: contributing,
    totalActivated,
    weightSum: den,
  };
}
