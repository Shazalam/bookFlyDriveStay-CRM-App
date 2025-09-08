"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import InputField from "@/components/InputField";
import VehicleSelector from "@/components/VehicleSelector";
import { ArrowLeft } from "lucide-react";
import TimePicker from "@/components/TimePicker";

const rentalCompanies = [
    "Hertz", "Avis", "Sixt", "Budget", "Enterprise",
    "Alamo", "National", "Thrifty", "Dollar",
    "Europcar", "Fox Rent A Car", "Payless", "Zipcar", "Other",
];

export default function NewBookingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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

    // inside your component
    const otherInputRef = useRef<HTMLInputElement | null>(null);
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


    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            toast.success("✅ Booking created successfully!");
            router.push("/dashboard");
        } else {
            toast.error(data.error || "❌ Something went wrong");
        }
    }


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
                        ✈️ Create New Booking
                    </h1>
                </div>

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
                                placeholder="John Doe"
                                required
                            />
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                required
                            />
                            <InputField
                                label="Phone Number"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                placeholder="+1 234 567 890"
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
                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                            {form?.rentalCompany === "Other" ?
                                <InputField
                                    label="Confirmation Number"
                                    name="confirmationNumber"
                                    value={form.confirmationNumber}
                                    onChange={handleChange}
                                    placeholder="e.g., ABC123456"
                                    required
                                />
                                : <></>

                            }


                            <InputField
                                label="Confirmation Number"
                                name="confirmationNumber"
                                value={form.confirmationNumber}
                                onChange={handleChange}
                                placeholder="e.g., ABC123456"
                                required
                            />
                        </div> */}


                        {/* Row 1: Rental Company & Confirmation Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rental Company
                                </label>
                                {form.rentalCompany === "Other" ? (
                                    <input
                                        ref={otherInputRef}
                                        type="text"
                                        name="rentalCompany"
                                        value={form.rentalCompany}
                                        onChange={handleChange}
                                        placeholder="Enter rental company name"
                                        className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
                                        required
                                    />
                                ) : (
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
                                )}
                            </div>

                            <InputField
                                label="Confirmation Number"
                                name="confirmationNumber"
                                value={form.confirmationNumber}
                                onChange={handleChange}
                                placeholder="e.g., ABC123456"
                                required
                            />
                        </div>

                        {/* Row 2: Vehicle Selection (full width) */}
                        <div className="mb-6">
                            <VehicleSelector
                                form={{
                                    vehicleImage: form.vehicleImage,
                                }}
                                setForm={(vehicleData) => setForm({ ...form, ...vehicleData })}
                            />
                        </div>

                        {/* Row 3: Location and Date/Time Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField
                                label="Pickup Location"
                                name="pickupLocation"
                                value={form.pickupLocation}
                                onChange={handleChange}
                                placeholder="e.g., JFK Airport"
                                required
                            />

                            <InputField
                                label="Pickup Date"
                                name="pickupDate"
                                type="date"
                                value={form.pickupDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
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
                                placeholder="e.g., LAX Airport"
                                required
                            />

                            <InputField
                                label="Drop-off Date"
                                name="dropoffDate"
                                type="date"
                                value={form.dropoffDate}
                                onChange={handleChange}
                                min={form.pickupDate || new Date().toISOString().split('T')[0]}
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
                                type="string"
                                value={form.total}
                                onChange={handleChange}
                                placeholder="500"
                                required
                            />
                            <InputField
                                label="MCO"
                                name="mco"
                                type="string"
                                value={form.mco}
                                onChange={handleChange}
                                placeholder="MCO Reference"
                            />
                            <InputField
                                label="Payable at Pickup ($)"
                                name="payableAtPickup"
                                type="string"
                                value={form.payableAtPickup}
                                onChange={handleChange}
                                placeholder="200"
                            />
                            <InputField
                                label="Card Last 4 Digits"
                                name="cardLast4"
                                value={form.cardLast4}
                                onChange={handleChange}
                                placeholder="1234"
                                maxLength={4}
                            />
                            <InputField
                                label="Expiration Date"
                                name="expiration"
                                type="month"
                                value={form.expiration}
                                onChange={handleChange}
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
                                    className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
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
                            Create Booking
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
