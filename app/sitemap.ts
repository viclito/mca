import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Degree from '@/lib/models/Degree';
import Semester from '@/lib/models/Semester';
import Subject from '@/lib/models/Subject';
import Unit from '@/lib/models/Unit';
import Content from '@/lib/models/Content';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://csi-mca.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await dbConnect();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];

    // Fetch all degrees with their nested data
    const degrees = await Degree.find({}).lean();
    const semesters = await Semester.find({}).populate('degreeId').lean();
    const subjects = await Subject.find({}).populate({
      path: 'semesterId',
      populate: { path: 'degreeId' }
    }).lean();
    const units = await Unit.find({}).populate({
      path: 'subjectId',
      populate: {
        path: 'semesterId',
        populate: { path: 'degreeId' }
      }
    }).lean();
    const content = await Content.find({}).populate({
      path: 'unitId',
      populate: {
        path: 'subjectId',
        populate: {
          path: 'semesterId',
          populate: { path: 'degreeId' }
        }
      }
    }).lean();

    // Generate degree pages
    const degreePages: MetadataRoute.Sitemap = degrees.map((degree: any) => ({
      url: `${baseUrl}/${degree.slug}`,
      lastModified: degree.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    // Generate semester pages
    const semesterPages: MetadataRoute.Sitemap = semesters
      .filter((sem: any) => sem.degreeId)
      .map((semester: any) => ({
        url: `${baseUrl}/${semester.degreeId.slug}/${semester.slug}`,
        lastModified: semester.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    // Generate subject pages
    const subjectPages: MetadataRoute.Sitemap = subjects
      .filter((sub: any) => sub.semesterId?.degreeId)
      .map((subject: any) => ({
        url: `${baseUrl}/${subject.semesterId.degreeId.slug}/${subject.semesterId.slug}/${subject.slug}`,
        lastModified: subject.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    // Generate unit pages
    const unitPages: MetadataRoute.Sitemap = units
      .filter((unit: any) => unit.subjectId?.semesterId?.degreeId)
      .map((unit: any) => ({
        url: `${baseUrl}/${unit.subjectId.semesterId.degreeId.slug}/${unit.subjectId.semesterId.slug}/${unit.subjectId.slug}/unit/${unit._id}`,
        lastModified: unit.updatedAt || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));

    // Generate content pages
    const contentPages: MetadataRoute.Sitemap = content
      .filter((c: any) => c.unitId?.subjectId?.semesterId?.degreeId)
      .map((cont: any) => ({
        url: `${baseUrl}/${cont.unitId.subjectId.semesterId.degreeId.slug}/${cont.unitId.subjectId.semesterId.slug}/${cont.unitId.subjectId.slug}/read/${cont._id}`,
        lastModified: cont.updatedAt || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }));

    return [
      ...staticPages,
      ...degreePages,
      ...semesterPages,
      ...subjectPages,
      ...unitPages,
      ...contentPages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least the static pages if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];
  }
}
