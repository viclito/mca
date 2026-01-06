import { NextResponse } from "next/server";
import Degree from "@/lib/models/Degree";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import slugify from "slugify";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const degrees = await Degree.find({}).sort({ createdAt: -1 });
    return NextResponse.json(degrees);
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

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    await dbConnect();

    const slug = slugify(name, { lower: true, strict: true });
    
    // Check if exists
    const existing = await Degree.findOne({ slug });
    if (existing) {
        return NextResponse.json({ message: "Degree already exists" }, { status: 400 });
    }

    const degree = await Degree.create({
      name,
      slug,
    });

    return NextResponse.json(degree, { status: 201 });
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
    await Degree.findByIdAndDelete(id);

    return NextResponse.json({ message: "Degree deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
