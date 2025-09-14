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
// export async function PUT(req: Request) {
//   try {
//     await connectDB();

//     // ✅ Auth check
//     const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
//     if (!token) return apiResponse({ error: "Unauthorized" }, 401);

//     const decoded = verifyToken(token);
//     if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
//       return apiResponse({ error: "Invalid token" }, 401);
//     }

//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//       console.log("chagne id =>", id)
//     if (!id) return apiResponse({ error: "Booking ID required" }, 400);

//     const data = await req.json();

//     // Get the existing booking
//     const existingBooking = await Booking.findById(id);
//     if (!existingBooking) {
//       return apiResponse({ error: "Booking not found" }, 404);
//     }

//     // Define the timeline event interface
//     interface TimelineEvent {
//       date: string;
//       message: string;
//     }

//     // Compare fields to create timeline entries with proper typing
//     const timelineUpdates: TimelineEvent[] = [];
//     const updatedFields: Record<string, any> = {};

//     // List of fields to check for message
//     const fieldsToCheck = [
//       "fullName", "email", "phoneNumber", "rentalCompany", "confirmationNumber",
//       "vehicleImage", "total", "mco", "payableAtPickup", "pickupDate", "dropoffDate",
//       "pickupTime", "dropoffTime", "pickupLocation", "dropoffLocation", "cardLast4",
//       "expiration", "billingAddress", "status"
//     ];

//     fieldsToCheck.forEach(field => {
//       if (data[field] !== undefined && data[field] !== existingBooking[field]) {
//         // Add to timeline if field has changed
//         timelineUpdates.push({
//           date: new Date().toISOString(),
//           message: `${field} updated from "${existingBooking[field]}" to "${data[field]}"`
//         });

//         // Add to updated fields
//         updatedFields[field] = data[field];
//       }
//     });

//     // Add notes if provided
//     if (data.notes && Array.isArray(data.notes)) {
//       updatedFields.notes = data.notes;
//     }

//     // Prepare the update payload - use MongoDB operators properly
//     const updatePayload: Record<string, any> = {};

//     // Add field updates
//     if (Object.keys(updatedFields).length > 0) {
//       updatePayload.$set = updatedFields;
//     }

//     // Add timeline updates
//     if (timelineUpdates.length > 0) {
//       updatePayload.$push = {
//         timeline: { $each: timelineUpdates }
//       };
//     }

//     // If no message, return the existing booking
//     if (Object.keys(updatePayload).length === 0) {
//       return apiResponse({ success: true, booking: existingBooking }, 200);
//     }

//     // ✅ Update booking
//     const booking = await Booking.findByIdAndUpdate(
//       id,
//       updatePayload,
//       { new: true }
//     );

//     console.log("✅ Booking Updated:", booking);

//     return apiResponse({ success: true, booking }, 200);
//   } catch (err: unknown) {
//     console.error("PUT /bookings error:", err); 
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ error: message }, 500);
//   }
// }

// ✅ PUT update booking
// export async function PUT(req: Request) {
//   try {
//     await connectDB();

//     // ✅ Auth check
//     const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
//     if (!token) return apiResponse({ error: "Unauthorized" }, 401);

//     const decoded = verifyToken(token);
//     if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
//       return apiResponse({ error: "Invalid token" }, 401);
//     }

//     const { searchParams } = new URL(req.url);

//     const id = searchParams.get("id");
//     console.log("message in booking id=>", id)
//     if (!id) return apiResponse({ error: "Booking ID required" }, 400);

//     const data = await req.json();

//     // Get the existing booking
//     const existingBooking = await Booking.findById(id);
//     if (!existingBooking) {
//       return apiResponse({ error: "Booking not found" }, 404);
//     }

//     // Compare fields to create timeline entries
//     const timelineUpdates = [];
//     const updatedFields = {};

//     // List of fields to check for message
//     const fieldsToCheck = [
//       "fullName", "email", "phoneNumber", "rentalCompany", "confirmationNumber",
//       "vehicleImage", "total", "mco", "payableAtPickup", "pickupDate", "dropoffDate",
//       "pickupTime", "dropoffTime", "pickupLocation", "dropoffLocation", "cardLast4",
//       "expiration", "billingAddress", "status"
//     ];

//     fieldsToCheck.forEach(field => {
//       const newValue = data[field];
//       const oldValue = existingBooking[field];

//       // Handle special cases for number fields
//       if (field === "total" || field === "mco" || field === "payableAtPickup") {
//         const numNewValue = newValue ? Number(newValue) : 0;
//         const numOldValue = oldValue ? Number(oldValue) : 0;

//         if (numNewValue !== numOldValue) {
//           timelineUpdates.push({
//             date: new Date().toISOString(),
//             message: `${field} updated from ${numOldValue} to ${numNewValue}`
//           });
//           updatedFields[field] = numNewValue;
//         }
//       }
//       // Handle date comparisons
//       else if (field === "pickupDate" || field === "dropoffDate") {
//         const formattedNewValue = newValue || "";
//         const formattedOldValue = oldValue || "";

//         if (formattedNewValue !== formattedOldValue) {
//           timelineUpdates.push({
//             date: new Date().toISOString(),
//             message: `${field} updated from ${formattedOldValue} to ${formattedNewValue}`
//           });
//           updatedFields[field] = formattedNewValue;
//         }
//       }
//       // Handle all other fields
//       else if (newValue !== undefined && newValue !== oldValue) {
//         timelineUpdates.push({
//           date: new Date().toISOString(),
//           message: `${field} updated from "${oldValue}" to "${newValue}"`
//         });
//         updatedFields[field] = newValue;
//       }
//     });

