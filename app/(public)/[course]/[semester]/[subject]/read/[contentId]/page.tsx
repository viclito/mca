import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import dbConnect from "@/lib/db";
import Content from "@/lib/models/Content";
import Unit from "@/lib/models/Unit";
import { BookViewer } from "@/components/BookViewer";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-config";
import { generateBreadcrumbSchema, generateLearningResourceSchema, generateVideoObjectSchema } from "@/lib/structured-data";
import Subject from "@/lib/models/Subject";
import Semester from "@/lib/models/Semester";
import Degree from "@/lib/models/Degree";

interface ReadPageProps {
  params: Promise<{
    course: string;
    semester: string;
    subject: string;
    contentId: string;
  }>;
}

// Function to convert Google Drive view link to download link
const getDownloadUrl = (viewUrl: string) => {
  if (viewUrl.includes('drive.google.com')) {
    const match = viewUrl.match(/\/d\/(.+?)\//) || viewUrl.match(/id=(.+?)(&|$)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return viewUrl;
};

async function getContent(contentId: string) {
    await dbConnect();
    if (!contentId.match(/^[0-9a-fA-F]{24}$/)) return null;
    const content = await Content.findById(contentId).populate({
        path: 'unitId',
        populate: {
            path: 'subjectId',
            populate: {
                path: 'semesterId',
                populate: { path: 'degreeId' }
            }
        }
    });
    if (!content) return null;
    return content;
}

export async function generateMetadata({ params }: ReadPageProps): Promise<Metadata> {
  const { course, semester, subject, contentId } = await params;
  const content = await getContent(contentId);

  if (!content) {
    return generatePageMetadata({
      title: "Content Not Found",
      description: "The requested content could not be found.",
      path: `/${course}/${semester}/${subject}/read/${contentId}`,
      noIndex: true,
    });
  }

  const subjectName = typeof content.unitId?.subjectId === 'object' ? content.unitId.subjectId.name : subject.toUpperCase();
  const degreeName = typeof content.unitId?.subjectId?.semesterId?.degreeId === 'object' ? content.unitId.subjectId.semesterId.degreeId.name : course.toUpperCase();

  return generatePageMetadata({
    title: `${content.title} - ${subjectName} Study Material`,
    description: `Read and study ${content.title} from ${subjectName} at CSI Institute of Technology, Thovalai. High-quality ${content.type} resource for ${degreeName} students.`,
    keywords: [
      content.title,
      "MCA Thovalai",
      "CSIT Thovalai MCA",
      "MCA HUB",
      "Study Materials",
      "Learning Resource"
    ],
    path: `/${course}/${semester}/${subject}/read/${contentId}`,
    image: content.type === 'video' ? `https://img.youtube.com/vi/${content.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg` : undefined
  });
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { course, semester, subject, contentId } = await params;
  const content = await getContent(contentId);

  if (!content) return notFound();

  const unitName = typeof content.unitId === 'object' ? content.unitId.name : "Unit";
  const subjectName = typeof content.unitId?.subjectId === 'object' ? content.unitId.subjectId.name : subject.toUpperCase();
  const semesterName = typeof content.unitId?.subjectId?.semesterId === 'object' ? content.unitId.subjectId.semesterId.name : semester.toUpperCase();
  const degreeName = typeof content.unitId?.subjectId?.semesterId?.degreeId === 'object' ? content.unitId.subjectId.semesterId.degreeId.name : course.toUpperCase();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: degreeName, url: `/${course}` },
    { name: semesterName, url: `/${course}/${semester}` },
    { name: subjectName, url: `/${course}/${semester}/${subject}` },
    { name: unitName, url: `/${course}/${semester}/${subject}/unit/${content.unitId?._id}` },
    { name: content.title, url: `/${course}/${semester}/${subject}/read/${contentId}` },
  ]);

  const learningResourceSchema = generateLearningResourceSchema({
    name: `${content.title} - ${subjectName} | ${degreeName}`,
    description: `Study material: ${content.title}. Type: ${content.type}.`,
    url: `/${course}/${semester}/${subject}/read/${contentId}`,
    learningResourceType: content.type === 'video' ? 'Video Lecture' : 'PDF Document'
  });

  let videoSchema = null;
  if (content.type === 'video' && content.url.includes('youtube.com')) {
      const videoId = content.url.split('v=')[1]?.split('&')[0];
      videoSchema = generateVideoObjectSchema({
          name: content.title,
          description: `Educational video lecture for ${subjectName}.`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          uploadDate: content.createdAt?.toISOString() || new Date().toISOString(),
          contentUrl: content.url,
      });
  }

  // Find the unit to generate back link correctly? 
  // We can just go back to subject page or try to link back to unit if we fetch it.
  // For simplicity, let's link back to unit if we can find it, otherwise subject.
  let backLink = `/${course}/${semester}/${subject}`;
  if (content.unitId) {
      backLink += `/unit/${content.unitId._id?.toString() || content.unitId.toString()}`;
  }

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
      {videoSchema && (
        <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{
             __html: JSON.stringify(videoSchema),
           }}
        />
      )}
    <div className="min-h-screen bg-background flex flex-col">
       {/* Minimal Reader Header */}
       <div className="h-14 border-b flex items-center px-4 justify-between bg-background sticky top-0 z-10">
          <Link href={backLink} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back
          </Link>
          <div className="font-semibold text-sm truncate max-w-[150px] md:max-w-md">
             {content.title}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild title="Download PDF">
               <a href={getDownloadUrl(content.url)} download target="_blank" rel="noopener noreferrer">
                 <Download className="h-4 w-4" />
               </a>
            </Button>
          </div>
       </div>

       <div className="flex-1 bg-zinc-100 dark:bg-zinc-950/50 p-4 md:p-8 flex items-center justify-center">
          <BookViewer url={content.url} />
       </div>
    </div>
    </>
  );
}
