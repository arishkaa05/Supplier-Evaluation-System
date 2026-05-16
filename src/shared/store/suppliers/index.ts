import { create } from "zustand";
import {
  SupplierState,
  Supplier,
  MetricKey,
  QualityValue,
} from "./type/supplierType";
import * as api from "@/shared/api/endpoints";

const defaultQuality = (): Record<MetricKey, QualityValue> => ({
  localHiring: "1",
  completeness: "1",
  defects: "1",
});

const METRIC_TO_FIELD: Record<MetricKey, "local_hiring" | "completeness" | "defects"> = {
  localHiring: "local_hiring",
  completeness: "completeness",
  defects: "defects",
};

const METRIC_TO_QUALITY_FIELD: Record<
  MetricKey,
  "quality_local_hiring" | "quality_completeness" | "quality_defects"
> = {
  localHiring: "quality_local_hiring",
  completeness: "quality_completeness",
  defects: "quality_defects",
};

const logApiError = (op: string) => (e: unknown) => {
  console.error(`[supplierStore] ${op} failed:`, e);
};

// Локальное состояние пустое — наполняется bootstrap() из @/shared/api/bootstrap.
// Мутации применяются оптимистично и параллельно отправляются на сервер.
export const useSupplierStore = create<SupplierState>((set, get) => ({
  supplier: [],

  addSupplier: (supplier: Supplier) => {
    set((state) => ({ supplier: [...state.supplier, supplier] }));
    api
      .createSupplier(supplier.supplier)
      .then((created) => {
        // Подменяем id на серверный, чтобы последующие upsert наблюдений ссылались верно.
        set((state) => ({
          supplier: state.supplier.map((s) =>
            s.supplier === supplier.supplier ? { ...s, id: created.id } : s,
          ),
        }));
      })
      .catch(logApiError("createSupplier"));
  },

  deleteSupplier: (supplier: Supplier) => {
    const target = get().supplier.find((s) => s.supplier === supplier.supplier);
    set((state) => ({
      supplier: state.supplier.filter((s) => s.supplier !== supplier.supplier),
    }));
    if (target) api.deleteSupplier(target.id).catch(logApiError("deleteSupplier"));
  },

  removeMonth: (month: number) => {
    set((state) => ({
      supplier: state.supplier.map((s) => ({
        ...s,
        data: s.data.filter((d) => d.month !== month),
      })),
    }));
    api.removeMonth(month).catch(logApiError("removeMonth"));
  },

  updateSupplierMetric: (supplierName, month, metric, value) => {
    set((state) => ({
      supplier: state.supplier.map((s) =>
        s.supplier === supplierName
          ? {
              ...s,
              data: s.data.map((d) =>
                d.month === month ? { ...d, [metric]: value } : d,
              ),
            }
          : s,
      ),
    }));
    const target = get().supplier.find((s) => s.supplier === supplierName);
    if (!target) return;
    api
      .upsertObservation({
        supplierId: target.id,
        month,
        [METRIC_TO_FIELD[metric]]: value,
      })
      .catch(logApiError("upsertObservation"));
  },

  updateSupplierQuality: (supplierName, month, metric, value) => {
    set((state) => ({
      supplier: state.supplier.map((s) =>
        s.supplier === supplierName
          ? {
              ...s,
              data: s.data.map((d) =>
                d.month === month
                  ? {
                      ...d,
                      quality: {
                        ...(d.quality ?? defaultQuality()),
                        [metric]: value,
                      },
                    }
                  : d,
              ),
            }
          : s,
      ),
    }));
    const target = get().supplier.find((s) => s.supplier === supplierName);
    if (!target) return;
    api
      .upsertObservation({
        supplierId: target.id,
        month,
        [METRIC_TO_QUALITY_FIELD[metric]]: value,
      })
      .catch(logApiError("upsertObservation(quality)"));
  },

  addMonth: (month: number) => {
    set((state) => ({
      supplier: state.supplier.map((s) => {
        if (s.data.some((d) => d.month === month)) return s;
        return {
          ...s,
          data: [
            ...s.data,
            {
              month,
              localHiring: 0,
              completeness: 0,
              defects: 0,
              quality: defaultQuality(),
            },
          ].sort((a, b) => a.month - b.month),
        };
      }),
    }));
    api.addMonth(month).catch(logApiError("addMonth"));
  },
}));
