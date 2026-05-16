import { FC } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import { navMap } from "../model";
import { Link, useLocation } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useSupplierStore } from "@/shared/store/suppliers";
import { paths } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

export const NavSidebar: FC = () => {
  const suppliers = useSupplierStore((s) => s.supplier);
  const { pathname } = useLocation();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Навигация</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navMap.map((el) => (
              <SidebarMenuItem key={el.name} className="flex items-center">
                {el.icon}

                <SidebarMenuButton asChild>
                  <Link to={el.to}>{el.name}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Поставщики</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {suppliers.length === 0 && (
              <SidebarMenuItem>
                <div className="px-2 py-1 text-xs text-slate-500">
                  Список пуст
                </div>
              </SidebarMenuItem>
            )}
            {suppliers.map((s) => {
              const to = paths.app.supplierDashboard.build(s.id);
              const active = pathname === to;
              return (
                <SidebarMenuItem key={s.id} className="flex items-center">
                  <Building2 size={16} strokeWidth={1} />
                  <SidebarMenuButton asChild>
                    <Link
                      to={to}
                      className={cn(active && "font-semibold text-slate-900")}
                    >
                      {s.supplier}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};
