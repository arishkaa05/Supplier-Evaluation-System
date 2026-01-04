import { DataTables } from "@/widgets/dataTables/ui";
import { Database } from "lucide-react";

const DataTable = () => {
  return (
    <main className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Database size={32} strokeWidth={1} className="text-slate-700" />
        <h4 className="text-2xl font-semibold">База данных</h4>
      </div>

      <DataTables />
    </main>
  );
};

export default DataTable;
