"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiMapPin,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle
} from "react-icons/fi";
import { IoCarSport } from "react-icons/io5";
import toast from "react-hot-toast";

interface Booking {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  rentalCompany: string;
  vehicleType: string;
  total: number;
  mco: string;
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
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"BOOKED" | "MODIFIED" | "CANCELLED">("BOOKED");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: "ascending" | "descending" } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch bookings from API
  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const res = await fetch("/api/bookings", {
          method: "GET",
          credentials: "include", // ✅ important if using cookies
        });

        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const cancelBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to cancel booking");

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "CANCELLED" } : b))
      );

      toast.success("Booking cancelled");
    } catch (err: any) {
      toast.error(err.message || "Cancel failed");
    }
  };

  const handleSort = (key: keyof Booking) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
    if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
    return 0;
  });

  const filtered = sortedBookings.filter(
    (b) =>
      b.status === activeTab &&
      (b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b._id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusIcon = (status: Booking["status"]) => {
    switch (status) {
      case "BOOKED":
        return <FiCheckCircle className="text-green-500" />;
      case "MODIFIED":
        return <FiAlertCircle className="text-yellow-500" />;
      case "CANCELLED":
        return <FiXCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "BOOKED":
        return "bg-green-100 text-green-800";
      case "MODIFIED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Car Rental CRM</h1>
                <p className="text-gray-600 mt-1">Manage all your bookings in one place</p>
              </div>
              <Link
                href="/bookings/new"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                New Booking
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookings by name, email, or confirmation number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <FiFilter className="w-5 h-5" />
                Filters
                <FiChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {([
                { key: "BOOKED" as const, label: "Active Bookings", count: bookings.filter(b => b.status === "BOOKED").length },
                { key: "MODIFIED" as const, label: "Modified", count: bookings.filter(b => b.status === "MODIFIED").length },
                { key: "CANCELLED" as const, label: "Cancelled", count: bookings.filter(b => b.status === "CANCELLED").length }
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {getStatusIcon(tab.key)}
                  {tab.label}
                  <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.key ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('_id')}>
                      <div className="flex items-center gap-1">
                        Conf #
                        {sortConfig?.key === '_id' && (
                          sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('fullName')}>
                      <div className="flex items-center gap-1">
                        Customer
                        {sortConfig?.key === 'fullName' && (
                          sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('rentalCompany')}>
                      <div className="flex items-center gap-1">
                        Rental Company
                        {sortConfig?.key === 'rentalCompany' && (
                          sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('vehicleType')}>
                      <div className="flex items-center gap-1">
                        Vehicle Type
                        {sortConfig?.key === 'vehicleType' && (
                          sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalAmount')}>
                      <div className="flex items-center gap-1">
                        Total
                        {sortConfig?.key === 'totalAmount' && (
                          sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('pickupDate')}>
                      <div className="flex items-center gap-1">
                        Pickup Date
                        {sortConfig?.key === 'pickupDate' && (
                          sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="text-gray-500 text-lg">No {activeTab.toLowerCase()} bookings found</div>
                        <p className="text-gray-400 mt-2">Try adjusting your search or create a new booking</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((booking) => (
                      <>
                        <tr key={booking._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === booking._id ? null : booking._id)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking._id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiUser className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{booking.fullName}</div>
                                <div className="text-sm text-gray-500">{booking.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.rentalCompany}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.vehicleType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${booking.total.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(booking.pickupDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/bookings/${booking._id}/view`}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
                              onClick={(e) => e.stopPropagation()} // optional if inside clickable row
                            >
                              View Details
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/bookings/${booking._id}/edit`}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FiEdit className="w-4 h-4" />
                              </Link>
                              {booking.status !== "CANCELLED" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelBooking(booking._id);
                                  }}
                                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRow(expandedRow === booking._id ? null : booking._id);
                                }}
                                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {expandedRow === booking._id ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row Details */}
                        {expandedRow === booking._id && (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <FiUser className="w-4 h-4" />
                                    Customer Details
                                  </h4>
                                  <div className="text-sm">
                                    <div className="text-gray-600">Phone: {booking.phoneNumber}</div>
                                    <div className="text-gray-600">Email: {booking.email}</div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <IoCarSport className="w-4 h-4" />
                                    Rental Details
                                  </h4>
                                  <div className="text-sm">
                                    <div className="text-gray-600">MCO: {booking.mco}</div>
                                    <div className="text-gray-600">Payable at Pickup: ${booking.payableAtPickup.toFixed(2)}</div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <FiCalendar className="w-4 h-4" />
                                    Dates & Locations
                                  </h4>
                                  <div className="text-sm">
                                    <div className="text-gray-600">Pickup: {booking.pickupLocation}</div>
                                    <div className="text-gray-600">Dropoff: {booking.dropoffLocation}</div>
                                    <div className="text-gray-600">Dates: {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.dropoffDate).toLocaleDateString()}</div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <FiCreditCard className="w-4 h-4" />
                                    Payment Details
                                  </h4>
                                  <div className="text-sm">
                                    <div className="text-gray-600">Card: **** {booking.cardLast4}</div>
                                    <div className="text-gray-600">Expires: {booking.expiration}</div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <FiMapPin className="w-4 h-4" />
                                    Billing Address
                                  </h4>
                                  <div className="text-sm text-gray-600">{booking.billingAddress}</div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <FiBriefcase className="w-4 h-4" />
                                    Sales Info
                                  </h4>
                                  <div className="text-sm text-gray-600">Agent: {booking.salesAgent}</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{bookings.length}</span> results
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}