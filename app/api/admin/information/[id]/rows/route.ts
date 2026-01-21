import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Information from "@/lib/models/Information";
import InformationRow from "@/lib/models/InformationRow";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const information = await Information.findById(id);
    if (!information) {
      return new NextResponse("Information not found", { status: 404 });
    }

    const rows = await InformationRow.find({ informationId: id })
      .populate("lastEditedBy", "name")
      .sort({ createdAt: 1 });

    return NextResponse.json({ information, rows });
  } catch (error) {
    console.error("Error fetching information rows:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { rowId, data } = body;

    if (!rowId || !data) {
      return new NextResponse("Row ID and data are required", { status: 400 });
    }

    const updatedRow = await InformationRow.findByIdAndUpdate(
      rowId,
      {
        data,
        lastEditedBy: null, // Removed session dependency
        lastEditedAt: new Date(),
      },
      { new: true }
    ).populate("lastEditedBy", "name");

    if (!updatedRow) {
      return new NextResponse("Row not found", { status: 404 });
    }

    return NextResponse.json(updatedRow);
  } catch (error) {
    console.error("Error updating row:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    // const { id } = await params; // id not needed here but good to keep pattern consistent if needed
    const { searchParams } = new URL(req.url);
    const rowId = searchParams.get("rowId");

    if (!rowId) {
      return new NextResponse("Row ID is required", { status: 400 });
    }

    await InformationRow.findByIdAndDelete(rowId);

    return NextResponse.json({ message: "Row deleted successfully" });
  } catch (error) {
    console.error("Error deleting row:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
