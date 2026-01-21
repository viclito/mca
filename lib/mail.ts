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

export async function broadcastNotification(title: string, message: string | undefined, link?: string, images?: string[]) {
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

    // Build images HTML section if images are present
    const imagesHtml = images && images.length > 0 
      ? `
        <div style="margin: 20px 0;">
          ${images.map(img => `
            <div style="margin-bottom: 15px; border-radius: 8px; overflow: hidden; border: 1px solid #e1e1e1;">
              <img src="${img}" alt="Notification Image" style="width: 100%; height: auto; display: block;" />
            </div>
          `).join('')}
        </div>
      `
      : "";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0070f3; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">MCA Portal Notification</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #333 text-align: left;">
          <h2 style="color: #0070f3;">${title}</h2>
          ${imagesHtml}
          ${message ? `<p style="font-size: 16px;">${message}</p>` : ''}
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
          <p>You received this email because you are a registered user at MCA Portal.</p>
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

export async function broadcastInformation(title: string, description?: string) {
  try {
    await dbConnect();
    // Fetch all approved students, admins, and super_admins
    const users = await User.find({ 
      role: { $in: ["student", "admin", "super_admin"] },
      isApproved: true 
    }).select("email");
    const emails = users.map((u) => u.email);

    if (emails.length === 0) {
      console.log("No approved users to broadcast information to.");
      return;
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">New Information Shared</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #333; text-align: left;">
          <h2 style="color: #6366f1;">${title}</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">A new information table has been shared on the MCA Portal.</p>
          ${description ? `<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-style: italic; margin-bottom: 25px;">${description}</div>` : ''}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/student/information" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Information</a>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e1e1e1;">
          <p>This is an automated message from the MCA Student Portal. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      bcc: emails,
      subject: `New Information: ${title}`,
      html,
    });

    console.log(`Successfully broadcasted information update to ${emails.length} users.`);
  } catch (error) {
    console.error("Broadcasting Information Error:", error);
    throw error;
  }
}
