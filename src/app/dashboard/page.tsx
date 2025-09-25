// app/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FiEdit,
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
import LoadingScreen from "@/components/LoadingScreen";
import ConfirmCancelModal from "@/components/ConfirmCancelModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchBookings } from "../store/slices/bookingSlice";

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
  createdAt: string;
  status: "BOOKED" | "MODIFIED" | "CANCELLED" | "ALL";
}

type BookingStatus = Booking["status"];
type SortableField = keyof Booking;
type SortDirection = "ascending" | "descending";

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { bookingsList, listLoading, error } = useAppSelector(state => state.booking);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField;
    direction: SortDirection
  } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  // Fetch bookings from API
  // useEffect(() => {
  //   async function fetchBookings() {
  //     try {
  //       setLoading(true);
  //       const res = await fetch("/api/bookings", {
  //         method: "GET",
  //         credentials: "include",
  //       });

  //       if (!res.ok) {
  //         throw new Error("Failed to fetch bookings");
  //       }

  //       const data = await res.json();
  //       setBookings(data.bookings || []);
  //     } catch (err: unknown) {
  //       const message = err instanceof Error ? err.message : "Error loading bookings";
  //       toast.error(message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchBookings();
  // }, []);


  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const cancelBooking = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to cancel booking");

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "CANCELLED" } : b))
      );
      toast.success("Booking cancelled successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error cancelling booking";
      toast.error(message);
    } finally {
      setShowCancelModal(false);
      setBookingToCancel(null);
    }
  }, []);

  const handleCancelClick = useCallback((id: string) => {
    setBookingToCancel(id);
    setShowCancelModal(true);
  }, []);

  const handleSort = useCallback((key: SortableField) => {
    let direction: SortDirection = "ascending";
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const sortedBookings = useMemo(() => {
    if (!sortConfig) return bookingsList;

    return [...bookingsList].sort((a, b) => {
      const { key, direction } = sortConfig;
      const aValue = a[key];
      const bValue = b[key];

      // Handle null/undefined values
      if (aValue == null || bValue == null) {
        if (aValue == null && bValue == null) return 0;
        return aValue == null ? (direction === "ascending" ? -1 : 1) : (direction === "ascending" ? 1 : -1);
      }

      // Check if values are likely dates (string dates)
      const isLikelyDate = (value: unknown): boolean => {
        if (typeof value === 'string') {
          // Try to parse as date
          const date = new Date(value);
          return !isNaN(date.getTime());
        }
        return false;
      };

      if (isLikelyDate(aValue) && isLikelyDate(bValue)) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return direction === "ascending"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [bookingsList, sortConfig]);

  // ✅ Filtering logic (with ALL tab)
  const filteredBookings = useMemo(() => {
    return sortedBookings.filter((b) => {
      const matchesTab = activeTab === "ALL" || b.status === activeTab;
      const matchesSearch =
        b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [sortedBookings, activeTab, searchTerm]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getStatusIcon = useCallback((status: BookingStatus) => {
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
  }, []);

  const getStatusColor = useCallback((status: BookingStatus) => {
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
  }, []);

  // Tab counts
  const statusCounts = useMemo(
    () => ({
      ALL: bookingsList.length,
      BOOKED: bookingsList.filter((b) => b.status === "BOOKED").length,
      MODIFIED: bookingsList.filter((b) => b.status === "MODIFIED").length,
      CANCELLED: bookingsList.filter((b) => b.status === "CANCELLED").length,
    }),
    [bookingsList]
  );

  const tabs = useMemo(
    () => [
      { key: "ALL" as const, label: "All Bookings", count: statusCounts.ALL },
      {
        key: "BOOKED" as const,
        label: "Active Bookings",
        count: statusCounts.BOOKED,
      },
      {
        key: "MODIFIED" as const,
        label: "Modified",
        count: statusCounts.MODIFIED,
      },
      {
        key: "CANCELLED" as const,
        label: "Cancelled",
        count: statusCounts.CANCELLED,
      },
    ],
    [statusCounts]
  );

  if (listLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bookings by name, email, or phone number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {getStatusIcon(tab.key)}
                {tab.label}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.key ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'
                    }`}
                >
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
                  {[
                    { key: 'createdAt', label: 'Date' },
                    { key: 'fullName', label: 'Customer' },
                    { key: 'rentalCompany', label: 'Company' },
                    { key: 'mco', label: 'MCO' },
                    { key: 'pickupDate', label: 'Pickup Date' },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort(key as SortableField)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {sortConfig?.key === key && (
                          sortConfig.direction === 'ascending' ?
                            <FiChevronUp className="w-4 h-4" /> :
                            <FiChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th> */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modify
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500 text-lg">No {activeTab.toLowerCase()} bookings found</div>
                      <p className="text-gray-400 mt-2">Try adjusting your search or create a new booking</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((booking) => (
                    <BookingRow
                      key={booking._id}
                      booking={booking}
                      expanded={expandedRow === booking._id}
                      onExpand={() => setExpandedRow(expandedRow === booking._id ? null : booking._id)}
                      onCancel={handleCancelClick}
                      getStatusIcon={getStatusIcon}
                      getStatusColor={getStatusColor}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredBookings.length)}
                  </span> of <span className="font-medium">{filteredBookings.length}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {
        showCancelModal && (
          <>
            {/* Cancel Confirmation Modal */}
            <ConfirmCancelModal
              isOpen={showCancelModal}
              onClose={() => {
                setShowCancelModal(false);
                setBookingToCancel(null);
              }}
              onConfirm={() => {
                if (bookingToCancel) {
                  cancelBooking(bookingToCancel);
                }
              }}
            />
          </>
        )
      }

    </div>
  );
}


// Booking Row Component
interface BookingRowProps {
  booking: Booking;
  expanded: boolean;
  onExpand: () => void;
  onCancel: (id: string) => void;
  getStatusIcon: (status: BookingStatus) => React.ReactElement | null;
  getStatusColor: (status: BookingStatus) => string;
}

function BookingRow({
  booking,
  expanded,
  onExpand,
  getStatusIcon,
  getStatusColor
}: BookingRowProps) {
  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={onExpand}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {new Date(booking.createdAt).toLocaleDateString('en-CA', {
              timeZone: 'America/Vancouver',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{booking.fullName}</div>
              <div className="text-sm text-gray-500">
                {(() => {
                  const [localPart, domain] = booking.email.split('@');
                  return `${localPart.slice(0, 2)}******${localPart.slice(-3)}@${domain}`;
                })()}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{booking.rentalCompany}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">${Number(booking.mco).toFixed(2)}</div>
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
        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center gap-2">
            <Link
              href={`/bookings/${booking._id}/view`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
            >
              View Details
            </Link>
          </div>
        </td> */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center gap-2">
            {/* Existing Customer */}
            <Link
              href={`/bookings/new?id=${booking._id}`}
              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FiEdit className="w-4 h-4" />
            </Link>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center gap-2">
            {/* Existing Customer */}
            {booking.status !== "CANCELLED" ? (
              <Link
                href={`/bookings/modification?id=${booking._id}`}
                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FiEdit className="w-4 h-4" />
              </Link>
            ) : (
              <span
                className="text-gray-400 p-2 rounded-lg cursor-not-allowed opacity-50"
                title="Cannot modify a cancelled booking"
              >
                <FiEdit className="w-4 h-4" />
              </span>
            )}


            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {expanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Row Details */}
      {expanded && (
        <tr>
          <td colSpan={8} className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Customer Details
                </h4>
                <div className="text-sm">
                  <div className="text-gray-600">
                    Phone: ******{booking.phoneNumber.slice(-4)}
                  </div>
                  <div className="text-gray-600">
                    Email: {(() => {
                      const [localPart, domain] = booking.email.split('@');
                      return `${localPart.slice(0, 2)}******${localPart.slice(-3)}@${domain}`;
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <IoCarSport className="w-4 h-4" />
                  Rental Details
                </h4>
                <div className="text-sm">
                  <div className="text-gray-600">Total: ${Number(booking.total)}</div>
                  <div className="text-gray-600">Payable at Pickup: ${Number(booking.payableAtPickup).toFixed(2)}</div>
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
                  <div className="text-gray-600">
                    Dates: {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                    {new Date(booking.dropoffDate).toLocaleDateString()}
                  </div>
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

            <div className="mt-4 flex justify-end space-x-3">
              <Link
                href={`/bookings/${booking._id}/view`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
              >
                View Full Details
              </Link>

              {booking.status !== "CANCELLED" && (
                <Link
                  href={`/bookings/cancellation?id=${booking._id}`}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-70 text-white text-sm font-medium rounded-md transition"
                >
                  Cancel Booking
                </Link>)}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}