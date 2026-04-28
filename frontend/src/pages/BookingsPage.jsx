import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getAssets } from "../services/assetApi.js";
import {
  cancelBooking,
  createBooking,
  getAvailableTimeSlots,
  getResourceAvailability,
  getUserBookings,
} from "../services/bookingApi.js";
import BookingCalendar from "../components/portal/BookingCalendar";
import BookingQrCode from "../components/portal/BookingQrCode";
import AdminBookingsPage from "./AdminBookingsPage";

const INITIAL_FORM = {
  assetId: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "",
};

function BookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [resourceAvailability, setResourceAvailability] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!currentUser || currentUser.role === "ADMIN") {
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        setError(null);

        const [bookingData, assetData] = await Promise.all([
          getUserBookings(),
          getAssets(),
        ]);

        setBookings(bookingData);
        setAssets(assetData);
      } catch (err) {
        setError(err.message || "Failed to load booking data");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  useEffect(() => {
    const hasWindow = formData.startTime && formData.endTime;
    const hasAttendees = Number(formData.expectedAttendees) > 0;

    if (!showForm || !hasWindow || !hasAttendees || Object.keys(validationErrors).length > 0) {
      setResourceAvailability([]);
      setAvailableSlots([]);
      setAvailabilityError(null);
      return;
    }

    void (async () => {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError(null);

        const availability = await getResourceAvailability({
          startTime: formatDateTime(formData.startTime),
          endTime: formatDateTime(formData.endTime),
          expectedAttendees: Number(formData.expectedAttendees),
        });

        setResourceAvailability(availability);
      } catch (err) {
        setAvailabilityError(err.message || "Failed to load resource availability");
      } finally {
        setAvailabilityLoading(false);
      }
    })();
  }, [
    formData.startTime,
    formData.endTime,
    formData.expectedAttendees,
    showForm,
    validationErrors,
  ]);

  useEffect(() => {
    if (!showForm || !formData.assetId || !formData.startTime || !formData.endTime) {
      setAvailableSlots([]);
      return;
    }

    const durationMinutes = getDurationMinutes(formData.startTime, formData.endTime);
    if (!durationMinutes || durationMinutes <= 0) {
      setAvailableSlots([]);
      return;
    }

    void (async () => {
      try {
        setSlotsLoading(true);

        const slots = await getAvailableTimeSlots({
          assetId: Number(formData.assetId),
          date: formData.startTime.slice(0, 10),
          durationMinutes,
          expectedAttendees: Number(formData.expectedAttendees),
        });

        setAvailableSlots(slots);
      } catch (err) {
        setAvailableSlots([]);
        setAvailabilityError(err.message || "Failed to load time slots");
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, [
    formData.assetId,
    formData.startTime,
    formData.endTime,
    formData.expectedAttendees,
    showForm,
  ]);

  const selectedAvailability = useMemo(
    () =>
      resourceAvailability.find(
        (resource) => resource.assetId === Number(formData.assetId),
      ) || null,
    [formData.assetId, resourceAvailability],
  );

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === Number(formData.assetId)) || null,
    [assets, formData.assetId],
  );

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

  const handleSlotSelection = (slot) => {
    setFormData((previous) => ({
      ...previous,
      startTime: toDateTimeLocalValue(slot.startTime),
      endTime: toDateTimeLocalValue(slot.endTime),
    }));
    setValidationErrors((previous) => {
      const nextErrors = { ...previous };
      delete nextErrors.startTime;
      delete nextErrors.endTime;
      return nextErrors;
    });
    setError(null);
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();

    const newErrors = runFullValidation();
    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError("Please fix the validation errors below");
      return;
    }

    if (selectedAvailability && !selectedAvailability.available) {
      setError("Selected resource is not available for this time. Please choose another resource or slot.");
      return;
    }

    try {
      setFormLoading(true);
      setError(null);

      await createBooking({
        assetId: formData.assetId,
        startTime: formatDateTime(formData.startTime),
        endTime: formatDateTime(formData.endTime),
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees,
      });

      setFormData(INITIAL_FORM);
      setValidationErrors({});
      setResourceAvailability([]);
      setAvailableSlots([]);
      setShowForm(false);
      const [bookingData, assetData] = await Promise.all([
        getUserBookings(),
        getAssets(),
      ]);
      setBookings(bookingData);
      setAssets(assetData);
    } catch (err) {
      setError(err.message || "Failed to create booking");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      const [bookingData, assetData] = await Promise.all([
        getUserBookings(),
        getAssets(),
      ]);
      setBookings(bookingData);
      setAssets(assetData);
    } catch (err) {
      setError(err.message || "Failed to cancel booking");
    }
  };

  const runFullValidation = () => {
    const errors = {};

    if (!formData.assetId || formData.assetId <= 0) {
      errors.assetId = "Please select a resource";
    }
    if (!formData.startTime) {
      errors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      errors.endTime = "End time is required";
    }
    if (!formData.purpose || formData.purpose.trim().length < 3) {
      errors.purpose = "Purpose must be at least 3 characters";
    }
    if (!formData.expectedAttendees || formData.expectedAttendees <= 0) {
      errors.expectedAttendees = "Expected attendees must be a positive number";
    }

    if (formData.startTime && formData.endTime) {
      validateEndTime(formData.startTime, formData.endTime, errors);
    }

    return errors;
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case "assetId":
        if (!value || Number(value) <= 0) {
          errors.assetId = "Please select a resource";
        } else {
          delete errors.assetId;
        }
        break;
      case "startTime":
        if (!value) {
          errors.startTime = "Start time is required";
        } else if (new Date(value) < new Date()) {
          errors.startTime = "Start time cannot be in the past";
        } else {
          delete errors.startTime;
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
        if (!value || Number(value) <= 0) {
          errors.expectedAttendees = "Expected attendees must be a positive number";
        } else if (Number(value) > 1000) {
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

  if (currentUser?.role === "ADMIN") {
    return <AdminBookingsPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Check live resource availability before you place a booking.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setError(null);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "New Booking"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800">
            {error}
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="mb-8">
            <BookingCalendar bookings={bookings} />
          </div>
        )}

        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900">Create a Booking</h2>
            <p className="mt-1 text-sm text-gray-600">
              Pick a time window first, then choose from resources that are actually free.
            </p>

            <form onSubmit={handleCreateBooking} className="mt-6">
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label="Start Time"
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  error={validationErrors.startTime}
                />
                <FormField
                  label="End Time"
                  name="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  error={validationErrors.endTime}
                />
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Resource
                  </label>
                  <select
                    name="assetId"
                    value={formData.assetId}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      validationErrors.assetId
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Select a resource</option>
                    {assets.map((asset) => {
                      const availability = resourceAvailability.find(
                        (resource) => resource.assetId === asset.id,
                      );
                      const availabilityLabel = availability
                        ? availability.available
                          ? "Available"
                          : availability.message
                        : asset.status;

                      return (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} ({asset.type}) - {availabilityLabel}
                        </option>
                      );
                    })}
                  </select>
                  {validationErrors.assetId && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.assetId}
                    </p>
                  )}
                </div>

                <FormField
                  label="Expected Attendees"
                  name="expectedAttendees"
                  type="number"
                  value={formData.expectedAttendees}
                  onChange={handleInputChange}
                  error={validationErrors.expectedAttendees}
                  min="1"
                />
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

              <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Resource Availability
                    </h3>
                    {availabilityLoading && (
                      <span className="text-xs text-slate-500">Checking...</span>
                    )}
                  </div>

                  {availabilityError ? (
                    <p className="text-sm text-red-600">{availabilityError}</p>
                  ) : resourceAvailability.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Enter time and attendee details to see matching resources.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {resourceAvailability.map((resource) => (
                        <button
                          type="button"
                          key={resource.assetId}
                          onClick={() =>
                            setFormData((previous) => ({
                              ...previous,
                              assetId: resource.assetId,
                            }))
                          }
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            Number(formData.assetId) === resource.assetId
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {resource.assetName}
                              </p>
                              <p className="text-sm text-slate-600">
                                {resource.assetType} • {resource.location} • Capacity{" "}
                                {resource.capacity}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                resource.available
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {resource.message}
                            </span>
                          </div>

                          {resource.suggestedTimeSlots?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {resource.suggestedTimeSlots.map((slot) => (
                                <span
                                  key={`${resource.assetId}-${slot.startTime}`}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                                >
                                  {slot.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Suggested Slots
                    </h3>
                    {slotsLoading && (
                      <span className="text-xs text-slate-500">Loading...</span>
                    )}
                  </div>

                  {selectedAsset ? (
                    <p className="mb-3 text-sm text-slate-600">
                      {selectedAsset.name} {selectedAvailability ? `• ${selectedAvailability.message}` : ""}
                    </p>
                  ) : (
                    <p className="mb-3 text-sm text-slate-500">
                      Pick a resource to browse its free time slots.
                    </p>
                  )}

                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No alternate slots found for the selected day yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableSlots.slice(0, 8).map((slot) => (
                        <button
                          type="button"
                          key={slot.startTime}
                          onClick={() => handleSlotSelection(slot)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading || Object.keys(validationErrors).length > 0}
                className={`w-full rounded-lg px-4 py-2 font-medium text-white transition ${
                  formLoading || Object.keys(validationErrors).length > 0
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {formLoading ? "Creating Booking..." : "Create Booking"}
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
                <div className="mb-4 flex items-start justify-between">
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
                  <InfoBlock
                    label="Start Time"
                    value={new Date(booking.startTime).toLocaleString()}
                  />
                  <InfoBlock
                    label="End Time"
                    value={new Date(booking.endTime).toLocaleString()}
                  />
                  <InfoBlock
                    label="Expected Attendees"
                    value={booking.expectedAttendees}
                  />
                  <InfoBlock label="Purpose" value={booking.purpose} />
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
                  {(booking.status === "APPROVED" || booking.status === "PENDING") && (
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

function FormField({ label, error, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`w-full rounded-lg border px-3 py-2 ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        }`}
        required
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function getDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) {
    return null;
  }

  return Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60));
}

function formatDateTime(value) {
  if (value.length === 16) {
    return `${value}:00`;
  }

  return value;
}

function toDateTimeLocalValue(value) {
  const date = new Date(value);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function getStatusColor(status) {
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
}

export default BookingsPage;
