"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PDFBookInner = dynamic(() => import("./PDFBookInner").then(mod => mod.BookViewer), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing Reader...</p>
    </div>
  ),
});

interface BookViewerProps {
  url: string;
}

export function BookViewer(props: BookViewerProps) {
  return <PDFBookInner {...props} />;
}
