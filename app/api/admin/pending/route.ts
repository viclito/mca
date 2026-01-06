import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const pendingAdmins = await User.find({
      role: "admin",
      isApproved: false,
    })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pendingAdmins, { status: 200 });
  } catch (error) {
    console.error("Fetch Pending Admins Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
