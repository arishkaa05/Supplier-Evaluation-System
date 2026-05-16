// DTO, отражающие схему серверного API (snake_case поля как в БД).
export type ServerObservation = {
  id: number;
  month: number;
  local_hiring: number;
  completeness: number;
  defects: number;
  quality_local_hiring: string;
  quality_completeness: string;
  quality_defects: string;
};

export type ServerSupplier = {
  id: number;
  name: string;
  data: ServerObservation[];
};

export type ServerCriterionRow = {
  id: number;
  description: string;
  level: "L" | "M" | "H";
  trend: "up" | "down";
  direction: "up" | "down";
  p1: number;
  p2: number;
  p3: number;
  p4: number;
};

export type ServerCriterion = {
  id: number;
  key: string;
  name: string;
  range_min: number;
  range_max: number;
  impact_factor: number;
  epsilon: number;
  rows: ServerCriterionRow[];
};

export type ServerKbRule = {
  id: number;
  no: number;
  local_hiring_level: "L" | "M" | "H";
  local_hiring_trend: "up" | "down";
  completeness_level: "L" | "M" | "H";
  completeness_trend: "up" | "down";
  defects_level: "L" | "M" | "H";
  defects_trend: "up" | "down";
  assessment_level: "L" | "M" | "H";
  assessment_trend: "up" | "down";
};
