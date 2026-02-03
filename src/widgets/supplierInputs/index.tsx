import {
  MetricKey,
  QualityValue,
} from "@/shared/store/suppliers/type/supplierType";
import { SupplierCard } from "./ui/supplierCard";
import { useMemo, useState } from "react";
import { useSupplierStore } from "@/shared/store/suppliers";
import { CalendarPlus, Plus } from "lucide-react";

export const SupplierInputs: React.FC = () => {
  const supplier = useSupplierStore((s) => s.supplier);
  const addMonth = useSupplierStore((s) => s.addMonth);
  const updateSupplierMetric = useSupplierStore((s) => s.updateSupplierMetric);
  const deleteSupplier = useSupplierStore((s) => s.deleteSupplier);
  const removeMonth = useSupplierStore((s) => s.removeMonth);
  const updateSupplierQuality = useSupplierStore(
    (s) => (s as any).updateSupplierQuality,
  );

  const getQuality = (supplierName: string, month: number, key: MetricKey) => {
    const sp = supplier.find((x) => x.supplier === supplierName);
    const row = sp?.data.find((d) => d.month === month);
    return ((row as any)?.quality?.[key] ?? "1") as QualityValue;
  };

  const months = useMemo(() => {
    const set = new Set<number>();
    supplier.forEach((sp) => sp.data.forEach((d) => set.add(d.month)));
    return Array.from(set).sort((a, b) => a - b);
  }, [supplier]);

  const nextMonth = useMemo(() => {
    if (months.length === 0) return 1;
    let m = 1;
    const used = new Set(months);
    while (used.has(m)) m += 1;
    return m;
  }, [months]);

  const [monthToAdd] = useState<number>(nextMonth);

  const getCell = (supplierName: string, month: number, key: MetricKey) => {
    const sp = supplier.find((x) => x.supplier === supplierName);
    const row = sp?.data.find((d) => d.month === month);
    return row ? (row as any)[key] : 0;
  };

  const onChangeNumber = (
    supplierName: string,
    month: number,
    key: MetricKey,
    raw: string,
  ) => {
    const val = raw === "" ? 0 : Number(raw);
    updateSupplierMetric(
      supplierName,
      month,
      key,
      Number.isFinite(val) ? val : 0,
    );
  };

  return (
    <section className="gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Data on cooperation with suppliers A and B
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-2 py-1">
              <CalendarPlus size={16} className="text-slate-700" />
              <button
                type="button"
                onClick={() => addMonth(monthToAdd)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs"
                title="Добавить месяц всем поставщикам"
              >
                <Plus size={14} />
                Добавить
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid lg:grid-cols-2 gap-6">
          {supplier.map((sp) => (
            <SupplierCard
              key={sp.supplier}
              sp={sp as any}
              onDeleteSupplier={(s) => deleteSupplier(s as any)}
              onRemoveMonth={(m) => removeMonth(m)}
              getCell={getCell}
              onChangeNumber={onChangeNumber}
              getQuality={getQuality}
              onChangeQuality={(supplierName, month, key, value) =>
                updateSupplierQuality(supplierName, month, key, value)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};
