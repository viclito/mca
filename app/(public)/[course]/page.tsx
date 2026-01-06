import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Layers, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/db";
import Degree from "@/lib/models/Degree";
import Semester from "@/lib/models/Semester";
import Subject from "@/lib/models/Subject"; // Import for count

interface PageProps {
  params: Promise<{
    course: string;
  }>;
}

async function getCourseData(slug: string) {
    await dbConnect();
    const degree = await Degree.findOne({ slug });
    if (!degree) return null;
    
    // Fetch semesters with subject count if possible, or just fetch subjects separately
    const semesters = await Semester.find({ degreeId: degree._id }).sort({ name: 1 });
    
    // Populate counts manually or using aggregate
    // For simplicity, let's Map over semesters and find subjects count
    const semestersWithCounts = await Promise.all(semesters.map(async (sem: any) => {
        const subjectCount = await Subject.countDocuments({ semesterId: sem._id });
        return {
            ...sem.toObject(),
            subjectCount
        }
    }));

    return { degree, semesters: semestersWithCounts };
}

export default async function SemesterPage({ params }: PageProps) {
  const { course } = await params;
  const data = await getCourseData(course);

  if (!data) {
    return notFound();
  }

  const { degree, semesters } = data;

  return (
    <div className="flex flex-col min-h-screen bg-background">
       {/* Sticky Header */}
       <div className="px-6 py-6 border-b bg-background sticky top-14 md:top-0 z-20">
         <div className="max-w-5xl mx-auto w-full">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Back to Home
            </Link>
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary w-fit">
                  <GraduationCap className="h-3 w-3" />
                  <span>Masters Program</span>
               </div>
               <h1 className="text-3xl font-bold tracking-tight">{degree.name}</h1>
               <p className="text-sm text-muted-foreground max-w-2xl">
                 Select your current semester to access tailored study materials and resources.
               </p>
            </div>
         </div>
       </div>

      {/* Content Area */}
      <div className="flex-1 bg-muted/20 px-6 py-8">
         <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {semesters.map((sem: any) => {
                  // Extract semester number from name (e.g., "Semester 2" -> "2")
                  const semesterNumber = sem.name.match(/\d+/)?.[0] || sem.slug.match(/\d+/)?.[0] || "1";
                  
                  return (
                    <Link key={sem._id.toString()} href={`/${course}/${sem.slug}`} className="block group">
                        <Card className="h-full border-border/60 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Layers className="h-16 w-16 -mr-4 -mt-4 text-primary" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <Badge variant="outline" className="font-mono text-xs border-primary/10 text-primary/80 bg-primary/5">
                                  SEMESTER {semesterNumber}
                               </Badge>
                            </CardHeader>
                            <CardContent className="pt-3">
                                 <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors mb-1">{sem.name}</CardTitle>
                                 <CardDescription className="text-sm mb-4">Explore subjects and resources for this semester.</CardDescription>
                                 <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="px-3 py-1 bg-secondary/50 font-normal group-hover:bg-secondary transition-colors">
                                        <BookOpen className="mr-1.5 h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                        {sem.subjectCount} Subjects
                                    </Badge>
                                 </div>
                            </CardContent>
                        </Card>
                    </Link>
                  );
                })}
            </div>
         </div>
      </div>
    </div>
  );
}
