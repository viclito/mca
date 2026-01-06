import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

interface GoogleDriveViewerProps {
  url: string;
  type: "video" | "pdf";
  title: string;
}

export function GoogleDriveViewer({ url, type, title }: GoogleDriveViewerProps) {
  const getEmbedUrl = (url: string) => {
    try {
       // Extract ID
       // Pattern 1: https://drive.google.com/file/d/VIDEO_ID/view?usp=sharing
       // Pattern 2: https://drive.google.com/open?id=VIDEO_ID
       let id = "";
       const parts = url.split("/");
       const dIndex = parts.indexOf("d");
       
       if (dIndex !== -1 && parts[dIndex + 1]) {
           id = parts[dIndex + 1];
       } else {
           const urlObj = new URL(url);
           id = urlObj.searchParams.get("id") || "";
       }

       if (!id) return url; // Fallback

       return `https://drive.google.com/file/d/${id}/preview`;
    } catch (e) {
        return url;
    }
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden border border-border/50 relative">
        <iframe
          src={embedUrl}
          className="w-full h-full absolute top-0 left-0"
          allow="autoplay"
          title={title}
        ></iframe>
      </div>
      <div className="flex items-center justify-between">
         <h3 className="font-medium truncate pr-4">{title}</h3>
         <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open
                </a>
            </Button>
         </div>
      </div>
    </div>
  );
}
