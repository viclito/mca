import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Fetch all approved students (including admins who opted-in as students)
    const students = await User.find({
      isApproved: true,
      $or: [{ role: "student" }, { isStudent: true }]
    })
    .select("name email _id")
    .sort({ name: 1 });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching eligible students:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
