import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Log from "@/lib/models/Log";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const level = searchParams.get("level");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: any = {};

    if (level && level !== "ALL") {
      query.level = level;
    }

    if (category && category !== "ALL") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: "i" } },
        { "context.path": { $regex: search, $options: "i" } },
        { "context.ip": { $regex: search, $options: "i" } },
        // Add more search fields if necessary, like user email if we populated it
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Log.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email") // Populate user details
        .lean(),
      Log.countDocuments(query),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
