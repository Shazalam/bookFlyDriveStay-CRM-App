import { connectDB } from "@/lib/db";
import { sendEmail } from "@/lib/email/sendEmail";
import { cancellationTemplate } from "@/lib/email/templates/cancellation";
import Booking from "@/app/models/Booking";
import { apiResponse } from "@/lib/utils/apiResponse";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

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
export async function PUT(req: Request) {
  try {
    await connectDB();

    // ✅ Auth check
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return apiResponse({ error: "Unauthorized" }, 401);

    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return apiResponse({ error: "Invalid token" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return apiResponse({ error: "Booking ID required" }, 400);

    const data = await req.json();
    
    // Get the existing booking
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    // Define the timeline event interface
    interface TimelineEvent {
      date: string;
      message: string;
    }

    // Compare fields to create timeline entries with proper typing
    const timelineUpdates: TimelineEvent[] = [];
    const updatedFields: Record<string, any> = {};

    // List of fields to check for changes
    const fieldsToCheck = [
      "fullName", "email", "phoneNumber", "rentalCompany", "confirmationNumber",
      "vehicleImage", "total", "mco", "payableAtPickup", "pickupDate", "dropoffDate",
      "pickupTime", "dropoffTime", "pickupLocation", "dropoffLocation", "cardLast4",
      "expiration", "billingAddress", "status"
    ];

    fieldsToCheck.forEach(field => {
      if (data[field] !== undefined && data[field] !== existingBooking[field]) {
        // Add to timeline if field has changed
        timelineUpdates.push({
          date: new Date().toISOString(),
          message: `${field} updated from "${existingBooking[field]}" to "${data[field]}"`
        });
        
        // Add to updated fields
        updatedFields[field] = data[field];
      }
    });

    // Add notes if provided
    if (data.notes && Array.isArray(data.notes)) {
      updatedFields.notes = data.notes;
    }

    // Prepare the update payload - use MongoDB operators properly
    const updatePayload: Record<string, any> = {};
    
    // Add field updates
    if (Object.keys(updatedFields).length > 0) {
      updatePayload.$set = updatedFields;
    }
    
    // Add timeline updates
    if (timelineUpdates.length > 0) {
      updatePayload.$push = {
        timeline: { $each: timelineUpdates }
      };
    }

    // If no changes, return the existing booking
    if (Object.keys(updatePayload).length === 0) {
      return apiResponse({ success: true, booking: existingBooking }, 200);
    }

    // ✅ Update booking
    const booking = await Booking.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    );

    console.log("✅ Booking Updated:", booking);

    return apiResponse({ success: true, booking }, 200);
  } catch (err: unknown) {
    console.error("PUT /bookings error:", err); 
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
