// Хранилище результатов оценки, рассчитанных на сервере.
// Содержит результаты обеих ИС (нечёткой и мультиоперационной)
// и refresh-метод, который перезапрашивает их через /api/evaluate/*.

import { create } from "zustand";
import { apiFetch } from "@/shared/api/client";
import { useSupplierStore } from "@/shared/store/suppliers";

// Типы зеркалят серверный ответ — поля как в server_system/src/calc/*.
export type Level = "L" | "M" | "H";
export type Trend = "up" | "down";
export type Zone = "red" | "yellow" | "green";
export type MetricKey = "localHiring" | "completeness" | "defects";

export type CriterionTerm = {
  level: Level;
  trend: Trend;
  mu: number;
  correlation: number;
  value: number;
};

export type FiredRule = {
  no: number;
  assessment: { level: Level; trend: Trend };
  localHiring: CriterionTerm;
  completeness: CriterionTerm;
  defects: CriterionTerm;
  firingStrength: number;
  crispAssessment: number;
};

export type SupplierEvaluation = {
  finalScore: number;
  zone: Zone;
  zoneLabel: string;
  zoneDescription: string;
  activatedRules: number;
  entropy: number;
  trendShare: { positive: number; negative: number };
};

export type FuzzyBlocker = {
  metric: MetricKey;
  reason: "missing" | "expert";
  details: string;
};

export type FuzzyTrimInfo = {
  totalObservations: number;
  usedObservations: number;
  trimmed: boolean;
  lastBadMonth?: number;
};

export type SupplierFuzzyResult = {
  supplier: string;
  rules: FiredRule[];
  evaluation: SupplierEvaluation | null;
  blockers: FuzzyBlocker[];
  status: "ok" | "blocked";
  trim: FuzzyTrimInfo;
};

export type MultiopArea = {
  id: number | string;
  name_area: string;
  status: string;
  answer?: string;
  explanation?: string[];
};

export type MultiopEvaluation = {
  finalScore: number;
  zone: Zone;
  zoneLabel: string;
  zoneDescription: string;
  contributingRules: number;
  totalActivated: number;
};

export type SupplierMultiopResult = {
  supplier: string;
  areas: MultiopArea[];
  evaluation: MultiopEvaluation | null;
};

type State = {
  fuzzy: SupplierFuzzyResult[];
  multiop: SupplierMultiopResult[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

let inflight: Promise<void> | null = null;

export const useEvaluationStore = create<State>((set) => ({
  fuzzy: [],
  multiop: [],
  loading: false,
  error: null,
  refresh: async () => {
    if (inflight) return inflight;
    inflight = (async () => {
      set({ loading: true, error: null });
      try {
        const suppliers = useSupplierStore.getState().supplier;
        // Один запрос на поставщика. На сервере /api/evaluate/{fuzzy,multiop}
        // принимает ?supplierId=N и считает только этого поставщика.
        const pairs = await Promise.all(
          suppliers.map(async (s) => {
            const [fz, mo] = await Promise.all([
              apiFetch<{ results: SupplierFuzzyResult[] }>(
                `/evaluate/fuzzy?supplierId=${s.id}`,
              ),
              apiFetch<{ results: SupplierMultiopResult[] }>(
                `/evaluate/multiop?supplierId=${s.id}`,
              ),
            ]);
            return { fuzzy: fz.results[0], multiop: mo.results[0] };
          }),
        );
        set({
          fuzzy: pairs.map((p) => p.fuzzy).filter(Boolean) as SupplierFuzzyResult[],
          multiop: pairs.map((p) => p.multiop).filter(Boolean) as SupplierMultiopResult[],
          loading: false,
        });
      } catch (e: any) {
        set({ loading: false, error: String(e?.message ?? e) });
        console.error("[evaluation] refresh failed:", e);
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
}));
