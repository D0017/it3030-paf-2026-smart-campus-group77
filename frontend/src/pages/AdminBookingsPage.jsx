import { useEffect, useMemo, useState } from "react";
import {
  approveBooking,
  getAllBookings,
  rejectBooking,
} from "../services/bookingApi";
import { createBookingReportPdf } from "../utils/bookingReportPdf";

function StatusBadge({ status }) {
  const tones = {
    PENDING: "bg-amber-100 text-amber-800",
    APPROVED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-rose-100 text-rose-800",
    CANCELLED: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        tones[status] || tones.CANCELLED
      }`}
    >
      {status}
    </span>
  );
}

function SummaryCard({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div className="border-b border-slate-200 px-6 py-5">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

const REPORT_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending only" },
  { value: "APPROVED", label: "Approved only" },
  { value: "REJECTED", label: "Rejected only" },
  { value: "CANCELLED", label: "Cancelled only" },
];

function formatDateInputLabel(value) {
  return value || "all dates";
}

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reportStatus, setReportStatus] = useState("ALL");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportPreview, setReportPreview] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllBookings();
      const sorted = [...data].sort(
        (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
      );
      setBookings(sorted);
    } catch (loadError) {
      setError(loadError.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    return () => {
      if (reportPreview?.url) {
        URL.revokeObjectURL(reportPreview.url);
      }
    };
  }, [reportPreview]);

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "PENDING"),
    [bookings],
  );

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: pendingBookings.length,
      approved: bookings.filter((booking) => booking.status === "APPROVED").length,
      rejected: bookings.filter((booking) => booking.status === "REJECTED").length,
    }),
    [bookings, pendingBookings],
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (reportStatus !== "ALL" && booking.status !== reportStatus) {
        return false;
      }

      const bookingDate = booking.startTime.slice(0, 10);

      if (reportStartDate && bookingDate < reportStartDate) {
        return false;
      }

      if (reportEndDate && bookingDate > reportEndDate) {
        return false;
      }

      return true;
    });
  }, [bookings, reportEndDate, reportStartDate, reportStatus]);

  const reportSummary = useMemo(() => {
    return filteredBookings.reduce(
      (summary, booking) => {
        summary[booking.status] = (summary[booking.status] ?? 0) + 1;
        return summary;
      },
      {
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        CANCELLED: 0,
      },
    );
  }, [filteredBookings]);

  const reviewBooking = async (bookingId, action) => {
    try {
      setActiveBookingId(bookingId);
      setError("");
      await action();
      if (rejectingId === bookingId) {
        setRejectingId(null);
        setRejectReason("");
      }
      await loadBookings();
    } catch (reviewError) {
      setError(reviewError.message || "Failed to update booking");
    } finally {
      setActiveBookingId(null);
    }
  };

  const handleApprove = (bookingId) => {
    reviewBooking(bookingId, () => approveBooking(bookingId));
  };

  const handleReject = (bookingId) => {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason before rejecting a booking.");
      return;
    }

    reviewBooking(bookingId, () => rejectBooking(bookingId, rejectReason));
  };

  const clearReportFilters = () => {
    setReportStatus("ALL");
    setReportStartDate("");
    setReportEndDate("");
    setError("");
  };

  const generateReportPreview = () => {
    if (reportStartDate && reportEndDate && reportStartDate > reportEndDate) {
      setError("Report start date cannot be after the end date.");
      return;
    }

    const generatedAt = new Date();
    const nextPreview = createBookingReportPdf({
      bookings: filteredBookings,
      generatedAt,
      filters: {
        statusLabel:
          REPORT_STATUS_OPTIONS.find((option) => option.value === reportStatus)?.label ??
          "All statuses",
        startLabel: formatDateInputLabel(reportStartDate),
        endLabel: formatDateInputLabel(reportEndDate),
      },
    });

    setError("");
    setReportPreview((currentPreview) => {
      if (currentPreview?.url) {
        URL.revokeObjectURL(currentPreview.url);
      }
      return nextPreview;
    });
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-4xl bg-linear-to-r from-[#70071C] to-[#4A0513] px-8 py-10 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Booking review
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
              Review campus booking requests from one queue.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
              Approve valid requests quickly, record clear rejection reasons, and
              keep every booking decision visible to the admin team.
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#70071C] transition hover:bg-slate-100"
          >
            Refresh bookings
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Pending"
          value={stats.pending}
          helper="Requests waiting for an admin decision"
        />
        <SummaryCard
          label="Approved"
          value={stats.approved}
          helper="Bookings that are confirmed and active"
        />
        <SummaryCard
          label="Rejected"
          value={stats.rejected}
          helper="Requests that were declined with a reason"
        />
        <SummaryCard
          label="All Bookings"
          value={stats.total}
          helper="Complete booking activity across the platform"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading
          title="Booking report generator"
          description="Build a PDF snapshot of booking activity using status and date filters, then preview it before download."
        />

        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Report filters
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                <label className="grid gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Status</span>
                  <select
                    value={reportStatus}
                    onChange={(event) => setReportStatus(event.target.value)}
                    className="rounded-2xl border border-slate-300 bg-white px-3 py-3 outline-none transition focus:border-[#70071C] focus:ring-2 focus:ring-[#70071C]/15"
                  >
                    {REPORT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Start date</span>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(event) => setReportStartDate(event.target.value)}
                    className="rounded-2xl border border-slate-300 bg-white px-3 py-3 outline-none transition focus:border-[#70071C] focus:ring-2 focus:ring-[#70071C]/15"
                  />
                </label>

                <label className="grid gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">End date</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(event) => setReportEndDate(event.target.value)}
                    className="rounded-2xl border border-slate-300 bg-white px-3 py-3 outline-none transition focus:border-[#70071C] focus:ring-2 focus:ring-[#70071C]/15"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Included bookings
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {filteredBookings.length}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Preview and export the exact filtered results.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2 xl:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Status summary
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Pending: {reportSummary.PENDING}
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Approved: {reportSummary.APPROVED}
                  </div>
                  <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    Rejected: {reportSummary.REJECTED}
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                    Cancelled: {reportSummary.CANCELLED}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Report actions
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={generateReportPreview}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#70071C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5c0617]"
                >
                  Generate PDF preview
                </button>
                <button
                  type="button"
                  onClick={clearReportFilters}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Clear filters
                </button>
                {reportPreview && (
                  <a
                    href={reportPreview.url}
                    download={reportPreview.fileName}
                    className="inline-flex items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Download report
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  PDF preview
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {reportPreview
                    ? `${reportPreview.previewTitle} • ${reportPreview.pageCount} page${reportPreview.pageCount > 1 ? "s" : ""}`
                    : "Generate a report to preview it here."}
                </p>
              </div>
            </div>

            {reportPreview ? (
              <iframe
                title="Booking report PDF preview"
                src={reportPreview.url}
                className="mt-4 min-h-[720px] w-full rounded-2xl border border-slate-200 bg-white"
              />
            ) : (
              <div className="mt-4 flex min-h-[720px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm leading-7 text-slate-500">
                Select the filters you want and generate a PDF preview for the current
                booking report.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading
          title="Booking requests"
          description="Pending requests stay actionable at the top, while completed decisions remain visible for audit."
        />

        {loading ? (
          <div className="px-6 py-10 text-sm font-medium text-slate-500">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            No bookings have been submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {bookings.map((booking) => {
              const isBusy = activeBookingId === booking.id;
              const isPending = booking.status === "PENDING";

              return (
                <article key={booking.id} className="px-6 py-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {booking.assetName}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="font-semibold text-slate-900">Requested by</p>
                          <p>{booking.userName}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Start</p>
                          <p>{new Date(booking.startTime).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">End</p>
                          <p>{new Date(booking.endTime).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Attendees</p>
                          <p>{booking.expectedAttendees}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">Purpose</p>
                        <p className="mt-1 leading-6">{booking.purpose}</p>
                      </div>

                      {booking.rejectionReason && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          <p className="font-semibold">Rejection reason</p>
                          <p className="mt-1 leading-6">{booking.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="w-full max-w-sm shrink-0 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Admin actions
                      </p>

                      {isPending ? (
                        <div className="mt-4 space-y-3">
                          <button
                            type="button"
                            onClick={() => handleApprove(booking.id)}
                            disabled={isBusy}
                            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                          >
                            {isBusy ? "Updating..." : "Approve booking"}
                          </button>

                          {rejectingId === booking.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={rejectReason}
                                onChange={(event) => setRejectReason(event.target.value)}
                                rows="4"
                                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-[#70071C] focus:ring-2 focus:ring-[#70071C]/15"
                                placeholder="Add a clear rejection reason"
                              />
                              <button
                                type="button"
                                onClick={() => handleReject(booking.id)}
                                disabled={isBusy}
                                className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                              >
                                {isBusy ? "Updating..." : "Confirm rejection"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectReason("");
                                  setError("");
                                }}
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingId(booking.id);
                                setRejectReason("");
                                setError("");
                              }}
                              disabled={isBusy}
                              className="w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Reject booking
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-slate-500">
                          This booking has already been reviewed and no further admin action is available.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminBookingsPage;
