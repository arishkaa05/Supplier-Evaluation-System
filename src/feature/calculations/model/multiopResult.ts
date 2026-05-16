// Тонкая обёртка над серверными результатами мультиопераций.
// Сами расчёты выполняются в server_system/src/calc/multiop/.

import { useEvaluationStore, MultiopArea } from "@/shared/store/evaluation";
import { useSupplierStore } from "@/shared/store/suppliers";

export type { MultiopArea } from "@/shared/store/evaluation";

export function runMultiopForSupplier(supplierId: number): MultiopArea[] {
  const supplier = useSupplierStore
    .getState()
    .supplier.find((s) => s.id === supplierId);
  if (!supplier) return [];
  const result = useEvaluationStore
    .getState()
    .multiop.find((r) => r.supplier === supplier.supplier);
  return result?.areas ?? [];
}

export const STATUS_META: Record<
  string,
  { label: string; tone: "green" | "yellow" | "red" | "gray" }
> = {
  "0": { label: "Информация отсутствует", tone: "gray" },
  "1": { label: "Не подходит", tone: "red" },
  "2": { label: "Подходит", tone: "green" },
  "3": { label: "Противоречие эксперта и данных", tone: "yellow" },
  "4": { label: "Часть данных недоступна", tone: "gray" },
  "5": { label: "Может не подходить (на опыте эксперта)", tone: "yellow" },
  "6": { label: "Может подходить (на опыте эксперта)", tone: "yellow" },
  "7": { label: "Требуются уточнения", tone: "gray" },
};
