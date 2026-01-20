import nodemailer from "nodemailer";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function broadcastNotification(title: string, message: string, link?: string) {
  try {
    await dbConnect();
    // Fetch all approved students, admins, and super_admins
    const users = await User.find({ 
      role: { $in: ["student", "admin", "super_admin"] },
      isApproved: true 
    }).select("email");
    const emails = users.map((u) => u.email);

    if (emails.length === 0) {
      console.log("No approved users to broadcast to.");
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0070f3; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">MCA Portal Notification</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #333 text-align: left;">
          <h2 style="color: #0070f3;">${title}</h2>
          <p style="font-size: 16px;">${message}</p>
          ${
            link
              ? `
            <div style="margin-top: 30px; text-align: center;">
              <a href="${link}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details</a>
            </div>
          `
              : ""
          }
        </div>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; color: #777; font-size: 12px;">
          <p>You received this email because you are a registered student at MCA Portal.</p>
        </div>
      </div>
    `;

    // Sending individual emails is safer for Gmail limits than one big BCC if the student list grows
    // For now, let's use a single send with multiple recipients in BCC to be efficient
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      bcc: emails,
      subject: `New Notification: ${title}`,
      html,
    });

    console.log(`Successfully broadcasted notification to ${emails.length} users (students, admins, and super_admins).`);
  } catch (error) {
    console.error("Broadcasting Error:", error);
    throw error;
  }
}
