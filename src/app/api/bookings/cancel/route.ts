// // src/app/api/bookings/cancel/route.ts
// import { connectDB } from "@/lib/db";
// import Booking from "@/app/models/Booking";
// import { apiResponse } from "@/lib/utils/apiResponse";
// import { NextRequest } from "next/server";
// import { verifyToken } from "@/lib/auth";

// const REQUIRED_FIELDS = [
//   "fullName",
//   "phoneNumber",
//   "rentalCompany",
//   "confirmationNumber",
//   "pickupDate",
//   "dropoffDate",
//   "pickupLocation",
//   "dropoffLocation",
//   "cardLast4",
//   "expiration",
//   "billingAddress",
//   "dateOfBirth",
//   "salesAgent"
// ];

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     // ✅ Auth check
//     const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
//     if (!token) return apiResponse({ error: "Unauthorized" }, 401);

//     const decoded = verifyToken(token);
//     if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
//       return apiResponse({ error: "Invalid token" }, 401);
//     }

//     const body = await req.json();
//     const { bookingId, customerType, refundAmount, mco, ...rest } = body;

//     let booking;

//     if (customerType === "existing" && bookingId) {
//       // Get the existing booking to check for changes
//       const existingBooking = await Booking.findById(bookingId);
      
//       if (!existingBooking) {
//         return apiResponse({ error: "Booking not found" }, 404);
//       }

//       console.log("existing =>", existingBooking)
//       console.log("mco =>", mco)

//       // Create a single timeline entry with all changes
//       const changes = [];
      
//       // Check if MCO has changed
//       if (existingBooking.mco !== mco) {
//         changes.push({
//           text: `MCO changed from $${existingBooking.mco} to $${mco}`
//         });
//       }
      
//       // Check if refund amount is being set (it was likely null before)
//       if (refundAmount && (!existingBooking.refundAmount || existingBooking.refundAmount !== refundAmount)) {
//         changes.push({
//           text: `Refund amount set to $${refundAmount}`
//         });
//       }
      
//       // Create a single timeline entry with all changes
//       const timelineEntry = {
//         date: new Date(),
//         message: `Cancellation processed by ${rest.salesAgent || "System"}`,
//         agentName: rest.salesAgent || "System",
//         agentId: decoded.id,
//         changes: changes
//       };

//       // Update existing booking
//       booking = await Booking.findByIdAndUpdate(
//         bookingId,
//         {
//           status: "CANCELLED",
//           refundAmount,
//           mco:mco,
//           updatedAt: new Date(),
//           // Add the single timeline entry
//           $push: { timeline: timelineEntry }
//         },
//         { new: true }
//       );
//     } else {
//       // ✅ Check required fields for new cancellations
//       const missing = REQUIRED_FIELDS.filter(
//         (field) => !rest[field] || rest[field].toString().trim() === ""
//       );

//       if (missing.length > 0) {
//         return apiResponse(
//           { error: `Missing required fields: ${missing.join(", ")}` },
//           400
//         );
//       }

//       // Create new cancellation with a single timeline entry
//       booking = new Booking({
//         ...rest,
//         status: "CANCELLED",
//         refundAmount,
//         mco,
//         agentId: decoded.id,
//         timeline: [{
//           date: new Date(),
//           message: "Cancellation requested",
//           agentName: rest.salesAgent || "Unknown Employee",
//           changes: [
//             {
//               text: "Reservation cancelled"
//             },
//             ...(mco ? [{ text: `Cancellation fee applied: $${mco}` }] : []),
//             ...(refundAmount ? [{ text: `Refund amount: $${refundAmount}` }] : [])
//           ]
//         }],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//       await booking.save();
//     }

//     if (!booking) {
//       return apiResponse({ error: "Booking not found" }, 404);
//     }

//     return apiResponse({ success: true, booking }, 200);
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ error: message }, 500);
//   }
// }





// src/app/api/bookings/cancel/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/app/models/Booking";
import logger from "@/lib/utils/logger";
import { verifyToken } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";

