import { FC } from "react";
import { Navigate } from "react-router-dom";
import { useSupplierStore } from "@/shared/store/suppliers";
import { paths } from "@/shared/config";

// Заглушка на корневом маршруте: уводит на дашборд первого поставщика.
// Если поставщиков ещё нет — показывает подсказку.
export const DashboardsIndexRedirect: FC = () => {
  const supplier = useSupplierStore((s) => s.supplier);
  const first = supplier[0];

  if (!first) {
    return (
      <div className="p-6 text-slate-600">
        Поставщиков пока нет. Загрузите CSV на странице{" "}
        <a href={paths.app.update.path} className="underline">
          «Обновить данные»
        </a>
        .
      </div>
    );
  }

  return (
    <Navigate to={paths.app.supplierDashboard.build(first.id)} replace />
  );
};
