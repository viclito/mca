import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "admin",
      isApproved: false,
    });

    // Send email to super admin (or the main admin email defined in ENV)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (superAdminEmail) {
      await resend.emails.send({
        from: "Acme <onboarding@resend.dev>", // Start with resend testing domain or configured domain
        to: superAdminEmail,
        subject: "New Admin Registration Request",
        html: `
          <p>A new admin has requested to join.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>Please approve or deny this request in the admin dashboard.</p>
        `,
      });
    }

    return NextResponse.json(
      { message: "Registration successful. Pending approval." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
