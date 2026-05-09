import { useMemo, useState, FC } from "react";
import { LayoutDashboard } from "lucide-react";
import { useSupplierStore } from "@/shared/store/suppliers";
import {
  useSupplierRules,
  SupplierFuzzyResult,
} from "@/feature/calculations/model/useSupplierFuzzyResult";
import { Zone } from "@/feature/calculations/model/aggregateScore";
import {
  runMultiopForSupplier,
  STATUS_META,
  MultiopArea,
} from "@/feature/calculations/model/multiopResult";
import {
  aggregateMultiopScore,
  MultiopEvaluation,
} from "@/feature/calculations/model/multiopFinalScore";
import { Level, Trend } from "@/shared/config/data/type";
import { cn } from "@/shared/lib/utils";

const formatTerm = (t?: { level: Level; trend: Trend }) =>
  t ? `${t.level}${t.trend === "up" ? "↑" : "↓"}` : "";

const ZONE_STYLES: Record<
  Zone,
  { bar: string; bg: string; text: string; border: string; label: string; description: string }
> = {
  red: {
    bar: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    label: "Красная зона",
    description: "Отказ от поставщика",
  },
  yellow: {
    bar: "bg-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    label: "Жёлтая зона",
    description: "Возможны проблемы",
  },
  green: {
    bar: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
    label: "Зелёная зона",
    description: "Надёжный поставщик",
  },
};

const TONE_STYLES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-300",
  yellow: "bg-yellow-50 text-yellow-800 border-yellow-300",
  red: "bg-red-50 text-red-700 border-red-300",
  gray: "bg-slate-50 text-slate-600 border-slate-300",
};

// Порядок сортировки правил мультиоперационной системы:
//   2 — подходит, 6 — может подходить (эксперт), 4 — потенциально (нужно уточнение),
//   5 — может не подходить, 3/7 — пограничные, 1 — не подходит, 0 — нет данных.
const STATUS_ORDER: Record<string, number> = {
  "2": 0,
  "6": 1,
  "4": 2,
  "5": 3,
  "3": 4,
  "7": 5,
  "1": 6,
  "0": 7,
};

