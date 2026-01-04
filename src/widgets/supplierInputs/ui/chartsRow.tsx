import { LineChart } from "@/shared/components/charts";
import { MetricKey, Supplier } from "@/shared/store/suppliers/type/supplierType";
import { Trash2 } from "lucide-react";

type MonthRowProps = {
  supplier: Supplier
};

export const ChartsRow: React.FC<MonthRowProps> = ({
  supplier, 
}) => {
  const metricMeta: Array<{
    key: MetricKey;
    label: string; 
  }> = [
    {
      key: "localHiring",
      label: "Local hiring", 
    },
    {
      key: "completeness",
      label: "Completeness",  
    },
    { key: "defects", label: "Defects"},
  ];

  return (
    <div className="p-4  border-b-2 border-slate-200">
 

      <div className="mt-4 grid sm:grid-cols-3 gap-4">
        {metricMeta.map((mm) => (
          <div>
            <label className="text-sm font-medium text-slate-700">
              {mm.label}
            </label> 
                     <LineChart
                    title=""
                    yAxisCategory={supplier.data.map((d) => String(d.month))}
                    xAxisData={supplier.data.map((d) => d[mm.key])}
                  /> 
          </div>
        ))}
      </div>
    </div>
  );
};
