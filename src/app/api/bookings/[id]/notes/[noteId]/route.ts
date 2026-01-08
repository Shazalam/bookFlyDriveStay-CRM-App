import { connectDB } from "@/lib/db";
import Booking from "@/app/models/Booking";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import logger from "@/lib/utils/logger";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";

// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string; noteId: string }> }
// ) {
//   try {
//     await connectDB();

//     const { id, noteId } = await context.params; // ✅ await here
//     const { text } = await req.json();

//     if (!text?.trim()) {
//       return apiResponse({ error: "Note text is required" }, 400);
//     }

//     const booking = await Booking.findOneAndUpdate(
//       { _id: id, "notes._id": noteId },
//       {
//         $set: {
//           "notes.$.text": text.trim(),
//           "notes.$.updatedAt": new Date(),
//         },
//       },
//       { new: true }
//     );

//     if (!booking) {
//       return apiResponse({ error: "Booking or note not found" }, 404);
//     }

//     return apiResponse({ success: true, booking });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ error: message }, 500);
//   }
// }


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await connectDB();

    const { id, noteId } = await context.params;
    const { text } = await req.json();

    if (!id || !noteId) {
      logger.warn("Update note failed: id or noteId missing", { id, noteId });
      return apiError(
        ErrorCode.VALIDATION_ERROR,
        "Booking id and note id are required",
        400
      );
    }

    if (!text || !text.toString().trim()) {
      logger.warn("Update note failed: note text missing", {
        bookingId: id,
        noteId,
      });
      return apiError(
        ErrorCode.VALIDATION_ERROR,
        "Note text is required",
        400
      );
    }

    logger.info("Update note request received", {
      bookingId: id,
      noteId,
    });

    const booking = await Booking.findOneAndUpdate(
      { _id: id, "notes._id": noteId },
      {
        $set: {
          "notes.$.text": text.trim(),
          "notes.$.updatedAt": new Date(),
        },
      },
      { new: true }
    );

    if (!booking) {
      logger.warn("Update note failed: booking or note not found", {
        bookingId: id,
        noteId,
      });

      return apiError(
        ErrorCode.NOT_FOUND,
        "Booking or note not found",
        404
      );
    }

    logger.info("Note updated successfully", {
      bookingId: id,
      noteId,
    });

    return apiSuccess(
      { booking },
      "Note updated successfully",
      200
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    logger.error("Failed to update note", { error: message });

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to update note. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}



// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string; noteId: string }> }
// ) {
//   try {
//     await connectDB();

//     const { id, noteId } = await context.params; // ✅ await the params

//     // Auth check
//     const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
//     if (!token) return apiResponse({ error: "Unauthorized" }, 401);

//     const decoded = verifyToken(token);
//     if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
//       return apiResponse({ error: "Invalid token" }, 401);
//     }

//     // Delete the note using $pull
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       id,
//       { $pull: { notes: { _id: noteId } } },
//       { new: true }
//     );

//     if (!updatedBooking) {
//       return apiResponse({ error: "Booking not found" }, 404);
//     }

//     return apiResponse({ success: true, booking: updatedBooking }, 200);
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ error: message }, 500);
//   }
// }


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await connectDB();

    const { id, noteId } = await context.params;

    if (!id || !noteId) {
      logger.warn("Delete note failed: booking id or noteId missing", {
        id,
        noteId,
      });
      return apiError(
        ErrorCode.VALIDATION_ERROR,
        "Booking id and note id are required",
        400
      );
    }

    // -----------------------------
    // Auth: token from cookie
    // -----------------------------
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("token=")[1];

    if (!token) {
      logger.warn("Unauthorized delete-note attempt: missing token", {
        bookingId: id,
        noteId,
      });
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Unauthorized: authentication token missing",
        401
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string" || !("id" in decoded)) {
      logger.warn("Invalid token used for delete-note", {
        bookingId: id,
        noteId,
      });
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Invalid or expired token",
        401
      );
    }

    logger.info("Delete note request received", {
      bookingId: id,
      noteId,
      agentId: decoded.id,
      agentName: decoded.name,
    });

    // -----------------------------
    // Delete note with $pull
    // -----------------------------
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $pull: { notes: { _id: noteId } } },
      { new: true }
    );

    if (!updatedBooking) {
      logger.warn("Delete note failed: booking not found", {
        bookingId: id,
        noteId,
      });

      return apiError(
        ErrorCode.NOT_FOUND,
        "Booking not found",
        404
      );
    }

    logger.info("Note deleted from booking", {
      bookingId: id,
      noteId,
      agentId: decoded.id,
    });

    return apiSuccess(
      { booking: updatedBooking },
      "Note deleted successfully",
      200
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    logger.error("Failed to delete note from booking", { error: message });

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to delete note. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
