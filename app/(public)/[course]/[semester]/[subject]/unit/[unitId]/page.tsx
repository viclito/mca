import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import dbConnect from "@/lib/db";
import Unit from "@/lib/models/Unit";
import Content from "@/lib/models/Content";
import { UnitContentClient } from "@/components/UnitContentClient";

async function getUnitData(unitId: string) {
    await dbConnect();
    // Validate that unitId is a valid ObjectId (24 hex characters)
    if (!unitId.match(/^[0-9a-fA-F]{24}$/)) return null;

    const unit = await Unit.findById(unitId).lean();
    if (!unit) return null;

    const content = await Content.find({ unitId: unit._id }).sort({ createdAt: -1 }).lean();
    
    return { 
        unit: { ...unit, _id: unit._id.toString() }, 
        content: content.map((c: any) => ({ ...c, _id: c._id.toString(), unitId: c.unitId.toString() })) 
    };
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

  const videos = content.filter((c: any) => c.type === "video");
  const pdfs = content.filter((c: any) => c.type === "pdf");

  return (
    <div className="min-h-screen bg-background">
       {/* Header */}
      <div className="px-6 py-8 border-b bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/${course}/${semester}/${subject}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {subject}
          </Link>
          <div className="flex flex-col gap-2">
             <h1 className="text-3xl font-bold tracking-tight">{unit.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <UnitContentClient 
          videos={videos}
          pdfs={pdfs}
          basePath={`/${course}/${semester}/${subject}`}
        />
      </div>
    </div>
  );
}
