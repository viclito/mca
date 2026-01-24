import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file || typeof file === "string") {
      console.error("Upload failed: No file found in FormData or entry is a string");
      return NextResponse.json({ success: false, message: "No file uploaded or invalid file format" }, { status: 400 });
    }

    const fileObject = file as File;

    // Check if BLOB_READ_WRITE_TOKEN is present
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("CRITICAL: BLOB_READ_WRITE_TOKEN is missing from environment variables");
      return NextResponse.json({ 
        success: false, 
        message: "Server configuration error: Upload storage token is missing. Please check Vercel environment variables." 
      }, { status: 500 });
    }

    console.log(`Starting upload for file: ${fileObject.name}, size: ${fileObject.size} bytes`);

    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `notification-${uniqueSuffix}-${fileObject.name}`;

    // Upload to Vercel Blob
    const blob = await put(filename, fileObject, {
      access: "public",
    });

    console.log(`Upload successful. URL: ${blob.url}`);

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error("Upload error details:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Upload failed: " + (error.message || "Unknown error")
    }, { status: 500 });
  }
}
