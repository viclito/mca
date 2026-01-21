import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Information from "@/lib/models/Information";
import InformationRow from "@/lib/models/InformationRow";
import ChangeRequest from "@/lib/models/ChangeRequest";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const information = await Information.findById(id);
    if (!information || !information.active) {
      return new NextResponse("Information not found", { status: 404 });
    }

    const rows = await InformationRow.find({ informationId: id })
      .populate("lastEditedBy", "name")
      .sort({ createdAt: 1 });

    return NextResponse.json({ information, rows });
  } catch (error) {
    console.error("Error fetching information:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { rowId, data, proofImages } = body;

    if (!rowId || !data) {
      return new NextResponse("Row ID and data are required", { status: 400 });
    }

    const information = await Information.findById(id);
    if (!information || !information.active) {
      return new NextResponse("Information not found", { status: 404 });
    }

    if (information.permissionMode === "view-only") {
      return new NextResponse("This information is view-only", { status: 403 });
    }

    if (information.permissionMode === "editable") {
      // Direct edit
      const updatedRow = await InformationRow.findByIdAndUpdate(
        rowId,
        {
          data,
          lastEditedBy: null, // Removed session dependency
          lastEditedAt: new Date(),
        },
        { new: true }
      ).populate("lastEditedBy", "name");

      return NextResponse.json(updatedRow);
    } else if (information.permissionMode === "edit-with-proof") {
      // Create change request
      if (!proofImages || proofImages.length === 0) {
        return new NextResponse("Proof images are required", { status: 400 });
      }

      const changeRequest = await ChangeRequest.create({
        informationId: id,
        rowId,
        proposedChanges: data,
        proofImages,
        requestedBy: null, // Removed session dependency
      });

      return NextResponse.json({ changeRequest, requiresApproval: true });
    }

    return new NextResponse("Invalid permission mode", { status: 400 });
  } catch (error) {
    console.error("Error updating information:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
