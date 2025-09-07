'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiMail, FiPhone, FiCalendar, FiDollarSign, FiFileText, FiClock, FiChevronDown, FiChevronUp, FiUser, FiMapPin, FiCreditCard, FiCheckCircle, FiGift, FiRefreshCw, FiLink, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import LoadingScreen from "@/components/LoadingScreen";

interface Booking {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    rentalCompany: string;
    vehicleType: string;
    total: number;
    mco: number;
    payableAtPickup: number;
    pickupDate: string;
    dropoffDate: string;
    pickupLocation: string;
    dropoffLocation: string;
    cardLast4: string;
    expiration: string;
    billingAddress: string;
    salesAgent: string;
    status: "BOOKED" | "MODIFIED" | "CANCELLED";
    createdAt: string;
    history?: { date: string; message: string }[];
}

export default function BookingDetailPage() {
    const { id } = useParams();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("details");
    const [expandedSections, setExpandedSections] = useState({
        description: true,
        contact: true,
        company: true
    });

    useEffect(() => {
        async function fetchBooking() {
            try {
                setLoading(true);
                const res = await fetch(`/api/bookings/${id}`, { credentials: "include" });
                if (!res.ok) throw new Error("Failed to load booking");
                const data = await res.json();
                setBooking(data.booking);
            } catch (err: any) {
                console.log("error", err)
                toast.error(err || "Error loading booking");
            } finally {
                setLoading(false);
            }
        }
        fetchBooking();
    }, [id]);

    const handleSend = async (type: string) => {
        try {
            toast.success(`📧 ${type} email sent to ${booking?.email}`);
            // In production: await fetch(`/api/emails/${type}`, { method: "POST", body: JSON.stringify({ bookingId: booking?._id }) });
        } catch {
            toast.error("Failed to send email");
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section as keyof typeof prev]
        }));
    };

    if (loading) return (
        <LoadingScreen />
    );

    if (!booking) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking not found</h1>
                <p className="text-gray-600 mb-6">{`The booking you're looking for doesn't exist or may have been removed.`}</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition duration-200">
                    Back to Bookings
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section with Action Buttons */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{booking.vehicleType} - {booking.rentalCompany}</h1>
                            <p className="text-blue-600 font-semibold text-xl mt-1">${booking.total.toFixed(2)}</p>
                            <div className="flex flex-wrap items-center mt-2 gap-2">
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{booking._id}</span>
                                <span className="text-sm text-gray-500">Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => handleSend("General")}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-md"
                            >
                                <FiSend className="mr-2" /> Generate Email
                            </button>
                            <button
                                onClick={() => handleSend("Voucher")}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-md"
                            >
                                <FiGift className="mr-2" /> Voucher & Gift Card
                            </button>
                            <button
                                onClick={() => handleSend("Payment Link")}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md"
                            >
                                <FiLink className="mr-2" /> Payment Link
                            </button>
                            <button
                                onClick={() => handleSend("Refund")}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition shadow-md"
                            >
                                <FiRefreshCw className="mr-2" /> Refund Email
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row">
                    {/* Right Column */}
                    <div className="lg:w-1/3 p-6 bg-gray-50 border-r border-gray-200">

                        {/* Related Contact Section */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer bg-white"
                                onClick={() => toggleSection("contact")}
                            >
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <FiUser className="text-blue-600" />
                                    </div>
                                    Customer Information
                                </h2>
                                {expandedSections.contact ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>
                            {expandedSections.contact && (
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                                            {booking.fullName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{booking.fullName}</h3>
                                            <p className="text-sm text-gray-600">Primary Customer</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                            <FiMail className="mr-3 text-gray-500" />
                                            <span className="text-sm">{booking.email}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                            <FiPhone className="mr-3 text-gray-500" />
                                            <span className="text-sm">{booking.phoneNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Information Section */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer bg-white"
                                onClick={() => toggleSection("company")}
                            >
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <FiCreditCard className="text-blue-600" />
                                    </div>
                                    Payment Information
                                </h2>
                                {expandedSections.company ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>
                            {expandedSections.company && (
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <div className="space-y-3">
                                        <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                            <FiCreditCard className="mr-3 text-gray-500" />
                                            <span className="text-sm">Card: **** **** **** {booking.cardLast4}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                            <FiCalendar className="mr-3 text-gray-500" />
                                            <span className="text-sm">Expires: {booking.expiration}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-2 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 font-medium">Billing Address</p>
                                        <p className="text-sm text-gray-800">{booking.billingAddress}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer bg-white"
                                onClick={() => toggleSection("description")}
                            >
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <FiFileText className="text-blue-600" />
                                    </div>
                                    Description
                                </h2>
                                {expandedSections.description ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                            </div>
                            {expandedSections.description && (
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <p className="text-gray-600">
                                        This booking includes a {booking.vehicleType} rental from {booking.rentalCompany}.
                                        <br /><br />
                                        ➤ Pickup: {booking.pickupLocation} on {new Date(booking.pickupDate).toLocaleDateString()}
                                        <br />
                                        ➤ Drop-off: {booking.dropoffLocation} on {new Date(booking.dropoffDate).toLocaleDateString()}
                                        <br />
                                        ➤ Total amount: ${booking.total.toFixed(2)}
                                        <br />
                                        ➤ Payable at pickup: ${booking.payableAtPickup.toFixed(2)}
                                    </p>
                                    <div className="mt-4 text-sm text-gray-500 flex items-center">
                                        <FiClock className="mr-2" />
                                        Status: <span className={`ml-1 font-medium ${booking.status === "BOOKED" ? "text-green-600" :
                                            booking.status === "MODIFIED" ? "text-yellow-600" :
                                                "text-red-600"}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Left Column */}
                    <div className="lg:w-2/3 p-6">
                        {/* Tabs Navigation */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="flex overflow-x-auto -mb-px">
                                <button
                                    onClick={() => setActiveTab("details")}
                                    className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "details" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab("timeline")}
                                    className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "timeline" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                >
                                    Timeline
                                </button>
                                <button
                                    onClick={() => setActiveTab("notes")}
                                    className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "notes" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                >
                                    Notes
                                </button>
                                <button
                                    onClick={() => setActiveTab("emails")}
                                    className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "emails" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                >
                                    Emails
                                </button>
                                <button
                                    onClick={() => setActiveTab("files")}
                                    className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "files" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                >
                                    Files
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "details" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                            <FiMapPin className="mr-2 text-blue-500" /> Pickup Information
                                        </h3>
                                        <p className="text-gray-600"><strong>Location:</strong> {booking.pickupLocation}</p>
                                        <p className="text-gray-600"><strong>Date:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</p>
                                        <p className="text-gray-600"><strong>Time:</strong> {new Date(booking.pickupDate).toLocaleTimeString()}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                            <FiMapPin className="mr-2 text-blue-500" /> Drop-off Information
                                        </h3>
                                        <p className="text-gray-600"><strong>Location:</strong> {booking.dropoffLocation}</p>
                                        <p className="text-gray-600"><strong>Date:</strong> {new Date(booking.dropoffDate).toLocaleDateString()}</p>
                                        <p className="text-gray-600"><strong>Time:</strong> {new Date(booking.dropoffDate).toLocaleTimeString()}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                        <FiDollarSign className="mr-2 text-blue-500" /> Payment Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-600"><strong>Total Amount:</strong> ${booking.total.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600"><strong>Payable at Pickup:</strong> ${booking.payableAtPickup.toFixed(2)}</p>
                                            <p className="text-gray-600"><strong>MCO:</strong> {booking.mco}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                        <FiUser className="mr-2 text-blue-500" /> Sales Information
                                    </h3>
                                    <p className="text-gray-600"><strong>Sales Agent:</strong> {booking.salesAgent}</p>
                                    <p className="text-gray-600"><strong>Booking Created:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === "timeline" && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">History</h2>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">YESTERDAY</h3>

                                    <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                                        {booking.history?.length ? (
                                            booking.history.map((h, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-4 top-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <FiCheckCircle className="text-blue-600" />
                                                    </div>
                                                    <div className="ml-6 p-4 bg-blue-50 rounded-lg">
                                                        <p className="text-sm font-medium text-gray-900">{new Date(h.date).toLocaleTimeString()}</p>
                                                        <p className="text-sm text-gray-600">Stage updated by system</p>
                                                        <p className="text-sm text-blue-800 font-medium mt-1">{h.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute -left-4 top-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FiCheckCircle className="text-blue-600" />
                                                </div>
                                                <div className="ml-6 p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-900">11:58 PM</p>
                                                    <p className="text-sm text-gray-600">Stage updated by system</p>
                                                    <p className="text-sm text-blue-800 font-medium mt-1">Booking created</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notes" && (
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Notes</h3>
                                <p className="text-gray-600">No notes have been added yet.</p>
                            </div>
                        )}

                        {activeTab === "emails" && (
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Email History</h3>
                                <p className="text-gray-600">No emails have been sent yet.</p>
                            </div>
                        )}

                        {activeTab === "files" && (
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Files</h3>
                                <p className="text-gray-600">No files have been uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}