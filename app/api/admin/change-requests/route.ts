import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ChangeRequest from "@/lib/models/ChangeRequest";
import InformationRow from "@/lib/models/InformationRow";

export async function GET() {
  try {
    await dbConnect();
    const changeRequests = await ChangeRequest.find({ status: "pending" })
      .populate("informationId", "title")
      .populate("rowId")
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(changeRequests);
  } catch (error) {
    console.error("Error fetching change requests:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, action, reviewNotes } = body;

    if (!id || !action) {
      return new NextResponse("ID and action are required", { status: 400 });
    }

    const changeRequest = await ChangeRequest.findById(id).populate("rowId");
    if (!changeRequest) {
      return new NextResponse("Change request not found", { status: 404 });
    }

    if (changeRequest.status !== "pending") {
      return new NextResponse("Change request already processed", { status: 400 });
    }

    if (action === "approve") {
      // Apply the changes to the row
      await InformationRow.findByIdAndUpdate(changeRequest.rowId, {
        data: changeRequest.proposedChanges,
        lastEditedBy: changeRequest.requestedBy,
        lastEditedAt: new Date(),
      });

      changeRequest.status = "approved";
    } else if (action === "reject") {
      changeRequest.status = "rejected";
    } else {
      return new NextResponse("Invalid action", { status: 400 });
    }

    changeRequest.reviewedBy = null; // Removed session dependency
    changeRequest.reviewedAt = new Date();
    changeRequest.reviewNotes = reviewNotes;
    await changeRequest.save();

    return NextResponse.json(changeRequest);
  } catch (error) {
    console.error("Error processing change request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
