import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/lib/models/Notification";
import Content from "@/lib/models/Content";
import Unit from "@/lib/models/Unit";
import Subject from "@/lib/models/Subject";
import Semester from "@/lib/models/Semester";
import Degree from "@/lib/models/Degree";

export async function GET() {
  try {
    await dbConnect();

    // Ensure models are registered for populate (prevent tree-shaking)
    // We simply reference them here to ensure the bundler includes them
    const _models = [Unit, Subject, Semester, Degree]; 

    // 1. Fetch Active Notifications
    // 1. Fetch Active Notifications
    // Prioritize Main Notification
    const mainNotification = await Notification.findOne({ active: true, isMain: true });
    
    // Fetch recent regular notifications
    const query: any = { active: true };
    if (mainNotification) {
      query._id = { $ne: mainNotification._id };
    }
    
    const otherNotifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(5);

    const notifications = mainNotification ? [mainNotification, ...otherNotifications] : otherNotifications;

    // 2. Fetch Recent Content (last 6 items)
    // We need to populate all the way up to Degree to show context
    const recentContent = await Content.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({
        path: "unitId",
        populate: {
          path: "subjectId",
          populate: {
            path: "semesterId",
            populate: {
              path: "degreeId",
            },
          },
        },
      });

    return NextResponse.json({
      notifications,
      recentContent,
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
