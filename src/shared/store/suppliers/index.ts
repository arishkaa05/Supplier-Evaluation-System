 import { create } from "zustand";
import { SupplierState, Supplier, MetricKey } from "./type/supplierType";


export const useSupplierStore = create<SupplierState>((set) => ({
  supplier: [
    {
      supplier: "Supplier A",
      data: [
        { month: 1, localHiring: 72, completeness: 80, defects: 15 },
        { month: 2, localHiring: 71, completeness: 85, defects: 10 },
        { month: 3, localHiring: 80, completeness: 90, defects: 10 },
        { month: 4, localHiring: 88, completeness: 84, defects: 12 },
        { month: 5, localHiring: 88, completeness: 90, defects: 9 },
        { month: 6, localHiring: 90, completeness: 91, defects: 4 },
      ],
    },
    {
      supplier: "Supplier B",
      data: [
        { month: 1, localHiring: 97, completeness: 92, defects: 15 },
        { month: 2, localHiring: 90, completeness: 95, defects: 10 },
        { month: 3, localHiring: 80, completeness: 90, defects: 10 },
        { month: 4, localHiring: 84, completeness: 85, defects: 12 },
        { month: 5, localHiring: 70, completeness: 90, defects: 9 },
        { month: 6, localHiring: 90, completeness: 91, defects: 4 },
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
      supplier: state.supplier.filter(
        (s) => s.supplier !== supplier.supplier
      ),
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
  updateSupplierMetric: (
    supplierName: string,
    month: number,
    metric: MetricKey,
    value: number
  ) => {
    set((state) => ({
      supplier: state.supplier.map((s) =>
        s.supplier === supplierName
          ? {
              ...s,
              data: s.data.map((d) =>
                d.month === month ? { ...d, [metric]: value } : d
              ),
            }
          : s
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
            },
          ].sort((a, b) => a.month - b.month),
        };
      }),
    }));
  },
}));
