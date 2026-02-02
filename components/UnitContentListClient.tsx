"use client";

import { Content } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlayCircle, Download, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/SearchInput";
import { useState } from "react";
import Link from "next/link";

interface UnitContentListClientProps {
  courseId: string;
  semesterId: string;
  subjectId: string;
  unitContents: Content[];
}

export function UnitContentListClient({
  courseId,
  semesterId,
  subjectId,
  unitContents,
}: UnitContentListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContents = unitContents.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const notes = filteredContents.filter((c) => c.type === "note");
  const videos = filteredContents.filter((c) => c.type === "video");

  return (
    <div className="space-y-12">
      <div className="flex justify-center md:justify-start">
        <SearchInput
          onSearch={setSearchQuery}
          placeholder="Search in this unit..."
          className="w-full md:w-96"
        />
      </div>

      {/* Notes Section */}
      <section id="notes" className="scroll-mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              Study Notes
            </h2>
          </div>
        </div>

        {notes.length === 0 && (
           <div className="py-12 text-center rounded-3xl border-2 border-dashed bg-muted/10">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No notes found.</p>
           </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map(note => (
                <NoteCard key={note.id} note={note} courseId={courseId} semesterId={semesterId} subjectId={subjectId} />
            ))}
        </div>
      </section>

      {/* Video Section */}
      <section id="videos" className="scroll-mt-20 pt-8 border-t border-border/40">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <PlayCircle className="h-5 w-5 text-foreground" />
                    </div>
                    Video Lectures
                </h2>
            </div>
        </div>
        
        {videos.length === 0 && (
             <div className="py-12 text-center rounded-3xl border-2 border-dashed bg-muted/10">
                 <PlayCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                 <p className="text-muted-foreground font-medium">No videos found.</p>
             </div>
        )}

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map(video => (
                 <VideoCard key={video.id} video={video} />
            ))}
         </div>
      </section>
    </div>
  );
}

function NoteCard({ note, courseId, semesterId, subjectId }: { note: Content, courseId: string, semesterId: string, subjectId: string }) {
    return (
        <Card className="group flex flex-col h-full border-border/60 bg-background/80 hover:bg-background transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
            <CardHeader className="pb-3 flex-1">
                <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <FileText className="h-5 w-5" />
                        </div>
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {note.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="mt-auto">
                <CardDescription className="mb-6 line-clamp-2 text-sm leading-relaxed">{note.description}</CardDescription>
                <div className="flex items-center gap-2">
                    <a href={note.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full gap-2 group-hover:!bg-zinc-900 group-hover:!text-white dark:group-hover:!bg-zinc-100 dark:group-hover:!text-zinc-900 transition-all duration-300 shadow-sm" variant="secondary">
                            Read Now
                        </Button>
                    </a>
                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 bg-background hover:bg-zinc-100 hover:text-zinc-900 border-border/60 transition-colors" title="Download PDF">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function VideoCard({ video }: { video: Content }) {
    return (
        <Card className="group overflow-hidden border-border/60 bg-background/80 hover:bg-background transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
            <div className="aspect-video bg-muted relative block overflow-hidden">
                {/* Placeholder for thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/30 shadow-xl">
                        <PlayCircle className="h-6 w-6 text-white fill-white" />
                    </div>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs font-bold rounded flex items-center gap-1 backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    15:00
                </div>
            </div>
            <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-1">{video.title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
                <CardDescription className="mb-4 line-clamp-2 text-xs">{video.description}</CardDescription>
                <Button className="w-full text-sm h-9" variant="outline">Watch Lecture</Button>
            </CardContent>
        </Card>
    )
}
