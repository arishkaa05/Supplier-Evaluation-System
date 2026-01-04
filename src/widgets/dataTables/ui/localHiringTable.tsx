import { localHiringDb } from "@/shared/config/";
import { cn } from "@/shared/lib/utils";
import { CellPill } from "@/shared/ui/cellPill";

export const LocalHiringTable = () => {
  return (
    <div className="  p-5  ">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">
            Database for criterion local hiring
          </h3>
        </div>
        <span className="text-xs rounded-full bg-white border border-slate-200 px-2 py-1">
          Impact Factor:<b> {localHiringDb.impactFactor}</b>
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <tbody className="divide-y divide-slate-200">
              {localHiringDb.rows.map((r, i) => (
                <tr
                  key={i}
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    "focus-within:bg-slate-50",
                  )}
                  tabIndex={0}
                  role="row"
                >
                  <td className="px-2 py-2 font-medium text-slate-900">
                    {r.description}
                  </td>

                  <td className="px-2  ">
                    <CellPill level={r.value.level} trend={r.value.trend} />
                  </td>

                  <td className="px-2  ">[{r.parameters.join(", ")}]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
