import { Level, Trend } from "@/shared/config/data/type";
import { CriterionTerm } from "./getActiveTermsForCriterion";

export function findParamsForTerm(
  db: { rows: Array<{ value: { level: Level }; direction: Trend; parameters: number[] }> },
  term: CriterionTerm,
): number[] | null {
  const row = db.rows.find(
    (r) => r.value.level === term.level && r.direction === term.trend,
  );
  return row?.parameters ?? null;
}