import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/db";
import Semester from "@/lib/models/Semester";
import Subject from "@/lib/models/Subject";
import Unit from "@/lib/models/Unit";

async function getSemesterData(semesterSlug: string) {
    await dbConnect();
    const semester = await Semester.findOne({ slug: semesterSlug });
    if (!semester) return null;

    const subjects = await Subject.find({ semesterId: semester._id }).sort({ name: 1 });
    
    // Fetch unit counts
    const subjectsWithCounts = await Promise.all(subjects.map(async (sub: any) => {
        const unitCount = await Unit.countDocuments({ subjectId: sub._id });
        return {
            ...sub.toObject(),
            unitCount
        }
    }));

    return { semester, subjects: subjectsWithCounts };
}

export default async function SemesterDetailsPage({
  params,
}: {
  params: Promise<{ course: string; semester: string }>;
}) {
  const { course, semester } = await params;
  const data = await getSemesterData(semester);

  if (!data) return notFound();

  const { semester: semesterData, subjects } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 border-b">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/${course}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {course}
          </Link>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold tracking-tight">{semesterData.name}</h1>
              <Badge variant="secondary" className="px-3 py-1 font-mono text-xs">
                 {subjects.length} Subjects
              </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((sub: any) => (
            <Link key={sub._id.toString()} href={`/${course}/${semester}/${sub.slug}`} className="block group">
              <Card className="h-full border-border/60 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base group-hover:text-primary transition-colors">
                    <span>{sub.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {sub.unitCount} Units
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
