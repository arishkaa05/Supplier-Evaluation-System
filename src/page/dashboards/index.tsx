import { useMemo, FC, ReactNode } from "react";
import { LayoutDashboard } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { useSupplierStore } from "@/shared/store/suppliers";
import { paths } from "@/shared/config";
import {
  useSupplierRules,
  SupplierFuzzyResult,
  SupplierEvaluation as FuzzyEvaluation,
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
import { knowledgeBase } from "@/shared/config";
import { Level, Trend, KnowledgeBaseItem } from "@/shared/config/data/type";
import type { SupplierData, MetricKey } from "@/shared/store/suppliers/type/supplierType";
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

// Названия статусов без приписки «(на опыте эксперта)».
const SHORT_STATUS_LABEL: Record<string, string> = {
  "0": "Информация отсутствует",
  "1": "Не подходит",
  "2": "Подходит",
  "3": "Противоречие данных",
  "4": "Часть данных недоступна",
  "5": "Может не подходить",
  "6": "Может подходить",
  "7": "Требуются уточнения",
};

// Какие статусы показываем в таблице мультиопераций (исключаем «не подходит»).
const VISIBLE_STATUSES = new Set(["2", "4", "5", "6"]);

// Сортировка: подходит → может подходить → потенциально → может не подходить.
const STATUS_ORDER: Record<string, number> = {
  "2": 0,
  "6": 1,
  "4": 2,
  "5": 3,
};

const Dashboards = () => {
  const { supplier } = useSupplierStore();
  const fuzzyResults = useSupplierRules();
  const { supplierId } = useParams<{ supplierId: string }>();

  const activeId = Number(supplierId);
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

  // URL содержит неизвестный supplierId (например, после удаления поставщика).
  // Если есть хоть один — уводим на него, иначе на корень с подсказкой.
  if (!activeSupplier) {
    const fallback = supplier[0];
    if (fallback) {
      return (
        <Navigate
          to={paths.app.supplierDashboard.build(fallback.id)}
          replace
        />
      );
    }
    return (
      <div className="p-6 text-slate-600">
        Поставщик не найден. Загрузите CSV на странице «Обновить данные».
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <LayoutDashboard size={24} strokeWidth={1} />
        <h4 className="text-4xl font-bold">{activeSupplier.supplier}</h4>
      </div>

      {activeFuzzy && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FuzzyPanel
              result={activeFuzzy}
              supplierDates={activeSupplier.data.map((d) => ({
                month: d.month,
                date: d.date,
              }))}
            />
            <MultiopPanel areas={multiop} observations={activeSupplier.data} />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FuzzyEvaluationPanel
              evaluation={activeFuzzy.evaluation}
              blocked={activeFuzzy.status === "blocked"}
            />
            <MultiopEvaluationPanel evaluation={multiopEvaluation} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboards;

const RuleHead: FC = () => (
  <thead className="bg-slate-50">
    <tr className="text-xs text-slate-600 uppercase tracking-wide">
      <th className="px-2 py-2 border-b border-slate-200 text-center">№ правила</th>
      <th className="px-2 py-2 border-b border-slate-200 text-center">Наём</th>
      <th className="px-2 py-2 border-b border-slate-200 text-center">Полнота</th>
      <th className="px-2 py-2 border-b border-slate-200 text-center">Дефекты</th>
      <th className="px-2 py-2 border-b border-slate-200 text-center">Заключение</th>
    </tr>
  </thead>
);

const FuzzyPanel: FC<{
  result: SupplierFuzzyResult;
  supplierDates: { month: number; date?: string }[];
}> = ({ result, supplierDates }) => {
  const trim = result.trim;
  const firstUsedMonth =
    trim?.lastBadMonth != null ? trim.lastBadMonth + 1 : undefined;
  const firstUsedDate =
    firstUsedMonth != null
      ? supplierDates.find((d) => d.month === firstUsedMonth)?.date
      : undefined;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-4">
        Система на основе нечёткой логики
      </h2>

      {trim?.trimmed && result.status === "ok" && (
        <div className="mb-4 rounded-xl border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
          <div className="font-semibold mb-1">
            Использовано {trim.usedObservations} из {trim.totalObservations} наблюдений
          </div>
          <p>
            Нечёткая логика работает только с точными данными, поэтому
            наблюдения были исключены из расчётов. В обработку попали
            наблюдения начиная с{" "}
            <span className="font-semibold">
              {firstUsedDate ?? `индекса ${firstUsedMonth}`}
            </span>
            .
          </p>
        </div>
      )}

      {result.status === "blocked" ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold mb-2">
            Система не формирует итоговый вывод
          </div>
          <p className="mb-2">
            Процедура фаззификации требует точного значения за последний
            наблюдаемый месяц. При его отсутствии или экспертной оценке
            направление OFN не определяется.
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
            <RuleHead />
            <tbody className="divide-y divide-slate-200">
              {result.rules.map((r) => (
                <tr key={r.no} className="hover:bg-slate-50">
                  <td className="text-center px-2 py-1">{r.no}</td>
                  <td className="text-center px-2 py-1">{formatTerm(r.localHiring)}</td>
                  <td className="text-center px-2 py-1">{formatTerm(r.completeness)}</td>
                  <td className="text-center px-2 py-1">{formatTerm(r.defects)}</td>
                  <td className="text-center px-2 py-1">{formatTerm(r.assessment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const METRIC_LABEL: Record<MetricKey, string> = {
  localHiring: "Наём местных жителей",
  completeness: "Полнота заказа",
  defects: "Дефекты",
};

type MetricFlags = {
  // expert (?) есть среди ранее наблюдений (не последнее)
  historyImprecise: boolean;
  // expert (?) на последнем наблюдении
  lastImprecise: boolean;
  // пропуск или неизвестно среди ранее наблюдений
  historyUncertain: boolean;
  // пропуск или неизвестно на последнем наблюдении
  lastUncertain: boolean;
};

function metricFlagsOf(obs: SupplierData[], key: MetricKey): MetricFlags {
  const flags: MetricFlags = {
    historyImprecise: false,
    lastImprecise: false,
    historyUncertain: false,
    lastUncertain: false,
  };
  const lastIdx = obs.length - 1;
  obs.forEach((o, i) => {
    const q = o.quality?.[key];
    const isLast = i === lastIdx;
    if (q === "0" || q === "3") {
      if (isLast) flags.lastUncertain = true;
      else flags.historyUncertain = true;
    } else if (q === "2") {
      if (isLast) flags.lastImprecise = true;
      else flags.historyImprecise = true;
    }
  });
  return flags;
}

const MultiopPanel: FC<{ areas: MultiopArea[]; observations: SupplierData[] }> = ({
  areas,
  observations,
}) => {
  const visible = useMemo(() => {
    const filtered = areas.filter((a) => VISIBLE_STATUSES.has(String(a.status)));
    return filtered.sort((a, b) => {
      const sa = STATUS_ORDER[String(a.status)] ?? 99;
      const sb = STATUS_ORDER[String(b.status)] ?? 99;
      if (sa !== sb) return sa - sb;
      return Number(a.id) - Number(b.id);
    });
  }, [areas]);

  // Единая плашка-объяснение для всей выборки. Заголовок зависит от того,
  // какие статусы присутствуют (status=4 — «неопределённости», status 5/6 —
  // «неточности»). Подпись составляется из реальных метрик: для каждой
  // выбираем подходящую формулировку или пропускаем, если метрика чистая.
  const banner = useMemo(() => {
    const metricKeys: MetricKey[] = ["localHiring", "completeness", "defects"];
    const flags: Record<MetricKey, MetricFlags> = {
      localHiring: metricFlagsOf(observations, "localHiring"),
      completeness: metricFlagsOf(observations, "completeness"),
      defects: metricFlagsOf(observations, "defects"),
    };

    const anyUncertain = metricKeys.some(
      (k) => flags[k].historyUncertain || flags[k].lastUncertain,
    );
    const anyImprecise = metricKeys.some(
      (k) => flags[k].historyImprecise || flags[k].lastImprecise,
    );
    if (!anyUncertain && !anyImprecise) return null;

    // Сначала про неопределённости (история имеет приоритет над последней
    // точкой), потом про неточности.
    const lines: string[] = [];
    for (const key of metricKeys) {
      const f = flags[key];
      const name = METRIC_LABEL[key];
      if (f.historyUncertain) lines.push(`Исторические данные для критерия «${name}» неопределены`);
      else if (f.lastUncertain) lines.push(`Критерий «${name}» неопределён`);
    }
    for (const key of metricKeys) {
      const f = flags[key];
      const name = METRIC_LABEL[key];
      if (f.historyImprecise) lines.push(`Исторические данные для критерия «${name}» определены неточно`);
      else if (f.lastImprecise) lines.push(`Критерий «${name}» определён неточно`);
    }

    return {
      title: anyUncertain
        ? "Правила определены на основе данных с неопределённостями"
        : "Правила определены на основе данных с неточностями",
      lines,
      tone: anyUncertain ? ("gray" as const) : ("yellow" as const),
    };
  }, [observations]);

  const ruleByNo = useMemo(() => {
    const m = new Map<number, KnowledgeBaseItem>();
    for (const r of knowledgeBase) m.set(r.no, r);
    return m;
  }, []);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-4">
        Система на основе теории мультиопераций
      </h2>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Подходящих правил не найдено.
        </div>
      ) : (
        <>
          {banner && (
            <div
              className={cn(
                "mb-4 rounded-md border px-3 py-2 text-sm",
                TONE_STYLES[banner.tone],
              )}
            >
              <div className="font-semibold mb-1">{banner.title}</div>
              {banner.lines.length > 0 && (
                <ul className="list-disc pl-5 space-y-0.5">
                  {banner.lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr className="text-xs text-slate-600 uppercase tracking-wide">
                  <th className="px-2 py-2 border-b border-slate-200 text-center">№ правила</th>
                  <th className="px-2 py-2 border-b border-slate-200 text-center">Наём</th>
                  <th className="px-2 py-2 border-b border-slate-200 text-center">Полнота</th>
                  <th className="px-2 py-2 border-b border-slate-200 text-center">Дефекты</th>
                  <th className="px-2 py-2 border-b border-slate-200 text-center">Заключение</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {visible.map((a) => {
                  const rule = ruleByNo.get(Number(a.id));
                  const status = String(a.status);
                  const meta = STATUS_META[status];
                  const showStatus = status !== "2";
                  return (
                    <tr key={String(a.id)} className="hover:bg-slate-50">
                      <td className="px-2 py-1 text-center whitespace-nowrap font-medium">
                        <div className="inline-flex items-center gap-2 justify-center flex-wrap">
                          <span>{a.id}</span>
                          {showStatus && meta && (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-semibold border whitespace-nowrap",
                                TONE_STYLES[meta.tone],
                              )}
                            >
                              {SHORT_STATUS_LABEL[status] ?? meta.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center px-2 py-1">{formatTerm(rule?.localHiring)}</td>
                      <td className="text-center px-2 py-1">{formatTerm(rule?.completeness)}</td>
                      <td className="text-center px-2 py-1">{formatTerm(rule?.defects)}</td>
                      <td className="text-center px-2 py-1">{formatTerm(rule?.assessment)}</td>
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

const ZoneLegend: FC = () => (
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
);

const ScoreCard: FC<{
  title: string;
  description: string;
  score: number;
  zone: Zone;
  footer: ReactNode;
}> = ({ title, description, score, zone, footer }) => {
  const s = ZONE_STYLES[zone];
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <ZoneLegend />
      <div className="flex items-end gap-3">
        <div className={cn("text-5xl font-bold", s.text)}>
          {score.toFixed(2)}
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
        <div className={cn("h-full", s.bar)} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-3 text-sm text-slate-600 leading-relaxed">{footer}</div>
    </section>
  );
};

const EmptyScoreCard: FC<{ title: string; message: string }> = ({
  title,
  message,
}) => (
  <section className="bg-white border border-slate-200 rounded-2xl p-5">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      {message}
    </div>
  </section>
);

const FuzzyEvaluationPanel: FC<{
  evaluation: FuzzyEvaluation | null;
  blocked: boolean;
}> = ({ evaluation, blocked }) => {
  if (!evaluation) {
    return (
      <EmptyScoreCard
        title="Итоговая оценка — нечёткая логика"
        message={
          blocked
            ? "Оценка не сформирована: за последний месяц данные содержат пропуски или заданы экспертно."
            : "Оценка не сформирована: ни одно правило не активировано."
        }
      />
    );
  }
  const s = ZONE_STYLES[evaluation.zone];
  return (
    <ScoreCard
      title="Итоговая оценка — нечёткая логика"
      description="Среднее crisp-значений активированных правил, рассчитанных по точному «хвосту» наблюдений."
      score={evaluation.finalScore}
      zone={evaluation.zone}
      footer={
        <>
          В агрегации участвует{" "}
          <span className="font-semibold">{evaluation.activatedRules}</span>{" "}
          правил. Поставщик отнесён к категории{" "}
          <span className={cn("font-semibold", s.text)}>
            {s.label.toLowerCase()}
          </span>{" "}
          — {s.description.toLowerCase()}.
        </>
      }
    />
  );
};

const MultiopEvaluationPanel: FC<{ evaluation: MultiopEvaluation | null }> = ({
  evaluation,
}) => {
  if (!evaluation) {
    return (
      <EmptyScoreCard
        title="Итоговая оценка — теория мультиопераций"
        message="Оценка не сформирована: ни одно правило не активировано по данным поставщика."
      />
    );
  }
  const s = ZONE_STYLES[evaluation.zone];
  return (
    <ScoreCard
      title="Итоговая оценка — теория мультиопераций"
      description="Среднее crisp-значений по активированным правилам (агрегация совпадает с нечёткой логикой; различается только способ отбора правил)."
      score={evaluation.finalScore}
      zone={evaluation.zone}
      footer={
        <>
          В агрегации участвует{" "}
          <span className="font-semibold">{evaluation.contributingRules}</span>{" "}
          из 216 правил базы знаний. Поставщик отнесён к категории{" "}
          <span className={cn("font-semibold", s.text)}>
            {s.label.toLowerCase()}
          </span>{" "}
          — {s.description.toLowerCase()}.
        </>
      }
    />
  );
};
