 
export type Supplier = {
  supplier: string
  data: {
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
}

 

export type Correlations = {
  localHiring: number;
  completeness: number;
  defects: number;
};

export type MetricKey = keyof Correlations;  
 