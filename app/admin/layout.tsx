"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/degrees": "Degrees",
  "/admin/semesters": "Semesters",
  "/admin/subjects": "Subjects",
  "/admin/units": "Units",
  "/admin/content": "Content",
  "/admin/settings": "Settings",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mobileTitle = pageTitles[pathname] || "Admin";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar mobileTitle={mobileTitle} />
      <main className="flex-1 overflow-y-auto md:h-screen p-3 md:p-8">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
             {children}
        </div>
      </main>
    </div>
  );
}
