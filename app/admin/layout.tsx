import { auth } from "@/auth";
import { AdminLayoutContent } from "@/components/AdminLayoutContent";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AdminLayoutContent user={session?.user}>
      {children}
    </AdminLayoutContent>
  );
}
