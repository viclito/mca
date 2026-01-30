import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, FileText, Download, ChevronRight } from "lucide-react";

interface StudyMaterialCardProps {
  title: string;
  type: "video" | "pdf";
  url: string;
  contentId: string;
  basePath: string; // e.g., /course/sem/sub
  isLast?: boolean;
}

export function StudyMaterialCard({ title, type, url, contentId, basePath, isLast }: StudyMaterialCardProps) {
  const getDownloadUrl = (viewUrl: string) => {
    if (viewUrl.includes('drive.google.com')) {
      const match = viewUrl.match(/\/d\/(.+?)\//) || viewUrl.match(/id=(.+?)(&|$)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return viewUrl;
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 transition-all duration-200 hover:bg-emerald-500/5 group",
      !isLast && "border-b border-border/40"
    )}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/5 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-emerald-700 transition-colors truncate pr-4">{title}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">PDF Document</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
         <Button variant="ghost" size="icon" asChild title="Open in Drive" className="h-9 w-9 text-muted-foreground/50 hover:text-emerald-600 hover:bg-emerald-500/10">
              <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
              </a>
         </Button>

         <Button variant="ghost" size="icon" asChild title="Download PDF" className="h-9 w-9 text-muted-foreground/50 hover:text-emerald-600 hover:bg-emerald-500/10">
            <a href={getDownloadUrl(url)} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
         </Button>
         
         <Link 
           href={`${basePath}/read/${contentId}`}
           className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-sm font-semibold ml-2"
         >
           <BookOpen className="h-4 w-4" />
           <span className="hidden sm:inline">Read Online</span>
           <ChevronRight className="h-4 w-4" />
         </Link>
      </div>
    </div>
  );
}
