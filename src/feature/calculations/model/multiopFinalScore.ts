// Тонкая обёртка: возвращает MultiopEvaluation, рассчитанную на сервере.
// Сопоставление area[] → evaluation идёт по ссылочной идентичности списка areas
// в store: тот же список, что вернул сервер.

import { useEvaluationStore, MultiopArea, MultiopEvaluation } from "@/shared/store/evaluation";

export type { MultiopEvaluation } from "@/shared/store/evaluation";

export function aggregateMultiopScore(areas: MultiopArea[]): MultiopEvaluation | null {
  const found = useEvaluationStore
    .getState()
    .multiop.find((r) => r.areas === areas);
  return found?.evaluation ?? null;
}
