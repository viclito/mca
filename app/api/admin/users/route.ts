import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { logger, Logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        
        // Fetch all users except the current one (optional)
        const users = await User.find({}).sort({ createdAt: -1 }).select('-password').lean();

        return NextResponse.json(users);

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id, name, email, role, isApproved, batch, degree, college, isStudent, isEmailVerified } = await req.json();

        await dbConnect();

        // access check
        const currentUser = await User.findById(session.user.id);
        const isSuperAdmin = currentUser.role === 'super_admin';
        
        let hasPermission = isSuperAdmin;
        
        if (!isSuperAdmin && currentUser.tempPermissions?.canEdit) {
            if (new Date() < new Date(currentUser.tempPermissions.expiresAt)) {
                // Ensure they are not trying to escalate privileges to super_admin or edit a super_admin
                const targetUser = await User.findById(id);
                if (targetUser.role !== 'super_admin' && role !== 'super_admin') {
                     hasPermission = true;
                }
            }
        }

        if (!hasPermission) {
             return NextResponse.json({ message: "Permission denied" }, { status: 403 });
        }
        
        const originalUser = await User.findById(id).lean();
        const updatedUser = await User.findByIdAndUpdate(id, { 
            name, 
            email, 
            role, 
            isApproved, 
            batch, 
            degree, 
            college, 
            isStudent, 
            isEmailVerified 
        }, { new: true });

        // Calculate diff
        const changes = Logger.getDiff(originalUser, { 
            name, 
            email, 
            role, 
            isApproved, 
            batch, 
            degree, 
            college, 
            isStudent, 
            isEmailVerified 
        });

        await logger.info("User Updated", {
            category: "USER_MGMT",
            restricted: true, // Always restricted
            user: session.user.id,
            details: {
                targetUserId: id,
                resourceName: name,
                changes
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        await dbConnect();

         // access check
        const currentUser = await User.findById(session.user.id);
        const isSuperAdmin = currentUser.role === 'super_admin';
        
        let hasPermission = isSuperAdmin;
        
        if (!isSuperAdmin && currentUser.tempPermissions?.canDelete) {
            if (new Date() < new Date(currentUser.tempPermissions.expiresAt)) {
                // Ensure they are not trying to delete a super_admin
                 const targetUser = await User.findById(id);
                if (targetUser.role !== 'super_admin') {
                     hasPermission = true;
                }
            }
        }

        if (!hasPermission) {
             return NextResponse.json({ message: "Permission denied" }, { status: 403 });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (deletedUser) {
             await logger.info("User Deleted", {
                category: "USER_MGMT",
                restricted: true, // Always restricted
                user: session.user.id,
                details: {
                    targetUserId: id,
                    resourceName: deletedUser.name,
                    email: deletedUser.email
                }
            });
        }

        return NextResponse.json({ message: "User deleted" });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
