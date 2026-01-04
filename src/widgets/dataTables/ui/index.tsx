 
import { KnowledgeBaseTable } from "./knowledgeBaseTable";
import { LocalHiringTable } from "./localHiringTable";
import { CompletenessTable } from "./completenessTable";
import { DefectsTable } from "./defectsTable";
import { AssesmentTable } from "./assesmentTable"; 
import FormulasSection from "./formulasSection";

export const DataTables = () => {
  return (
    <section className="grid lg:grid-cols-2 gap-6">
      <KnowledgeBaseTable />

      <div className="space-y-6">
        <div className="grid gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <LocalHiringTable />

           <CompletenessTable /> 

           <DefectsTable />

           <AssesmentTable />  

           <FormulasSection />

           
          </div>
        </div>
      </div>
    </section>
  );
};
