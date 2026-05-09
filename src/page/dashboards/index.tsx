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
            <EvaluationPanel result={activeFuzzy} />
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
                <th className="px-2 py-2 border-b border-slate-200 text-center">
                  № правила
                </th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">
                  Наём
                </th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">
                  Полнота
                </th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">
                  Дефекты
                </th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">
                  Заключение
                </th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">
                  DA
                </th>
                <th className="px-2 py-2 border-b border-slate-200 text-center">
                  Crisp
                </th>
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
                    Итоговая оценка = Σ φ(B'ₙ) / N
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
  const relevant = areas.filter(
    (a) => a.status !== "1" && a.status !== "0" && a.status !== "4",
  );
  const fitting = areas.filter((a) => a.status === "2");
  const maybe = areas.filter((a) => a.status === "6");
  const expertBased = areas.filter(
    (a) => a.status === "5" || a.status === "6",
  );

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-1">
        Система на основе теории мультиопераций
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Логический вывод над дискретными статусами симптомов с метаоперациями
        конъюнкции/дизъюнкции/отрицания.
      </p>

      {relevant.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Подходящих правил не найдено: для большинства симптомов недостаточно
          данных.
        </div>
      ) : (
        <>
          {fitting.length > 0 && (
            <div className="mb-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Подходящие правила
              </div>
              <div className="flex flex-wrap gap-2">
                {fitting.map((a) => (
                  <span
                    key={String(a.id)}
                    className="px-2 py-1 rounded-md text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-300"
                  >
                    {a.name_area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {maybe.length > 0 && (
            <div className="mb-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Могут подходить (на опыте эксперта)
              </div>
              <div className="flex flex-wrap gap-2">
                {maybe.map((a) => (
                  <span
                    key={String(a.id)}
                    className="px-2 py-1 rounded-md text-xs font-semibold border bg-yellow-50 text-yellow-800 border-yellow-300"
                  >
                    {a.name_area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {expertBased.length > 0 && (
            <p className="text-xs text-slate-500 mb-3">
              Направления для части правил определены на основании опыта эксперта.
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr className="text-xs text-slate-600 uppercase tracking-wide">
                  <th className="px-2 py-2 border-b border-slate-200 text-center">
                    Правило
                  </th>
                  <th className="px-2 py-2 border-b border-slate-200 text-center">
                    Статус
                  </th>
                  <th className="px-2 py-2 border-b border-slate-200 text-left">
                    Описание
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {relevant.map((a) => {
                  const meta = STATUS_META[a.status] ?? {
                    label: `Статус ${a.status}`,
                    tone: "gray" as const,
                  };
                  return (
                    <tr key={String(a.id)} className="hover:bg-slate-50">
                      <td className="px-2 py-1 text-center whitespace-nowrap font-medium">
                        {a.name_area}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-semibold border",
                            TONE_STYLES[meta.tone],
                          )}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-2 py-1 text-left text-xs text-slate-600">
                        {a.answer ?? "—"}
                        {a.explanation && a.explanation.length > 0 && (
                          <ul className="list-disc pl-5 mt-1 space-y-0.5">
                            {a.explanation.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

const EvaluationPanel: FC<{ result: SupplierFuzzyResult }> = ({ result }) => {
  if (result.status === "blocked" || !result.evaluation) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-2">Итоговая оценка поставщика</h2>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Итоговый числовой балл нечёткой системой не сформирован: для расчёта
          необходимы полные исторические данные с определёнными направлениями
          трендов. Используйте результат мультиоперационной системы как набор
          согласованных правил-гипотез.
        </div>
      </section>
    );
  }

  const ev = result.evaluation;
  const s = ZONE_STYLES[ev.zone];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-3">Итоговая оценка поставщика</h2>

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
          {ev.finalScore.toFixed(2)}
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
        <div className={cn("h-full", s.bar)} style={{ width: `${ev.finalScore}%` }} />
      </div>

      <div className="mt-3 text-sm text-slate-600">
        {s.description}. Среднее по {ev.activatedRules}{" "}
        активированным правилам (формула 13). Тренды направлений:{" "}
        {(ev.trendShare.positive * 100).toFixed(0)}% положительных,{" "}
        {(ev.trendShare.negative * 100).toFixed(0)}% отрицательных. Энтропия
        результатов: {ev.entropy.toFixed(4)}.
      </div>
    </section>
  );
};
