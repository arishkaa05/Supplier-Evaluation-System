

export type KnowledgeBaseItem = {
  no: number;
  localHiring: LinguisticValue;
  completeness: LinguisticValue;
  defects: LinguisticValue;
  assessment: LinguisticValue;
};

export type Level = "L" | "M" | "H";
export type Trend = "up" | "down";         

export type LinguisticValue = {
  level: Level;
  trend: Trend;
};

export interface CriterionDbTable {
  name: string;
  range: [number, number];
  impactFactor: number;
  epsilon: number;
  rows: CriterionRow[];
}

export interface CriterionRow {
  description: string;
  value: LinguisticValue;       
  direction: Trend;
  parameters: [number, number, number, number];
}
