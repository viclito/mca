import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "super_admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { userId, canEdit, canDelete, durationHours } = await req.json();

        if (!userId || !durationHours) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + Number(durationHours));

        const user = await User.findByIdAndUpdate(userId, {
            tempPermissions: {
                canEdit: canEdit || false,
                canDelete: canDelete || false,
                expiresAt
            }
        }, { new: true });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Log this restricted action
        await logger.info("Permissions Granted", {
            category: "USER_MGMT",
            restricted: true,
            user: session.user.id,
            details: {
                targetUser: user.email,
                permissions: { canEdit, canDelete },
                duration: durationHours,
                expiresAt
            }
        });

        return NextResponse.json({ message: "Permissions granted successfully", permissions: user.tempPermissions });

    } catch (error) {
        console.error("Error granting permissions:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
