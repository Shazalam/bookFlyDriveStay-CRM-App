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
    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return apiResponse({ error: "Invalid token" }, 401);
    }

    const data = await req.json();
    console.log("📥 Incoming Booking Data =>", data);

    // ✅ Check required fields manually
    const missing = REQUIRED_FIELDS.filter(
      (field) => !data[field] || data[field].toString().trim() === ""
    );
    if (missing.length > 0) {
      return apiResponse(
        { error: `Missing required fields: ${missing.join(", ")}` },
        400
      );
    }

    // ✅ Normalize payload
    const payload = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      rentalCompany: data.rentalCompany,
      confirmationNumber: data.confirmationNumber,
      vehicleImage: data.vehicleImage || "", // ensure empty string if not provided
      total: data.total ? Number(data.total) : 0,
      mco: data.mco ? Number(data.mco) : 0,
      payableAtPickup: data.payableAtPickup ? Number(data.payableAtPickup) : 0,
      pickupDate: data.pickupDate || "",
      dropoffDate: data.dropoffDate || "",
      pickupTime: data.pickupTime || "",
      dropoffTime: data.dropoffTime || "",
      pickupLocation: data.pickupLocation || "",
      dropoffLocation: data.dropoffLocation || "",
      cardLast4: data.cardLast4,
      expiration: data.expiration,
      billingAddress: data.billingAddress,
      salesAgent: data.salesAgent || "Unknown Agent",
      agentId: decoded.id, // from token
      status: data.status || "BOOKED",
      // Add initial timeline entry for new booking
      timeline: [
        {
          date: new Date().toISOString(),
          message: "New booking created"
        }
      ]
    };

    // ✅ Save booking
    const booking = await Booking.create(payload);
    console.log("✅ Booking Saved:", booking);

    return apiResponse({ success: true, booking }, 201);
  } catch (err: unknown) {
    console.error("POST /bookings error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}