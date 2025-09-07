import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  rentalCompany: string;
  vehicleType: string;
  vehicleCategory: string;
  total: number;
  mco: number;
  payableAtPickup: number;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  cardLast4: string;
  expiration: string;
  billingAddress: string;
  salesAgent: string;
  agentId: String, // 🔑 reference
  status: "BOOKED" | "MODIFIED" | "CANCELLED";
}

const BookingSchema = new Schema<IBooking>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    rentalCompany: { type: String, required: true },
    vehicleType: { type: String },
    vehicleCategory: { type: String },
    total: { type: Number },
    mco: { type: Number, required: true },
    payableAtPickup: { type: Number },
    pickupDate: { type: String },
    dropoffDate: { type: String },
    pickupTime: { type: String },
    dropoffTime: { type: String },
    pickupLocation: { type: String },
    dropoffLocation: { type: String },
    cardLast4: { type: String, required: true },
    expiration: { type: String, required: true },
    billingAddress: { type: String, required: true },
    salesAgent: { type: String, required: true },
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true }, // 🔑 reference
    status: { type: String, enum: ["BOOKED", "MODIFIED", "CANCELLED"], default: "BOOKED" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
