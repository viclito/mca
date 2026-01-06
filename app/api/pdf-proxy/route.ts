import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
     // Extract ID from Google Drive URL to construct a direct download link
     // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
     // -> https://drive.google.com/uc?export=download&id=FILE_ID
     
     let id = "";
     if (fileUrl.includes("/file/d/")) {
        const parts = fileUrl.split("/d/");
        if (parts[1]) {
            id = parts[1].split("/")[0];
        }
     } else {
        // Try query param
        const urlObj = new URL(fileUrl);
        id = urlObj.searchParams.get("id") || "";
     }

     if (!id) {
         return new NextResponse("Invalid Google Drive URL", { status: 400 });
     }

     const directUrl = `https://drive.google.com/uc?export=download&id=${id}`;
     
     const response = await fetch(directUrl);
     
     if (!response.ok) {
         return new NextResponse("Failed to fetch PDF", { status: response.status });
     }

     const contentType = response.headers.get("Content-Type") || "application/pdf";
     const arrayBuffer = await response.arrayBuffer();

     return new NextResponse(arrayBuffer, {
         headers: {
             "Content-Type": contentType,
             "Cache-Control": "public, max-age=3600",
         }
     });

  } catch (error) {
      console.error("PDF Proxy Error:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
  }
}
