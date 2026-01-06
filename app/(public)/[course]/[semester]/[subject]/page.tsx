import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Layers, ChevronRight, FileText, Video as VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/db";
import Subject from "@/lib/models/Subject";
import Unit from "@/lib/models/Unit";
import Content from "@/lib/models/Content";

async function getSubjectData(subjectSlug: string) {
    await dbConnect();
    const subject = await Subject.findOne({ slug: subjectSlug });
    if (!subject) return null;

    const units = await Unit.find({ subjectId: subject._id }).sort({ name: 1 });
    
    // Fetch content counts per unit
    const unitsWithCounts = await Promise.all(units.map(async (unit: any) => {
        const videoCount = await Content.countDocuments({ unitId: unit._id, type: "video" });
        const pdfCount = await Content.countDocuments({ unitId: unit._id, type: "pdf" });
        return {
            ...unit.toObject(),
            videoCount,
            pdfCount
        }
    }));

    return { subject, units: unitsWithCounts };
}

export default async function SubjectDetailsPage({
  params,
}: {
  params: Promise<{ course: string; semester: string; subject: string }>;
}) {
  const { course, semester, subject: subjectSlug } = await params;
  const data = await getSubjectData(subjectSlug);

  if (!data) return notFound();

  const { subject, units } = data;

  return (
    <div className="min-h-screen bg-background">
       {/* Header */}
      <div className="px-6 py-8 border-b bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/${course}/${semester}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {semester}
          </Link>
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2">
                 <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
             </div>
             <p className="text-muted-foreground">Select a unit to view topics and resources.</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {units.map((unit: any) => (
            <Link key={unit._id.toString()} href={`/${course}/${semester}/${subjectSlug}/unit/${unit._id.toString()}`} className="block group">
              <Card className="h-full border-border/60 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                    <Layers className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <span>{unit.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <VideoIcon className="h-4 w-4" /> {unit.videoCount} Videos
                    </div>
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" /> {unit.pdfCount} Notes
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
