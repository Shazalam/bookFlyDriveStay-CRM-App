// import { connectDB } from "@/lib/db";
// import Booking from "@/app/models/Booking";
// import { verifyToken } from "@/lib/auth"; // ✅ auth check
// import { apiResponse } from "@/lib/utils/apiResponse";

// // ✅ GET all bookings (only for authenticated users)
// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     // ✅ Verify auth
//     const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
//     if (!token) return apiResponse({ error: "Unauthorized" }, 401);


//     const bookings = await Booking.find({isDeleted: false}).sort({ createdAt: -1 });
//     return apiResponse({ success: true, bookings });
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ error: message }, 500);
//   }
// }

// // ✅ Required fields for booking
// const REQUIRED_FIELDS = [
//   "fullName",
//   "email",
//   "phoneNumber",
//   "rentalCompany",
//   "cardLast4",
//   "expiration",
//   "billingAddress",
// ];

// // ✅ POST create new/new modification booking
// export async function POST(req: Request) {
//   try {
//     await connectDB();

//     // ✅ Auth check
//     const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
//     if (!token) return apiResponse({ error: "Unauthorized" }, 401);

//     const decoded = verifyToken(token);
//     if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
//       return apiResponse({ error: "Invalid token" }, 401);
//     }

//     const data = await req.json();

//     // ✅ Check required fields manually
//     const missing = REQUIRED_FIELDS.filter(
//       (field) => !data[field] || data[field].toString().trim() === ""
//     );

//     if (missing.length > 0) {
//       return apiResponse(
//         { error: `Missing required fields: ${missing.join(", ")}` },
//         400
//       );
//     }

//     // ✅ Normalize payload
//     const payload = {
//       fullName: data.fullName,
//       email: data.email,
//       phoneNumber: data.phoneNumber,
//       rentalCompany: data.rentalCompany,
//       confirmationNumber: data.confirmationNumber,
//       vehicleImage: data.vehicleImage || "",
//       total: data.total ? Number(data.total) : 0,
//       mco: data.mco ? Number(data.mco) : 0,
//       modificationFee: data.modificationFee || [], // Set modificationFee array
//       payableAtPickup: data.payableAtPickup ? Number(data.payableAtPickup) : 0,
//       pickupDate: data.pickupDate || "",
//       dropoffDate: data.dropoffDate || "",
//       pickupTime: data.pickupTime || "",
//       dropoffTime: data.dropoffTime || "",
//       pickupLocation: data.pickupLocation || "",
//       dropoffLocation: data.dropoffLocation || "",
//       cardLast4: data.cardLast4,
//       expiration: data.expiration,
//       billingAddress: data.billingAddress,
//       dateOfBirth: data.dateOfBirth,
//       salesAgent: decoded.name || "Unknown Agent",
//       agentId: decoded.id,
//       status: data.status || "BOOKED",
//       isDeleted: false, // ✅ ensure stored as false
//       // Add initial timeline entry for new booking
//       timeline: Array.isArray(data.timeline) && data.timeline.length > 0
//         ? data.timeline
//         : [
//           {
//             date: new Date().toISOString(),
//             agentName: decoded.name || "",
//             message: "New booking created",
//             changes: [],
//           }
//         ],
//     };
    
//     const bookingData = new Booking(payload)

//     // ✅ Save booking
//     const booking = await bookingData.save();
    
//     return apiResponse({ success: true, booking }, 201);

//     // ✅ Save booking
//     // const booking = await Booking.create(payload);
//     // console.log("booking deleted =>", booking)
//     // return apiResponse({ success: true, booking }, 201);
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ success: false, error: message }, 500);
//   }
// }






import { connectDB } from "@/lib/db";
import Booking from "@/app/models/Booking";
import { verifyToken } from "@/lib/auth"; // ✅ auth check
import logger from "@/lib/utils/logger";
import { apiError, apiSuccess, ErrorCode } from "@/lib/utils/apiResponse";

