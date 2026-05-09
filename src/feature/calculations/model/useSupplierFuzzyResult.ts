import {
  completenessDb,
  defectsDb,
  knowledgeBase,
  localHiringDb, 
} from "@/shared/config";
import { useSupplierStore } from "@/shared/store/suppliers";
import { Supplier} from "@/shared/store/suppliers/type/supplierType";
import { useMemo } from "react";
import { getActiveTermsForCriterion } from "./getActiveTermsForCriterion";
import { RHO_DEFECTS, MU_DEFUZZ } from "./const";
import { defuzzify } from "./defuzzify";
import { directionDeterminantDown } from "./directionDeterminantDown";
import { directionDeterminantUp } from "./directionDeterminantUp";
import { findOutputOFNForAssessment } from "./findOutputOFNForAssessment";
import { findParamsForTerm } from "./findParamsForTerm";
import { ofnShift } from "./ofnShift";
import { aggregateSupplierScore, FiredRule, SupplierEvaluation } from "./aggregateScore";
import { MetricKey } from "@/shared/store/suppliers/type/supplierType";

export type FuzzyBlocker = {
  metric: MetricKey;
  reason: "missing" | "expert";
  details: string;
};

export type SupplierFuzzyResult = {
  supplier: string;
  rules: FiredRule[];
  evaluation: SupplierEvaluation | null;
  blockers: FuzzyBlocker[];
  status: "ok" | "blocked";
};

const METRIC_NAMES: Record<MetricKey, string> = {
  localHiring: "наёма местных жителей",
  completeness: "полноты заказа",
  defects: "дефектов",
};

function detectBlockers(s: Supplier): FuzzyBlocker[] {
  const blockers: FuzzyBlocker[] = [];
  const metrics: MetricKey[] = ["localHiring", "completeness", "defects"];

  for (const metric of metrics) {
    const qualities = s.data.map((d) => d.quality?.[metric] ?? "1");
    const missing = qualities.filter((q) => q === "0").length;
    const expert = qualities.filter((q) => q === "2").length;

    if (missing > 0) {
      blockers.push({
        metric,
        reason: "missing",
        details: `Отсутствует ${missing} из ${qualities.length} наблюдений ${METRIC_NAMES[metric]} — фаззификация невозможна.`,
      });
    } else if (expert >= Math.ceil(qualities.length / 2)) {
      blockers.push({
        metric,
        reason: "expert",
        details: `${expert} из ${qualities.length} наблюдений ${METRIC_NAMES[metric]} заданы экспертно — направление тренда не может быть надёжно определено.`,
      });
    }
  }

  return blockers;
}

export function useSupplierRules(): SupplierFuzzyResult[] {
  const { supplier } = useSupplierStore();

  return useMemo(() => {
    return supplier.map((s: Supplier): SupplierFuzzyResult => {
      const blockers = detectBlockers(s);
      if (blockers.length > 0) {
        return {
          supplier: s.supplier,
          rules: [],
          evaluation: null,
          blockers,
          status: "blocked",
        };
      }

      const localHiringTerms = getActiveTermsForCriterion(s, localHiringDb, "localHiring");
      const completenessTerms = getActiveTermsForCriterion(s, completenessDb, "completeness");
      const defectsTerms = getActiveTermsForCriterion(s, defectsDb, "defects");

      const rules: FiredRule[] = [];

      for (const lh of localHiringTerms) {
        for (const comp of completenessTerms) {
          for (const def of defectsTerms) {
            const kbRule = knowledgeBase.find(
              (item) =>
                item.localHiring.level === lh.level &&
                item.localHiring.trend === lh.trend &&
                item.completeness.level === comp.level &&
                item.completeness.trend === comp.trend &&
                item.defects.level === def.level &&
                item.defects.trend === def.trend,
            );

            if (!kbRule) continue;
 
            const lhParams = findParamsForTerm(localHiringDb, lh);
            const compParams = findParamsForTerm(completenessDb, comp);
            const defParams = findParamsForTerm(defectsDb, def);

            if (!lhParams || !compParams || !defParams) continue;

            const D_lh =
              lh.trend === "up"
                ? directionDeterminantUp(lh.value, lhParams)
                : directionDeterminantDown(lh.value, lhParams, RHO_DEFECTS);

            const D_c =
              comp.trend === "up"
                ? directionDeterminantUp(comp.value, compParams)
                : directionDeterminantDown(comp.value, compParams, RHO_DEFECTS);

            const D_d =
              def.trend === "up"
                ? directionDeterminantUp(def.value, defParams)
                : directionDeterminantDown(def.value, defParams, RHO_DEFECTS);
 
            const eps_lh = +1;
            const eps_c = +1;
            const eps_d = -1;

            const DA = (eps_lh * D_lh + eps_c * D_c + eps_d * D_d) / 3;
 
            const B = findOutputOFNForAssessment(kbRule.assessment.level, kbRule.assessment.trend);
            const Bp = ofnShift(B, DA, kbRule.assessment.trend);

             const crisp = defuzzify(Bp, MU_DEFUZZ);

            rules.push({
              no: kbRule.no,
              assessment: kbRule.assessment,
              localHiring: lh,
              completeness: comp,
              defects: def,
              firingStrength: DA,
              crispAssessment: crisp, 
            });
          }
        }
      }

      rules.sort((a, b) => a.no - b.no);

      const evaluation = aggregateSupplierScore(rules);

      return {
        supplier: s.supplier,
        rules,
        evaluation,
        blockers: [],
        status: "ok",
      };
    });
  }, [supplier]);
}
