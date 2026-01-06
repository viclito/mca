import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import dbConnect from "@/lib/db";
import Content from "@/lib/models/Content";
import Unit from "@/lib/models/Unit";
import { BookViewer } from "@/components/BookViewer";
import { Button } from "@/components/ui/button";

interface ReadPageProps {
  params: Promise<{
    course: string;
    semester: string;
    subject: string;
    contentId: string;
  }>;
}

// Function to convert Google Drive view link to download link
const getDownloadUrl = (viewUrl: string) => {
  if (viewUrl.includes('drive.google.com')) {
    const match = viewUrl.match(/\/d\/(.+?)\//) || viewUrl.match(/id=(.+?)(&|$)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return viewUrl;
};

async function getContent(contentId: string) {
    await dbConnect();
    if (!contentId.match(/^[0-9a-fA-F]{24}$/)) return null;
    const content = await Content.findById(contentId);
    if (!content) return null;
    return content;
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { course, semester, subject, contentId } = await params;
  const content = await getContent(contentId);

  if (!content) return notFound();

  // Find the unit to generate back link correctly? 
  // We can just go back to subject page or try to link back to unit if we fetch it.
  // For simplicity, let's link back to unit if we can find it, otherwise subject.
  let backLink = `/${course}/${semester}/${subject}`;
  if (content.unitId) {
      backLink += `/unit/${content.unitId.toString()}`;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
       {/* Minimal Reader Header */}
       <div className="h-14 border-b flex items-center px-4 justify-between bg-background sticky top-0 z-10">
          <Link href={backLink} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back
          </Link>
          <div className="font-semibold text-sm truncate max-w-[150px] md:max-w-md">
             {content.title}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild title="Download PDF">
               <a href={getDownloadUrl(content.url)} download target="_blank" rel="noopener noreferrer">
                 <Download className="h-4 w-4" />
               </a>
            </Button>
          </div>
       </div>

       <div className="flex-1 bg-zinc-100 dark:bg-zinc-950/50 p-4 md:p-8 flex items-center justify-center">
          <BookViewer url={content.url} />
       </div>
    </div>
  );
}
