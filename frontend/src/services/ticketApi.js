import API_BASE_URL from "./api";

async function handleResponse(response, fallbackMessage) {
  if (!response.ok) {
    let errorMessage = fallbackMessage;

    try {
      const data = await response.json();
      errorMessage = data.message || data.error || fallbackMessage;
    } catch {
      try {
        errorMessage = await response.text();
      } catch {
        errorMessage = fallbackMessage;
      }
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function createTicket(ticketData, userId) {
  const response = await fetch(`${API_BASE_URL}/tickets?userId=${userId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  return handleResponse(response, "Failed to create ticket");
}

export async function getAllTickets() {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    credentials: "include",
  });

  return handleResponse(response, "Failed to fetch tickets");
}

export async function getUserTickets(userId) {
  const response = await fetch(`${API_BASE_URL}/tickets/user?userId=${userId}`, {
    credentials: "include",
  });

  return handleResponse(response, "Failed to fetch your tickets");
}

export async function getTechnicianTickets(technicianId) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/technician?technicianId=${technicianId}`,
    {
      credentials: "include",
    }
  );

  return handleResponse(response, "Failed to fetch assigned tickets");
}

export async function getTechnicians() {
  const response = await fetch(`${API_BASE_URL}/tickets/technicians`, {
    credentials: "include",
  });

  return handleResponse(response, "Failed to fetch technicians");
}

export async function assignTechnician(ticketId, technicianId) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/assign-technician?technicianId=${technicianId}`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  return handleResponse(response, "Failed to assign technician");
}

export async function acceptTicket(ticketId, technicianId) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/accept?technicianId=${technicianId}`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  return handleResponse(response, "Failed to accept ticket");
}

export async function rejectTicket(ticketId, technicianId, reason) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/reject?technicianId=${technicianId}&reason=${encodeURIComponent(reason)}`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  return handleResponse(response, "Failed to reject ticket");
}

export async function resolveTicket(ticketId, technicianId, resolutionNotes) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/resolve?technicianId=${technicianId}&resolutionNotes=${encodeURIComponent(
      resolutionNotes
    )}`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  return handleResponse(response, "Failed to resolve ticket");
}

export async function closeTicket(ticketId, userId) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/close?userId=${userId}`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  return handleResponse(response, "Failed to close ticket");
}

export async function deleteTicket(ticketId, userId) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}?userId=${userId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return handleResponse(response, "Failed to delete ticket");
}