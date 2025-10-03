"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import InputField from "@/components/InputField";
import LoadingButton from "@/components/LoadingButton";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearBooking, fetchBookingById } from "@/app/store/slices/bookingSlice";
import ErrorComponent from "@/components/ErrorComponent";
import { Booking, rentalCompanies } from "@/types/booking";
import TimePicker from "@/components/TimePicker";
import { fetchCurrentUser } from "@/app/store/slices/authSlice";

export default function CancellationForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { currentBooking, loading, error } = useAppSelector((state) => state.booking);
    // ✅ Use Redux state instead of local state
    const { user } = useAppSelector((state) => state.auth);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExistingCustomer] = useState(!!id);
    const [cancellationFee, setCancellationFee] = useState("");
    const [form, setForm] = useState<Booking>({
        id: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        rentalCompany: "",
        confirmationNumber: "",
        vehicleImage: "",
        total: "",
        mco: "",
        modificationFee: [],
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
        status: "CANCELLED",
        dateOfBirth: "",
        refundAmount: ""
    });

    // Fetch booking data when component mounts or id changes
    useEffect(() => {
        if (id) {
            dispatch(fetchBookingById(id))
                .unwrap()
                .catch((err) => toast.error(err.message || "Failed to fetch booking"));
        }
    }, [id, dispatch]);

    // Update form when booking data is available
    useEffect(() => {
        if (currentBooking && id) {
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
                status: "CANCELLED",
                dateOfBirth: currentBooking.dateOfBirth || "",
                refundAmount: ""
            });
        }
    }, [currentBooking, id]);


    // Fetch current user using Redux thunk
    useEffect(() => {
        if (user && !user.name) {
            dispatch(fetchCurrentUser())
                .unwrap()
                .then((userData) => {
                    setForm((prev) => ({ ...prev, salesAgent: userData.name }));
                })
                .catch((error) => {
                    console.error("Failed to fetch user:", error);
                    toast.error("Failed to load user information");
                });
        }
    }, [dispatch, user]);

    // ✅ Calculate refund and update MCO with cancellation fee
    const calculateRefund = () => {
        if (isExistingCustomer && form.mco && cancellationFee) {
            const mco = parseFloat(form.mco) || 0;
            const fee = parseFloat(cancellationFee) || 0;
            const refund = mco - fee;

            setForm((prev) => ({
                ...prev,
                refundAmount: refund >= 0 ? refund.toFixed(2) : "0.00",
            }));
        }
    };

    // Reset form when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearBooking());
        };
    }, [dispatch]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value } as Booking));
    };

    // Handle form submission for cancellation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare data for API
            const requestData = {
                bookingId: isExistingCustomer ? form.id : undefined,
                email: form.email,
                customerType: isExistingCustomer ? "existing" : "new",
                refundAmount: form.refundAmount,
                mco: cancellationFee,
                salesAgent: form.salesAgent,
                // For new customers, include all necessary booking details
                ...(isExistingCustomer ? {} : {
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber,
                    rentalCompany: form.rentalCompany,
                    confirmationNumber: form.confirmationNumber,
                    total: form.total,
                    payableAtPickup: form.payableAtPickup,
                    pickupDate: form.pickupDate,
                    dropoffDate: form.dropoffDate,
                    pickupTime: form.pickupTime,
                    dropoffTime: form.dropoffTime,
                    pickupLocation: form.pickupLocation,
                    dropoffLocation: form.dropoffLocation,
                    cardLast4: form.cardLast4,
                    expiration: form.expiration,
                    billingAddress: form.billingAddress,
                    salesAgent: form.salesAgent,
                    dateOfBirth: form.dateOfBirth
                })
            };
            console.log("requestData =>", requestData)
            const response = await fetch("/api/bookings/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to process cancellation");
            }
            toast.success("Reservation cancelled successfully!");
            router.push("/dashboard");
        } catch (err: unknown) {
            console.error("Cancellation error:", err);
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to cancel reservation");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) {
        return (
            <ErrorComponent
                title="Failed to Load Booking"
                message={error || "Unknown error occurred"}
                onRetry={() => dispatch(fetchBookingById(id!))}
            />
        );
    }

    if (loading && id) return <LoadingScreen />;

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
                    {isExistingCustomer ? "Cancel Existing Reservation" : "New Cancellation Reservation"}
                </h1>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-7xl bg-white p-10 rounded-2xl shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-10">
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
                                readOnly={isExistingCustomer}
                            />
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter Email"
                                readOnly={isExistingCustomer}
                            />
                            <InputField
                                label="Phone Number"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                required
                                placeholder="Enter PhoneNumber"
                                readOnly={isExistingCustomer}
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

                    {/* Booking Details */}
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
                                    disabled={isExistingCustomer}
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
                                readOnly={isExistingCustomer}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField
                                label="Pickup Location"
                                name="pickupLocation"
                                value={form.pickupLocation}
                                onChange={handleChange}
                                required
                                placeholder="e.g., JFK Airport"
                                readOnly={isExistingCustomer}
                            />
                            <InputField
                                label="Pickup Date"
                                name="pickupDate"
                                type="date"
                                value={form.pickupDate}
                                onChange={handleChange}
                                required
                                readOnly={isExistingCustomer}
                            />

                            <TimePicker
                                label="Pickup Time"
                                name="pickupTime"
                                value={form.pickupTime}
                                onChange={handleChange}
                                required
                                disabled={isExistingCustomer}
                            />

                            <InputField
                                label="Drop-off Location"
                                name="dropoffLocation"
                                value={form.dropoffLocation}
                                onChange={handleChange}
                                required
                                placeholder="e.g., LAX Airport"
                                readOnly={isExistingCustomer}
                            />
                            <InputField
                                label="Drop-off Date"
                                name="dropoffDate"
                                type="date"
                                value={form.dropoffDate}
                                onChange={handleChange}
                                required
                                readOnly={isExistingCustomer}
                            />

                            <TimePicker
                                label="Drop-off Time"
                                name="dropoffTime"
                                value={form.dropoffTime}
                                onChange={handleChange}
                                required
                                disabled={isExistingCustomer}
                            />
                        </div>
                    </section>

                    {/* Payment Information - Show for both cases but with different fields */}
                    <section>
                        <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
                            💳 Payment Information
                        </h2>

                        {isExistingCustomer ? (
                            // Existing customer payment info (read-only)
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg">
                                <InputField
                                    label="Total Amount ($)"
                                    name="total"
                                    value={form.total || ""}
                                    onChange={handleChange}
                                    readOnly={true}
                                />
                                <InputField
                                    label="Payable at Pickup ($)"
                                    name="payableAtPickup"
                                    value={form.payableAtPickup || ""}
                                    onChange={handleChange}
                                    readOnly={true}
                                />
                                <InputField
                                    label="MCO Amount ($)"
                                    name="mco"
                                    value={form.mco || ""}
                                    onChange={handleChange}
                                    readOnly={true}
                                />
                                <InputField
                                    label="Card Last 4 Digits"
                                    name="cardLast4"
                                    value={form.cardLast4}
                                    onChange={handleChange}
                                    placeholder="Enter Last 4 Digits"
                                    maxLength={4}
                                    readOnly={true}
                                />
                                <InputField
                                    label="Expiration Date"
                                    name="expiration"
                                    type="month"
                                    value={form.expiration}
                                    onChange={handleChange}
                                    readOnly={true}
                                />
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Billing Address
                                    </label>
                                    <textarea
                                        name="billingAddress"
                                        value={form.billingAddress}
                                        onChange={handleChange}
                                        placeholder="Enter Billing Address"
                                        rows={3}
                                        readOnly={true}
                                        className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
                                    />
                                </div>
                            </div>
                        ) : (
                            // New customer payment info (editable)
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg">

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
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Billing Address
                                    </label>
                                    <textarea
                                        name="billingAddress"
                                        value={form.billingAddress}
                                        onChange={handleChange}
                                        placeholder="Enter Billing Address"
                                        rows={3}
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Cancellation Details */}
                    <section>
                        <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
                            ❌ Cancellation Amount
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputField
                                    label="Cancellation Fee ($)"
                                    name="cancellationFee"
                                    value={cancellationFee}
                                    onChange={(e) => setCancellationFee(e.target.value)}
                                    required
                                    placeholder="Enter cancellation fee"
                                    min="0"
                                    step="0.01"
                                />
                                {isExistingCustomer && (
                                    <button
                                        type="button"
                                        onClick={calculateRefund}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Calculate Refund
                                    </button>
                                )}
                            </div>
                            <InputField
                                label={isExistingCustomer ? "Refund Amount ($)" : "Refund if Applicable ($)"}
                                name="refundAmount"
                                value={form.refundAmount || ""}
                                onChange={handleChange}
                                readOnly={isExistingCustomer}
                                placeholder="Refund amount"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        {isExistingCustomer && form.mco && cancellationFee && (
                            <div className="mt-4 text-sm text-gray-600">
                                <p>Refund Calculation: ${form.mco} (Original MCO) - ${cancellationFee} (Cancellation Fee) = ${form.refundAmount}</p>
                            </div>
                        )}
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
                            loading={isSubmitting}
                            className="w-full bg-red-600 text-white hover:bg-red-700 py-3 text-lg rounded-lg cursor-pointer"
                        >
                            Confirm Cancellation
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </div>
    );
}