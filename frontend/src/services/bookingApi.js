import API_BASE_URL from "./api.js";

const BOOKINGS_API_URL = `${API_BASE_URL}/bookings`;

async function parseError(response, fallbackMessage) {
  try {
    const errorData = await response.json();
    return errorData.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

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
    throw new Error(await parseError(response, "Failed to create booking"));
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
    throw new Error(await parseError(response, "Failed to fetch bookings"));
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
    throw new Error(await parseError(response, "Failed to fetch bookings"));
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
    throw new Error(await parseError(response, "Failed to fetch booking"));
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
    throw new Error(await parseError(response, "Failed to approve booking"));
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
    throw new Error(await parseError(response, "Failed to reject booking"));
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
    throw new Error(await parseError(response, "Failed to cancel booking"));
  }

  return response.json();
}
