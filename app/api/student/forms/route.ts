import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import Submission from "@/lib/models/Submission";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
         return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // 1. Fetch Active Forms
    const activeForms = await Form.find({ status: "active" }).select("title description createdAt status").sort({ createdAt: -1 });

    // 2. Fetch User's Submissions to check which are done
    const userSubmissions = await Submission.find({ studentId: session.user.id }).select("formId");
    const submittedFormIds = new Set(userSubmissions.map(s => s.formId.toString()));

    // 3. Merge data
    const formsWithStatus = activeForms.map(form => ({
        ...form.toObject(),
        submitted: submittedFormIds.has(form._id.toString())
    }));

    return NextResponse.json(formsWithStatus);
  } catch (error) {
    console.error("Error fetching student forms:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
