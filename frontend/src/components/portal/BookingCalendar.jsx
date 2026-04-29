import { useState } from "react";

function BookingCalendar({ bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  // Color mapping for booking statuses
  const statusColors = {
    PENDING: "border-amber-300 bg-amber-100",
    APPROVED: "border-emerald-300 bg-emerald-100",
    REJECTED: "border-rose-300 bg-rose-100",
    CANCELLED: "border-slate-300 bg-slate-200",
  };

  const statusTextColors = {
    PENDING: "text-amber-800",
    APPROVED: "text-emerald-800",
    REJECTED: "text-rose-800",
    CANCELLED: "text-slate-700",
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get bookings for a specific date
  const getBookingsForDate = (day) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split("T")[0];

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime).toISOString().split("T")[0];
      return bookingDate === dateStr;
    });
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Collapsed view - show Open Calendar button
  if (!isCalendarOpen) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#70071C]">
              Calendar view
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Browse your bookings by date
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Open the calendar to see your bookings laid out across the month.
            </p>
          </div>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="whitespace-nowrap rounded-2xl bg-[#70071C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0513]"
          >
            Open calendar
          </button>
        </div>
      </div>
    );
  }

  // Expanded calendar view
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#70071C]">
            Booking calendar
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {monthName} {year}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsCalendarOpen(false)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            title="Close calendar view"
          >
            Close
          </button>
          <button
            onClick={previousMonth}
            className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Prev
          </button>
          <button
            onClick={goToToday}
            className="rounded-2xl bg-[#70071C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4A0513]"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 border-b border-slate-200 pb-4 md:grid-cols-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-amber-300 bg-amber-100"></div>
          <span className="text-sm text-slate-700">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-emerald-300 bg-emerald-100"></div>
          <span className="text-sm text-slate-700">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-rose-300 bg-rose-100"></div>
          <span className="text-sm text-slate-700">Rejected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-slate-300 bg-slate-200"></div>
          <span className="text-sm text-slate-700">Cancelled</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-full grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="rounded-2xl bg-slate-100 p-3 text-center text-sm font-semibold text-slate-700"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const dayBookings = day ? getBookingsForDate(day) : [];
            const isToday =
              day &&
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
              ).toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-28 rounded-2xl border p-2 ${
                  day ? "border-slate-200 bg-white" : "border-transparent bg-slate-50"
                } ${isToday ? "border-[#70071C]/30 bg-[#70071C]/5" : ""}`}
              >
                {day && (
                  <div className="flex h-full flex-col">
                    <p
                      className={`mb-2 text-sm font-semibold ${
                        isToday ? "text-[#70071C]" : "text-slate-800"
                      }`}
                    >
                      {day}
                    </p>
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {dayBookings.map((booking, idx) => (
                        <div
                          key={idx}
                          className={`cursor-pointer rounded-xl border px-2 py-1 text-xs transition hover:opacity-80 ${
                            statusColors[booking.status]
                          } ${statusTextColors[booking.status]}`}
                          title={`${booking.assetName}\n${new Date(
                            booking.startTime
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}\n${booking.purpose}`}
                        >
                          <p className="font-semibold truncate">
                            {booking.assetName}
                          </p>
                          <p className="truncate">
                            {new Date(booking.startTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Section */}
      {bookings.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">
            Booking Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-2xl font-bold text-amber-700">
                {bookings.filter((b) => b.status === "PENDING").length}
              </p>
              <p className="text-sm text-slate-600">Pending</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-2xl font-bold text-emerald-700">
                {bookings.filter((b) => b.status === "APPROVED").length}
              </p>
              <p className="text-sm text-slate-600">Approved</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-2xl font-bold text-rose-700">
                {bookings.filter((b) => b.status === "REJECTED").length}
              </p>
              <p className="text-sm text-slate-600">Rejected</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4">
              <p className="text-2xl font-bold text-slate-700">
                {bookings.filter((b) => b.status === "CANCELLED").length}
              </p>
              <p className="text-sm text-slate-600">Cancelled</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingCalendar;