//     // Prepare the update payload
//     const updatePayload = {
//       ...updatedFields,
//       // Add timeline updates to existing timeline
//       $push: {
//         timeline: { $each: timelineUpdates }
//       }
//     };

//     // ✅ Update booking
//     const booking = await Booking.findByIdAndUpdate(
//       id,
//       updatePayload,
//       { new: true }
//     );

//     console.log("✅ Booking Updated:", booking);

//     return apiResponse({ success: true, booking }, 200);
//   } catch (err: unknown) {
//     console.error("PUT /bookings error:", err);
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ error: message }, 500);
//   }
// }

// ✅ PUT update booking
// export async function PUT(req: Request) {
//   try {
//     await connectDB();

//     // ✅ Auth check
//     const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
//     if (!token) return apiResponse({ error: "Unauthorized" }, 401);

//     const decoded = verifyToken(token);
//     if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
//       return apiResponse({ error: "Invalid token" }, 401);
//     }

//     // ✅ Get ID from pathname instead of searchParams
//     const pathParts = new URL(req.url).pathname.split("/");
//     console.log("pathname =>", pathParts)

//     const id = pathParts[pathParts.length - 1];
//     console.log("message in booking id =====>", id);

//     if (!id) return apiResponse({ error: "Booking ID required" }, 400);

//     const data = await req.json();

//     // Get the existing booking
//     const existingBooking = await Booking.findById(id);
//     if (!existingBooking) {
//       return apiResponse({ error: "Booking not found" }, 404);
//     }

//     // Compare fields to create timeline entries
//     const message: { text: string }[] = [];
//     const updatedFields = {};

//     // List of fields to check for message
//     const fieldsToCheck = [
//       "fullName", "email", "phoneNumber", "rentalCompany", "confirmationNumber",
//       "vehicleImage", "total", "mco", "payableAtPickup", "pickupDate", "dropoffDate",
//       "pickupTime", "dropoffTime", "pickupLocation", "dropoffLocation", "cardLast4",
//       "expiration", "billingAddress", "status"
//     ];

//     fieldsToCheck.forEach(field => {
//       const newValue = data[field];
//       const oldValue = existingBooking[field];

//       // Handle special cases for number fields
//       if (field === "total" || field === "mco" || field === "payableAtPickup") {
//         const numNewValue = newValue ? Number(newValue) : 0;
//         const numOldValue = oldValue ? Number(oldValue) : 0;

//         if (numNewValue !== numOldValue) {
//           message.push({
//             text: `${field} updated from ${numOldValue} to ${numNewValue}`
//           });
//           updatedFields[field] = numNewValue;
//         }
//       }
//       // Handle date comparisons
//       else if (field === "pickupDate" || field === "dropoffDate") {
//         const formattedNewValue = newValue || "";
//         const formattedOldValue = oldValue || "";

//         if (formattedNewValue !== formattedOldValue) {
//           message.push({
//             text: `${field} updated from ${formattedOldValue} to ${formattedNewValue}`
//           });
//           updatedFields[field] = formattedNewValue;
//         }
//       }
//       // Handle all other fields
//       else if (newValue !== undefined && newValue !== oldValue) {
//         message.push({
//           text: `${field} updated from "${oldValue}" to "${newValue}"`
//         });
//         updatedFields[field] = newValue;
//       }
//     });

//     console.log("message timeline updatedFields =>",updatedFields )
//     console.log("message timeline message =>",message )

//     // Prepare the update payload
//     const updatePayload: any = {
//       ...updatedFields
//     };

//     // Add a single timeline entry if there are message
//     if (message.length > 0) {
//       updatePayload.$push = {
//         timeline: {
//           date: new Date().toISOString(),
//           message: message // This now contains an array of objects with text properties
//         }
//       };
//     }

//     // ✅ Update booking
//     const booking = await Booking.findByIdAndUpdate(
//       id,
//       updatePayload,
//       { new: true }
//     );
//     console.log("✅ Booking Updated:", booking);

//     return apiResponse({ success: true, booking }, 200);
//   } catch (err: unknown) {
//     console.error("PUT /bookings error:", err);
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ error: message }, 500);
//   }
// }



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

    // Get the existing booking
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    // Track all changes for a single timeline entry
    const changes: { text: string }[] = [];
    const updatedFields: Record<string, any> = {};

    // List of fields to check for changes
    const fieldsToCheck = [
      "fullName", "email", "phoneNumber", "rentalCompany", "confirmationNumber",
      "vehicleImage", "total", "mco", "payableAtPickup", "pickupDate", "dropoffDate",
      "pickupTime", "dropoffTime", "pickupLocation", "dropoffLocation", "cardLast4",
      "expiration", "billingAddress", "status"
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

    console.log("changes =>", changes);

    // Prepare the update payload
    const updatePayload: any = {
      ...updatedFields
    };

    // Add a single timeline entry if there are changes
    if (changes.length > 0) {
      // Create the timeline entry with proper structure
      const timelineEntry = {
        date: new Date().toISOString(),
        message: data?.status === "BOOKED" ? `New Booking Created - Updated ${changes.length} field(s)` : `Updated ${changes.length} field(s)`,
        changes: changes
      };

      if (data?.status === "BOOKED") {
        updatePayload.timeline = timelineEntry
      }
      else {
        // Use $push to add the timeline entry
        updatePayload.$push = {
          timeline: timelineEntry
        };
      }
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
