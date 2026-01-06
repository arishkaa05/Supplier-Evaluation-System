import {
  completenessDb,
  defectsDb,
  knowledgeBase,
  localHiringDb, 
} from "@/shared/config";
import { Level, Trend } from "@/shared/config/data/type";
import { useSupplierStore } from "@/shared/store/suppliers";
import { Supplier} from "@/shared/store/suppliers/type/supplierType";
import { useMemo } from "react";
import {
  CriterionTerm,
  getActiveTermsForCriterion,
} from "./getActiveTermsForCriterion";
import { RHO_DEFECTS, MU_DEFUZZ } from "./const";
import { defuzzify } from "./defuzzify";
import { directionDeterminantDown } from "./directionDeterminantDown";
import { directionDeterminantUp } from "./directionDeterminantUp";
import { findOutputOFNForAssessment } from "./findOutputOFNForAssessment";
import { findParamsForTerm } from "./findParamsForTerm";
import { ofnShift } from "./ofnShift";

export function useSupplierRules() {
  const { supplier } = useSupplierStore();

  return useMemo(() => {
    return supplier.map((s: Supplier) => {
      const localHiringTerms = getActiveTermsForCriterion(s, localHiringDb, "localHiring");
      const completenessTerms = getActiveTermsForCriterion(s, completenessDb, "completeness");
      const defectsTerms = getActiveTermsForCriterion(s, defectsDb, "defects");

      type RuleResult = {
        no: number;
        assessment: { level: Level; trend: Trend };
        localHiring: CriterionTerm;
        completeness: CriterionTerm;
        defects: CriterionTerm; 
        firingStrength: number;    
        crispAssessment: number;    
      };

      const rules: RuleResult[] = [];

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

      return { supplier: s.supplier, rules };
    });
  }, [supplier]);
}
