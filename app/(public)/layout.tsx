import { AppSidebar } from "@/components/AppSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { getNavigationData } from "@/lib/actions/navigation";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courses = await getNavigationData();

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
         <MobileHeader courses={courses} />
         <main className="flex-1">
            {children}
         </main>
      </div>
    </div>
  );
}
