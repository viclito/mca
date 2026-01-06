import React from "react";
import { getNavigationData } from "@/lib/actions/navigation";
import { AppSidebarClient } from "./AppSidebarClient";

export async function AppSidebar() {
  const courses = await getNavigationData();

  return (
    <aside className="hidden md:flex flex-col w-[280px] border-r border-border/60 h-[calc(100vh)] shrink-0 bg-background/50 sticky top-0 z-30">
        <AppSidebarClient courses={courses} />
    </aside>
  );
}
