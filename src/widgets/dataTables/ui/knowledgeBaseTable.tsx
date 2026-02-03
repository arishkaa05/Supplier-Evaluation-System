import { 
  knowledgeBase,
} from "@/shared/config/"; 
import { areas } from "@/shared/config/data/preparingknowledgeBase";
import { cn } from "@/shared/lib/utils";
import { CellPill } from "@/shared/ui/cellPill"; 

export const KnowledgeBaseTable = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Knowledge base for supplier assessment system
          </h2>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-xs text-slate-600 uppercase tracking-wide">
              <th className="text-left px-2 py-3 border-b   w-14">
                №
              </th>
              <th className="text-left px-2 py-3 border-b border-slate-200">
                Local hiring
              </th>
              <th className="text-left px-2 py-3 border-b border-slate-200">
                Completeness
              </th>
              <th className="text-left px-2 py-3 border-b border-slate-200">
                Defects
              </th>
              <th className="text-left px-2 py-3 border-b border-slate-200">
                Assessment
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {knowledgeBase.map((r) => (
              <tr
                key={r.no}
                className={cn(
                  "hover:bg-slate-50 transition-colors",
                  "focus-within:bg-slate-50",
                )}
                tabIndex={0}
                role="row"
              >
                <td className="px-2 py-2 font-medium text-slate-900">{r.no}</td>

                <td className="px-2  ">
                  <CellPill
                    level={r.localHiring.level}
                    trend={r.localHiring.trend}
                  />
                </td>

                <td className="px-2  ">
                  <CellPill
                    level={r.completeness.level}
                    trend={r.completeness.trend}
                  />
                </td>

                <td className="px-2  ">
                  <CellPill level={r.defects.level} trend={r.defects.trend} />
                </td>

                <td className="px-2  ">
                  <CellPill
                    level={r.assessment.level}
                    trend={r.assessment.trend}
                  />
                </td>
                 <td className="px-2  ">
                 { (areas[r.no - 1].name_area)}
                </td>
                   <td className="px-2  ">
                 { (areas[r.no - 1].formula_area)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
