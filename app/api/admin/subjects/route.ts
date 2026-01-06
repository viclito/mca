import { NextResponse } from "next/server";
import Subject from "@/lib/models/Subject";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import slugify from "slugify";
import Semester from "@/lib/models/Semester";
import Degree from "@/lib/models/Degree";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get("semesterId");

    await dbConnect();

    const query = semesterId ? { semesterId } : {};
    const subjects = await Subject.find(query).populate({
        path: 'semesterId',
        populate: { path: 'degreeId' }
    }).sort({ name: 1 });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, semesterId } = await req.json();
    if (!name || !semesterId) {
      return NextResponse.json({ message: "Name and Semester provided are required" }, { status: 400 });
    }

    await dbConnect();

    const slug = slugify(name, { lower: true, strict: true }); // Slug might conflict if same subject name in diff semesters? Maybe.
    // Ideally slug should be unique global or compound. For simplicity, simple slug.
    
    const subject = await Subject.create({
      name,
      slug,
      semesterId
    });

    return NextResponse.json(subject, { status: 201 });
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
    await Subject.findByIdAndDelete(id);

    return NextResponse.json({ message: "Subject deleted successfully" });
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

    const { id, name, semesterId } = await req.json();
    if (!id || !name || !semesterId) {
      return NextResponse.json({ message: "ID, Name and Semester are required" }, { status: 400 });
    }

    await dbConnect();

    const slug = slugify(name, { lower: true, strict: true });
    
    const subject = await Subject.findByIdAndUpdate(
      id,
      { name, slug, semesterId },
      { new: true }
    ).populate({
        path: 'semesterId',
        populate: { path: 'degreeId' }
    });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
