import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/shared/ui/sidebar";

import { NavSidebar } from "./NavSidebar";
import { FooterSidebar } from "./FooterSidebar";

export const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup>
          <h4 className={"font-bold text-sm leading-snug"}>
            Оценка поставщиков в&nbsp;управлении цепочками поставок
          </h4>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <NavSidebar />
      </SidebarContent>

      <FooterSidebar />
    </Sidebar>
  );
};
