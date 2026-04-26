import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
} from "../services/bookingApi.js";
import { useNavigate } from "react-router-dom";
import BookingCalendar from "../components/portal/BookingCalendar";

function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    assetId: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data =
        user?.role === "ADMIN" ? await getAllBookings() : await getUserBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "assetId" || name === "expectedAttendees"
          ? parseInt(value) || ""
          : value,
    }));
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case "assetId":
        if (!value || value <= 0) {
          errors.assetId = "Asset ID must be a positive number";
        } else {
          delete errors.assetId;
        }
        break;

      case "startTime":
        if (!value) {
          errors.startTime = "Start time is required";
        } else {
          const startDate = new Date(value);
          const now = new Date();
          if (startDate < now) {
            errors.startTime = "Start time cannot be in the past";
          } else {
            delete errors.startTime;
          }
        }
        // Check endTime validation when startTime changes
        if (formData.endTime) {
          validateEndTime(value, formData.endTime, errors);
        }
        break;

      case "endTime":
        validateEndTime(formData.startTime, value, errors);
        break;

      case "purpose":
        if (!value || value.trim().length === 0) {
          errors.purpose = "Purpose is required";
        } else if (value.trim().length < 3) {
          errors.purpose = "Purpose must be at least 3 characters";
        } else if (value.length > 500) {
          errors.purpose = "Purpose cannot exceed 500 characters";
        } else {
          delete errors.purpose;
        }
        break;

      case "expectedAttendees":
        if (!value || value <= 0) {
          errors.expectedAttendees = "Expected attendees must be a positive number";
        } else if (value > 1000) {
          errors.expectedAttendees = "Expected attendees cannot exceed 1000";
        } else {
          delete errors.expectedAttendees;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
  };

  const validateEndTime = (startTimeValue, endTimeValue, errors) => {
    if (!endTimeValue) {
      errors.endTime = "End time is required";
    } else if (!startTimeValue) {
      delete errors.endTime;
    } else {
      const startDate = new Date(startTimeValue);
      const endDate = new Date(endTimeValue);
      const minDuration = 15; // Minimum 15 minutes

      if (endDate <= startDate) {
        errors.endTime = "End time must be after start time";
      } else {
        const durationMinutes = (endDate - startDate) / (1000 * 60);
        if (durationMinutes < minDuration) {
          errors.endTime = `Booking duration must be at least ${minDuration} minutes`;
        } else {
          delete errors.endTime;
        }
      }
    }
  };

  const formatDateTime = (value) => {
    // Convert from datetime-local format (YYYY-MM-DDTHH:mm) to ISO 8601 (YYYY-MM-DDTHH:mm:ss)
    if (value.length === 16) {
      return value + ":00";
    }
    return value;
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    
    if (!formData.assetId || formData.assetId <= 0) {
      newErrors.assetId = "Asset ID must be a positive number";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (!formData.purpose || formData.purpose.trim().length < 3) {
      newErrors.purpose = "Purpose must be at least 3 characters";
    }
    if (!formData.expectedAttendees || formData.expectedAttendees <= 0) {
      newErrors.expectedAttendees = "Expected attendees must be a positive number";
    }
    
    if (formData.startTime && formData.endTime) {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      const durationMinutes = (endDate - startDate) / (1000 * 60);
      
      if (endDate <= startDate) {
        newErrors.endTime = "End time must be after start time";
      } else if (durationMinutes < 15) {
        newErrors.endTime = "Booking duration must be at least 15 minutes";
      }
    }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError("Please fix the validation errors below");
      return;
    }

    try {
      const payload = {
        assetId: formData.assetId,
        startTime: formatDateTime(formData.startTime),
        endTime: formatDateTime(formData.endTime),
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees,
      };

      await createBooking(payload);
      setFormData({
        assetId: "",
        startTime: "",
        endTime: "",
        purpose: "",
        expectedAttendees: "",
      });
      setShowForm(false);
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to create booking");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to cancel booking");
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await approveBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to approve booking");
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      if (!rejectReason.trim()) {
        setError("Please provide a rejection reason");
        return;
      }
      await rejectBooking(bookingId, rejectReason);
      setRejectingId(null);
      setRejectReason("");
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to reject booking");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bookings</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Calendar View */}
        {!loading && bookings.length > 0 && (
          <BookingCalendar bookings={bookings} />
        )}

        {user?.role !== "ADMIN" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "New Booking"}
          </button>
        )}

        {showForm && user?.role !== "ADMIN" && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create a Booking</h2>
            <form onSubmit={handleCreateBooking}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset ID
                  </label>
                  <input
                    type="number"
                    name="assetId"
                    value={formData.assetId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      validationErrors.assetId
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {validationErrors.assetId && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors.assetId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      validationErrors.startTime
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {validationErrors.startTime && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors.startTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      validationErrors.endTime
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {validationErrors.endTime && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors.endTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    name="expectedAttendees"
                    value={formData.expectedAttendees}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      validationErrors.expectedAttendees
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {validationErrors.expectedAttendees && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors.expectedAttendees}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    validationErrors.purpose
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  rows="3"
                  maxLength="500"
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {validationErrors.purpose && (
                    <p className="text-red-600 text-xs">
                      {validationErrors.purpose}
                    </p>
                  )}
                  <p className={`text-xs ml-auto ${
                    formData.purpose.length > 450
                      ? "text-orange-600"
                      : "text-gray-500"
                  }`}>
                    {formData.purpose.length}/500 characters
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={Object.keys(validationErrors).length > 0}
                className={`w-full px-4 py-2 rounded-lg transition text-white font-medium ${
                  Object.keys(validationErrors).length > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Create Booking
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No bookings found
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.assetName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Booked by: {booking.userName}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Start Time</p>
                    <p className="text-sm font-medium">
                      {new Date(booking.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">End Time</p>
                    <p className="text-sm font-medium">
                      {new Date(booking.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expected Attendees</p>
                    <p className="text-sm font-medium">
                      {booking.expectedAttendees}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Purpose</p>
                    <p className="text-sm font-medium">{booking.purpose}</p>
                  </div>
                </div>

                {booking.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {booking.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {user?.role === "ADMIN" && booking.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleApproveBooking(booking.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(booking.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {booking.status === "APPROVED" && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                    >
                      Cancel
                    </button>
                  )}

                  {user?.role !== "ADMIN" &&
                    booking.status === "PENDING" && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                      >
                        Cancel
                      </button>
                    )}
                </div>

                {rejectingId === booking.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium mb-2">
                      Rejection Reason
                    </p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                      rows="2"
                      placeholder="Enter rejection reason..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRejectBooking(booking.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;