import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Layers, ChevronRight, FileText, Video as VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/db";
import Subject from "@/lib/models/Subject";
import Unit from "@/lib/models/Unit";
import Content from "@/lib/models/Content";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-config";
import { generateBreadcrumbSchema, generateLearningResourceSchema } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";

async function getSubjectData(subjectSlug: string) {
    await dbConnect();
    const subject = await Subject.findOne({ slug: subjectSlug }).populate({
        path: 'semesterId',
        populate: { path: 'degreeId' }
    });
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

export async function generateMetadata({ params }: { params: Promise<{ course: string; semester: string; subject: string }> }): Promise<Metadata> {
  const { course, semester, subject: subjectSlug } = await params;
  const data = await getSubjectData(subjectSlug);

  if (!data) {
    return generatePageMetadata({
      title: "Subject Not Found",
      description: "The requested subject could not be found.",
      path: `/${course}/${semester}/${subjectSlug}`,
      noIndex: true,
    });
  }

  const { subject } = data;
  const semesterName = typeof subject.semesterId === 'object' ? subject.semesterId.name : semester.toUpperCase();
  const degreeName = typeof subject.semesterId === 'object' && typeof subject.semesterId.degreeId === 'object' ? subject.semesterId.degreeId.name : course.toUpperCase();

  return generatePageMetadata({
    title: `${subject.name} - ${semesterName} | ${degreeName}`,
    description: `Comprehensive study material for ${subject.name}. Includes ${data.units.length} units with video lectures and PDF resources. Perfect for ${degreeName} students.`,
    keywords: [
      subject.name,
      semesterName,
      degreeName,
      "Study Units",
      "Video Lectures",
      "Course Notes",
      ...data.units.map((u: any) => u.name)
    ],
    path: `/${course}/${semester}/${subjectSlug}`,
  });
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
  const semesterName = typeof subject.semesterId === 'object' ? subject.semesterId.name : semester.toUpperCase();
  const degreeName = typeof subject.semesterId === 'object' && typeof subject.semesterId.degreeId === 'object' ? subject.semesterId.degreeId.name : course.toUpperCase();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: degreeName, url: `/${course}` },
    { name: semesterName, url: `/${course}/${semester}` },
    { name: subject.name, url: `/${course}/${semester}/${subjectSlug}` },
  ]);

  const learningResourceSchema = generateLearningResourceSchema({
    name: `${subject.name} - ${semesterName} | ${degreeName}`,
    description: `Comprehensive units and topics for ${subject.name}.`,
    url: `/${course}/${semester}/${subjectSlug}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(learningResourceSchema),
        }}
      />
    <div className="min-h-screen bg-background">
       {/* Header */}
      <div className="px-6 py-8 border-b bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <Breadcrumbs 
            items={[
              { label: degreeName, href: `/${course}` },
              { label: semesterName, href: `/${course}/${semester}` },
              { label: subject.name, href: `/${course}/${semester}/${subjectSlug}`, current: true }
            ]}
            className="mb-4"
          />
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
    </>
  );
}
