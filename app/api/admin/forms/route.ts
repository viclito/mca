import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";

import { auth } from "@/auth";

export async function GET() {
  try {
    await dbConnect();
    const forms = await Form.find({}).sort({ createdAt: -1 });
    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, description, fields, status, assignedStudents } = body;

    if (!title || !fields) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const form = await Form.create({
      title,
      description,
      fields,
      status: status || "draft",
      assignedStudents: assignedStudents || [],
      createdBy: session.user.id,
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, title, description, fields, status, assignedStudents } = body;

    if (!id) return new NextResponse("ID required", { status: 400 });

    const form = await Form.findByIdAndUpdate(
      id,
      { title, description, fields, status, assignedStudents },
      { new: true }
    );

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error updating form:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("ID required", { status: 400 });

    await Form.findByIdAndDelete(id);
    return NextResponse.json({ message: "Form deleted" });
  } catch (error) {
    console.error("Error deleting form:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
