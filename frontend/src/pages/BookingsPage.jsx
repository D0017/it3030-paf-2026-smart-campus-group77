import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  cancelBooking,
  createBooking,
  getUserBookings,
} from "../services/bookingApi.js";
import BookingCalendar from "../components/portal/BookingCalendar";
import BookingQrCode from "../components/portal/BookingQrCode";
import AdminBookingsPage from "./AdminBookingsPage";

function BookingsPage() {
  const { currentUser } = useAuth();
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
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!currentUser || currentUser.role === "ADMIN") {
      return;
    }

    loadBookings();
  }, [currentUser]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "assetId" || name === "expectedAttendees"
          ? parseInt(value, 10) || ""
          : value,
    }));

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
      return;
    }

    if (!startTimeValue) {
      delete errors.endTime;
      return;
    }

    const startDate = new Date(startTimeValue);
    const endDate = new Date(endTimeValue);
    const durationMinutes = (endDate - startDate) / (1000 * 60);

    if (endDate <= startDate) {
      errors.endTime = "End time must be after start time";
    } else if (durationMinutes < 15) {
      errors.endTime = "Booking duration must be at least 15 minutes";
    } else {
      delete errors.endTime;
    }
  };

  const formatDateTime = (value) => {
    if (value.length === 16) {
      return `${value}:00`;
    }

    return value;
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();

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
      validateEndTime(formData.startTime, formData.endTime, newErrors);
    }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError("Please fix the validation errors below");
      return;
    }

    try {
      setError(null);
      await createBooking({
        assetId: formData.assetId,
        startTime: formatDateTime(formData.startTime),
        endTime: formatDateTime(formData.endTime),
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees,
      });

      setFormData({
        assetId: "",
        startTime: "",
        endTime: "",
        purpose: "",
        expectedAttendees: "",
      });
      setValidationErrors({});
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

  if (currentUser?.role === "ADMIN") {
    return <AdminBookingsPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Bookings</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800">
            {error}
          </div>
        )}

        {!loading && bookings.length > 0 && <BookingCalendar bookings={bookings} />}

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "New Booking"}
        </button>

        {showForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Create a Booking</h2>
            <form onSubmit={handleCreateBooking}>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Asset ID
                  </label>
                  <input
                    type="number"
                    name="assetId"
                    value={formData.assetId}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      validationErrors.assetId
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {validationErrors.assetId && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.assetId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      validationErrors.startTime
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {validationErrors.startTime && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.startTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      validationErrors.endTime
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {validationErrors.endTime && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.endTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    name="expectedAttendees"
                    value={formData.expectedAttendees}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      validationErrors.expectedAttendees
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {validationErrors.expectedAttendees && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.expectedAttendees}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Purpose
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 ${
                    validationErrors.purpose
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  rows="3"
                  maxLength="500"
                  required
                />
                <div className="mt-1 flex items-center justify-between">
                  {validationErrors.purpose && (
                    <p className="text-xs text-red-600">{validationErrors.purpose}</p>
                  )}
                  <p
                    className={`ml-auto text-xs ${
                      formData.purpose.length > 450
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.purpose.length}/500 characters
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={Object.keys(validationErrors).length > 0}
                className={`w-full rounded-lg px-4 py-2 font-medium text-white transition ${
                  Object.keys(validationErrors).length > 0
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Create Booking
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No bookings found</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg"
              >
                <div className="mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.assetName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Booked by: {booking.userName}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                      booking.status,
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
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
                  <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {booking.rejectionReason}
                    </p>
                  </div>
                )}

                {booking.status === "APPROVED" && booking.qrCodeValue && (
                  <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        Entry QR
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        Show this QR code when entering the booked resource.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Scanning the code opens a live booking validation page tied to this approved booking.
                      </p>
                      {booking.qrIssuedAt && (
                        <p className="mt-3 text-xs text-slate-500">
                          Issued on {new Date(booking.qrIssuedAt).toLocaleString()}
                        </p>
                      )}
                      <a
                        href={booking.qrCodeValue}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center justify-center rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Open validation page
                      </a>
                    </div>

                    <a
                      href={booking.qrCodeValue}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block cursor-pointer transition hover:opacity-90"
                    >
                      <BookingQrCode value={booking.qrCodeValue} />
                    </a>
                  </div>
                )}

                <div className="flex gap-2">
                  {booking.status === "APPROVED" && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition hover:bg-orange-700"
                    >
                      Cancel
                    </button>
                  )}

                  {booking.status === "PENDING" && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition hover:bg-orange-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;
