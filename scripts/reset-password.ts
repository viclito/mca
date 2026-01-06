import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const EMAIL = "berglin1998@gmail.com"; // The email from your request
const NEW_PASSWORD = "password123"; // Temporary password

async function resetPassword() {
  try {
    await dbConnect();
    console.log("Connected to database...");

    const user = await User.findOne({ email: EMAIL });

    if (!user) {
      console.log(`User with email ${EMAIL} not found.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    
    user.password = hashedPassword;
    await user.save();

    console.log("SUCCESS! Password has been reset.");
    console.log(`Email: ${EMAIL}`);
    console.log(`New Password: ${NEW_PASSWORD}`);
    console.log("Please login and change it if needed.");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting password:", error);
    process.exit(1);
  }
}

resetPassword();
