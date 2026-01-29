import { NextResponse } from "next/server";
import Unit from "@/lib/models/Unit";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import slugify from "slugify";
import Subject from "@/lib/models/Subject";
import Semester from "@/lib/models/Semester";
import Degree from "@/lib/models/Degree";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const semesterId = searchParams.get("semesterId");
    const degreeId = searchParams.get("degreeId");

    await dbConnect();

    let query: any = {};

    if (subjectId) {
      query.subjectId = subjectId;
    } else if (semesterId) {
      const subjects = await Subject.find({ semesterId }).select("_id");
      query.subjectId = { $in: subjects.map(s => s._id) };
    } else if (degreeId) {
      const semesters = await Semester.find({ degreeId }).select("_id");
      const subjects = await Subject.find({ semesterId: { $in: semesters.map(s => s._id) } }).select("_id");
      query.subjectId = { $in: subjects.map(s => s._id) };
    }

    const units = await Unit.find(query).populate({
        path: 'subjectId',
        populate: { 
            path: 'semesterId',
            populate: { path: 'degreeId' }
        }
    }).sort({ name: 1 });

    return NextResponse.json(units);
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

    const { name, subjectId } = await req.json();
    if (!name || !subjectId) {
      return NextResponse.json({ message: "Name and Subject provided are required" }, { status: 400 });
    }

    await dbConnect();

    const slug = slugify(name, { lower: true, strict: true });
    
    const unit = await Unit.create({
      name,
      slug,
      subjectId
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
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
    await Unit.findByIdAndDelete(id);

    return NextResponse.json({ message: "Unit deleted successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, name, subjectId } = await req.json();
    if (!id || !name || !subjectId) {
      return NextResponse.json({ message: "ID, Name and Subject are required" }, { status: 400 });
    }

    await dbConnect();

    const slug = slugify(name, { lower: true, strict: true });
    
    const unit = await Unit.findByIdAndUpdate(
      id,
      { name, slug, subjectId },
      { new: true }
    ).populate({
        path: 'subjectId',
        populate: {
            path: 'semesterId',
            populate: { path: 'degreeId' }
        }
    });

    if (!unit) {
      return NextResponse.json({ message: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
