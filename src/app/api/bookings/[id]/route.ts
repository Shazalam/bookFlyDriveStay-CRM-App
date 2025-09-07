import { connectDB } from "@/lib/db";
import { sendEmail } from "@/lib/email/sendEmail";
import { modificationTemplate } from "@/lib/email/templates/modification";
import { cancellationTemplate } from "@/lib/email/templates/cancellation";
import Booking from "@/app/models/Booking";
import { apiResponse } from "@/lib/utils/apiResponse";
import { NextRequest } from "next/server";

// ✅ GET /api/bookings/:id
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ params is a Promise
    const booking = await Booking.findById(id);

    if (!booking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    return apiResponse({ success: true, booking });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}

// ✅ PUT /api/bookings/:id
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ params is a Promise
    const data = await req.json();

    const booking = await Booking.findByIdAndUpdate(id, data, { new: true });
    if (!booking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    // Non-blocking email
    sendEmail(booking.email, "Booking Updated", modificationTemplate(booking))
      .catch((err) => console.error("Email send error (update):", err));

    return apiResponse({ success: true, booking }, 200);
  } catch (err: unknown) {
    console.error("GET /bookings error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}

// ✅ DELETE /api/bookings/:id
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; // ✅ params is a Promise
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "CANCELLED" },
      { new: true }
    );

    if (!booking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    // Non-blocking email
    sendEmail(booking.email, "Booking Cancelled", cancellationTemplate(booking))
      .catch((err) => console.error("Email send error (cancel):", err));

    return apiResponse({ success: true, booking }, 200);
  } catch (err: unknown) {
    console.error("GET /bookings error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}
