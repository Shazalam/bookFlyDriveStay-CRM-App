'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiMail, FiPhone, FiCalendar, FiDollarSign, FiFileText, FiClock, FiChevronDown, FiChevronUp, FiUser, FiMapPin, FiCreditCard, FiCheckCircle, FiGift, FiRefreshCw, FiLink, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import { bookingTemplate, BookingTemplateData } from "@/lib/email/templates/booking";
import Modal from "@/components/Modal";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchBookingById } from "@/app/store/slices/bookingSlice";
import ErrorComponent from "@/components/ErrorComponent";

export default function BookingDetailPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("details");
    const [expandedSections, setExpandedSections] = useState({
        description: true,
        contact: true,
        company: true
    });

    // 2. Rename states for clarity
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emailPreviewHtml, setEmailPreviewHtml] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false); // State for loading indicator
    const dispatch = useAppDispatch();
    const { currentBooking: booking, loading, error } = useAppSelector((state) => state.booking);

    // 3. Update the handleSend function to open the modal
    const handleSend = async (type: string) => {
        if (!booking) return;

        const emailData: BookingTemplateData = {
            fullName: booking.fullName,
            email: booking.email,
            phoneNumber: booking.phoneNumber,
            rentalCompany: booking.rentalCompany,
            confirmationNumber: booking.confirmationNumber,
            vehicleImage: booking.vehicleImage,
            total: booking.total,
            mco: booking.mco,
            payableAtPickup: booking.payableAtPickup,
            // 🐛 FIX HERE: Pass original strings directly to email template
            pickupDate: booking.pickupDate, // Use the YYYY-MM-DD string
            dropoffDate: booking.dropoffDate, // Use the YYYY-MM-DD string
            pickupTime: booking.pickupTime, // Use the HH:MM AM/PM string
            dropoffTime: booking.dropoffTime, // Use the HH:MM AM/PM string
            pickupLocation: booking.pickupLocation,
            dropoffLocation: booking.dropoffLocation,
            cardLast4: booking.cardLast4,
            expiration: booking.expiration,
            billingAddress: booking.billingAddress,
            salesAgent: booking.salesAgent
        };

        // For now, we only have one template. You can expand this with a switch statement for different email types.
        switch (type) {
            case "General":
                setEmailPreviewHtml(bookingTemplate(emailData));
                setIsModalOpen(true);
                break;
            // Add cases for "Voucher", "Payment Link", etc. as you create those templates
            default:
                toast.error(`Email template for "${type}" is not yet implemented.`);
                break;
        }
    };

    // --- NEW function to handle the actual email submission ---
    const handleEmailSubmit = async () => {
        if (!booking || !emailPreviewHtml) {
            toast.error("Cannot send email. Data is missing.");
            return;
        }

        setIsSendingEmail(true);
        const toastId = toast.loading('Sending email...');

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: booking.email,
                    subject: `${booking.rentalCompany} Car Rental Confirmation: #${booking.confirmationNumber}`,
                    html: emailPreviewHtml,
                }),
            });

            if (!response.ok) {
                // Try to get a more specific error from the backend response
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send email.');
            }

            toast.success('Email sent successfully!', { id: toastId });
            setIsModalOpen(false); // Close modal on success

        } catch (error: unknown) {
            console.error("Email sending failed:", error);
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Error: ${message}`, { id: toastId });
        } finally {
            setIsSendingEmail(false);
        }
    };

    useEffect(() => {
        if (id) {
            dispatch(fetchBookingById(id as string))
                .unwrap()
                .catch((err) => toast.error(err));
        }
    }, [id, dispatch]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section as keyof typeof prev]
        }));
    };

    const formatTimeWithCapitalAMPM = (dateString: string, timeZone: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).replace(/(am|pm)/i, match => match.toUpperCase());
    };

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorComponent />;

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
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section with Action Buttons */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="mb-4 md:mb-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{booking.rentalCompany} ({booking.confirmationNumber})</h1>
                                <p className="text-blue-600 font-semibold text-xl mt-1">${booking.mco.toFixed(2)} (Total - ${booking.total.toFixed(2)})</p>
                                <div className="flex flex-wrap items-center mt-2 gap-2">
                                    <span className="text-sm text-gray-500">Created on: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => handleSend("General")}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-md"
                                >
                                    <FiSend className="mr-2" /> Preview Email
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
                                            This booking includes a rental from <strong>{booking.rentalCompany}</strong>.
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
                                    {/* ✅ Vehicle Image Section */}
                                    {booking.vehicleImage && (
                                        <div className="flex justify-center">
                                            {/* Relative container with fixed height (needed for next/image fill) */}
                                            <div className="relative w-full h-64 md:h-96">
                                                <Image
                                                    src={booking.vehicleImage}
                                                    alt="Vehicle"
                                                    fill // 🔑 makes the image fill its parent container
                                                    className="rounded-2xl shadow-lg border border-gray-200 object-contain"
                                                    sizes="(max-width: 768px) 100vw, 50vw" // 🔑 responsive image sizes
                                                    priority // optional: load faster if above the fold
                                                />
                                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                                                    Vehicle Image
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                                <FiMapPin className="mr-2 text-blue-500" /> Pickup Information
                                            </h3>
                                            <p className="text-gray-600"><strong>Location:</strong> {booking.pickupLocation}</p>
                                            <p className="text-gray-600"><strong>Date:</strong> {booking.pickupDate}</p>
                                            <p className="text-gray-600"><strong>Time:</strong> {booking.pickupTime}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                                <FiMapPin className="mr-2 text-blue-500" /> Drop-off Information
                                            </h3>
                                            <p className="text-gray-600"><strong>Location:</strong> {booking.dropoffLocation}</p>
                                            <p className="text-gray-600"><strong>Date:</strong> {booking.dropoffDate}</p>
                                            <p className="text-gray-600"><strong>Time:</strong> {booking.dropoffTime}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                                <FiDollarSign className="mr-2 text-blue-500" /> Payment Details
                                            </h3>

                                            <div>
                                                <p className="text-gray-600"><strong>Total Amount:</strong> ${booking.total.toFixed(2)}</p>
                                                <p className="text-gray-600"><strong>Payable at Pickup:</strong> ${booking.payableAtPickup.toFixed(2)}</p>
                                                <p className="text-gray-600"><strong>MCO:</strong> ${booking.mco}</p>
                                            </div>

                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                                <FiUser className="mr-2 text-blue-500" /> Sales Information
                                            </h3>
                                            <p className="text-gray-600"><strong>Sales Agent:</strong> {booking.salesAgent}</p>

                                            <p className="text-gray-600">
                                                <strong>Booking Created:</strong> {formatTimeWithCapitalAMPM(booking.createdAt, 'America/Vancouver')} PDT
                                            </p>
                                            <p className="text-gray-600">
                                                <strong>Booking Created:</strong> {formatTimeWithCapitalAMPM(booking.createdAt, 'Asia/Kolkata')} IST
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {activeTab === "timeline" && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">History</h2>

                                    {booking.timeline && booking.timeline.length > 0 ? (
                                        <div>
                                            
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                                    Recent Activity
                                                </h3>

                                                <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                                                    {booking.timeline.map((event, index) => {
                                                        const eventDate = new Date(event.date);

                                                        return (
                                                            <div key={index} className="relative">
                                                                {/* Icon on timeline */}
                                                                <div className="absolute -left-4 top-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <FiCheckCircle className="text-blue-600" />
                                                                </div>

                                                                {/* Content */}
                                                                <div className="ml-6 p-4 bg-blue-50 rounded-lg">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {eventDate.toLocaleDateString()} at{" "}
                                                                        {eventDate.toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">{event.message}</p>
                                                                    {/* <p className="text-sm text-blue-800 font-medium mt-1">
                                                                        {event.message}
                                                                    </p> */}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline events</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Activity will appear here as changes are made to this booking.
                                            </p>
                                        </div>
                                    )}

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

            {
                isModalOpen && (
                    <>
                        {/* Pass the new props to the Modal component */}
                        < Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onSubmit={handleEmailSubmit}
                            isSubmitting={isSendingEmail}
                            title="Email Preview"
                        >
                            <iframe
                                srcDoc={emailPreviewHtml}
                                title="Email Preview"
                                className="w-full h-[65vh] border-0 rounded-md"
                            />
                        </Modal >
                    </>

                )
            }


        </>

    );
}