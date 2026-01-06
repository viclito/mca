import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import * as dotenv from "dotenv";

dotenv.config();

async function approveFirstUser() {
  try {
    await dbConnect();
    console.log("Connected to database...");

    // Find the pending user (or just the first user found)
    const user = await User.findOne({});

    if (!user) {
      console.log("No users found. Please register on the website first.");
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);
    
    // Update role to super_admin and approve
    user.role = "super_admin";
    user.isApproved = true;
    await user.save();

    console.log("SUCCESS! User has been approved and promoted to 'super_admin'.");
    console.log("You can now log in at /login");
    process.exit(0);
  } catch (error) {
    console.error("Error approving user:", error);
    process.exit(1);
  }
}

approveFirstUser();
