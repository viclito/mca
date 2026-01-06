import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { authConfig } from "./auth.config";

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
                return null;
            }

            console.log("User found:", user.email);

            const passwordsMatch = await bcrypt.compare(
                credentials.password as string,
                user.password
            );

            if (!passwordsMatch) {
                console.log("Password mismatch");
                return null;
            }

            if (!user.isApproved) {
                console.log("User not approved");
                throw new Error("Account not approved yet.");
            }

            console.log("Authorization successful for:", user.email);
            // Return safe object
            return { 
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            };
        } catch (error) {
            console.error("Authorize error:", error);
            return null;
        }
      },
    }),
  ],
});
