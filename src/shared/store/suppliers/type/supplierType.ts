export type quality = Record<keyof Correlations, QualityValue>

export type SupplierData =  {
    quality: quality;
    month:number
    localHiring: number, 
    completeness: number
    defects: number
  }

export type Supplier = {
  supplier: string
  id: number
  data:SupplierData[]
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
 export type QualityValue = "1" | "2" | "3";
