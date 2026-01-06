"use client";

import { Content, Subject } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlayCircle, Download, Clock, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/SearchInput";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SubjectContentListClientProps {
  courseId: string;
  semesterId: string;
  subjectId: string;
  subject: Subject;
}

export function SubjectContentListClient({
  courseId,
  semesterId,
  subjectId,
  subject,
}: SubjectContentListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const allContents = subject.contents;

  // Helper to extract unique units
  const getUnits = () => {
    const units = new Set<number>();
    let hasGeneral = false;
    allContents.forEach(c => {
        if (c.unit) units.add(c.unit);
        else hasGeneral = true;
    });
    return {
        units: Array.from(units).sort((a, b) => a - b),
        hasGeneral
    };
  };

  const { units, hasGeneral } = getUnits();

  // Filter for deep search
  const filteredContents = searchQuery ? allContents.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const isSearching = searchQuery.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
           <SearchInput
            onSearch={setSearchQuery}
            placeholder="Search all notes and videos..."
            className="w-full md:w-96 mx-auto md:mx-0"
           />
           {isSearching && (
               <p className="text-sm text-muted-foreground ml-1">
                   Found {filteredContents.length} results
               </p>
           )}
      </div>

      {!isSearching ? (
        /* Unit Grid View */
        <div className="grid gap-6 md:grid-cols-2">
            {units.map((unit) => {
                const unitContents = allContents.filter(c => c.unit === unit);
                const noteCount = unitContents.filter(c => c.type === 'note').length;
                const videoCount = unitContents.filter(c => c.type === 'video').length;

                return (
                    <Link key={unit} href={`/${courseId}/${semesterId}/${subjectId}/unit/${unit}`} className="block group">
                        <Card className="h-full border-border/60 bg-gradient-to-br from-background/50 to-muted/20 hover:bg-background transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                                </div>
                                <CardTitle className="text-2xl mb-1">Unit {unit}</CardTitle>
                                <CardDescription>
                                    Contains {unitContents.length} resources
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <div className="flex items-center gap-3">
                                     {noteCount > 0 && (
                                         <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                                             <FileText className="mr-1.5 h-3 w-3" />
                                             {noteCount} Notes
                                         </Badge>
                                     )}
                                     {videoCount > 0 && (
                                         <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                                             <PlayCircle className="mr-1.5 h-3 w-3" />
                                             {videoCount} Videos
                                         </Badge>
                                     )}
                                 </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}

            {hasGeneral && (
                 <Link href={`/${courseId}/${semesterId}/${subjectId}/unit/general`} className="block group">
                     <Card className="h-full border-dashed border-border hover:border-solid hover:border-border/60 bg-muted/5 hover:bg-background transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-foreground transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                                </div>
                                <CardTitle className="text-2xl mb-1">General Resources</CardTitle>
                                <CardDescription>
                                    Additional learning materials
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                     <Badge variant="outline" className="bg-transparent">
                                         Miscellaneous
                                     </Badge>
                                </div>
                            </CardContent>
                     </Card>
                 </Link>
            )}

            {units.length === 0 && !hasGeneral && (
                <div className="col-span-full py-16 text-center rounded-3xl border-2 border-dashed bg-muted/10">
                     <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                     <p className="text-muted-foreground font-medium">No units found for this subject.</p>
                </div>
            )}
        </div>
      ) : (
        /* Search Results View */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {filteredContents.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     {filteredContents.map(content => (
                         content.type === 'note' ? (
                             <NoteCard key={content.id} note={content} courseId={courseId} semesterId={semesterId} subjectId={subjectId} />
                         ) : (
                             <VideoCard key={content.id} video={content} />
                         )
                     ))}
                 </div>
             ) : (
                 <div className="py-16 text-center">
                     <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                 </div>
             )}
        </div>
      )}
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
                    <Link href={`/${courseId}/${semesterId}/${subjectId}/read/${note.id}`} className="flex-1">
                        <Button className="w-full gap-2 group-hover:!bg-zinc-900 group-hover:!text-white dark:group-hover:!bg-zinc-100 dark:group-hover:!text-zinc-900 transition-all duration-300 shadow-sm" variant="secondary">
                            Read Now
                        </Button>
                    </Link>
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
