// Тонкая обёртка: возвращает fuzzy-результаты, вычисленные на сервере.
// Сами расчёты выполняются в server_system/src/calc/fuzzy/.

import { useEvaluationStore } from "@/shared/store/evaluation";

export type {
  SupplierFuzzyResult,
  FuzzyBlocker,
  FiredRule,
  SupplierEvaluation,
  CriterionTerm,
} from "@/shared/store/evaluation";

export function useSupplierRules() {
  return useEvaluationStore((s) => s.fuzzy);
}
