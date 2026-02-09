"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { Footer } from "@/components/Footer";
import { usePathname } from "next/navigation";
import { User } from "next-auth";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/degrees": "Degrees",
  "/admin/semesters": "Semesters",
  "/admin/subjects": "Subjects",
  "/admin/units": "Units",
  "/admin/content": "Content",
  "/admin/forms": "Forms",
  "/admin/books": "Books",
  "/admin/question-papers": "Question Papers",
  "/admin/settings": "Settings",
};

interface AdminLayoutContentProps {
  children: React.ReactNode;
  user?: User;
}

export function AdminLayoutContent({
  children,
  user
}: AdminLayoutContentProps) {
  const pathname = usePathname();
  const mobileTitle = pageTitles[pathname] || "Admin";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar mobileTitle={mobileTitle} user={user} />
      <main className="flex-1 overflow-y-auto md:h-screen p-3 md:p-8">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
             {children}
             <Footer />
        </div>
      </main>
    </div>
  );
}
