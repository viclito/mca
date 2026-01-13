"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AppSidebarClient } from "@/components/AppSidebarClient";

import { User } from "next-auth";

interface MobileHeaderProps {
    courses: any[];
    user?: User;
}

export function MobileHeader({ courses, user }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur md:hidden flex items-center h-14 px-4 gap-4 justify-between">
      <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
               <AppSidebarClient courses={courses} user={user} />
            </SheetContent>
          </Sheet>
          <div className="font-semibold">MCA Study Hub</div>
      </div>
      {user && (
          <div className="text-sm font-medium text-muted-foreground truncate max-w-[120px]">
              {user.name || "Student"}
          </div>
      )}
    </header>
  );
}
