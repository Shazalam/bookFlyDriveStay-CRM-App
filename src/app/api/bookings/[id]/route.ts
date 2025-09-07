import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendEmail } from "@/lib/email/sendEmail";
import { modificationTemplate } from "@/lib/email/templates/modification";
import { cancellationTemplate } from "@/lib/email/templates/cancellation";
import Booking from "@/app/models/Booking";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const booking = await Booking.findById(params.id);
  return NextResponse.json({ booking });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const data = await req.json();
  const booking = await Booking.findByIdAndUpdate(params.id, data, { new: true });
  await sendEmail(booking.email, "Booking Updated", modificationTemplate(booking));
  return NextResponse.json({ success: true, booking });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const booking = await Booking.findByIdAndUpdate(params.id, { status: "CANCELLED" }, { new: true });
  await sendEmail(booking.email, "Booking Cancelled", cancellationTemplate(booking));
  return NextResponse.json({ success: true, booking });
}
