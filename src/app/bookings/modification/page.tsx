"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import InputField from "@/components/InputField";
import VehicleSelector from "@/components/VehicleSelector";
import LoadingButton from "@/components/LoadingButton";
import TimePicker from "@/components/TimePicker";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearBooking, fetchBookingById } from "@/app/store/slices/bookingSlice";

interface Booking {
  _id: string;
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
  salesAgent: string;
  dateOfBirth?: string; // Make dateOfBirth optional
}

const editableGroups = {
  Customer: ["fullName"],
  Vehicle: ["vehicleImage"],
  "Locations & Dates": [
    "pickupLocation",
    "dropoffLocation",
    "pickupDate",
    "dropoffDate",
    "pickupTime",
    "dropoffTime",
  ],
  "Payment Info": [
    "total",
    "mco",
    "payableAtPickup",
    "cardLast4",
    "expiration",
    "billingAddress",
  ],
};

// Create an empty form template
const emptyForm: Booking = {
  _id: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  rentalCompany: "",
  confirmationNumber: "",
  vehicleImage: "",
  total: "",
  mco: "",
  payableAtPickup: "",
  pickupDate: "",
  dropoffDate: "",
  pickupTime: "",
  dropoffTime: "",
  pickupLocation: "",
  dropoffLocation: "",
  cardLast4: "",
  expiration: "",
  billingAddress: "",
  salesAgent: "",
  dateOfBirth: "",
};

export default function ModifyBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Use useSearchParams instead of useParams
  const id = searchParams.get("id"); // Get the id from query parameters
  console.log("modification param =>", id);

  const dispatch = useAppDispatch();
  const { currentBooking, loading, error } = useAppSelector((state) => state.booking);

    // Initialize form with empty values
  const [form, setForm] = useState<Booking>(emptyForm);
  
  // Reset editable state when id changes
  const [editable, setEditable] = useState<Record<string, boolean>>(() =>
    Object.values(editableGroups)
      .flat()
      .reduce((acc, field) => ({ ...acc, [field]: false }), {})
  );

