import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, BookOpen, FileText } from "lucide-react";

interface StudyMaterialCardProps {
  title: string;
  type: "video" | "pdf";
  url: string;
  contentId: string;
  basePath: string; // e.g., /course/sem/sub
}

export function StudyMaterialCard({ title, type, url, contentId, basePath }: StudyMaterialCardProps) {
  return (
    <Card className="flex items-center justify-between p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
             <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium truncate pr-4 text-sm md:text-base">{title}</h4>
          <p className="text-xs text-muted-foreground">PDF Document</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
         <Button variant="outline" size="sm" asChild className="hidden sm:flex">
             <a href={url} target="_blank" rel="noopener noreferrer">
                 <ExternalLink className="mr-2 h-4 w-4" /> Drive
             </a>
         </Button>
         
         <Button size="sm" asChild>
             <Link href={`${basePath}/read/${contentId}`}>
                 <BookOpen className="mr-2 h-4 w-4" /> Read Book
             </Link>
         </Button>
      </div>
    </Card>
  );
}
