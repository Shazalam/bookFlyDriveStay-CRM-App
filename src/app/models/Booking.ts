import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBooking extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  rentalCompany: string;
  confirmationNumber: string;
  vehicleImage: string;
  total: string;
  mco: string;
  payableAtPickup: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  cardLast4: string;
  expiration: string;
  billingAddress: string;
  dateOfBirth: string;
  salesAgent: string;
  agentId: Types.ObjectId;  // 🔑 reference
  status: "BOOKED" | "MODIFIED" | "CANCELLED";
  // Add timeline field
  timeline: {
    date: string;
    message: string;
    changes: {
      text: string;
    }[];
  }[];
  // Add notes field
  notes: {
    text: string;
    createdAt: Date;
    createdBy: Types.ObjectId;
  }[];
}

const BookingSchema = new Schema<IBooking>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    rentalCompany: { type: String, required: true },
    vehicleImage: { type: String, default: "" }, // ✅ ensure it always saves
    confirmationNumber: { type: String, required: true },
    total: { type: String },
    mco: { type: String, required: true },
    payableAtPickup: { type: String },
    pickupDate: { type: String },
    dropoffDate: { type: String },
    pickupTime: { type: String },
    dropoffTime: { type: String },
    pickupLocation: { type: String },
    dropoffLocation: { type: String },
    cardLast4: { type: String, required: true },
    expiration: { type: String, required: true },
    billingAddress: { type: String, required: true },
    dateOfBirth: { type: String, default: "" },
    salesAgent: { type: String, required: true },
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true }, // 🔑 reference
    status: { type: String, enum: ["BOOKED", "MODIFIED", "CANCELLED"], default: "BOOKED" },
    // Add timeline field (mandatory)
    // Updated timeline field
    timeline: {
      type: [
        {
          date: { type: String, required: true },
          message: { type: String, required: true },
          changes: [
            {
              text: { type: String, required: true }
            }
          ]
        }
      ],
      required: true,
      default: []
    },
    // Add notes field (optional)
    notes: {
      type: [
        {
          text: {
            type: String,
            required: true
          },
          createdAt: {
            type: Date,
            default: Date.now
          },
          createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Agent"
          }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
