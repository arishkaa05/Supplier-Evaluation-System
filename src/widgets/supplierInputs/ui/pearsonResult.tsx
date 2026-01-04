import React, { useMemo } from "react";
import { pearsonCorrelation } from "@/shared/lib/pearsonCorrelation";
import { cn } from "@/shared/lib/utils";
import { MetricKey, Supplier } from "@/shared/store/suppliers/type/supplierType";

type PearsonResultProps = {
  supplier: Supplier;
};

export const PearsonResult: React.FC<PearsonResultProps> = ({ supplier }) => {
  const metricMeta: Array<{ key: MetricKey; label: string }> = [
    { key: "localHiring", label: "Local hiring" },
    { key: "completeness", label: "Completeness" },
    { key: "defects", label: "Defects" },
  ];

  const months = useMemo(() => supplier.data.map((d) => d.month), [supplier.data]);

   const corrByKey = useMemo(() => {
    const out = {} as Record<MetricKey, number | null>;
    for (const { key } of metricMeta) {
      out[key] = pearsonCorrelation(
        months,
        supplier.data.map((d) => d[key])
      );
    }
    return out; 
  }, [months, supplier.data]);

  const trendBadge = (v: number | null) =>
    (v ?? 0) > 0.2 ? "text-green-800" : "text-red-800";

  const trendArrow = (v: number | null) => ((v ?? 0) > 0.2 ? "↑" : "↓");

  return (
    <div className="p-4 border-b-2 border-slate-200">
      <div className="mt-4 grid sm:grid-cols-3 gap-4">
        {metricMeta.map((mm) => {
          const v = corrByKey[mm.key];

          return (
            <div key={mm.key} className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">
                {mm.label}:
              </label>

              <b className="mono">{v ?? 0}</b>

              <span
                className={cn(
                  "inline-flex items-center justify-center py-1  font-semibold mono",
                  trendBadge(v)
                )}
              >
                {trendArrow(v)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
