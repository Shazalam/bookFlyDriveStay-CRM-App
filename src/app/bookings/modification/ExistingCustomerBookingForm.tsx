"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InputField from "@/components/InputField";
import VehicleSelector from "@/components/VehicleSelector";
import LoadingButton from "@/components/LoadingButton";
import TimePicker from "@/components/TimePicker";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearBooking, fetchBookingById, resetOperationStatus, saveBooking } from "@/app/store/slices/bookingSlice";
import ErrorComponent from "@/components/ErrorComponent";
import { Booking, rentalCompanies, editableGroups, emptyForm, TimelineChange, TimelineEntry } from "@/types/booking";
import FieldSelectionPanel from "@/components/FieldSelectionPanel";


interface ExistingCustomerBookingFormProps {
  id?: string | null;
}


export default function ExistingCustomerBookingForm({ id }: ExistingCustomerBookingFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentBooking, loading, error, operation } = useAppSelector((state) => state.booking);
  const [isPastBooking, setIsPastBooking] = useState(false);
  const [newModificationFee, setNewModificationFee] = useState("");
  const [form, setForm] = useState<Booking>(emptyForm);
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
      router.push("/dashboard");
    }
  }, [id, dispatch, router]);

  console.log("currentBooking =>", currentBooking)
  // Update form when booking data is available
  useEffect(() => {
    if (currentBooking && id as string) {
      setForm({
        id: currentBooking._id || "",
        fullName: currentBooking.fullName || "",
        email: currentBooking.email || "",
        phoneNumber: currentBooking.phoneNumber || "",
        rentalCompany: currentBooking.rentalCompany || "",
        confirmationNumber: currentBooking.confirmationNumber || "",
        vehicleImage: currentBooking.vehicleImage || "",
        total: currentBooking.total?.toString() || "",
        mco: currentBooking.mco?.toString() || "",
        modificationFee: currentBooking.modificationFee || [],
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
        status: "MODIFIED",
        dateOfBirth: currentBooking.dateOfBirth ?? "",
      });
    }
  }, [currentBooking, id]);

  // Fetch logged-in agent
  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data.user) {
        setForm((prev) => ({ ...prev, salesAgent: data.user.name }));
      }
    }
    fetchUser();
  }, []);


  // Calculate MCO when total or payableAtPickup changes
  useEffect(() => {
    if (form.total && form.payableAtPickup) {
      const total = parseFloat(form.total) || 0;
      const payableAtPickup = parseFloat(form.payableAtPickup) || 0;
      const mco = total - payableAtPickup;

      if (mco >= 0) {
        setForm(prev => ({ ...prev, mco: mco.toFixed(2) }));
      }
    } else {
      setForm(prev => ({ ...prev, mco: "0.00" }));
    }
  }, [form.total, form.payableAtPickup]);

  // Check if booking is in the past
  useEffect(() => {
    if (form.pickupDate) {
      const pickupDate = new Date(form.pickupDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setIsPastBooking(pickupDate < today);
    }
  }, [form.pickupDate]);

  // Reset form when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearBooking());
    };
  }, [dispatch]);

  // Handle adding a new modification fee
  const addModificationFee = () => {
    if (newModificationFee) {
      setForm(prev => ({
        ...prev,
        modificationFee: [...prev.modificationFee, { charge: newModificationFee }]
      }));
      setNewModificationFee("");
    }
  };

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
    const allFields = Object.values(editableGroups).flat();
    const allSelected = allFields.every((f) => editable[f]);
    const newValue = !allSelected;
    const updated = allFields.reduce(
      (acc, f) => ({ ...acc, [f]: newValue }),
      {}
    );
    setEditable(updated);
  };

  // Handle form submission for modification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: Partial<Booking> = { ...form };
    const changes: TimelineChange[] = [];

    // Collect changes for the timeline
    Object.keys(editable).forEach((field) => {
      if (editable[field]) {
        changes.push({
          text: `${field} updated to ${form[field as keyof Booking]}`
        });
      }
    });

    if (changes.length === 0) {
      toast.error("No changes selected. Please select at least one field to update.");
      return;
    }

    const timelineEntry: TimelineEntry = {
      date: new Date().toISOString(),
      message: `Updated ${changes.length} field(s)`,
      agentName: form.salesAgent,
      changes: changes
    };

    formData.timeline = [timelineEntry]; // ✅ no more `any`
    await dispatch(saveBooking({
      formData,
      id: id || undefined,
    }));
    setNewModificationFee("");
  };

  // Handle side effects after operation
  useEffect(() => {
    if (operation === 'succeeded') {
      toast.success("Booking updated successfully!");
      router.push("/dashboard");
      dispatch(resetOperationStatus());
    } else if (operation === 'failed') {
      toast.error(error || "Failed to update booking");
      dispatch(resetOperationStatus());
    }
  }, [operation, error, router, dispatch, id]);

  if (error) {
    return (
      <ErrorComponent
        title="Failed to Update Booking"
        message={error || "Unknown error occurred"}
        onRetry={() => dispatch(resetOperationStatus())}
      />
    )
  }

  if (loading) return <LoadingScreen />;

  if (!currentBooking && id) return <LoadingScreen />;

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
          {`✏️ Modify Booking`}
        </h1>
      </div>

      {isPastBooking && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full max-w-7xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Past Booking
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You are modifying a booking with a past pickup date.
                  Some validations have been disabled to allow corrections.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-7xl bg-white p-10 rounded-2xl shadow-xl grid md:grid-cols-4 gap-8">
        {/* Left: Checkbox panel */}
        <FieldSelectionPanel
          editable={editable}
          toggleField={toggleField}
          toggleAll={toggleAll}
        />

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
                required
                placeholder="Enter FullName"
                readOnly={!editable.fullName}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter Email"
                readOnly={!editable.email}
              />
              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter PhoneNumber"
                readOnly={!editable.phoneNumber}
              />
              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth || ""}
                onChange={handleChange}
                required

              />
            </div>
          </section>

          {/* Locations & Dates */}
          <section>
            <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
              📅 Booking Details
            </h2>

            {/* Row 1: Rental Company & Confirmation Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rental Company
                </label>
                <select
                  name="rentalCompany"
                  value={form.rentalCompany}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
                  required
                  disabled={!editable.rentalCompany}
                >
                  <option value="">Select a company</option>
                  {rentalCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                label="Confirmation Number/Rental Agreement"
                name="confirmationNumber"
                value={form.confirmationNumber}
                onChange={handleChange}
                placeholder="Enter Confirmation Number/Rental Agreement"
                required
                readOnly={!editable.confirmationNumber}
              />
            </div>

            {editable.vehicleImage && (
              <div className="mb-6">
                <VehicleSelector
                  value={form.vehicleImage}
                  onChange={(url) =>
                    setForm((prev) => ({ ...prev, vehicleImage: url }))
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Pickup Location"
                name="pickupLocation"
                value={form.pickupLocation}
                onChange={handleChange}
                required
                placeholder="e.g., JFK Airport"
                readOnly={!editable.pickupLocation}
              />
              <InputField
                label="Pickup Date"
                name="pickupDate"
                type="date"
                value={form.pickupDate}
                onChange={handleChange}
                required
                min={isPastBooking ? undefined : new Date().toISOString().split('T')[0]}
                readOnly={!editable.pickupDate}
              />

              <TimePicker
                label="Pickup Time"
                name="pickupTime"
                value={form.pickupTime}
                onChange={handleChange}
                required
                disabled={!editable.pickupTime}
              />
              <InputField
                label="Drop-off Location"
                name="dropoffLocation"
                value={form.dropoffLocation}
                onChange={handleChange}
                required
                placeholder="e.g., LAX Airport"
                readOnly={!editable.dropoffLocation}
              />
              <InputField
                label="Drop-off Date"
                name="dropoffDate"
                type="date"
                value={form.dropoffDate}
                onChange={handleChange}
                required
                min={isPastBooking ? undefined : new Date().toISOString().split('T')[0]}
                readOnly={!editable.dropoffDate}
              />
              <TimePicker
                label="Drop-off Time"
                name="dropoffTime"
                value={form.dropoffTime}
                onChange={handleChange}
                required
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
                placeholder="Enter Total"
                readOnly={!editable.total}
              />

              <InputField
                label="Payable at Pickup ($)"
                name="payableAtPickup"
                value={form.payableAtPickup}
                onChange={handleChange}
                placeholder="Enter Payable At Pickup"
                readOnly={!editable.payableAtPickup}
              />
              <InputField
                label="MCO"
                name="mco"
                value={form.mco}
                onChange={handleChange}
                placeholder="MCO Reference"
                readOnly={!editable.mco}
              />

              {/* Modification Fee Section */}
              <div className="md:col-span-2">
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Modification Fee
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newModificationFee}
                      onChange={(e) => setNewModificationFee(e.target.value)}
                      placeholder="Enter fee amount (e.g., 25.00)"
                      className="flex-1 border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={addModificationFee}
                      disabled={!newModificationFee.trim()}
                      className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Fee
                    </button>
                  </div>
                </div>

                {/* Display added fees */}
                {form.modificationFee.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Modification Fee:</p>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <span className="text-gray-700 font-medium">
                        ${form.modificationFee[form.modificationFee.length - 1].charge}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedFees = [...form.modificationFee];
                          updatedFees.pop();
                          setForm(prev => ({ ...prev, modificationFee: updatedFees }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <InputField
                label="Card Last 4 Digits"
                name="cardLast4"
                value={form.cardLast4}
                onChange={handleChange}
                placeholder="Enter Last 4 Digits"
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
                  placeholder="Enter Billing Address"
                  rows={3}
                  readOnly={!editable.billingAddress}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
                />
              </div>
            </div>
          </section>

          {/* Sales Agent Section */}
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
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 text-lg rounded-lg cursor-pointer"
            >
              Save Changes
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}