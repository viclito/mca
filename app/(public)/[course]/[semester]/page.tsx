import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dbConnect from "@/lib/db";
import Semester from "@/lib/models/Semester";
import Subject from "@/lib/models/Subject";
import Unit from "@/lib/models/Unit";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-config";
import { generateBreadcrumbSchema, generateCourseSchema } from "@/lib/structured-data";
import Degree from "@/lib/models/Degree";
import { Breadcrumbs } from "@/components/Breadcrumbs";

async function getSemesterData(semesterSlug: string) {
    await dbConnect();
    const semester = await Semester.findOne({ slug: semesterSlug }).populate('degreeId');
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

export async function generateMetadata({ params }: { params: Promise<{ course: string; semester: string }> }): Promise<Metadata> {
  const { course, semester } = await params;
  const data = await getSemesterData(semester);

  if (!data) {
    return generatePageMetadata({
      title: "Semester Not Found",
      description: "The requested semester could not be found.",
      path: `/${course}/${semester}`,
      noIndex: true,
    });
  }

  const { semester: semesterData } = data;
  const degreeName = typeof semesterData.degreeId === 'object' ? semesterData.degreeId.name : course.toUpperCase();

  return generatePageMetadata({
    title: `${semesterData.name} - ${degreeName} | Study Materials`,
    description: `Access comprehensive study materials, notes, and resources for ${semesterData.name} of ${degreeName} at CSI Institute of Technology. Including subjects like ${data.subjects.slice(0, 3).map((s: any) => s.name).join(', ')}.`,
    keywords: [
      semesterData.name,
      degreeName,
      "MCA Thovalai",
      "CSIT Thovalai MCA",
      "Semester Notes",
      "Study Materials",
      ...data.subjects.slice(0, 5).map((s: any) => s.name)
    ],
    path: `/${course}/${semester}`,
  });
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
  const degreeName = typeof semesterData.degreeId === 'object' ? semesterData.degreeId.name : course.toUpperCase();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: degreeName, url: `/${course}` },
    { name: semesterData.name, url: `/${course}/${semester}` },
  ]);

  const courseSchema = generateCourseSchema({
    name: `${semesterData.name} - ${degreeName}`,
    description: `Detailed study materials and resources for ${semesterData.name} of ${degreeName}.`,
    url: `/${course}/${semester}`,
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
                { label: degreeName, href: `/${course}` },
                { label: semesterData.name, href: `/${course}/${semester}`, current: true }
              ]}
              className="mb-2"
            />
            <h1 className="text-2xl font-bold text-slate-900">{semesterData.name} Overview</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>{subjects.length} Core Subjects</span>
          </div>
        </div>

        {/* Adaptive Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Column: Subjects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-800">Available Subjects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((sub: any) => (
                <Link key={sub._id.toString()} href={`/${course}/${semester}/${sub.slug}`} className="block group h-full">
                  <Card className="h-full border border-slate-200 shadow-none hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden flex flex-col">
                    <CardHeader className="p-6 pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="p-2.5 rounded-lg bg-primary/5 group-hover:bg-primary transition-colors">
                          <BookOpen className="h-5 w-5 text-primary group-hover:text-white" />
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors mt-1" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">
                        {sub.name}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 text-slate-500 font-medium leading-relaxed">
                        Access all units, notes, and reference materials for this subject.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1">
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-xs font-bold text-slate-700">{sub.unitCount} Study Units</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-0">
                       <div className="w-full bg-slate-50 p-3 text-center border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">View Materials</span>
                       </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Semester Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  This semester focuses on advanced subject matters and specialized topics within the {course.toUpperCase()} curriculum.
                </p>
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Academic Year</span>
                    <span className="text-xs font-bold text-slate-700">2025-26</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Evaluation Type</span>
                    <span className="text-xs font-bold text-slate-700">Semester Pattern</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-[#1e293b] text-white">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 bg-white/10 rounded-xl w-fit">
                   <ChevronRight className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg leading-tight">Exam Schedule</h4>
                  <p className="text-white/70 text-xs font-medium leading-relaxed">
                    Check the latest examination portal updates for this semester's finals and internals.
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="w-full font-bold bg-white/10 hover:bg-white/20 text-white border-none mt-2">
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
