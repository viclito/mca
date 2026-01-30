import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Layers, ChevronRight, FileText, Video as VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/db";
import Subject from "@/lib/models/Subject";
import Unit from "@/lib/models/Unit";
import Content from "@/lib/models/Content";
import Book from "@/lib/models/Book";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-config";
import { generateBreadcrumbSchema, generateLearningResourceSchema } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Library, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

    const books = await Book.find({ subjectId: subject._id }).sort({ createdAt: -1 });

    return { subject, units: unitsWithCounts, books };
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

  const { subject, units, books } = data;
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
      <div className="px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs 
            items={[
              { label: degreeName, href: `/${course}` },
              { label: semesterName, href: `/${course}/${semester}` },
              { label: subject.name, href: `/${course}/${semester}/${subjectSlug}`, current: true }
            ]}
            className="mb-4"
          />
          <div className="flex flex-col gap-1">
             <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{subject.name}</h1>
             <p className="text-muted-foreground">Select a unit to view topics and resources.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="units" className="w-full space-y-6">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none gap-4">
            <TabsTrigger 
              value="units" 
              className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Core Units</span>
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  {units.length}
                </span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="books" 
              className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none disabled:opacity-50"
              disabled={!books || books.length === 0}
            >
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                <span>Reference Books</span>
                {books && books.length > 0 && (
                  <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                    {books.length}
                  </span>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="units" className="mt-4 animate-in fade-in slide-in-from-bottom-3 duration-500 outline-none">
            <div className="space-y-px overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
              {units.map((unit: any, idx: number) => (
                <Link 
                  key={unit._id.toString()} 
                  href={`/${course}/${semester}/${subjectSlug}/unit/${unit._id.toString()}`}
                  className={cn(
                    "flex items-center justify-between p-4 transition-all duration-200 hover:bg-muted/50 group",
                    idx !== units.length - 1 && "border-b border-border/40"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{unit.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                          <VideoIcon className="h-3 w-3" /> {unit.videoCount} Videos
                        </span>
                        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                          <FileText className="h-3 w-3" /> {unit.pdfCount} Notes
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </TabsContent>

          {books && books.length > 0 && (
            <TabsContent value="books" className="mt-4 animate-in fade-in slide-in-from-bottom-3 duration-500 outline-none">
              <div className="space-y-px overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm">
                {books.map((book: any, idx: number) => (
                  <a 
                    key={book._id.toString()} 
                    href={book.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-between p-4 transition-all duration-200 hover:bg-emerald-500/5 group",
                      idx !== books.length - 1 && "border-b border-border/40"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/5 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Library className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-emerald-700 transition-colors">{book.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase tracking-wider border-emerald-200 text-emerald-700 bg-emerald-50/50">
                            PDF Book
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-emerald-500 transition-all" />
                  </a>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
    </>
  );
}
