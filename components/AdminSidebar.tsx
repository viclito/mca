"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GraduationCap,
  LibraryBig,
  BookOpen,
  Layers,
  FileVideo,
  LogOut,
  Settings,
  Menu,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Degrees", href: "/admin/degrees", icon: GraduationCap },
  { label: "Semesters", href: "/admin/semesters", icon: LibraryBig },
  { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
  { label: "Units", href: "/admin/units", icon: Layers },
  { label: "Content", href: "/admin/content", icon: FileVideo },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} onClick={onLinkClick}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/40 space-y-2">
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Account
        </div>
        <Link href="/admin/settings" onClick={onLinkClick}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </div>
        </Link>
        <div
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </div>
      </div>
    </>
  );
}

export function AdminSidebar({ mobileTitle }: { mobileTitle?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="h-14 flex items-center justify-between px-6 border-b border-border/40">
                <h2 className="text-lg font-bold tracking-tight">Admin Panel</h2>
              </div>
              <SidebarContent onLinkClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        {mobileTitle && (
          <h1 className="text-lg font-semibold truncate">{mobileTitle}</h1>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
