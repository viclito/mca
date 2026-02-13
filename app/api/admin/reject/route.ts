import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await auth();

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

    // Delete the user instead of just marking as rejected
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    await logger.info("User Rejected/Deleted", { 
        user: session.user.id, 
        category: "ADMIN",
        details: { rejectedUserId: userId } 
    });

    return NextResponse.json(
      { message: "User rejected and removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Rejection Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
