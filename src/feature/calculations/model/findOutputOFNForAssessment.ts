import { assessmentDb } from "@/shared/config";
import { Level, Trend } from "@/shared/config/data/type";

export function findOutputOFNForAssessment(level: Level, trend: Trend): [number, number, number, number] {
   const row = assessmentDb.rows.find(
    (r: any) => r.value.level === level && r.direction === trend,
  );
  const p = row?.parameters as number[] | undefined;

   if (!p || p.length !== 4) return [0, 0, 0, 0];
  return [p[0], p[1], p[2], p[3]];
}