"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight, GraduationCap, Info, Layers, LogOut } from "lucide-react";
import { User } from "next-auth";
import { signOut } from "next-auth/react";

interface NavigationData {
  id: string;
  name: string;
  slug: string;
  semesters: {
    id: string;
    name: string;
    slug: string;
    subjects: {
      id: string;
      name: string;
      slug: string;
      units: {
        id: string;
        name: string;
        slug: string;
      }[];
    }[];
  }[];
}

export function AppSidebarClient({ courses, user }: { courses: NavigationData[]; user?: User }) {
  const pathname = usePathname();
  
  // Use the first course as the main one for now
  const mainCourse = courses[0];

  if (!mainCourse) return <div>No courses found.</div>;

  return (
    <div className="h-full flex flex-col bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-6 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-sm">
             <GraduationCap className="h-5 w-5" />
          </div>
          <span>MCA Hub</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
         {/* Main Navigation Group */}
         <div className="space-y-1">
             <h4 className="px-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">Platform</h4>
             <Link href={`/${mainCourse.slug}`}>
               <div className={cn(
                   "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                   pathname === `/${mainCourse.slug}` 
                     ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm" 
                     : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
               )}>
                  <BookOpen className="h-4 w-4 opacity-70" />
                  {mainCourse.name}
               </div>
             </Link>
         </div>

         {/* Course Hierarchy Group */}
         <div className="space-y-1">
             <h4 className="px-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">Curriculum</h4>
             <Accordion type="multiple" className="w-full space-y-1">
                {mainCourse.semesters.map((sem) => (
                    <AccordionItem key={sem.id} value={sem.id} className="border-none">
                        <AccordionTrigger className={cn(
                            "px-3 py-2 text-[13px] font-medium text-foreground/80 hover:bg-muted/60 hover:text-foreground rounded-lg transition-all duration-200 group [&[data-state=open]]:text-foreground [&[data-state=open]]:bg-muted/40",
                            "decoration-0 hover:no-underline"
                        )}>
                            <span>{sem.name}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0 pt-1">
                             <div className="flex flex-col gap-1 pl-3 border-l ml-3 border-border/50">
                                 <Accordion type="multiple" className="w-full">
                                    {sem.subjects.map((sub) => {
                                         const isActiveSubject = pathname.includes(`/${mainCourse.slug}/${sem.slug}/${sub.slug}`);
                                         
                                         return (
                                              <AccordionItem key={sub.id} value={sub.id} className="border-none">
                                                   <div className="flex items-center">
                                                       <AccordionTrigger className={cn(
                                                            "flex-1 px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md transition-all duration-200 decoration-0 hover:no-underline",
                                                            isActiveSubject && "text-foreground font-semibold bg-muted/40"
                                                       )}>
                                                          <Link href={`/${mainCourse.slug}/${sem.slug}/${sub.slug}`} className="flex-1 text-left flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                                                               {sub.name}
                                                          </Link>
                                                          {(sub.units.length > 0) && (
                                                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                                                          )}
                                                       </AccordionTrigger>
                                                   </div>
                                                   
                                                   {(sub.units.length > 0) && (
                                                       <AccordionContent className="pb-0 pt-1">
                                                           <div className="flex flex-col gap-0.5 pl-3 border-l ml-3 border-border/40">
                                                               {sub.units.map(unit => {
                                                                    const unitHref = `/${mainCourse.slug}/${sem.slug}/${sub.slug}/unit/${unit.id}`; // using unit ID for URL
                                                                    const isUnitActive = pathname === unitHref;
                                                                    return (
                                                                        <Link key={unit.id} href={unitHref}>
                                                                            <div className={cn(
                                                                                "text-[12px] py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center gap-2",
                                                                                isUnitActive 
                                                                                    ? "text-primary font-medium bg-primary/10" 
                                                                                    : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/30"
                                                                            )}>
                                                                                <Layers className="h-3 w-3 opacity-70" />
                                                                                {unit.name}
                                                                            </div>
                                                                        </Link>
                                                                    )
                                                               })}
                                                           </div>
                                                       </AccordionContent>
                                                   )}
                                              </AccordionItem>
                                         )
                                    })}
                                 </Accordion>
                             </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
             </Accordion>
         </div>
      </div>

      <div className="p-4 border-t border-border/40">
          <div className="rounded-xl bg-muted/40 p-4 border border-border/50">
             <div className="flex flex-col gap-3">
                 <Link 
                    href="/about"
                    className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline"
                 >
                    <Info className="h-3 w-3" />
                    About
                 </Link>

                 <div className="h-px bg-border/40 w-full" />

                 {user ? (
                     <div className="flex flex-col gap-2">
                         <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-medium leading-none truncate">{user.name || "Student"}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                         </div>
                         <button 
                            onClick={() => signOut()} 
                            className="flex items-center gap-2 text-[11px] font-medium text-red-500 hover:text-red-600 hover:underline"
                         >
                            <LogOut className="h-3 w-3" />
                            Sign Out
                         </button>
                     </div>
                 ) : (
                    <div className="space-y-3">
                     <div>
                        <h5 className="text-xs font-semibold mb-1">Need Help?</h5>
                        <p className="text-[11px] text-muted-foreground">Contact support if you find any missing notes.</p>
                     </div>
                     <button className="text-[11px] font-medium text-primary hover:underline block">Contact Support</button>
                    </div>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
}
