import { NextResponse } from "next/server";
import Content from "@/lib/models/Content";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import Unit from "@/lib/models/Unit";
import Subject from "@/lib/models/Subject";
import Semester from "@/lib/models/Semester";
import Degree from "@/lib/models/Degree";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");

    await dbConnect();

    const query = unitId ? { unitId } : {};
    const content = await Content.find(query).populate({
        path: 'unitId',
        populate: {
             path: 'subjectId',
             populate: {
                 path: 'semesterId',
                 populate: { path: 'degreeId' }
             }
        }
    }).sort({ createdAt: -1 });

    return NextResponse.json(content);
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

    const { title, type, url, unitId } = await req.json();
    if (!title || !type || !url || !unitId) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    const newContent = await Content.create({
      title,
      type,
      url,
      unitId
    });

    return NextResponse.json(newContent, { status: 201 });
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
    await Content.findByIdAndDelete(id);

    return NextResponse.json({ message: "Content deleted successfully" });
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

    const { id, title, type, url, unitId } = await req.json();
    if (!id || !title || !type || !url || !unitId) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    const content = await Content.findByIdAndUpdate(
      id,
      { title, type, url, unitId },
      { new: true }
    ).populate('unitId');

    if (!content) {
      return NextResponse.json({ message: "Content not found" }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
