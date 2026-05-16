// Загружает справочники (критерии + база знаний) и поставщиков с сервера
// и подменяет содержимое мутабельных экспортов в shared/config/data/*.
// Вызывается один раз перед рендером приложения.

import { fetchCriteria, fetchKnowledgeBase, fetchSuppliers, runSeed } from "./endpoints";
import { ServerCriterion, ServerKbRule, ServerSupplier } from "./dto";
import {
  CriterionDbTable,
  KnowledgeBaseItem,
  Level,
  Trend,
} from "@/shared/config/data/type";
import {
  assessmentDb,
  setAssessmentDb,
} from "@/shared/config/data/assessmentDb";
import {
  completenessDb,
  setCompletenessDb,
} from "@/shared/config/data/completenessDb";
import { defectsDb, setDefectsDb } from "@/shared/config/data/defectsDb";
import {
  localHiringDb,
  setLocalHiringDb,
} from "@/shared/config/data/localHiringDb";
import { setKnowledgeBase } from "@/shared/config/data/knowledgeBase";
import { useSupplierStore } from "@/shared/store/suppliers";
import { useEvaluationStore } from "@/shared/store/evaluation";
import type {
  MetricKey,
  QualityValue,
  Supplier,
} from "@/shared/store/suppliers/type/supplierType";

const mapCriterion = (c: ServerCriterion): CriterionDbTable => ({
  name: c.name,
  range: [c.range_min, c.range_max],
  impactFactor: c.impact_factor,
  epsilon: c.epsilon,
  rows: c.rows.map((r) => ({
    description: r.description,
    value: { level: r.level as Level, trend: r.trend as Trend },
    direction: r.direction as Trend,
    parameters: [r.p1, r.p2, r.p3, r.p4],
  })),
});

const mapKbRule = (r: ServerKbRule): KnowledgeBaseItem => ({
  no: r.no,
  localHiring: { level: r.local_hiring_level, trend: r.local_hiring_trend },
  completeness: { level: r.completeness_level, trend: r.completeness_trend },
  defects: { level: r.defects_level, trend: r.defects_trend },
  assessment: { level: r.assessment_level, trend: r.assessment_trend },
});

const mapSupplier = (s: ServerSupplier): Supplier => ({
  id: s.id,
  supplier: s.name,
  data: s.data
    .slice()
    .sort((a, b) => a.month - b.month)
    .map((o) => ({
      month: o.month,
      localHiring: o.local_hiring,
      completeness: o.completeness,
      defects: o.defects,
      quality: {
        localHiring: o.quality_local_hiring as QualityValue,
        completeness: o.quality_completeness as QualityValue,
        defects: o.quality_defects as QualityValue,
      } as Record<MetricKey, QualityValue>,
    })),
});

const applyCriterion = (c: ServerCriterion) => {
  const mapped = mapCriterion(c);
  switch (c.key) {
    case "localHiring":
      setLocalHiringDb(mapped);
      break;
    case "completeness":
      setCompletenessDb(mapped);
      break;
    case "defects":
      setDefectsDb(mapped);
      break;
    case "assessment":
      setAssessmentDb(mapped);
      break;
  }
};

export async function bootstrap(): Promise<void> {
  // Если БД пуста — заполняем дефолтами один раз.
  let [criteria, rules, suppliers] = await Promise.all([
    fetchCriteria(),
    fetchKnowledgeBase(),
    fetchSuppliers(),
  ]);

  if (criteria.length === 0 || rules.length === 0 || suppliers.length === 0) {
    console.info("[bootstrap] empty DB, running seed");
    await runSeed(false);
    [criteria, rules, suppliers] = await Promise.all([
      fetchCriteria(),
      fetchKnowledgeBase(),
      fetchSuppliers(),
    ]);
  }

  criteria.forEach(applyCriterion);
  setKnowledgeBase(rules.map(mapKbRule));
  useSupplierStore.setState({ supplier: suppliers.map(mapSupplier) });

  // Прогоняем обе ИС на сервере — результаты лягут в useEvaluationStore.
  await useEvaluationStore.getState().refresh();

  // Прогрев — чтобы линтер не ругался на неиспользуемые re-imports.
  void assessmentDb;
  void completenessDb;
  void defectsDb;
  void localHiringDb;
}
