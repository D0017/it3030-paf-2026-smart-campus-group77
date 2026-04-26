import API_BASE_URL from "./api.js";

const BOOKINGS_API_URL = `${API_BASE_URL}/bookings`;

export async function createBooking(bookingData) {
  const response = await fetch(BOOKINGS_API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    let errorMessage = "Failed to create booking";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getUserBookings() {
  const response = await fetch(BOOKINGS_API_URL, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}

export async function getAllBookings() {
  const response = await fetch(BOOKINGS_API_URL, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}

export async function getBookingById(id) {
  const response = await fetch(`${BOOKINGS_API_URL}/${id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch booking");
  }

  return response.json();
}

export async function approveBooking(id, rejectionReason = null) {
  const response = await fetch(`${BOOKINGS_API_URL}/${id}/approval`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      approved: true,
      rejectionReason: rejectionReason,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to approve booking");
  }

  return response.json();
}

export async function rejectBooking(id, rejectionReason) {
  const response = await fetch(`${BOOKINGS_API_URL}/${id}/approval`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      approved: false,
      rejectionReason: rejectionReason,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to reject booking");
  }

  return response.json();
}

export async function cancelBooking(id) {
  const response = await fetch(`${BOOKINGS_API_URL}/${id}/cancel`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to cancel booking");
  }

  return response.json();
}
