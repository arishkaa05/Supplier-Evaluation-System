import { CriterionDbTable, Level, Trend } from "@/shared/config/data/type";
import { pearsonCorrelation } from "@/shared/lib/pearsonCorrelation";
import { trapezoidMembership } from "@/feature/calculations/model/trapezoidMembership";
import { Supplier, MetricKey } from "@/shared/store/suppliers/type/supplierType";

 export interface CriterionTerm {
  level: Level;
  trend: Trend;
  mu: number;
  correlation: number;
  value: number;
}

function trendFromCorrelation(r: number): Trend {
   return r > 0 ? "up" : "down";
}

export function getActiveTermsForCriterion(
  supplier: Supplier,
  criterionDb: CriterionDbTable,
  key: MetricKey  
): CriterionTerm[] {
  const xs = supplier.data.map((d) => d[key] as number);
  const t = supplier.data.map((d) => d.month);

  const r = pearsonCorrelation(xs, t);
   const trend = trendFromCorrelation(r);
  const currentValue = xs[xs.length - 1];
   const rows = criterionDb.rows.filter(
    (row) => row.direction === trend
  );

  const terms: CriterionTerm[] = rows
    .map((row) => {
      const mu = trapezoidMembership(currentValue, row.parameters);
 
      return {
        level: row.value.level,
        trend,
        mu,
        correlation: r,
        value: currentValue,
      };
    })
    .filter((term) => term.mu > 0); 
  return terms;
}