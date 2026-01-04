 import { SupplierInputs } from "@/widgets/supplierInputs";
import { CloudUpload } from "lucide-react";

const Update = () => {
  return ( 
        <main className="w-full">
      <div className="flex items-center gap-4 mb-6">
         <CloudUpload size={32} strokeWidth={1} className="text-slate-700" />
        <h4 className="text-2xl font-semibold">Обновить данные</h4>
      </div>

     <SupplierInputs />
    </main>
  );
};

export default Update;
