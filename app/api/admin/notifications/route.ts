import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { broadcastNotification } from "@/lib/mail";

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
    const { title, message, type, link, isMain, timetable } = body;

    if (!title || !message) {
      return new NextResponse("Title and Message are required", { status: 400 });
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
      isMain: isMain || false,
      timetable: timetable || [],
    });

    // Broadcast email to students in background
    // We don't await this to ensure fast response to Admin UI
    broadcastNotification(title, message, link).catch(err => console.error("Broadcast failed:", err));

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
    const { id, title, message, type, link, active, isMain, timetable } = body;

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    // If isMain is true, unset it for all other notifications
    if (isMain) {
       await Notification.updateMany({ _id: { $ne: id }, isMain: true }, { isMain: false });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { title, message, type, link, active, isMain, timetable },
      { new: true }
    );


    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
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

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
