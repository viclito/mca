import { generatePageMetadata } from "@/lib/seo-config";

export const metadata = generatePageMetadata({
  title: "About Us - MCA Hub",
  description: "Learn more about MCA Hub - A premium learning portal dedicated to providing quality education for Master of Computer Applications students.",
  keywords: [
    "About MCA Hub",
    "Educational Platform",
    "Computer Science Education",
    "Master's Degree Program"
  ],
  path: "/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
