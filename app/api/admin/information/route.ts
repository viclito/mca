import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Information from "@/lib/models/Information";
import InformationRow from "@/lib/models/InformationRow";
import { broadcastInformation } from "@/lib/mail";

export async function GET() {
  try {
    await dbConnect();
    const information = await Information.find({}).sort({ createdAt: -1 }).populate("createdBy", "name email");
    return NextResponse.json(information);
  } catch (error) {
    console.error("Error fetching information:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, description, columns, rows, permissionMode } = body;

    if (!title || !columns || !Array.isArray(columns) || columns.length === 0) {
      return new NextResponse("Title and columns are required", { status: 400 });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return new NextResponse("At least one data row is required", { status: 400 });
    }

    // Create information metadata
    const information = await Information.create({
      title,
      description,
      columns,
      permissionMode: permissionMode || "view-only",
    });

    // Create information rows
    const rowDocs = rows.map(row => ({
      informationId: information._id,
      data: row,
    }));
    await InformationRow.insertMany(rowDocs);

    // Broadcast notification in background
    broadcastInformation(title, description).catch(err => console.error("Broadcast skip error:", err));

    return NextResponse.json(information);
  } catch (error) {
    console.error("Error creating information:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, title, description, permissionMode, active } = body;

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    const information = await Information.findByIdAndUpdate(
      id,
      { title, description, permissionMode, active },
      { new: true }
    );

    if (!information) {
      return new NextResponse("Information not found", { status: 404 });
    }

    return NextResponse.json(information);
  } catch (error) {
    console.error("Error updating information:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    // Delete information and all associated rows
    await Information.findByIdAndDelete(id);
    await InformationRow.deleteMany({ informationId: id });

    return NextResponse.json({ message: "Information deleted successfully" });
  } catch (error) {
    console.error("Error deleting information:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
