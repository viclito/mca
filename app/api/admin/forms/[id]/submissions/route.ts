import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Submission from "@/lib/models/Submission";
import User from "@/lib/models/User";
import Form from "@/lib/models/Form";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15+ params handling
) {
  try {
    await dbConnect();
    const { id: formId } = await params;

    // 1. Fetch Form to ensure it exists
    const form = await Form.findById(formId);
    if (!form) return new NextResponse("Form not found", { status: 404 });

    // 2. Fetch all approved students
    const allStudents = await User.find({ role: "student", isApproved: true }).select("name email _id");

    // 3. Fetch all submissions for this form
    const submissions = await Submission.find({ formId }).populate("studentId", "name email");

    // 4. Identify missing students
    const submittedStudentIds = new Set(submissions.map((sub) => sub.studentId?._id.toString()));
    
    const missingStudents = allStudents.filter(
      (student) => !submittedStudentIds.has(student._id.toString())
    );

    return NextResponse.json({
      formTitle: form.title,
      submissions,
      missingStudents,
      totalStudents: allStudents.length,
      submittedCount: submissions.length,
      missingCount: missingStudents.length,
    });
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
