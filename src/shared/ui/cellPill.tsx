import { cn } from "../lib/utils";

export function CellPill({ level, trend }: { level: Level; trend: Trend }) {
  const trendBadge = trend === "up" ? "text-green-800 " : " text-red-800 ";

  return (
    <div className="flex items-center  gap-2">
      <span
        className={cn(
          "inline-flex items-center justify-center  py-1 text-xs font-semibold mono text-slate-800",
        )}
        title={`Level: ${level}`}
      >
        {level}
      </span>

      <span
        className={cn(
          "inline-flex items-center justify-center   py-1 text-xs font-semibold mono",
          trendBadge,
        )}
        title={`Trend: ${trend}`}
      >
        {trend === "up" ? "↑" : "↓"}
      </span>
    </div>
  );
}
