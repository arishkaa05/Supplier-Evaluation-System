import { create } from "zustand";
import { SupplierState, Supplier, MetricKey, QualityValue } from "./type/supplierType";


const defaultQuality = (): Record<MetricKey, QualityValue> => ({
  localHiring: "1",
  completeness: "1",
  defects: "2",
});

export const useSupplierStore = create<
  SupplierState 
>((set) => ({
  supplier: [
    {
      id: 1,
      supplier: "Поставщик №1",
      data: [
        { month: 1, localHiring: 72, completeness: 80, defects: 15, quality: defaultQuality() },
        { month: 2, localHiring: 71, completeness: 85, defects: 10, quality: defaultQuality() },
        { month: 3, localHiring: 80, completeness: 90, defects: 10, quality: defaultQuality() },
        { month: 4, localHiring: 88, completeness: 84, defects: 12, quality: defaultQuality() },
        { month: 5, localHiring: 88, completeness: 90, defects: 9, quality: defaultQuality() },
        { month: 6, localHiring: 90, completeness: 91, defects: 4, quality: defaultQuality() },
      ],
    },
    {
      id: 2,
      supplier: "Поставщик №2",
      // Часть исторических наблюдений по дефектам отсутствует (quality="0").
      data: [
        { month: 1, localHiring: 72, completeness: 91, defects: 0, quality: { localHiring: "1", completeness: "1", defects: "0" } },
        { month: 2, localHiring: 71, completeness: 85, defects: 0, quality: { localHiring: "1", completeness: "1", defects: "0" } },
        { month: 3, localHiring: 68, completeness: 82, defects: 0, quality: { localHiring: "1", completeness: "1", defects: "0" } },
        { month: 4, localHiring: 73, completeness: 84, defects: 10, quality: defaultQuality() },
        { month: 5, localHiring: 68, completeness: 83, defects: 8, quality: defaultQuality() },
        { month: 6, localHiring: 67, completeness: 89, defects: 12, quality: defaultQuality() },
      ],
    },
    {
      id: 3,
      supplier: "Поставщик №3",
      // Часть исторических значений задана на основании опыта эксперта (quality="2").
      data: [
        { month: 1, localHiring: 97, completeness: 92, defects: 15, quality: { localHiring: "2", completeness: "1", defects: "1" } },
        { month: 2, localHiring: 90, completeness: 95, defects: 10, quality: defaultQuality() },
        { month: 3, localHiring: 80, completeness: 90, defects: 10, quality: { localHiring: "1", completeness: "1", defects: "2" } },
        { month: 4, localHiring: 84, completeness: 85, defects: 12, quality: { localHiring: "2", completeness: "1", defects: "2" } },
        { month: 5, localHiring: 70, completeness: 90, defects: 9, quality: { localHiring: "2", completeness: "1", defects: "2" } },
        { month: 6, localHiring: 90, completeness: 91, defects: 4, quality: defaultQuality() },
      ],
    },
  ],

  addSupplier: (supplier: Supplier) => {
    set((state) => ({
      supplier: [...state.supplier, supplier],
    }));
  },

  deleteSupplier: (supplier: Supplier) => {
    set((state) => ({
      supplier: state.supplier.filter((s) => s.supplier !== supplier.supplier),
    }));
  },

  removeMonth: (month: number) => {
    set((state) => ({
      supplier: state.supplier.map((s) => ({
        ...s,
        data: s.data.filter((d) => d.month !== month),
      })),
    }));
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
  },
}));
