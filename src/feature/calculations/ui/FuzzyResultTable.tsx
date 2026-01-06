import { cn } from "@/shared/lib/utils";
 import { useSupplierRules } from "../model/useSupplierFuzzyResult";
import { Level, Trend } from "@/shared/config/data/type";
const formatTerm = (t?: {  level: Level;
  trend: Trend;}) =>
  t ? `${t.level}${t.trend === "up" ? "↑" : "↓"}` : "";

export const tableHead = [
  { id: 1, name: "№ rule", description: "№" },
  { id: 2, name: "Local Hiring", description: "Reliability" },
  { id: 3, name: "Completeness", description: "Completeness" },
  { id: 4, name: "Defects", description: "Defects" },
  { id: 5, name: "Assessment", description: "Assessment" },
  { id: 6, name: "Crisp Assessment", description: "Crisp Assessment" },
];

export const FuzzyResultTable = () => {
  const supplierRules = useSupplierRules();
 
  return (
    <section className="gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Data on cooperation with suppliers A and B
            </h2>
          </div>
        </div>

        <div className="mt-5 grid lg:grid-cols-2 gap-6">
          {supplierRules.map((sp) => (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-scroll">
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="font-semibold">{sp.supplier}</div>
              </div>

              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="text-xs text-slate-600 uppercase tracking-wide">
                    <th className="px-3 py-2 border-b border-slate-200 text-center whitespace-nowrap">
                      № rule
                    </th>
                    <th className="px-3 py-2 border-b border-slate-200 text-center whitespace-nowrap">
                      Local Hiring
                    </th>
                    <th className="px-3 py-2 border-b border-slate-200 text-center whitespace-nowrap">
                      Completeness
                    </th>
                    <th className="px-3 py-2 border-b border-slate-200 text-center whitespace-nowrap">
                      Defects
                    </th>
                    <th className="px-3 py-2 border-b border-slate-200 text-center whitespace-nowrap">
                      Assessment
                    </th>
                    <th className="px-3 py-2 border-b border-slate-200 text-center whitespace-nowrap">
                      Crisp Assessment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sp.rules.map((rule) => (
                    <tr
                      key={rule.no}
                      className={cn(
                        "hover:bg-slate-50 transition-colors",
                        "focus-within:bg-slate-50",
                      )}
                      tabIndex={0}
                      role="row"
                    >
                      <td className="text-center px-3 py-1 whitespace-nowrap">
                        {rule.no}
                      </td>
                      <td className="text-center px-3 py-1 whitespace-nowrap">
                        {formatTerm(rule.localHiring)}
                      </td>
                      <td className="text-center px-3 py-1 whitespace-nowrap">
                        {formatTerm(rule.completeness)}
                      </td>
                      <td className="text-center px-3 py-1 whitespace-nowrap">
                        {formatTerm(rule.defects)} 
                      </td>
                      <td className="text-center px-3 py-1 whitespace-nowrap">
                 {formatTerm(rule.assessment)}
                      </td>
                      <td className="text-center px-3 py-1 whitespace-nowrap">
                        {rule.crispAssessment.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
