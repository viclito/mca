import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    try {
      await dbConnect();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link." },
        { status: 200 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link." },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token (using findByIdAndUpdate to avoid validation errors)
    await User.findByIdAndUpdate(
      user._id,
      {
        resetToken,
        resetTokenExpiry,
      },
      { runValidators: false } // Skip validation to prevent "name required" errors on existing users
    );

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Send email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.5;">
          You requested to reset your password. Click the button below to set a new password:
        </p>
        <a href="${resetLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          This link will expire in 1 hour.
        </p>
        <p style="font-size: 14px; color: #666;">
          If you didn't request this, please ignore this email.
        </p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">MCA Department</p>
      </div>
    `;

    try {
      await sendEmail(email, "Password Reset Request", htmlContent);
      console.log(`Password reset email sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Log the detailed error but still return success to prevent user enumeration
      console.error("SMTP Configuration:", {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM,
      });
      // Still return success for security
    }

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error - Unexpected:", error);
    // Return generic success message for security (don't expose errors)
    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link." },
      { status: 200 }
    );
  }
}
