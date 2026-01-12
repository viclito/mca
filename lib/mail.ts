import nodemailer from "nodemailer";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string | string[], subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"MCA Notification" <no-reply@mca.edu>', // sender address
      to: Array.isArray(to) ? to.join(", ") : to, // list of receivers
      subject: subject, // Subject line
      html: html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // don't throw, just log so we don't break the notification flow
    return null;
  }
};

export const broadcastNotification = async (title: string, message: string, link?: string) => {
  try {
    await dbConnect();
    // Fetch all users with role 'student' (or all users if you prefer)
    // Assuming 'active' users or similar. For now, all users who look like students (role 'student' OR default 'user')
    // Since we are adding specific student role, let's target that. 
    // BUT we also want to target existing users maybe? Let's check User model roles.
    // Plan said: "Treat all users with role 'user' (or default) as students."
    
    // Fetch ALL users as requested
    const users = await User.find({}).select('email');
    
    const emails = users.map(s => s.email).filter(Boolean); // Ensure no nulls

    if (emails.length === 0) {
      console.log("No students to broadcast to.");
      return;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">New Notification: ${title}</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.5;">${message}</p>
        ${
          link
            ? `<a href="${link}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Details</a>`
            : ""
        }
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">MCA Department Notification System</p>
      </div>
    `;

    // Process in batches if too many emails (simple version: send as BCC or individual)
    // Using BCC for privacy and single implementation
    await transporter.sendMail({
       from: process.env.SMTP_FROM || '"MCA Notification" <no-reply@mca.edu>',
       bcc: emails, // Use BCC to hide recipients from each other
       subject: `📢 New MCA Notification: ${title}`,
       html: htmlContent
    });

    console.log(`Broadcasted notification '${title}' to ${emails.length} students.`);

  } catch (error) {
    console.error("Error broadcasting notification:", error);
  }
};
