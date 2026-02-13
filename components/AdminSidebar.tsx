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
  X,
  Megaphone,
  Info,
  FileText,
  FileSpreadsheet,
  Library,
  FileQuestion,
  Activity
} from "lucide-react";


import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Degrees", href: "/admin/degrees", icon: GraduationCap },
  { label: "Semesters", href: "/admin/semesters", icon: LibraryBig },
  { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
  { label: "Books", href: "/admin/books", icon: Library },
  { label: "Units", href: "/admin/units", icon: Layers },
  { label: "Content", href: "/admin/content", icon: FileVideo },
  { label: "Forms", href: "/admin/forms", icon: FileText },
  { label : "Notices" , href : "/admin/notifications" , icon : Megaphone } ,
  { label: "Question Papers", href: "/admin/question-papers", icon: FileQuestion },
  { label: "Information", href: "/admin/information", icon: FileSpreadsheet },
  { label: "System Logs", href: "/admin/logs", icon: Activity },
];


function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {sidebarItems.map((item) => {
          // For dashboard, use exact match to prevent it from being active on all /admin/* routes
          const isActive = item.href === "/admin" 
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
        <Link href="/about" onClick={onLinkClick}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
            <Info className="h-4 w-4" />
            About
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

import { User } from "next-auth";

// ... existing imports

export function AdminSidebar({ mobileTitle, user }: { mobileTitle?: string; user?: User }) {
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
              <div className="px-6 py-4 border-b border-border/40 bg-muted/20">
                 {user ? (
                   <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none truncate">{user.name || "Admin"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                   </div>
                 ) : (
                   <p className="text-sm font-medium">Guest</p>
                 )}
              </div>
              <SidebarContent onLinkClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1 min-w-0">
            {mobileTitle && (
            <h1 className="text-lg font-semibold truncate">{mobileTitle}</h1>
            )}
        </div>
        {/* Mobile profile icon could go here if needed, but sidebar is enough */}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
        </div>
        <div className="px-6 py-4 border-b border-border/40 bg-muted/20">
             {user ? (
               <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-none truncate">{user.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className="inline-flex mt-1 items-center rounded-full border border-transparent bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 w-fit">
                    {user.role || 'Admin'}
                  </span>
               </div>
             ) : (
               <p className="text-sm font-medium">Guest</p>
             )}
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
