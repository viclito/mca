import React from "react";
import { getNavigationData } from "@/lib/actions/navigation";
import { AppSidebarClient } from "./AppSidebarClient";
import { auth } from "@/auth";

export async function AppSidebar() {
  const [courses, session] = await Promise.all([
    getNavigationData(),
    auth()
  ]);

  return (
    <aside className="hidden md:flex flex-col w-[280px] border-r border-border/60 h-[calc(100vh)] shrink-0 bg-background/50 sticky top-0 z-30">
        <AppSidebarClient courses={courses} user={session?.user} />
    </aside>
  );
}
