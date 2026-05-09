 
export type Supplier = {
  supplier: string
  id: number
  data: {
    quality: Record<keyof Correlations, QualityValue>;
    month:number
    localHiring: number, 
    completeness: number
    defects: number
  }[]
};

export interface SupplierState {
  supplier: Supplier[]; 
  addSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplier: Supplier) => void;
  removeMonth: (month: number) => void;
   addMonth: (month: number) => void; 
  updateSupplierMetric: (
    supplierName: string,
    month: number,
    metric: MetricKey,
    value: number
  ) => void;
  updateSupplierQuality: (
      supplierName: string,
      month: number,
      metric: MetricKey,
      value: QualityValue,
    ) => void;
}

 

export type Correlations = {
  localHiring: number;
  completeness: number;
  defects: number;
};

export type MetricKey = keyof Correlations;  
// "0" — наблюдение отсутствует, "1" — точное значение,
// "2" — задано на основании опыта эксперта, "3" — неизвестно.
export type QualityValue = "0" | "1" | "2" | "3";