// Fetch booking data when component mounts or id changes
  useEffect(() => {
    if (id) {
      dispatch(fetchBookingById(id))
        .unwrap()
        .catch((err) => toast.error(err.message || "Failed to fetch booking"));
    } else {
      console.log("Clear Booking");
      dispatch(clearBooking());
      // Reset form to empty when no ID is present
      setForm(emptyForm);
      // Reset editable state
      setEditable(
        Object.values(editableGroups)
          .flat()
          .reduce((acc, field) => ({ ...acc, [field]: false }), {})
      );
    }
  }, [id, dispatch]);

  
  // Update form when booking data is available
  useEffect(() => {
    if (currentBooking && id) {
      setForm({
        _id: currentBooking._id || "",
        fullName: currentBooking.fullName || "",
        email: currentBooking.email || "",
        phoneNumber: currentBooking.phoneNumber || "",
        rentalCompany: currentBooking.rentalCompany || "",
        confirmationNumber: currentBooking.confirmationNumber || "",
        vehicleImage: currentBooking.vehicleImage || "",
        total: currentBooking.total?.toString() || "",
        mco: currentBooking.mco?.toString() || "",
        payableAtPickup: currentBooking.payableAtPickup?.toString() || "",
        pickupDate: currentBooking.pickupDate || "",
        dropoffDate: currentBooking.dropoffDate || "",
        pickupTime: currentBooking.pickupTime || "",
        dropoffTime: currentBooking.dropoffTime || "",
        pickupLocation: currentBooking.pickupLocation || "",
        dropoffLocation: currentBooking.dropoffLocation || "",
        cardLast4: currentBooking.cardLast4 || "",
        expiration: currentBooking.expiration || "",
        billingAddress: currentBooking.billingAddress || "",
        salesAgent: currentBooking.salesAgent || "",
        dateOfBirth: (currentBooking as any).dateOfBirth || "",
      });
    } else if (!id) {
      // Ensure form is empty when no ID is present
      setForm(emptyForm);
    }
  }, [currentBooking, id]);

  // Reset form when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearBooking());
    };
  }, [dispatch]);


  const allFields = Object.values(editableGroups).flat();
  const allSelected = allFields.every((f) => editable[f]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as Booking));
  };

  const toggleField = (field: string) => {
    setEditable((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleAll = () => {
    const newValue = !allSelected;
    const updated = allFields.reduce(
      (acc, f) => ({ ...acc, [f]: newValue }),
      {}
    );
    setEditable(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsToUpdate: Partial<Booking> = {};
    allFields.forEach((field) => {
      if (editable[field as keyof Booking]) {
        fieldsToUpdate[field as keyof Booking] = form[field as keyof Booking];
      }
    });

    const method = id ? "PUT" : "POST";
    const url = id ? `/api/bookings/${id}` : "/api/bookings";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fieldsToUpdate),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Booking saved successfully!");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "❌ Failed to save booking");
      }
    } catch (error) {
      toast.error("❌ Network error. Please try again.");
    }
  };

  if (loading) return <LoadingScreen />;
  

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10">
      {/* Header */}
      <div className="w-full max-w-7xl flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full shadow-sm hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex-1">
          { `✏️ Modify Booking (${id ? "Existing Customer" : "New Customer"}) `}
        </h1>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl bg-white p-10 rounded-2xl shadow-xl grid md:grid-cols-4 gap-8">
        {/* Left: Checkbox panel */}
        <div className="md:col-span-1 space-y-6 sticky top-10 self-start">
          {Object.entries(editableGroups).map(([group, fields]) => (
            <div key={group}>
              <h3 className="text-lg font-semibold text-indigo-700 mb-2 border-b pb-1">{group}</h3>
              <div className="space-y-2">
                {fields.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editable[field]}
                      onChange={() => toggleField(field)}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="capitalize text-gray-600">{field}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={toggleAll}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        </div>

        {/* Right: Form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-10">
          {/* Customer Info */}
          <section>
            <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
              👤 Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Customer Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                readOnly={!editable.fullName}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                readOnly={!editable.email}
              />
              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                readOnly={!editable.phoneNumber}
              />
              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth || ""}
                onChange={handleChange}
                readOnly={!editable.dateOfBirth}
              />
            </div>
          </section>

          {/* Vehicle */}
          {editable.vehicleImage && (
            <section>
              <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
                🚗 Vehicle
              </h2>
              <VehicleSelector
                value={form.vehicleImage}
                onChange={(url) =>
                  setForm((prev) => ({ ...prev, vehicleImage: url }))
                }
              />
            </section>
          )}

          {/* Locations & Dates */}
          <section>
            <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
              📅 Locations & Dates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Pickup Location"
                name="pickupLocation"
                value={form.pickupLocation}
                onChange={handleChange}
                placeholder="e.g., JFK Airport"
                readOnly={!editable.pickupLocation}
              />
              <InputField
                label="Pickup Date"
                name="pickupDate"
                type="date"
                value={form.pickupDate}
                onChange={handleChange}
                readOnly={!editable.pickupDate}
              />
              <TimePicker
                label="Pickup Time"
                name="pickupTime"
                value={form.pickupTime}
                onChange={handleChange}
                disabled={!editable.pickupTime}
              />
              <InputField
                label="Drop-off Location"
                name="dropoffLocation"
                value={form.dropoffLocation}
                onChange={handleChange}
                placeholder="e.g., LAX Airport"
                readOnly={!editable.dropoffLocation}
              />
              <InputField
                label="Drop-off Date"
                name="dropoffDate"
                type="date"
                value={form.dropoffDate}
                onChange={handleChange}
                readOnly={!editable.dropoffDate}
              />
              <TimePicker
                label="Drop-off Time"
                name="dropoffTime"
                value={form.dropoffTime}
                onChange={handleChange}
                disabled={!editable.dropoffTime}
              />
            </div>
          </section>

          {/* Payment Info */}
          <section>
            <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
              💳 Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <InputField
                label="Total ($)"
                name="total"
                value={form.total}
                onChange={handleChange}
                placeholder="500"
                readOnly={!editable.total}
              />
              <InputField
                label="MCO"
                name="mco"
                value={form.mco}
                onChange={handleChange}
                placeholder="MCO Reference"
                readOnly={!editable.mco}
              />
              <InputField
                label="Payable at Pickup ($)"
                name="payableAtPickup"
                value={form.payableAtPickup}
                onChange={handleChange}
                placeholder="200"
                readOnly={!editable.payableAtPickup}
              />
              <InputField
                label="Card Last 4 Digits"
                name="cardLast4"
                value={form.cardLast4}
                onChange={handleChange}
                placeholder="1234"
                maxLength={4}
                readOnly={!editable.cardLast4}
              />
              <InputField
                label="Expiration Date"
                name="expiration"
                type="month"
                value={form.expiration}
                onChange={handleChange}
                readOnly={!editable.expiration}
              />
              <div className="md:col-span-2 lg:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address
                </label>
                <textarea
                  name="billingAddress"
                  value={form.billingAddress}
                  onChange={handleChange}
                  placeholder="123 Main St, New York, NY"
                  rows={3}
                  readOnly={!editable.billingAddress}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
                />
              </div>
            </div>
          </section>

          {/* Sales Agent Section - Added after Payment Info */}
          <section>
            <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
              🧑‍💼 Sales Agent
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <InputField
                  label="Sales Agent"
                  name="salesAgent"
                  value={form.salesAgent}
                  onChange={handleChange}
                  placeholder="Sales Agent Name"
                  readOnly={true}
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div>
            <LoadingButton
              type="submit"
              loading={loading}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 text-lg rounded-lg"
            >
              {id ? "Save Changes" : "Create Booking"}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}