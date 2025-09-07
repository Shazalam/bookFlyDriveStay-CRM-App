import { connectDB } from "@/lib/db";
import { sendEmail } from "@/lib/email/sendEmail";
import { modificationTemplate } from "@/lib/email/templates/modification";
import { cancellationTemplate } from "@/lib/email/templates/cancellation";
import Booking from "@/app/models/Booking";
import { apiResponse } from "@/lib/utils/apiResponse";

// ✅ GET /api/bookings/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    return apiResponse({ success: true, booking }, 200);
  } catch (err: unknown) {
    console.error("GET /bookings error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}

// ✅ PUT /api/bookings/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await req.json();

    const booking = await Booking.findByIdAndUpdate(params.id, data, { new: true });
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
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const booking = await Booking.findByIdAndUpdate(
      params.id,
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
