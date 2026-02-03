import React from "react";
import { MetricKey, QualityValue } from "@/shared/store/suppliers/type/supplierType";
import { Trash2 } from "lucide-react"; 
 
const accuracyOptions: Array<{ value: QualityValue; name: string }> = [
  { value: "1", name: "точно" },
  { value: "2", name: "неточно" },
  { value: "3", name: "неизмеримо" },
];

type MonthRowProps = {
  supplierName: string;
  month: number;
  isLast: boolean;

  getCell: (supplierName: string, month: number, key: MetricKey) => number;
  onChangeNumber: (supplierName: string, month: number, key: MetricKey, raw: string) => void;
  getQuality: (supplierName: string, month: number, key: MetricKey) => QualityValue;
  onChangeQuality: (
    supplierName: string,
    month: number,
    key: MetricKey,
    value: QualityValue,
  ) => void;

  onRemoveMonth: (month: number) => void;
};

export const MonthRow: React.FC<MonthRowProps> = ({
  supplierName,
  month,
  isLast,
  getCell,
  onChangeNumber,
  getQuality,
  onChangeQuality,
  onRemoveMonth,
}) => {
  const metricMeta: Array<{
    key: MetricKey;
    label: string;
    hint: string;
    trend: string;
  }> = [
    { key: "localHiring", label: "Local hiring, %", hint: "benefit", trend: "↑" },
    { key: "completeness", label: "Completeness, %", hint: "benefit", trend: "↑" },
    { key: "defects", label: "Defects, %", hint: "cost", trend: "↓" },
  ];

  return (
    <div className={`p-4 ${isLast ? "" : "border-b-2 border-slate-200"}`}>
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
        {metricMeta.map((mm) => {
          const selected = getQuality(supplierName, month, mm.key);
          const groupName = `${supplierName}-${month}-${mm.key}-quality`;

          return (
            <div key={mm.key} className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {mm.label}
              </label>

              <input
                type="number"
                step="0.01"
                value={getCell(supplierName, month, mm.key)}
                onChange={(e) =>
                  onChangeNumber(supplierName, month, mm.key, e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-2 py-1"
              />

              {isLast && (
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-xs text-slate-500 mb-2">Достоверность</div>


                  <div className="flex flex-wrap gap-3">
                    {accuracyOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className="inline-flex items-center gap-2 text-xs text-slate-700"
                      >
                      
                        <input
                          type="radio"
                          name={groupName}
                          value={opt.value}
                          checked={selected === opt.value}
                          onChange={() =>
                            onChangeQuality(supplierName, month, mm.key, opt.value)
                          }
                          className="accent-slate-900"
                        />
                        {opt.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
