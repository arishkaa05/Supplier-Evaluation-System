import { cn } from "@/shared/lib/utils";
import { useSupplierRules } from "../model/useSupplierFuzzyResult";
import { Zone } from "../model/aggregateScore";
import { Level, Trend } from "@/shared/config/data/type";

const formatTerm = (t?: { level: Level; trend: Trend }) =>
  t ? `${t.level}${t.trend === "up" ? "↑" : "↓"}` : "";

const ZONE_STYLES: Record<Zone, { bar: string; bg: string; text: string; border: string }> = {
  red: {
    bar: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
  },
  yellow: {
    bar: "bg-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  green: {
    bar: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
};

const ZONES: { zone: Zone; range: string; label: string }[] = [
  { zone: "red", range: "0.00 – 33.33", label: "Immediate rejection" },
  { zone: "yellow", range: "33.34 – 66.66", label: "Potential problems" },
  { zone: "green", range: "66.67 – 100.00", label: "Reliable supplier" },
];

export const SupplierEvaluation = () => {
  const supplierRules = useSupplierRules();

  return (
    <section className="mt-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Supplier evaluation</h2>
            <p className="text-sm text-slate-500">
              Aggregated final score from the inference process and zone classification.
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ZONES.map((z) => {
            const s = ZONE_STYLES[z.zone];
            return (
              <div
                key={z.zone}
                className={cn("rounded-xl border p-3", s.bg, s.border)}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("inline-block h-3 w-3 rounded-full", s.bar)} />
                  <span className={cn("font-semibold", s.text)}>
                    {z.zone[0].toUpperCase() + z.zone.slice(1)} group
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-600">{z.range} pts</div>
                <div className="text-sm">{z.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {supplierRules.map((sp) => {
            const ev = sp.evaluation;
            const s = ZONE_STYLES[ev.zone];
            const fired = sp.rules.filter((r) => Math.abs(r.firingStrength) > 0);
            const top = [...fired]
              .sort((a, b) => Math.abs(b.firingStrength) - Math.abs(a.firingStrength))
              .slice(0, 10);

            return (
              <div
                key={sp.supplier}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="font-semibold">Supplier {sp.supplier}</div>
                  <div
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-semibold border",
                      s.bg,
                      s.text,
                      s.border,
                    )}
                  >
                    {ev.zoneLabel}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-end gap-3">
                    <div className={cn("text-4xl font-bold", s.text)}>
                      {ev.finalScore.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-500 pb-1">/ 100</div>
                  </div>

                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn("h-full", s.bar)}
                      style={{ width: `${ev.finalScore}%` }}
                    />
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    {ev.zoneDescription}. Aggregated from {ev.contributingRules}{" "}
                    activated rule{ev.contributingRules === 1 ? "" : "s"}{" "}
                    (Σ|α| = {ev.weightSum.toFixed(3)}).
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                    Top contributing rules
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-xs text-slate-600 uppercase tracking-wide">
                          <th className="px-2 py-2 border-b border-slate-200 text-center">
                            № rule
                          </th>
                          <th className="px-2 py-2 border-b border-slate-200 text-center">
                            LH
                          </th>
                          <th className="px-2 py-2 border-b border-slate-200 text-center">
                            Comp
                          </th>
                          <th className="px-2 py-2 border-b border-slate-200 text-center">
                            Def
                          </th>
                          <th className="px-2 py-2 border-b border-slate-200 text-center">
                            Conclusion
                          </th>
                          <th className="px-2 py-2 border-b border-slate-200 text-center">
                            α (firing)
                          </th>
                          <th className="px-2 py-2 border-b border-slate-200 text-center">
                            Crisp
                          </th>
                          <th className="px-2 py-2 border-b border-slate-200 text-center">
                            α · crisp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {top.map((r) => {
                          const w = Math.abs(r.firingStrength);
                          return (
                            <tr key={r.no} className="hover:bg-slate-50">
                              <td className="text-center px-2 py-1">{r.no}</td>
                              <td className="text-center px-2 py-1 whitespace-nowrap">
                                {formatTerm(r.localHiring)}
                              </td>
                              <td className="text-center px-2 py-1 whitespace-nowrap">
                                {formatTerm(r.completeness)}
                              </td>
                              <td className="text-center px-2 py-1 whitespace-nowrap">
                                {formatTerm(r.defects)}
                              </td>
                              <td className="text-center px-2 py-1 whitespace-nowrap">
                                {formatTerm(r.assessment)}
                              </td>
                              <td className="text-center px-2 py-1">
                                {r.firingStrength.toFixed(3)}
                              </td>
                              <td className="text-center px-2 py-1">
                                {r.crispAssessment.toFixed(2)}
                              </td>
                              <td className="text-center px-2 py-1">
                                {(w * r.crispAssessment).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-semibold">
                          <td
                            className="text-right px-2 py-2 border-t border-slate-200"
                            colSpan={5}
                          >
                            Final score = Σ(α · crisp) / Σα
                          </td>
                          <td
                            className="text-center px-2 py-2 border-t border-slate-200"
                            colSpan={2}
                          >
                            Σα = {ev.weightSum.toFixed(3)}
                          </td>
                          <td
                            className={cn(
                              "text-center px-2 py-2 border-t border-slate-200",
                              s.text,
                            )}
                          >
                            {ev.finalScore.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    {fired.length > top.length && (
                      <div className="mt-2 text-xs text-slate-500">
                        Showing {top.length} of {fired.length} activated rules
                        (full set used in the aggregation).
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
