import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { broadcastNotification } from "@/lib/mail";
import { logger, Logger } from "@/lib/logger";
import { auth } from "@/auth";

export async function GET() {
  try {
    await dbConnect();
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, message, type, link, image, images, isMain, timetable } = body;

    // Title is always required
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // For image notifications, images array is required, message is optional
    // For other types, message is required
    if (type === "image") {
      if (!images || images.length === 0) {
        return new NextResponse("At least one image is required for image notifications", { status: 400 });
      }
    } else {
      if (!message) {
        return new NextResponse("Message is required", { status: 400 });
      }
    }

    // If isMain is true, unset it for all other notifications
    if (isMain) {
      await Notification.updateMany({ isMain: true }, { isMain: false });
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      link,
      image,
      images: images || [],
      isMain: isMain || false,
      timetable: timetable || [],
    });

    // Broadcast email to all users in background
    // We don't await this to ensure fast response to Admin UI
    const origin = new URL(req.url).origin;
    broadcastNotification(title, message, link, images || [], origin).catch(err => console.error("Broadcast failed:", err));

    const session = await auth();
    if (session?.user) {
        await logger.info("Notification Created", { 
            user: session.user.id, 
            category: "ADMIN",
            details: { title, type, notificationId: notification._id } 
        });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, title, message, type, link, image, images, active, isMain, timetable } = body;

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    // If isMain is true, unset it for all other notifications
    if (isMain) {
       await Notification.updateMany({ _id: { $ne: id }, isMain: true }, { isMain: false });
    }

    const originalNotification = await Notification.findById(id).lean();
    if (!originalNotification) {
        return new NextResponse("Notification not found", { status: 404 });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { title, message, type, link, image, images, active, isMain, timetable },
      { new: true }
    );

    const changes = Logger.getDiff(originalNotification, { title, message, type, link, image, images, active, isMain, timetable });

    const session = await auth();
    if (session?.user) {
        await logger.info("Notification Updated", { 
            user: session.user.id, 
            category: "ADMIN",
            details: { 
                notificationId: id,
                resourceName: originalNotification.title,
                changes: changes || "No changes detected"
            } 
        });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    await Notification.findByIdAndDelete(id);

    const session = await auth();
    if (session?.user) {
        await logger.info("Notification Deleted", { 
            user: session.user.id, 
            category: "ADMIN",
            details: { notificationId: id } 
        });
    }

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
