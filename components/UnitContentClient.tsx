"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/SearchInput";
import { StudyMaterialCard } from "@/components/StudyMaterialCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video as VideoIcon, FileText, ChevronRight, ExternalLink, StickyNote } from "lucide-react";

interface Content {
  _id: string;
  title: string;
  type: string;
  url: string;
  unitId: string;
}

interface UnitContentClientProps {
  videos: Content[];
  pdfs: Content[];
  notes: Content[];
  basePath: string;
}

export function UnitContentClient({ videos, pdfs, notes, basePath }: UnitContentClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVideos = searchQuery
    ? videos.filter((v) =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : videos;

  const filteredPdfs = searchQuery
    ? pdfs.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pdfs;

  const filteredNotes = searchQuery
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  const getThumbnailUrl = (url: string) => {
    // YouTube Regex
    const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs defaultValue="pdfs" className="w-full">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none gap-6">
            <TabsTrigger 
              value="pdfs" 
              className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3.5 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Study Material</span>
                <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                  {filteredPdfs.length}
                </span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3.5 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <VideoIcon className="h-4 w-4" />
                <span>Videos</span>
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  {filteredVideos.length}
                </span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3.5 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                <span>Notes</span>
                <span className="ml-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[11px] font-bold text-yellow-600">
                  {filteredNotes.length}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <SearchInput
              onSearch={setSearchQuery}
              placeholder="Search videos and study materials..."
              className="w-full md:w-96"
            />

            <TabsContent value="pdfs" className="mt-0 animate-in fade-in slide-in-from-bottom-3 duration-500 outline-none">
              {filteredPdfs.length === 0 ? (
                <div className="text-center py-16 border rounded-xl border-dashed bg-muted/5">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? `No study materials found for "${searchQuery}"`
                      : "No study material available for this unit yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-px overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm">
                  {filteredPdfs.map((pdf, idx) => (
                    <StudyMaterialCard
                      key={pdf._id}
                      title={pdf.title}
                      type="pdf"
                      url={pdf.url}
                      contentId={pdf._id}
                      basePath={basePath}
                      isLast={idx === filteredPdfs.length - 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="mt-0 animate-in fade-in slide-in-from-bottom-3 duration-500 outline-none">
              {filteredVideos.length === 0 ? (
                <div className="text-center py-16 border rounded-xl border-dashed bg-muted/5">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? `No videos found for "${searchQuery}"`
                      : "No videos available for this unit yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-px overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm">
                  {filteredVideos.map((vid, idx) => {
                    const thumbUrl = getThumbnailUrl(vid.url);
                    return (
                      <a 
                        key={vid._id} 
                        href={vid.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center justify-between p-3 sm:p-4 transition-all duration-200 hover:bg-primary/5 group",
                          idx !== filteredVideos.length - 1 && "border-b border-border/40"
                        )}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative h-14 w-24 sm:h-16 sm:w-28 shrink-0 overflow-hidden rounded-lg border border-border/50 shadow-sm transition-transform group-hover:scale-[1.02]">
                            {thumbUrl ? (
                              <img src={thumbUrl} alt={vid.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <VideoIcon className="h-6 w-6" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate pr-4">{vid.title}</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider font-bold">Video Lecture</p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all shrink-0" />
                      </a>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-0 animate-in fade-in slide-in-from-bottom-3 duration-500 outline-none">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-16 border rounded-xl border-dashed bg-muted/5">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? `No notes found for "${searchQuery}"`
                      : "No notes available for this unit yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-px overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm">
                  {filteredNotes.map((note, idx) => (
                    <StudyMaterialCard
                      key={note._id}
                      title={note.title}
                      type="note"
                      url={note.url}
                      contentId={note._id}
                      basePath={basePath}
                      isLast={idx === filteredNotes.length - 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
