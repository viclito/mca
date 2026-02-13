import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { authConfig } from "./auth.config";
import { logger } from "@/lib/logger";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
            console.log("Authorizing user:", credentials?.email);
            if (!credentials?.email || !credentials?.password) {
                console.log("Missing credentials");
                return null;
            }

            await dbConnect();

            const email = credentials.email as string;
            const user = await User.findOne({ email }).select("+password").lean();

            if (!user) {
                console.log("User not found");
                await logger.warn("Login Failed: User not found", { category: "AUTH", details: { email: credentials.email } });
                return null;
            }

            console.log("User found:", user.email);

            const passwordsMatch = await bcrypt.compare(
                credentials.password as string,
                user.password
            );

            if (!passwordsMatch) {
                console.log("Password mismatch");
                await logger.warn("Login Failed: Password mismatch", { category: "AUTH", details: { email: credentials.email } });
                return null;
            }

            if (user.role === "student" && !user.isEmailVerified) {
                console.log("Student email not verified");
                await logger.warn("Login Failed: Email not verified", { category: "AUTH", user: user._id.toString(), details: { email: credentials.email } });
                throw new Error("Please verify your email before logging in.");
            }

            if (!user.isApproved) {
                console.log("User not approved");
                await logger.warn("Login Failed: Account not approved", { category: "AUTH", user: user._id.toString(), details: { email: credentials.email } });
                throw new Error("Account not approved yet.");
            }

            console.log("Authorization successful for:", user.email);
            
            await logger.info("User Logged In", { category: "AUTH", user: user._id.toString(), details: { email: user.email, role: user.role } });

            // Return safe object
            return { 
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            };
        } catch (error) {
            console.error("Authorize error:", error);
            await logger.error("Login Error", { category: "AUTH", details: { error: String(error), email: credentials?.email } });
            return null;
        }
      },
    }),
  ],
});
