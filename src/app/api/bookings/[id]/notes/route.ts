// app/api/bookings/[id]/notes/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/app/models/Booking";
import logger from "@/lib/utils/logger";
import { verifyToken } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!id) {
      logger.warn("Add note failed: booking id missing in params");
      return apiError(
        ErrorCode.VALIDATION_ERROR,
        "Booking id is required",
        400
      );
    }

    const { text } = await req.json();

    if (!text || !text.toString().trim()) {
      logger.warn("Add note failed: note text missing", { bookingId: id });
      return apiError(
        ErrorCode.VALIDATION_ERROR,
        "Note text is required",
        400
      );
    }

    // -----------------------------
    // Auth: extract token from cookie
    // -----------------------------
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("token=")[1];

    if (!token) {
      logger.warn("Unauthorized add-note attempt: missing token", {
        bookingId: id,
      });
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Unauthorized: authentication token missing",
        401
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string" || !("id" in decoded)) {
      logger.warn("Invalid token used for add-note", { bookingId: id });
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Invalid or expired token",
        401
      );
    }

    const agentName = decoded.name || "Unknown Agent";
    const createdBy = decoded.id;

    logger.info("Add note request received", {
      bookingId: id,
      agentId: createdBy,
      agentName,
    });

    const booking = await Booking.findById(id);
    if (!booking) {
      logger.warn("Add note failed: booking not found", {
        bookingId: id,
        agentId: createdBy,
      });

      return apiError(
        ErrorCode.NOT_FOUND,
        "Booking not found",
        404
      );
    }

    booking.notes.push({
      text,
      agentName,
      createdBy,
      createdAt: new Date(),
    });

    await booking.save();

    logger.info("Note added to booking", {
      bookingId: id,
      agentId: createdBy,
    });

    return apiSuccess(
      { booking },
      "Note added successfully",
      200
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    logger.error("Failed to add note to booking", { error: message });

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to add note. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
