import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Information from "@/lib/models/Information";

export async function GET() {
  try {
    await dbConnect();
    const information = await Information.find({ active: true }).sort({ createdAt: -1 });
    return NextResponse.json(information);
  } catch (error) {
    console.error("Error fetching information:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
