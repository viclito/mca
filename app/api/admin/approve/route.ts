import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    // Check if user is authenticated and is a super_admin
    // Note: You need to manually seed the first super_admin or allow the first user to be super_admin logic elsewhere,
    // or just allow any 'admin' to approve others? Usually super_admin approves.
    // For now, let's assume 'admin' role can approve for simplicity if that matches user request "main admin gmail" context.
    // But safely, only super_admin should.
    
    if (!session || session.user.role !== "super_admin") {
         return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User approved successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approval Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
