import { connectDB } from "@/lib/db";
import Booking from "@/app/models/Booking";
import { verifyToken } from "@/lib/auth"; // ✅ auth check
import { apiResponse } from "@/lib/utils/apiResponse";

// ✅ GET all bookings (only for authenticated users)
export async function GET(req: Request) {
  try {
    await connectDB();

    // ✅ Verify auth
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return apiResponse({ error: "Unauthorized" }, 401);


    const bookings = await Booking.find().sort({ createdAt: -1 });
    return apiResponse({ success: true, bookings });
  } catch (err: unknown) {
    console.error("GET /bookings error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}

// ✅ Required fields for booking
const REQUIRED_FIELDS = [
  "fullName",
  "email",
  "phoneNumber",
  "rentalCompany",
  "mco",
  "cardLast4",
  "expiration",
  "billingAddress",
];

// ✅ POST create booking

export async function POST(req: Request) {
  try {
    await connectDB();

    // ✅ Auth check
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return apiResponse({ error: "Unauthorized" }, 401);

    const decoded = verifyToken(token);

    const data = await req.json();

    // ✅ Check required fields manually
    const missing = REQUIRED_FIELDS.filter((field) => !data[field] || data[field].toString().trim() === "");
    if (missing.length > 0) {
      return apiResponse(
        { error: `Missing required fields: ${missing.join(", ")}` },
        400
      );
    }

    // ✅ Save booking (salesAgent enforced from token)
    const booking = await Booking.create({
      ...data,
      agentId: decoded?.id,
    });

    // ✅ Send email (async, non-blocking)
    // sendEmail(
    //   booking.email,
    //   "Booking Confirmation",
    //   bookingTemplate(booking)
    // ).catch((err) => console.error("Email error:", err));

    return apiResponse({ success: true, booking }, 201);
  }  catch (err: unknown) {
    console.error("GET /bookings error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}