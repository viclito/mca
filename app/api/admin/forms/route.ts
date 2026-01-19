import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";

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
    await dbConnect();
    const body = await req.json();
    const { title, description, fields, status, createdBy } = body;

    if (!title || !fields || !createdBy) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const form = await Form.create({
      title,
      description,
      fields,
      status: status || "draft",
      createdBy,
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, title, description, fields, status } = body;

    if (!id) return new NextResponse("ID required", { status: 400 });

    const form = await Form.findByIdAndUpdate(
      id,
      { title, description, fields, status },
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
