import { NextResponse } from "next/server";
import Semester from "@/lib/models/Semester";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import slugify from "slugify";
import Degree from "@/lib/models/Degree";

// Ensure all models are loaded for populate to work
const models = { Degree, Semester };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const degreeId = searchParams.get("degreeId");

    await dbConnect();
    
    const query = degreeId ? { degreeId } : {};
    const semesters = await Semester.find(query).populate("degreeId").sort({ name: 1 });
    return NextResponse.json(semesters);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, degreeId } = await req.json();
    if (!name || !degreeId) {
      return NextResponse.json({ message: "Name and Degree are required" }, { status: 400 });
    }

    await dbConnect();

    const slug = slugify(name, { lower: true, strict: true });
    
    // Check duplication in same degree?
    const existing = await Semester.findOne({ slug, degreeId });
    if (existing) {
        return NextResponse.json({ message: "Semester already exists in this degree" }, { status: 400 });
    }

    const semester = await Semester.create({
      name,
      slug,
      degreeId
    });

    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    await dbConnect();
    await Semester.findByIdAndDelete(id);

    return NextResponse.json({ message: "Semester deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, name, degreeId } = await req.json();
    if (!id || !name || !degreeId) {
      return NextResponse.json({ message: "ID, Name and Degree are required" }, { status: 400 });
    }

    await dbConnect();

    const slug = slugify(name, { lower: true, strict: true });
    
    // Check duplication in same degree (excluding current id)
    const existing = await Semester.findOne({ slug, degreeId, _id: { $ne: id } });
    if (existing) {
        return NextResponse.json({ message: "Semester already exists in this degree" }, { status: 400 });
    }

    const semester = await Semester.findByIdAndUpdate(
      id,
      { name, slug, degreeId },
      { new: true }
    ).populate("degreeId");

    if (!semester) {
      return NextResponse.json({ message: "Semester not found" }, { status: 404 });
    }

    return NextResponse.json(semester);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
