"use client";

import { useState } from "react";
import { SearchInput } from "@/components/SearchInput";
import { GoogleDriveViewer } from "@/components/GoogleDriveViewer";
import { StudyMaterialCard } from "@/components/StudyMaterialCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video as VideoIcon, FileText } from "lucide-react";

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
  basePath: string;
}

export function UnitContentClient({ videos, pdfs, basePath }: UnitContentClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter content based on search query
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

  return (
    <div className="space-y-6">
      <SearchInput
        onSearch={setSearchQuery}
        placeholder="Search videos and study materials..."
        className="w-full md:w-96"
      />

      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="videos" className="gap-2">
            <VideoIcon className="h-4 w-4" /> Videos ({filteredVideos.length})
          </TabsTrigger>
          <TabsTrigger value="pdfs" className="gap-2">
            <FileText className="h-4 w-4" /> Study Material ({filteredPdfs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No videos found for "${searchQuery}"`
                  : "No videos available for this unit yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {filteredVideos.map((vid) => (
                <GoogleDriveViewer
                  key={vid._id}
                  url={vid.url}
                  type="video"
                  title={vid.title}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pdfs" className="space-y-6">
          {filteredPdfs.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No study materials found for "${searchQuery}"`
                  : "No study material available for this unit yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPdfs.map((pdf) => (
                <StudyMaterialCard
                  key={pdf._id}
                  title={pdf.title}
                  type="pdf"
                  url={pdf.url}
                  contentId={pdf._id}
                  basePath={basePath}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
