import { NextResponse } from "next/server";
import Book from "@/lib/models/Book";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import Subject from "@/lib/models/Subject";
import Semester from "@/lib/models/Semester";
import Degree from "@/lib/models/Degree";

// Ensure all models are loaded for populate to work
const models = { Subject, Semester, Degree, Book };

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

    const books = await Book.find(query).populate({
        path: 'subjectId',
        populate: {
             path: 'semesterId',
             populate: { path: 'degreeId' }
        }
    }).sort({ createdAt: -1 });

    return NextResponse.json(books);
  } catch (error: any) {
    console.error('[Books API ERROR]:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, url, subjectId } = await req.json();
    if (!title || !url || !subjectId) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    const newBook = await Book.create({
      title,
      url,
      subjectId
    });

    return NextResponse.json(newBook, { status: 201 });
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
    await Book.findByIdAndDelete(id);

    return NextResponse.json({ message: "Book deleted successfully" });
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

    const { id, title, url, subjectId } = await req.json();
    if (!id || !title || !url || !subjectId) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    const book = await Book.findByIdAndUpdate(
      id,
      { title, url, subjectId },
      { new: true }
    ).populate('subjectId');

    if (!book) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
