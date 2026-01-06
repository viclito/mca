"use server";

import dbConnect from "@/lib/db";
import Degree from "@/lib/models/Degree";
import Semester from "@/lib/models/Semester";
import Subject from "@/lib/models/Subject";
import Unit from "@/lib/models/Unit";

export async function getNavigationData() {
  await dbConnect();

  // Fetch all degrees (assuming one major course for now, but scalable)
  const degrees = await Degree.find({}).lean();

  const navigationData = await Promise.all(
    degrees.map(async (degree) => {
      // Fetch semesters for this degree
      const semesters = await Semester.find({ degreeId: degree._id })
        .sort({ name: 1 })
        .lean();

      // For each semester, fetch subjects
      const semestersWithSubjects = await Promise.all(
        semesters.map(async (semester) => {
          const subjects = await Subject.find({ semesterId: semester._id })
            .sort({ name: 1 })
            .lean();

          // For each subject, fetch units
          const subjectsWithUnits = await Promise.all(
            subjects.map(async (subject) => {
              const units = await Unit.find({ subjectId: subject._id })
                .sort({ name: 1 }) // Or safe sort
                .lean();
              
              return {
                id: subject._id.toString(),
                name: subject.name,
                slug: subject.slug,
                units: units.map(u => ({ 
                    id: u._id.toString(),
                    name: u.name,
                    slug: u.slug
                })),
              };
            })
          );

          return {
            id: semester._id.toString(),
            name: semester.name,
            slug: semester.slug,
            subjects: subjectsWithUnits,
          };
        })
      );

      return {
        id: degree._id.toString(),
        name: degree.name,
        slug: degree.slug,
        semesters: semestersWithSubjects,
      };
    })
  );

  return JSON.parse(JSON.stringify(navigationData)); // Final safety net for serialization
}
