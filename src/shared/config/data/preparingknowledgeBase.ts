import { localHiringDb, completenessDb, defectsDb, knowledgeBase } from "..";
import type { CriterionDbTable, KnowledgeBaseItem, Level } from "./type";

export type Trend = "up" | "down";

export type Parametr = {
  id: number;
  name_parametr: string;
  max_value_parametr: number;
  min_value_parametr: number;
};

export type Symptom = {
  id: number;
  name_symptom: string;
  range_start_symptom: number;
  range_end_symptom: number;
  parametrs: [Parametr];
};

export type SymptomsByParamId = Record<number, Record<string, any>>;

export type CriterionDbMap = Record<string, CriterionDbTable>;

const arrow = (t: Trend) => (t === "up" ? "↑" : "↓");
const normalizeName = (name: string) => name.trim().toLowerCase();
const symName = (level: Level, trend: Trend) => `${level}${arrow(trend)}`;
const symptomKey = (x: { level: Level; trend: Trend }) => `${x.level}${arrow(x.trend)}`;

const minOf = (nums: number[]) => Math.min(...nums);
const maxOf = (nums: number[]) => Math.max(...nums);

function buildSymptomsByParamId(dbs: CriterionDbTable[]): SymptomsByParamId {
  const result: SymptomsByParamId = {};

   let nextUpParamId = 1; // 1..3
  let nextDownParamId = 1 + dbs.length; // 4..6
 
  const nextSymptomIdByDb: Record<number, { up: number; down: number }> = {};
  dbs.forEach((_, idx) => {
    nextSymptomIdByDb[idx] = {
      up: 1 + idx * 6, 
      down: 4 + idx * 6,  
    };
  });

  for (let idx = 0; idx < dbs.length; idx++) {
    const db = dbs[idx];
    const baseName = normalizeName(db.name);

     {
      const upParamId = nextUpParamId++;
      const upRows = db.rows.filter((r) => r.value.trend === "up");
 
      const upParam: Parametr = {
        id: upParamId,
        name_parametr: `${baseName}↑`,
        max_value_parametr: db.range[1] + 0.1,  
        min_value_parametr: db.range[0] - 0.1,  
      };

      result[upParamId] = {
        symptoms: upRows.map((row) => {
          const start = minOf(row.parameters);
          const end = maxOf(row.parameters);

          return {
            id: nextSymptomIdByDb[idx].up++,
            name_symptom: symName(row.value.level, row.value.trend),
            range_start_symptom: start,
            range_end_symptom: end,
            parametrs: [upParam],
          };
        }),
      };
    }
 
    {
      const downParamId = nextDownParamId++;
      const downRows = db.rows.filter((r) => r.value.trend === "down");

      const downParam: Parametr = {
        id: downParamId,
        name_parametr: `${baseName}↓`,
        max_value_parametr: db.range[1] + 0.1,
        min_value_parametr: db.range[0] - 0.1,
      };

      result[downParamId] = {
        symptoms: downRows.map((row) => { 
          const start = minOf(row.parameters);
          const end = maxOf(row.parameters);

          return {
            id: nextSymptomIdByDb[idx].down++,
            name_symptom: symName(row.value.level, row.value.trend),
            range_start_symptom: start,
            range_end_symptom: end,
            parametrs: [downParam],
          };
        }),
      };
    }
  }

  return result;
}

export const symptomsByParamId = buildSymptomsByParamId([
  localHiringDb,
  completenessDb,
  defectsDb,
]);
 
function findSymptomId(
  paramId: 1 | 2 | 3 | 4 | 5 | 6,
  term: { level: Level; trend: Trend },
): number {
  const key = symptomKey(term);
  const found = symptomsByParamId[paramId].symptoms.find(
    (s) => s.name_symptom === key,
  );
  if (!found) {
    throw new Error(`Symptom not found: paramId=${paramId}, key=${key}`);
  }
  return found.id;
}

export type IArea = {
  id: number;
  name_area: string;
  formula_area: string;
};

function knowledgeBaseToAreas(knowledgeBase: KnowledgeBaseItem[]): IArea[] {
  const areas = knowledgeBase.map((rule) => { 
      const sLocalHiring = findSymptomId(
      rule.localHiring.trend === "up" ? 1 : 4,
      rule.localHiring,
    );
    const sCompleteness = findSymptomId(
      rule.completeness.trend === "up" ? 2 : 5,
      rule.completeness,
    );
    const sDefects = findSymptomId(
      rule.defects.trend === "up" ? 3 : 6,
      rule.defects,
    );
    return {
      id: rule.no,
      name_area: `${rule.no}) ${rule.assessment.level}${arrow(
        rule.assessment.trend,
      )}`,
      formula_area: `s${sLocalHiring}&s${sCompleteness}&s${sDefects}`,
    };
  });
  return areas;
}

export const areas = knowledgeBaseToAreas(knowledgeBase);
