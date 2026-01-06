"use client";

import { Subject } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Video } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/SearchInput";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SubjectListClientProps {
  courseId: string;
  semesterId: string;
  subjects: Subject[];
}

export function SubjectListClient({ courseId, semesterId, subjects }: SubjectListClientProps) {
  const [filteredSubjects, setFilteredSubjects] = useState(subjects);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredSubjects(subjects);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.code.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery)
    );
    setFilteredSubjects(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center md:justify-start">
        <SearchInput onSearch={handleSearch} placeholder="Search subjects..." className="w-full md:w-96" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <AnimatePresence>
          {filteredSubjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/${courseId}/${semesterId}/${subject.id}`} className="block group h-full">
                <Card className="h-full border-border/60 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase">
                        {subject.code}
                      </p>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {subject.name}
                      </CardTitle>
                    </div>
                    <div className="h-10 w-10 text-muted-foreground/20 group-hover:text-primary/80 transition-colors">
                      <BookOpen className="h-full w-full" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-6 line-clamp-2 leading-relaxed">
                      {subject.description}
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="px-3 py-1 bg-secondary/50 font-normal hover:bg-secondary transition-colors"
                      >
                        <BookOpen className="mr-1.5 h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                        {subject.contents.filter((c) => c.type === "note").length} Notes
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="px-3 py-1 bg-secondary/50 font-normal hover:bg-secondary transition-colors"
                      >
                        <Video className="mr-1.5 h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                        {subject.contents.filter((c) => c.type === "video").length} Videos
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredSubjects.length === 0 && (
         <div className="text-center py-12 text-muted-foreground">
             No subjects found.
         </div>
      )}
    </div>
  );
}
