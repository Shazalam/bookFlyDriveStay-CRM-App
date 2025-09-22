// components/BookingFormWrapper.jsx
"use client";

import { useSearchParams } from "next/navigation";
import NewCustomerBookingForm from "./NewCustomerBookingForm";
import ExistingCustomerBookingForm from "./ExistingCustomerBookingForm";

export default function BookingFormWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return id ? <ExistingCustomerBookingForm id={id} /> : <NewCustomerBookingForm id={id}/>;
}