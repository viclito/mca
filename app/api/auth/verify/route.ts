import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Missing verification token" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Verify user and auto-approve students on email verification
    // Alternatively, you can keep isApproved false if manual admin approval is still required
    user.isEmailVerified = true;
    user.isApproved = true; 
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    // Redirect to login page with a success message
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/login?verified=true`);
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
