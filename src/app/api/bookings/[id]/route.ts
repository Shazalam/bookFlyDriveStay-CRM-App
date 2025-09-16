import { connectDB } from "@/lib/db";
import { sendEmail } from "@/lib/email/sendEmail";
import { cancellationTemplate } from "@/lib/email/templates/cancellation";
import Booking from "@/app/models/Booking";
import { apiResponse } from "@/lib/utils/apiResponse";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

// Define interfaces for type safety
interface TimelineChange {
  text: string;
}

interface TimelineEntry {
  date: string;
  message: string;
  agentName: string;
  changes: TimelineChange[];
}

interface BookingUpdateFields {
  [key: string]: string | number;
}

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

    // ✅ Get ID from pathname
    const pathParts = new URL(req.url).pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) return apiResponse({ error: "Booking ID required" }, 400);

    const data = await req.json();

    console.log("data ====>", data)
    // Get the existing booking
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    // Track all changes for a single timeline entry
    const changes: TimelineChange[] = [];
    const updatedFields: BookingUpdateFields = {};

    // Handle modification fees if they are provided
    if (data.modificationFee && Array.isArray(data.modificationFee)) {
      updatedFields.modificationFee = data.modificationFee;
      console.log("modification Fee =>", updatedFields.modificationFee)
      // Get the last modification fee
      const lastFee = data.modificationFee[data.modificationFee.length - 1];
      // Add to timeline if modification fees changed
      if (JSON.stringify(existingBooking.modificationFee) !== JSON.stringify(data.modificationFee)) {
        changes.push({
          text: `Modification fee added: $${lastFee.charge}`,
        });
      }
    }
    // List of fields to check for changes
    const fieldsToCheck = [
      "fullName", "email", "phoneNumber", "rentalCompany", "confirmationNumber",
      "vehicleImage", "total", "mco", "payableAtPickup", "pickupDate", "dropoffDate",
      "pickupTime", "dropoffTime", "pickupLocation", "dropoffLocation", "cardLast4",
      "expiration", "billingAddress", "status", "dateOfBirth"
    ];

    fieldsToCheck.forEach(field => {
      const newValue = data[field];
      const oldValue = existingBooking[field];

      // Handle special cases for number fields
      if (field === "total" || field === "mco" || field === "payableAtPickup") {
        const numNewValue = newValue ? Number(newValue) : 0;
        const numOldValue = oldValue ? Number(oldValue) : 0;

        if (numNewValue !== numOldValue) {
          changes.push({
            text: `${field} updated from ${numOldValue} to ${numNewValue}`
          });
          updatedFields[field] = numNewValue;
        }
      }

      // Handle date comparisons
      else if (field === "pickupDate" || field === "dropoffDate") {
        const formattedNewValue = newValue || "";
        const formattedOldValue = oldValue || "";

        if (formattedNewValue !== formattedOldValue) {
          changes.push({
            text: `${field} updated from ${formattedOldValue} to ${formattedNewValue}`
          });
          updatedFields[field] = formattedNewValue;
        }
      }

      // Handle all other fields
      else if (newValue !== undefined && newValue !== oldValue) {
        changes.push({
          text: `${field} updated from "${oldValue}" to "${newValue}"`
        });
        updatedFields[field] = newValue;
      }
    });

    // Prepare the update payload
    const updatePayload: Record<string, unknown> = {
      ...updatedFields
    };

    // Add a single timeline entry if there are changes
    if (changes.length > 0) {
      // Create the timeline entry with proper structure
      const timelineEntry: TimelineEntry = {
        date: new Date().toISOString(),
        message: `Updated ${changes.length} field(s)`,
        agentName: data?.salesAgent || "",
        changes: changes
      };

      // Use $push to add the timeline entry
      updatePayload.$push = {
        timeline: timelineEntry
      };

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