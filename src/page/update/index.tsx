import { CloudUpload } from "lucide-react";
import { FC } from "react";
import { useSupplierStore } from "@/shared/store/suppliers";
import {
  MetricKey,
  QualityValue,
  Supplier,
} from "@/shared/store/suppliers/type/supplierType";
import { cn } from "@/shared/lib/utils";

const METRIC_LABEL: Record<MetricKey, string> = {
  localHiring: "Наём",
  completeness: "Полнота",
  defects: "Дефекты",
};

const METRIC_NOMINATIVE: Record<MetricKey, string> = {
  localHiring: "Наём местных жителей",
  completeness: "Полнота заказа",
  defects: "Дефекты",
};

const Update = () => {
  const { supplier } = useSupplierStore();

  return (
    <main className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <CloudUpload size={32} strokeWidth={1} className="text-slate-700" />
        <h4 className="text-2xl font-semibold">Обновить данные</h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {supplier.map((sp) => (
          <SupplierTable key={sp.id} sp={sp} />
        ))}
      </div>
    </main>
  );
};

export default Update;

type Quality = QualityValue;

const isMissing = (q: Quality) => q === "0" || q === "3";
const isExpert = (q: Quality) => q === "2";

type Diagnosis = {
  kind: "exact" | "expert" | "missing";
  expertMetrics: MetricKey[];
  missingMetrics: MetricKey[];
};

function diagnose(sp: Supplier): Diagnosis {
  const metrics: MetricKey[] = ["localHiring", "completeness", "defects"];
  const missingMetrics: MetricKey[] = [];
  const expertMetrics: MetricKey[] = [];

  for (const m of metrics) {
    const qualities = sp.data.map((d) => (d.quality?.[m] ?? "1") as Quality);
    if (qualities.some(isMissing)) missingMetrics.push(m);
    else if (qualities.some(isExpert)) expertMetrics.push(m);
  }

  if (missingMetrics.length > 0)
    return { kind: "missing", expertMetrics, missingMetrics };
  if (expertMetrics.length > 0)
    return { kind: "expert", expertMetrics, missingMetrics };
  return { kind: "exact", expertMetrics, missingMetrics };
}

const joinAnd = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " и " + items[items.length - 1];
};

const SupplierTable: FC<{ sp: Supplier }> = ({ sp }) => {
  const months = [...sp.data].sort((a, b) => a.month - b.month);
  const diag = diagnose(sp);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="font-semibold">{sp.supplier}</div>
      </div>

      <div className="p-4">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="text-xs text-slate-600 uppercase tracking-wide">
              <th className="px-3 py-2 border-b border-slate-200 text-center">Месяц</th>
              <th className="px-3 py-2 border-b border-slate-200 text-center">
                {METRIC_LABEL.localHiring}
              </th>
              <th className="px-3 py-2 border-b border-slate-200 text-center">
                {METRIC_LABEL.completeness}
              </th>
              <th className="px-3 py-2 border-b border-slate-200 text-center">
                {METRIC_LABEL.defects}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {months.map((row) => {
              const q = row.quality ?? {
                localHiring: "1" as Quality,
                completeness: "1" as Quality,
                defects: "1" as Quality,
              };
              return (
                <tr key={row.month}>
                  <td className="text-center px-3 py-1.5 font-medium">{row.month}</td>
                  <ValueCell value={row.localHiring} quality={q.localHiring as Quality} />
                  <ValueCell value={row.completeness} quality={q.completeness as Quality} />
                  <ValueCell value={row.defects} quality={q.defects as Quality} />
                </tr>
              );
            })}
          </tbody>
        </table>

        <Result diag={diag} sp={sp} />
      </div>
    </section>
  );
};

const ValueCell: FC<{ value: number; quality: Quality }> = ({ value, quality }) => {
  if (isMissing(quality)) {
    return (
      <td
        className="text-center px-3 py-1.5 bg-red-50 text-red-700"
        title="Значение не определено"
      />
    );
  }
  if (isExpert(quality)) {
    return (
      <td
        className="text-center px-3 py-1.5 bg-yellow-50 text-yellow-800"
        title="Значение определено на основании опыта эксперта"
      >
        {value} <span className="font-semibold">(?)</span>
      </td>
    );
  }
  return <td className="text-center px-3 py-1.5">{value}</td>;
};

const Result: FC<{ diag: Diagnosis; sp: Supplier }> = ({ diag, sp }) => {
  if (diag.kind === "exact") {
    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
        <span className="font-semibold">Результат:</span> данные определены точно.
      </div>
    );
  }

  if (diag.kind === "expert") {
    // Метрики, экспертные именно в последнем месяце.
    const last = [...sp.data].sort((a, b) => a.month - b.month).at(-1);
    const lastExpert = diag.expertMetrics.filter(
      (m) => (last?.quality?.[m] as Quality | undefined) === "2",
    );
    const target = lastExpert.length > 0 ? lastExpert : diag.expertMetrics;
    const names = target.map((m) => `«${METRIC_NOMINATIVE[m]}»`);
    const where = lastExpert.length > 0 ? "за последний месяц" : "за часть месяцев";
    return (
      <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
        <div>
          <span className="font-semibold">Результат:</span> часть данных задана
          неточно.
        </div>
        <div className="mt-1 text-xs">
          Для поставщика по входным переменным {joinAnd(names)} не удалось
          определить точные значения {where} — соответствующие наблюдения заданы
          на основании опыта эксперта.
        </div>
      </div>
    );
  }

  const names = diag.missingMetrics.map((m) => `«${METRIC_NOMINATIVE[m]}»`);
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <div>
        <span className="font-semibold">Результат:</span> часть данных
        невозможно определить.
      </div>
      <div className="mt-1 text-xs">
        Для поставщика по входным переменным {joinAnd(names)} отсутствуют
        точные значения за часть месяцев — построить полный исторический ряд
        нельзя.
      </div>
    </div>
  );
};
