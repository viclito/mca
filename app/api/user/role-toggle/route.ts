import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const { isStudent } = await req.json();

    if (typeof isStudent !== "boolean") {
      return new NextResponse("Invalid value for isStudent", { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { isStudent },
      { new: true }
    );

    if (!updatedUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      message: "Role updated successfully",
      isStudent: updatedUser.isStudent,
    });
  } catch (error) {
    console.error("Error toggling student role:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
