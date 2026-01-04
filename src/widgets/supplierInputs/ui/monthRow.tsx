import { MetricKey } from "@/shared/store/suppliers/type/supplierType";
import { Trash2 } from "lucide-react";

type MonthRowProps = {
  supplierName: string;
  month: number;
  isLast: boolean;
  getCell: (supplierName: string, month: number, key: MetricKey) => number;
  onChangeNumber: (
    supplierName: string,
    month: number,
    key: MetricKey,
    raw: string,
  ) => void;
  onRemoveMonth: (month: number) => void;
};

export const MonthRow: React.FC<MonthRowProps> = ({
  supplierName,
  month,
  isLast,
  getCell,
  onChangeNumber,
  onRemoveMonth,
}) => {
  const metricMeta: Array<{
    key: MetricKey;
    label: string;
    hint: string;
    trend: string;
  }> = [
    {
      key: "localHiring",
      label: "Local hiring, %",
      hint: "benefit",
      trend: "↑",
    },
    {
      key: "completeness",
      label: "Completeness, %",
      hint: "benefit",
      trend: "↑",
    },
    { key: "defects", label: "Defects, %", hint: "cost", trend: "↓" },
  ];

  return (
    <div className="p-4  border-b-2 border-slate-200">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">
          Месяц <span className="text-slate-700">{month}</span>
        </div>

        <button
          type="button"
          onClick={() => onRemoveMonth(month)}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-sm"
          title="Удалить месяц"
        >
          <Trash2 size={16} />
          Удалить месяц
        </button>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-4">
        {metricMeta.map((mm) => (
          <div>
            <label className="text-sm font-medium text-slate-700">
              {mm.label}
            </label>
            <input
              type="number"
              step="0.01"
              value={getCell(supplierName, month, mm.key)}
              onChange={(raw) =>
                onChangeNumber(supplierName, month, mm.key, raw)
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
