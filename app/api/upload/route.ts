import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file || typeof file === "string") {
      console.error("Upload failed: No file found in FormData or entry is a string");
      return NextResponse.json({ success: false, message: "No file uploaded or invalid file format" }, { status: 400 });
    }

    const fileObject = file as File;

    console.log(`Starting upload for file: ${fileObject.name}, size: ${fileObject.size} bytes`);

    // Use the abstraction layer for upload
    const result = await uploadFile(fileObject);

    console.log(`Upload successful via ${result.provider}. URL: ${result.url}`);

    return NextResponse.json({ success: true, url: result.url, provider: result.provider });
  } catch (error: any) {
    console.error("Upload error details:", error);
    
    // Customize error message based on common issues
    let errorMessage = "Upload failed: " + (error.message || "Unknown error");
    if (error.message?.includes("BLOB_READ_WRITE_TOKEN")) {
      errorMessage = "Server configuration error: Vercel Blob token is missing.";
    } else if (error.message?.includes("Cloudinary credentials")) {
      errorMessage = "Server configuration error: Cloudinary credentials are missing.";
    }

    return NextResponse.json({ 
      success: false, 
      message: errorMessage
    }, { status: 500 });
  }
}
