import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";
import logger from "@/lib/utils/logger";

export const runtime = "nodejs"; // ✅ required for Buffer + Cloudinary streams

export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const file = body.get("file") as File;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!file) {
      logger.warn("File upload failed — no file provided");

      return apiError(
        ErrorCode.REQUIRED_FIELD,
        "No file uploaded",
        400
      );
    }

    // -----------------------------
    // Convert File -> Buffer
    // -----------------------------
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // -----------------------------
    // Upload to Cloudinary
    // -----------------------------
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "vehicles" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(buffer);
    });

    logger.info("File uploaded to Cloudinary successfully", {
      originalName: file.name,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      size: uploadResult.bytes,
    });

    return apiSuccess(
      uploadResult,
      "File uploaded successfully",
      200
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    logger.error("Cloudinary file upload failed", { error: message });

    return apiError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      "File upload failed. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
