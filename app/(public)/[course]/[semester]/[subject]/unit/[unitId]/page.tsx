import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import dbConnect from "@/lib/db";
import Unit from "@/lib/models/Unit";
import Content from "@/lib/models/Content";
import { UnitContentClient } from "@/components/UnitContentClient";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-config";
import { generateBreadcrumbSchema, generateLearningResourceSchema } from "@/lib/structured-data";
import Subject from "@/lib/models/Subject";
import { Breadcrumbs } from "@/components/Breadcrumbs";

async function getUnitData(unitId: string) {
    await dbConnect();
    // Validate that unitId is a valid ObjectId (24 hex characters)
    if (!unitId.match(/^[0-9a-fA-F]{24}$/)) return null;

    const unit = await Unit.findById(unitId).populate({
        path: 'subjectId',
        populate: {
            path: 'semesterId',
            populate: { path: 'degreeId' }
        }
    }).lean();
    if (!unit) return null;

    const content = await Content.find({ unitId: unit._id }).sort({ createdAt: -1 }).lean();
    
    return { 
        unit: { ...unit, _id: unit._id.toString() }, 
        content: content.map((c: any) => ({ ...c, _id: c._id.toString(), unitId: c.unitId.toString() })) 
    };
}

export async function generateMetadata({ params }: { params: Promise<{ course: string; semester: string; subject: string; unitId: string }> }): Promise<Metadata> {
  const { course, semester, subject, unitId } = await params;
  const data = await getUnitData(unitId);

  if (!data) {
    return generatePageMetadata({
      title: "Unit Not Found",
      description: "The requested unit could not be found.",
      path: `/${course}/${semester}/${subject}/unit/${unitId}`,
      noIndex: true,
    });
  }

  const { unit } = data;
  const subjectName = typeof unit.subjectId === 'object' ? unit.subjectId.name : subject.toUpperCase();
  const degreeName = typeof unit.subjectId === 'object' && typeof unit.subjectId.semesterId === 'object' && typeof unit.subjectId.semesterId.degreeId === 'object' ? unit.subjectId.semesterId.degreeId.name : course.toUpperCase();

  return generatePageMetadata({
    title: `${unit.name} - ${subjectName} | ${degreeName}`,
    description: `Detailed study topics for ${unit.name} in ${subjectName} at CSI Institute of Technology. Access ${data.content.length} specialized topics, video lectures and PDF notes for ${degreeName} students.`,
    keywords: [
      unit.name,
      "MCA Thovalai",
      "CSIT Thovalai MCA",
      "Unit Wise Notes",
      "Topic Lectures",
      ...data.content.slice(0, 5).map((c: any) => c.title)
    ],
    path: `/${course}/${semester}/${subject}/unit/${unitId}`,
  });
}

export default async function UnitDetailsPage({
  params,
}: {
  params: Promise<{ course: string; semester: string; subject: string; unitId: string }>;
}) {
  const { course, semester, subject, unitId } = await params;
  const data = await getUnitData(unitId);

  if (!data) return notFound();

  const { unit, content } = data;

  const subjectName = typeof unit.subjectId === 'object' ? unit.subjectId.name : subject.toUpperCase();
  const semesterName = typeof unit.subjectId === 'object' && typeof unit.subjectId.semesterId === 'object' ? unit.subjectId.semesterId.name : semester.toUpperCase();
  const degreeName = typeof unit.subjectId === 'object' && typeof unit.subjectId.semesterId === 'object' && typeof unit.subjectId.semesterId.degreeId === 'object' ? unit.subjectId.semesterId.degreeId.name : course.toUpperCase();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: degreeName, url: `/${course}` },
    { name: semesterName, url: `/${course}/${semester}` },
    { name: subjectName, url: `/${course}/${semester}/${subject}` },
    { name: unit.name, url: `/${course}/${semester}/${subject}/unit/${unitId}` },
  ]);

  const learningResourceSchema = generateLearningResourceSchema({
    name: `${unit.name} - ${subjectName} | ${degreeName}`,
    description: `Detailed topics and resources for ${unit.name}.`,
    url: `/${course}/${semester}/${subject}/unit/${unitId}`,
  });

  const videos = content.filter((c: any) => c.type === "video");
  const pdfs = content.filter((c: any) => c.type === "pdf");

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
              { label: subjectName, href: `/${course}/${semester}/${subject}` },
              { label: unit.name, href: `/${course}/${semester}/${subject}/unit/${unitId}`, current: true }
            ]}
            className="mb-4"
          />
          <div className="flex flex-col gap-1">
             <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{unit.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <UnitContentClient 
          videos={videos}
          pdfs={pdfs}
          basePath={`/${course}/${semester}/${subject}`}
        />
      </div>
    </div>
    </>
  );
}
