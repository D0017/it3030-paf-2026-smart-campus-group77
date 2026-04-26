import { useState } from "react";

function BookingCalendar({ bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  // Color mapping for booking statuses
  const statusColors = {
    PENDING: "bg-yellow-200 border-yellow-400",
    APPROVED: "bg-green-200 border-green-400",
    REJECTED: "bg-red-200 border-red-400",
    CANCELLED: "bg-gray-200 border-gray-400",
  };

  const statusTextColors = {
    PENDING: "text-yellow-800",
    APPROVED: "text-green-800",
    REJECTED: "text-red-800",
    CANCELLED: "text-gray-800",
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
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calendar View</h2>
            <p className="text-gray-600 mt-2">Click "Open Calendar" to view your bookings in calendar format.</p>
          </div>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2 whitespace-nowrap"
          >
            📅 Open Calendar
          </button>
        </div>
      </div>
    );
  }

  // Expanded calendar view
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {monthName} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCalendarOpen(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
            title="Close calendar view"
          >
            ✕ Close
          </button>
          <button
            onClick={previousMonth}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition text-sm"
          >
            ← Prev
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition text-sm"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition text-sm"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
          <span className="text-sm text-gray-700">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
          <span className="text-sm text-gray-700">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
          <span className="text-sm text-gray-700">Rejected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
          <span className="text-sm text-gray-700">Cancelled</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-full">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center font-bold text-gray-700 bg-gray-100 rounded"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
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
                className={`min-h-24 p-2 rounded border-2 ${
                  day ? "bg-white border-gray-200" : "bg-gray-50 border-transparent"
                } ${isToday ? "bg-blue-50 border-blue-300" : ""}`}
              >
                {day && (
                  <div className="h-full flex flex-col">
                    <p
                      className={`text-sm font-bold mb-1 ${
                        isToday ? "text-blue-600" : "text-gray-800"
                      }`}
                    >
                      {day}
                    </p>
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {dayBookings.map((booking, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-2 py-1 rounded border-l-2 cursor-pointer hover:opacity-80 transition ${
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
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Booking Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter((b) => b.status === "PENDING").length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter((b) => b.status === "APPROVED").length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
              <p className="text-2xl font-bold text-red-600">
                {bookings.filter((b) => b.status === "REJECTED").length}
              </p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-400">
              <p className="text-2xl font-bold text-gray-600">
                {bookings.filter((b) => b.status === "CANCELLED").length}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingCalendar;
