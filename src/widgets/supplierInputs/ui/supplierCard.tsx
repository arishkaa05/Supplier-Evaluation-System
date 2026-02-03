import { useMemo, FC } from "react";
import { Trash2 } from "lucide-react";
import {
  MetricKey,
  QualityValue,
  Supplier,
} from "@/shared/store/suppliers/type/supplierType";
import { MonthRow } from "./monthRow";
import { ChartsRow } from "./chartsRow";
import { PearsonResult } from "./pearsonResult";

type SupplierCardProps = {
  sp: Supplier;
  onDeleteSupplier: (sp: Supplier) => void;
  onRemoveMonth: (month: number) => void;
  getCell: (supplierName: string, month: number, key: MetricKey) => number;
  onChangeNumber: (
    supplierName: string,
    month: number,
    key: MetricKey,
    raw: string,
  ) => void;
  getQuality: (
    supplierName: string,
    month: number,
    key: MetricKey,
  ) => QualityValue;
  onChangeQuality: (
    supplierName: string,
    month: number,
    key: MetricKey,
    value: QualityValue,
  ) => void;
};

export const SupplierCard: FC<SupplierCardProps> = ({
  sp,
  onDeleteSupplier,
  onRemoveMonth,
  getCell,
  onChangeNumber,
  onChangeQuality,
  getQuality,
}) => {
  const spMonths = useMemo(
    () => sp.data.map((d) => d.month).sort((a, b) => a - b),
    [sp.data],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="font-semibold">{sp.supplier}</div>

        <button
          type="button"
          onClick={() => onDeleteSupplier(sp)}
          className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-sm"
          title="Удалить поставщика"
        >
          <Trash2 size={16} />
          Удалить
        </button>
      </div>

      <div className="m-4 rounded-xl bg-slate-50 border border-slate-200">
        {spMonths.map((m, idx) => (
          <MonthRow
            key={`${sp.supplier}-${m}`}
            supplierName={sp.supplier}
            month={m}
            isLast={idx === spMonths.length - 1}
            getCell={getCell}
            onChangeNumber={onChangeNumber}
            onRemoveMonth={onRemoveMonth}
            getQuality={getQuality}
            onChangeQuality={onChangeQuality}
          />
        ))}
        <ChartsRow supplier={sp} />

        <PearsonResult supplier={sp} />
      </div>
    </div>
  );
};
