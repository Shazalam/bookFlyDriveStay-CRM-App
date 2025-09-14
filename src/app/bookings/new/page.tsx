"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import InputField from "@/components/InputField";
import VehicleSelector from "@/components/VehicleSelector";
import { ArrowLeft } from "lucide-react";
import TimePicker from "@/components/TimePicker";
import LoadingScreen from "@/components/LoadingScreen";

const rentalCompanies = [
    "Hertz", "Avis", "Sixt", "Budget", "Enterprise",
    "Alamo", "National", "Thrifty", "Dollar",
    "Europcar", "Fox Rent A Car", "Payless", "Zipcar", "Other",
];

export default function NewBookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isPastBooking, setIsPastBooking] = useState(false);

    const [form, setForm] = useState({
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
    });

    const otherInputRef = useRef<HTMLInputElement | null>(null);

    // Fetch booking data if ID is present in URL
    useEffect(() => {
        if (id) {
            setIsEditing(true);
            fetchBookingData(id);
        }
    }, [id]);

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

    useEffect(() => {
        if (form.rentalCompany === "Other" && otherInputRef.current) {
            otherInputRef.current.focus();
        }
    }, [form.rentalCompany]);

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
            today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison

            setIsPastBooking(pickupDate < today);
        }
    }, [form.pickupDate]);

    async function fetchBookingData(bookingId: string) {
        try {
            setLoading(true);
            const res = await fetch(`/api/bookings/${bookingId}`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch booking");

            const data = await res.json();
            const booking = data.booking;

            // Pre-fill form with existing booking data
            setForm({
                fullName: booking.fullName || "",
                email: booking.email || "",
                phoneNumber: booking.phoneNumber || "",
                rentalCompany: booking.rentalCompany || "",
                confirmationNumber: booking.confirmationNumber || "",
                vehicleImage: booking.vehicleImage || "",
                total: booking.total?.toString() || "",
                mco: booking.mco?.toString() || "",
                payableAtPickup: booking.payableAtPickup?.toString() || "",
                pickupDate: booking.pickupDate || "",
                dropoffDate: booking.dropoffDate || "",
                pickupTime: booking.pickupTime || "",
                dropoffTime: booking.dropoffTime || "",
                pickupLocation: booking.pickupLocation || "",
                dropoffLocation: booking.dropoffLocation || "",
                cardLast4: booking.cardLast4 || "",
                expiration: booking.expiration || "",
                billingAddress: booking.billingAddress || "",
                salesAgent: booking.salesAgent || "",
            });
        } catch (error) {
            console.error("Error fetching booking:", error);
            toast.error("Failed to load booking data");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        console.log("isEditing id =>", id)
        console.log("isEditing =>", isEditing)
        const url = isEditing ? `/api/bookings/${id}` : "/api/bookings";
        const method = isEditing ? "PUT" : "POST";

        // Prepare data for submission
        const submitData = {
            ...form,
            total: form.total ? parseFloat(form.total) : 0,
            mco: form.mco ? parseFloat(form.mco) : 0,
            payableAtPickup: form.payableAtPickup ? parseFloat(form.payableAtPickup) : 0,
            status: "BOOKED"
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Booking ${isEditing ? 'updated' : 'created'} successfully!`);
                router.push("/dashboard");
            } else {
                toast.error(data.error || "Something went wrong");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error";
            toast.error(`Error: ${errorMessage}. Please try again.`);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <LoadingScreen />;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10">
            <div className="w-full max-w-6xl bg-white p-10 rounded-2xl shadow-xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full shadow-sm hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 self-start"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back</span>
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 text-center md:text-left flex-1">
                        {isEditing ? "✏️ Edit Booking" : "✈️ Create New Booking"}
                    </h1>
                </div>

                {isPastBooking && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                                        You are editing a booking with a past pickup date.
                                        Some validations have been disabled to allow corrections.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section: Personal Info */}
                    <section>
                        <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
                            👤 Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField
                                label="Customer Name"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Enter FullName"
                                required
                            />
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter Email"
                                required
                            />
                            <InputField
                                label="Phone Number"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter PhoneNumber"
                                required
                            />
                        </div>
                    </section>

                    {/* Section: Booking Details */}
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
                                label="Confirmation Number"
                                name="confirmationNumber"
                                value={form.confirmationNumber}
                                onChange={handleChange}
                                placeholder="Enter Confirmation Number"
                                required
                            />
                        </div>

                        {/* Row 2: Vehicle Selection (full width) */}
                        <div className="mb-6">
                            <VehicleSelector
                                value={form.vehicleImage}
                                onChange={(url) => setForm((prev) => ({ ...prev, vehicleImage: url }))}
                            />
                        </div>

                        {/* Row 3: Location and Date/Time Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField
                                label="Pickup Location"
                                name="pickupLocation"
                                value={form.pickupLocation}
                                onChange={handleChange}
                                placeholder="Enter Pickup Location"
                                required
                            />

                            <InputField
                                label="Pickup Date"
                                name="pickupDate"
                                type="date"
                                value={form.pickupDate}
                                onChange={handleChange}
                                min={isPastBooking ? undefined : new Date().toISOString().split('T')[0]}
                                required
                                readOnly={isPastBooking}
                            />

                            <TimePicker
                                label="Pickup Time"
                                name="pickupTime"
                                value={form.pickupTime}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label="Drop-off Location"
                                name="dropoffLocation"
                                value={form.dropoffLocation}
                                onChange={handleChange}
                                placeholder="Enter Dropoff Location"
                                required
                            />

                            <InputField
                                label="Drop-off Date"
                                name="dropoffDate"
                                type="date"
                                value={form.dropoffDate}
                                onChange={handleChange}
                                min={form.pickupDate || (isPastBooking ? undefined : new Date().toISOString().split('T')[0])}
                                required
                            />

                            <TimePicker
                                label="Drop-off Time"
                                name="dropoffTime"
                                value={form.dropoffTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </section>

                    {/* Section: Payment Info */}
                    <section>
                        <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
                            💳 Payment Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            <InputField
                                label="Total ($)"
                                name="total"
                                type="text"
                                value={form.total}
                                onChange={handleChange}
                                placeholder="Enter Total"
                                required
                                step="0.01"
                                min="0"
                            />

                            <InputField
                                label="Payable at Pickup ($)"
                                name="payableAtPickup"
                                type="text"
                                value={form.payableAtPickup}
                                onChange={handleChange}
                                placeholder="Enter Payable At Pickup"
                                step="0.01"
                                min="0"
                            />

                            <InputField
                                label="MCO"
                                name="mco"
                                type="text"
                                value={form.mco}
                                onChange={handleChange}
                                placeholder="Enter MCO"
                                readOnly
                                step="0.01"
                            />

                            <InputField
                                label="Card Last 4 Digits"
                                name="cardLast4"
                                value={form.cardLast4}
                                onChange={handleChange}
                                placeholder="Enter Last 4 Digits"
                                maxLength={4}
                                required
                            />
                            <InputField
                                label="Expiration Date"
                                name="expiration"
                                type="month"
                                value={form.expiration}
                                onChange={handleChange}
                                required
                            />
                            <div className="md:col-span-2 lg:col-span-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Address
                                </label>
                                <textarea
                                    name="billingAddress"
                                    value={form.billingAddress}
                                    onChange={handleChange}
                                    placeholder="Enter Biling Address"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section: Sales Agent */}
                    <section>
                        <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
                            🧑‍💼 Sales Agent
                        </h2>
                        <input
                            type="text"
                            name="salesAgent"
                            value={form.salesAgent}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                    </section>

                    {/* Submit */}
                    <div>
                        <LoadingButton
                            type="submit"
                            loading={loading}
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 text-lg rounded-lg"
                        >
                            {isEditing ? "Update Booking" : "Create Booking"}
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </div>
    );
}