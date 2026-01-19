import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Submission from "@/lib/models/Submission";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { formId, studentId, responses } = body;

    if (!formId || !studentId || !responses) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check for existing submission
    const existingSubmission = await Submission.findOne({ formId, studentId });
    if (existingSubmission) {
      return new NextResponse("You have already submitted this form.", { status: 409 });
    }

    // Fetch user to get name (snapshotting the name at time of submission)
    const user = await User.findById(studentId);
    if (!user) return new NextResponse("User not found", { status: 404 });

    const submission = await Submission.create({
      formId,
      studentId,
      studentName: user.name,
      responses,
    });

    return NextResponse.json(submission);
  } catch (error: any) {
    if (error.code === 11000) {
        return new NextResponse("You have already submitted this form.", { status: 409 });
    }
    console.error("Error submitting form:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