// ✅ GET all bookings (only for authenticated users)
export async function GET(req: Request) {
  try {
    await connectDB();

    // -----------------------------
    // Auth: Extract token from cookie
    // -----------------------------
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("token=")[1];

    if (!token) {
      logger.warn("Unauthorized bookings fetch attempt: missing token");
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Unauthorized: authentication token missing",
        401
      );
    }

    // If you have a verifyToken/verifyAuth helper, call it here to decode and validate the token.
    // const user = verifyToken(token);
    // if (!user) { ... }

    logger.info("Fetching bookings for authenticated user", {
      // userId: user.id,  // if you decode token
    });

    // -----------------------------
    // Fetch non-deleted bookings
    // -----------------------------
    const bookings = await Booking.find({ isDeleted: false }).sort({
      createdAt: -1,
    });

    logger.info("Bookings fetched successfully", {
      count: bookings.length,
    });

    return apiSuccess(
      {
        bookings,
      },
      "Bookings fetched successfully",
      200
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    logger.error("Failed to fetch bookings", { error: message });

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to fetch bookings. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}





// ✅ Required fields for booking
// ✅ Required fields for booking
const REQUIRED_FIELDS = [
  "fullName",
  "email",
  "phoneNumber",
  "rentalCompany",
  "cardLast4",
  "expiration",
  "billingAddress",
];

// ✅ POST create new / modification booking
export async function POST(req: Request) {
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
      logger.warn("Unauthorized booking creation attempt: missing token");
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Unauthorized: authentication token missing",
        401
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string" || !("id" in decoded)) {
      logger.warn("Invalid token used for booking creation");
      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Invalid or expired token",
        401
      );
    }

    const data = await req.json();

    // -----------------------------
    // Required fields check
    // -----------------------------
    const missing = REQUIRED_FIELDS.filter(
      (field) => !data[field] || data[field].toString().trim() === ""
    );

    if (missing.length > 0) {
      logger.warn("Booking creation failed: missing required fields", {
        missing,
        agentId: decoded.id,
        agentName: decoded.name,
      });

      return apiError(
        ErrorCode.VALIDATION_ERROR,
        `Missing required fields: ${missing.join(", ")}`,
        400,
        { missingFields: missing }
      );
    }

    // -----------------------------
    // Normalize payload
    // -----------------------------
    const payload = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      rentalCompany: data.rentalCompany,
      confirmationNumber: data.confirmationNumber,
      vehicleImage: data.vehicleImage || "",
      total: data.total ? Number(data.total) : 0,
      mco: data.mco ? Number(data.mco) : 0,
      modificationFee: Array.isArray(data.modificationFee)
        ? data.modificationFee
        : [],
      payableAtPickup: data.payableAtPickup
        ? Number(data.payableAtPickup)
        : 0,
      pickupDate: data.pickupDate || "",
      dropoffDate: data.dropoffDate || "",
      pickupTime: data.pickupTime || "",
      dropoffTime: data.dropoffTime || "",
      pickupLocation: data.pickupLocation || "",
      dropoffLocation: data.dropoffLocation || "",
      cardLast4: data.cardLast4,
      expiration: data.expiration,
      billingAddress: data.billingAddress,
      dateOfBirth: data.dateOfBirth,
      salesAgent: decoded.name || "Unknown Agent",
      agentId: decoded.id,
      status: data.status || "BOOKED",
      isDeleted: false,
      timeline:
        Array.isArray(data.timeline) && data.timeline.length > 0
          ? data.timeline
          : [
              {
                date: new Date().toISOString(),
                agentName: decoded.name || "",
                message: "New booking created",
                changes: [],
              },
            ],
    };

    // -----------------------------
    // Save booking
    // -----------------------------
    const booking = await new Booking(payload).save();

    logger.info("Booking created successfully", {
      bookingId: booking._id.toString(),
      agentId: decoded.id,
      agentName: decoded.name,
      email: booking.email,
      status: booking.status,
    });

    return apiSuccess(
      {
        booking,
      },
      "Booking created successfully",
      201
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    logger.error("Booking creation failed", { error: message });

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to create booking. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}