const Dashboards = () => {
  const { supplier } = useSupplierStore();
  const fuzzyResults = useSupplierRules();

  const [activeId, setActiveId] = useState<number>(supplier[0]?.id ?? 1);

  const activeSupplier = supplier.find((s) => s.id === activeId);
  const activeFuzzy = fuzzyResults.find(
    (r) => r.supplier === activeSupplier?.supplier,
  );

  const multiop = useMemo<MultiopArea[]>(() => {
    if (!activeSupplier) return [];
    return runMultiopForSupplier(activeSupplier.id);
  }, [activeSupplier, supplier]);

  const multiopEvaluation = useMemo<MultiopEvaluation | null>(
    () => aggregateMultiopScore(multiop),
    [multiop],
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <LayoutDashboard size={24} strokeWidth={1} />
        <h4 className="text-4xl font-bold">Дашборды</h4>
      </div>

      <div className="flex gap-2 mb-6">
        {supplier.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveId(s.id)}
            className={cn(
              "px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
              activeId === s.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100",
            )}
          >
            {s.supplier}
          </button>
        ))}
      </div>

      {activeSupplier && activeFuzzy && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FuzzyPanel result={activeFuzzy} />
            <MultiopPanel areas={multiop} />
          </div>

          <div className="mt-6">
            <EvaluationPanel evaluation={multiopEvaluation} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboards;

const FuzzyPanel: FC<{ result: SupplierFuzzyResult }> = ({ result }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-1">
        Система на основе нечёткой логики
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        OFN-вывод по правилам IF–THEN из базы знаний (Rudnik et al., Entropy 2024).
      </p>

      {result.status === "blocked" ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold mb-2">
            Система не формирует итоговый вывод
          </div>
          <p className="mb-2">
            Процедура фаззификации требует точных входных значений за весь
            горизонт наблюдений. При отсутствии или экспертно заданных
            наблюдениях направление OFN не может быть определено корректно,
            поэтому система не формирует итоговый вывод.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {result.blockers.map((b, i) => (
              <li key={i}>{b.details}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs text-slate-600 uppercase tracking-wide">
                <th className="px-2 py-2 border-b border-slate-200 text-center">№ правила</th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">Наём</th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">Полнота</th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">Дефекты</th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">Заключение</th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">DA</th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">Crisp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {result.rules.map((r) => (
                <tr key={r.no} className="hover:bg-slate-50">
                  <td className="text-center px-2 py-1">{r.no}</td>
                  <td className="text-center px-2 py-1">{formatTerm(r.localHiring)}</td>
                  <td className="text-center px-2 py-1">{formatTerm(r.completeness)}</td>
                  <td className="text-center px-2 py-1">{formatTerm(r.defects)}</td>
                  <td className="text-center px-2 py-1">{formatTerm(r.assessment)}</td>
                  <td className="text-center px-2 py-1">{r.firingStrength.toFixed(4)}</td>
                  <td className="text-center px-2 py-1">{r.crispAssessment.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
            {result.evaluation && (
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td colSpan={6} className="text-right px-2 py-2 border-t border-slate-200">
                    Σ φ(B'ₙ) / N (нечёткая система)
                  </td>
                  <td className="text-center px-2 py-2 border-t border-slate-200">
                    {result.evaluation.finalScore.toFixed(4)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </section>
  );
};

const MultiopPanel: FC<{ areas: MultiopArea[] }> = ({ areas }) => {
  // Сортируем по приоритету статуса: подходящие сверху, не подходящие — внизу.
  const sorted = useMemo(() => {
    return [...areas].sort((a, b) => {
      const sa = STATUS_ORDER[String(a.status)] ?? 99;
      const sb = STATUS_ORDER[String(b.status)] ?? 99;
      if (sa !== sb) return sa - sb;
      return Number(a.id) - Number(b.id);
    });
  }, [areas]);

  const fitting = sorted.filter((a) => a.status === "2");
  const maybe = sorted.filter((a) => a.status === "6");
  const potential = sorted.filter((a) => a.status === "4");
  const others = sorted.filter(
    (a) => a.status !== "2" && a.status !== "6" && a.status !== "4" && a.status !== "0",
  );
  const noInfo = sorted.filter((a) => a.status === "0");

  const isUnsuitable = (s: string) => s === "1" || s === "5" || s === "3";

  const renderRow = (a: MultiopArea) => {
    const status = String(a.status);
    const meta = STATUS_META[status] ?? { label: `Статус ${status}`, tone: "gray" as const };
    const subdued = isUnsuitable(status);
    return (
      <tr
        key={String(a.id)}
        className={cn(
          "transition-colors",
          subdued ? "bg-slate-50/50 text-slate-400" : "hover:bg-slate-50",
        )}
      >
        <td className="px-2 py-1.5 whitespace-nowrap font-medium">
          <div className="flex items-center gap-2">
            <span>{a.name_area}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-semibold border whitespace-nowrap",
                TONE_STYLES[meta.tone],
              )}
            >
              {meta.label}
            </span>
          </div>
        </td>
        <td className={cn("px-2 py-1.5 text-xs", subdued ? "text-slate-400" : "text-slate-600")}>
          {a.answer ?? "—"}
        </td>
      </tr>
    );
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-1">
        Система на основе теории мультиопераций
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Логический вывод над дискретными статусами симптомов с метаоперациями
        конъюнкции/дизъюнкции/отрицания.
      </p>

      {fitting.length === 0 && maybe.length === 0 && potential.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 mb-4">
          Подходящих правил не найдено: для большинства симптомов недостаточно
          данных.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4">
          {fitting.map((a) => (
            <span
              key={String(a.id)}
              className="px-2 py-1 rounded-md text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-300"
            >
              {a.name_area}
            </span>
          ))}
          {maybe.map((a) => (
            <span
              key={String(a.id)}
              className="px-2 py-1 rounded-md text-xs font-semibold border bg-yellow-50 text-yellow-800 border-yellow-300"
            >
              {a.name_area}
            </span>
          ))}
          {potential.map((a) => (
            <span
              key={String(a.id)}
              className="px-2 py-1 rounded-md text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-300"
            >
              {a.name_area}
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="text-xs text-slate-600 uppercase tracking-wide">
              <th className="px-2 py-2 border-b border-slate-200 text-left">Правило</th>
              <th className="px-2 py-2 border-b border-slate-200 text-left">Описание</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {fitting.map(renderRow)}
            {maybe.map(renderRow)}
            {potential.map(renderRow)}
            {others.map(renderRow)}
            {noInfo.length > 0 && (
              <tr>
                <td colSpan={2} className="px-2 py-2 text-xs text-slate-400 italic">
                  + {noInfo.length} правил без активации (информации недостаточно).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const EvaluationPanel: FC<{ evaluation: MultiopEvaluation | null }> = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-2">Итоговая оценка поставщика</h2>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Оценка не сформирована: ни одно правило мультиоперационной системы не
          подтверждается данными поставщика. Уточните недостающие наблюдения.
        </div>
      </section>
    );
  }

  const s = ZONE_STYLES[evaluation.zone];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-3">Итоговая оценка поставщика</h2>
      <p className="text-sm text-slate-500 mb-4">
        Оценка рассчитана по правилам, активированным в мультиоперационной системе
        (взвешена по статусу: подходит — 1.0, может подходить — 0.7, потенциально
        применимо — 0.4, может не подходить — 0.3).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {(Object.keys(ZONE_STYLES) as Zone[]).map((z) => {
          const zs = ZONE_STYLES[z];
          const ranges: Record<Zone, string> = {
            red: "0,00 – 33,33",
            yellow: "33,34 – 66,66",
            green: "66,67 – 100,00",
          };
          return (
            <div key={z} className={cn("rounded-xl border p-3", zs.bg, zs.border)}>
              <div className="flex items-center gap-2">
                <span className={cn("inline-block h-3 w-3 rounded-full", zs.bar)} />
                <span className={cn("font-semibold", zs.text)}>{zs.label}</span>
              </div>
              <div className="mt-1 text-xs text-slate-600">{ranges[z]} баллов</div>
              <div className="text-sm">{zs.description}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-end gap-3">
        <div className={cn("text-5xl font-bold", s.text)}>
          {evaluation.finalScore.toFixed(2)}
        </div>
        <div className="text-sm text-slate-500 pb-2">из 100</div>
        <div
          className={cn(
            "ml-auto px-3 py-1 rounded-md text-sm font-semibold border",
            s.bg,
            s.text,
            s.border,
          )}
        >
          {s.label}
        </div>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={cn("h-full", s.bar)} style={{ width: `${evaluation.finalScore}%` }} />
      </div>

      <div className="mt-3 text-sm text-slate-600">
        {evaluation.zoneDescription}. В агрегации участвует{" "}
        {evaluation.contributingRules} из {evaluation.totalActivated} активированных
        правил, суммарный вес = {evaluation.weightSum.toFixed(2)}.
      </div>
    </section>
  );
};
