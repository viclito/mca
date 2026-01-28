import { put } from "@vercel/blob";
import { v2 as cloudinary } from "cloudinary";

// Define return type for consistent response
export interface UploadResult {
  url: string;
  provider: "vercel" | "cloudinary";
}

/**
 * Uploads a file to the configured storage provider.
 * 
 * @param file The file object to upload
 * @param filename Optional custom filename
 * @returns Promise resolving to the uploaded file URL and provider
 */
export async function uploadFile(file: File, filename?: string): Promise<UploadResult> {
  const provider = process.env.STORAGE_PROVIDER || "vercel";

  // Generate a unique filename if not provided, preserving extension
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const finalFilename = filename || `upload-${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

  if (provider === "cloudinary") {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary credentials are missing. Please check your environment variables.");
    }

    try {
      // Convert File to ArrayBuffer then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary using a stream or direct upload
      // Since we are in a server context, we can use a promise wrapper around the upload_stream
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "mca_uploads", // Optional: Organize in a folder
            public_id: finalFilename.split('.')[0], // Cloudinary prefers ID without extension
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error("Cloudinary upload failed: " + error.message));
            } else if (result) {
              resolve({
                url: result.secure_url,
                provider: "cloudinary",
              });
            } else {
              reject(new Error("Cloudinary upload failed: Unknown status"));
            }
          }
        );

        // Write buffer to stream
        uploadStream.end(buffer);
      });

    } catch (error: any) {
      console.error("Cloudinary processing error:", error);
      throw new Error("Failed to process file for Cloudinary: " + error.message);
    }

  } else {
    // Default to Vercel Blob
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is missing. Please check Vercel environment variables.");
    }

    try {
      const blob = await put(finalFilename, file, {
        access: "public",
      });

      return {
        url: blob.url,
        provider: "vercel",
      };
    } catch (error: any) {
      console.error("Vercel Blob upload error:", error);
      throw new Error("Vercel Blob upload failed: " + error.message);
    }
  }
}
