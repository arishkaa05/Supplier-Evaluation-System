import { Correlations, quality, SupplierData } from "../store/suppliers/type/supplierType";

export function calcFinalQuality(data: SupplierData[]): quality {
  const keys: (keyof Correlations)[] = [
    "localHiring",
    "completeness",
    "defects",
  ];

  const result = {} as quality;

  for (const key of keys) {
    const values = data.map(item => item.quality[key]);

    const unique = new Set(values);

    if (unique.size === 1) {
      result[key] = values[0];
    } else {
      result[key] = "2";
    }
  }

  return result;
}
