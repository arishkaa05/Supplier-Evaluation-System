import { LayoutDashboard } from "lucide-react";
import { FuzzyResultTable } from "@/feature/calculations";

const Dashboards = () => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <LayoutDashboard size={24} strokeWidth={1} />
        <h4 className="text-4xl font-bold">Дашборды</h4>
      </div>
      <FuzzyResultTable />
    </div>
  );
};

export default Dashboards;
