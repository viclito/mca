import { AppSidebar } from "@/components/AppSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { Footer } from "@/components/Footer";
import { getNavigationData } from "@/lib/actions/navigation";
import { auth } from "@/auth";
import { generatePageMetadata } from "@/lib/seo-config";

export const metadata = generatePageMetadata({
  title: "Home - MCA Hub",
  description: "Welcome to MCA Hub - Your comprehensive learning portal for Master of Computer Applications. Access course materials, study resources, and educational content.",
  keywords: [
    "MCA",
    "Master of Computer Applications",
    "Computer Science",
    "Online Learning",
    "Study Portal",
    "Educational Resources"
  ],
  path: "/",
});

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
