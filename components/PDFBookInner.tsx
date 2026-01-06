"use client";

import React, { useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Minimize, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

// Setup PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookViewerProps {
  url: string;
}

export function BookViewer({ url }: BookViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [width, setWidth] = useState(400);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Use proxy to avoid CORS
  const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Responsive width logic
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
           // Firefox implements `contentBoxSize` as a single content rect, rather than an array
           const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
           setContainerWidth(contentBoxSize.inlineSize);
        } else {
           setContainerWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (containerWidth) {
        // Calculate page width (half of container for 2-page view)
        // Ensure max width constraint
        const newWidth = Math.min(500, (containerWidth - 40) / 2); // 40px padding
        setWidth(newWidth > 300 ? newWidth : 300); // Min width
    }
  }, [containerWidth]);

/* Responsive width logic uses ResizeObserver, effectively handling fullscreen resize */
  return (
    <div 
      className={cn(
        "flex flex-col items-center transition-all duration-300 relative", 
        isFullscreen 
          ? "fixed inset-0 z-50 h-screen w-screen bg-background overflow-hidden p-0 justify-center" 
          : "w-full min-h-[600px] bg-zinc-900/5 dark:bg-zinc-900/50 rounded-xl p-4 md:p-8"
      )} 
      ref={containerRef}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-[60] bg-background/50 backdrop-blur-sm hover:bg-background/80"
        onClick={() => setIsFullscreen(!isFullscreen)}
      >
        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
      </Button>
      <Document
        file={proxyUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Loading Book...</p>
          </div>
        }
        error={
            <div className="text-red-500 p-8 text-center bg-red-50 rounded-lg">
                <p>Failed to load PDF. Security restrictions may be blocking this file.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.open(url, '_blank')}>
                    Open in Drive
                </Button>
            </div>
        }
        className="flex justify-center"
      >
        {/* @ts-ignore - Types for react-pageflip can be tricky with children */}
        <HTMLFlipBook 
            width={width} 
            height={width * 1.41} // A4 aspect ratio approx
            size="stretch"
            minWidth={300}
            maxWidth={500}
            minHeight={400}
            maxHeight={700}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            className="shadow-2xl"
        >
             {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="bg-white shadow-sm overflow-hidden border-r border-gray-100">
                    <Page 
                        pageNumber={index + 1} 
                        width={width} 
                        renderAnnotationLayer={false} 
                        renderTextLayer={false}
                        loading={
                            <div className="flex items-center justify-center h-full w-full bg-white">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        }
                    />
                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
                        {index + 1}
                    </div>
                </div>
             ))}
        </HTMLFlipBook>
      </Document>
      
      {numPages > 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
             Use arrow keys or click corners to flip • {numPages} Pages
          </p>
      )}
    </div>
  );
}
