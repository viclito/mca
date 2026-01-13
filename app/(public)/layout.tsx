import { AppSidebar } from "@/components/AppSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { Footer } from "@/components/Footer";
import { getNavigationData } from "@/lib/actions/navigation";
import { auth } from "@/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [courses, session] = await Promise.all([
    getNavigationData(),
    auth()
  ]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
         <MobileHeader courses={courses} user={session?.user} />
         <main className="flex-1">
            {children}
         </main>
         <Footer />
      </div>
    </div>
  );
}
