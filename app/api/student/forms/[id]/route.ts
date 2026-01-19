import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const form = await Form.findById(id).select("title description fields status");

    if (!form) {
      return new NextResponse("Form not found", { status: 404 });
    }

    if (form.status !== "active") {
        // Option: allow 'closed' to be viewed but not submitted? 
        // For now, let's allow fetching it, but frontend checks status or backend blocks submission.
        // Actually, returning it allows the UI to show "This form is closed".
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
