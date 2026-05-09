import result from "./math/module";

export type MultiopArea = {
  id: number | string;
  name_area: string;
  status: string;
  answer?: string;
  explanation?: string[];
};

export function runMultiopForSupplier(supplierId: number): MultiopArea[] {
  const out = result(supplierId) as MultiopArea[] | unknown;
  if (!Array.isArray(out)) return [];
  return out.map((a) => ({
    id: a.id,
    name_area: a.name_area,
    status: String(a.status ?? ""),
    answer: a.answer,
    explanation: Array.isArray(a.explanation) ? [...a.explanation] : undefined,
  }));
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
