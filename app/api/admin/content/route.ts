import { NextResponse } from "next/server";
import Content from "@/lib/models/Content";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";

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
