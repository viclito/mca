import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Layers, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dbConnect from "@/lib/db";
import Degree from "@/lib/models/Degree";
import Semester from "@/lib/models/Semester";
import Subject from "@/lib/models/Subject"; // Import for count
import { Metadata } from "next";
import { generatePageMetadata, siteConfig } from "@/lib/seo-config";
import { generateCourseSchema, generateBreadcrumbSchema } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { course } = await params;
  const data = await getCourseData(course);

  if (!data) {
    return generatePageMetadata({
      title: "Course Not Found",
      description: "The requested course could not be found.",
      path: `/${course}`,
      noIndex: true,
    });
  }

  const { degree, semesters } = data;

  return generatePageMetadata({
    title: `${degree.name} - Course Curriculum`,
    description: `Explore the complete curriculum for ${degree.name}. Access ${semesters.length} semesters of comprehensive study materials, resources, and educational content.`,
    keywords: [
      degree.name,
      "MCA Course",
      "Curriculum",
      "Semesters",
      "Study Materials",
      "Computer Applications"
    ],
    path: `/${course}`,
  });
}

export default async function SemesterPage({ params }: PageProps) {
  const { course } = await params;
  const data = await getCourseData(course);

  if (!data) {
    return notFound();
  }

  const { degree, semesters } = data;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: degree.name, url: `/${course}` },
  ]);

  const courseSchema = generateCourseSchema({
    name: degree.name,
    description: `Complete ${degree.name} curriculum with ${semesters.length} semesters of study materials.`,
    url: `/${course}`,
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
          __html: JSON.stringify(courseSchema),
        }}
      />
    <div className="min-h-screen bg-[#F4F7FB] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar with Breadcrumbs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Breadcrumbs 
              items={[
                { label: degree.name, href: `/${course}`, current: true }
              ]} 
              className="mb-2"
            />
            <h1 className="text-2xl font-bold text-slate-900">{degree.name}</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Masters Program</span>
          </div>
        </div>

        {/* Adaptive Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Column: Semesters */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-800">Academic Semesters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {semesters.map((sem: any) => {
                const semesterNumber = sem.name.match(/\d+/)?.[0] || sem.slug.match(/\d+/)?.[0] || "1";
                
                return (
                  <Link key={sem._id.toString()} href={`/${course}/${sem.slug}`} className="block group h-full">
                    <Card className="h-full border border-slate-200 shadow-none hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden flex flex-col">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="p-2.5 rounded-lg bg-primary/5 group-hover:bg-primary transition-colors">
                            <Layers className="h-5 w-5 text-primary group-hover:text-white" />
                          </div>
                          <Badge className="bg-slate-50 text-slate-500 border-slate-200 flex items-center gap-1 font-bold text-[10px] uppercase shadow-none">
                            Semester {semesterNumber}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">
                          {sem.name}
                        </CardTitle>
                        <CardDescription className="text-sm mt-2 text-slate-500 font-medium leading-relaxed">
                          Comprehensive study materials and core subjects for this term.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 flex-1">
                        <div className="pt-4 border-t border-slate-50 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold text-slate-700">{sem.subjectCount} Subjects</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-0">
                         <div className="w-full bg-slate-50 p-3 text-center border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">Explore Curriculum</span>
                         </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  The {degree.name} program is designed to provide advanced knowledge and practical training in modern computing concepts and applications.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Duration</span>
                    <span className="text-sm font-bold text-slate-700">2 Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Total Semesters</span>
                    <span className="text-sm font-bold text-slate-700">{semesters.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg p-6 text-white overflow-hidden relative group">
              <div className="relative z-10 space-y-3">
                <h4 className="font-bold text-lg leading-tight">Academic Support</h4>
                <p className="text-white/80 text-xs font-medium leading-relaxed">
                  Access the complete academic calendar and department guidelines for this academic session.
                </p>
                <Button variant="secondary" size="sm" className="w-full font-bold bg-white text-primary border-none hover:bg-slate-100 mt-2">
                  Download Prospectus
                </Button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-24 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
