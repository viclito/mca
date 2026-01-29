import { NextResponse } from "next/server";
import Content from "@/lib/models/Content";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import Unit from "@/lib/models/Unit";
import Subject from "@/lib/models/Subject";
import Semester from "@/lib/models/Semester";
import Degree from "@/lib/models/Degree";

// Ensure all models are loaded for populate to work
const models = { Unit, Subject, Semester, Degree, Content };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");
    const subjectId = searchParams.get("subjectId");
    const semesterId = searchParams.get("semesterId");
    const degreeId = searchParams.get("degreeId");

    console.log('[Content API] Connecting to database...');
    const dbConnection = await Promise.race([
      dbConnect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    console.log('[Content API] Database connected successfully');

    let query: any = {};

    if (unitId) {
        query.unitId = unitId;
    } else if (subjectId) {
        console.log('[Content API] Filtering by subjectId:', subjectId);
        const units = await Unit.find({ subjectId }).select("_id");
        query.unitId = { $in: units.map(u => u._id) };
    } else if (semesterId) {
        console.log('[Content API] Filtering by semesterId:', semesterId);
        const subjects = await Subject.find({ semesterId }).select("_id");
        const units = await Unit.find({ subjectId: { $in: subjects.map(s => s._id) } }).select("_id");
        query.unitId = { $in: units.map(u => u._id) };
    } else if (degreeId) {
        console.log('[Content API] Filtering by degreeId:', degreeId);
        const semesters = await Semester.find({ degreeId }).select("_id");
        const subjects = await Subject.find({ semesterId: { $in: semesters.map(s => s._id) } }).select("_id");
        const units = await Unit.find({ subjectId: { $in: subjects.map(s => s._id) } }).select("_id");
        query.unitId = { $in: units.map(u => u._id) };
    }

    console.log('[Content API] Fetching content with query:', JSON.stringify(query));
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

    console.log('[Content API] Successfully fetched', content.length, 'items');
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('[Content API ERROR]:', error);
    console.error('[Content API ERROR Stack]:', error.stack);
    console.error('[Content API ERROR Message]:', error.message);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
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