const REQUIRED_FIELDS = [
  "fullName",
  "phoneNumber",
  "rentalCompany",
  "confirmationNumber",
  "pickupDate",
  "dropoffDate",
  "pickupLocation",
  "dropoffLocation",
  "cardLast4",
  "expiration",
  "billingAddress",
  "dateOfBirth",
  "salesAgent",
];

export async function POST(req: NextRequest) {
  try {
    await connectDB();

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
      logger.warn("Unauthorized cancellation attempt: missing token");
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Unauthorized: authentication token missing",
        401
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string" || !("id" in decoded)) {
      logger.warn("Invalid token used for cancellation");
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Invalid or expired token",
        401
      );
    }

    const body = await req.json();
    const { bookingId, customerType, refundAmount, mco, ...rest } = body;

    let booking;

    // -----------------------------
    // Case 1: Existing booking cancellation/update
    // -----------------------------
    if (customerType === "existing" && bookingId) {
      const existingBooking = await Booking.findById(bookingId);

      if (!existingBooking) {
        logger.warn("Cancellation failed: booking not found", {
          bookingId,
          agentId: decoded.id,
        });

        return apiError(
          ErrorCode.NOT_FOUND,
          "Booking not found",
          404
        );
      }

      const changes: { text: string }[] = [];

      // MCO change
      if (typeof mco === "number" && existingBooking.mco !== mco) {
        changes.push({
          text: `MCO changed from $${existingBooking.mco} to $${mco}`,
        });
      }

      // Refund amount change
      if (
        typeof refundAmount === "number" &&
        (existingBooking.refundAmount == null ||
          existingBooking.refundAmount !== refundAmount)
      ) {
        changes.push({
          text: `Refund amount set to $${refundAmount}`,
        });
      }

      const timelineEntry = {
        date: new Date(),
        message: `Cancellation processed by ${rest.salesAgent || "System"}`,
        agentName: rest.salesAgent || "System",
        agentId: decoded.id,
        changes,
      };

      booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: "CANCELLED",
          refundAmount,
          mco,
          updatedAt: new Date(),
          $push: { timeline: timelineEntry },
        },
        { new: true }
      );

      logger.info("Existing booking cancelled/updated", {
        bookingId,
        agentId: decoded.id,
        refundAmount,
        mco,
        changesCount: changes.length,
      });
    } else {
      // -----------------------------
      // Case 2: New cancellation booking
      // -----------------------------
      const missing = REQUIRED_FIELDS.filter(
        (field) =>
          !rest[field] ||
          rest[field].toString().trim() === ""
      );

      if (missing.length > 0) {
        logger.warn("New cancellation booking failed: missing fields", {
          missing,
          agentId: decoded.id,
        });

        return apiError(
          ErrorCode.VALIDATION_ERROR,
          `Missing required fields: ${missing.join(", ")}`,
          400,
          { missingFields: missing }
        );
      }

      booking = new Booking({
        ...rest,
        status: "CANCELLED",
        refundAmount,
        mco,
        agentId: decoded.id,
        timeline: [
          {
            date: new Date(),
            message: "Cancellation requested",
            agentName: rest.salesAgent || "Unknown Employee",
            changes: [
              { text: "Reservation cancelled" },
              ...(mco
                ? [{ text: `Cancellation fee applied: $${mco}` }]
                : []),
              ...(refundAmount
                ? [{ text: `Refund amount: $${refundAmount}` }]
                : []),
            ],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await booking.save();

      logger.info("New cancellation booking created", {
        bookingId: booking._id.toString(),
        agentId: decoded.id,
        refundAmount,
        mco,
      });
    }

    if (!booking) {
      logger.error("Cancellation failed: booking instance not returned");
      return apiError(
        ErrorCode.NOT_FOUND,
        "Booking not found",
        404
      );
    }

    return apiSuccess(
      { booking },
      "Booking cancellation processed successfully",
      200
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    logger.error("Booking cancellation failed", { error: message });

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to process booking cancellation. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
