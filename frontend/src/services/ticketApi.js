import API_BASE_URL from "./api";

export async function createTicket(ticketData, userId) {
  const response = await fetch(`${API_BASE_URL}/tickets?userId=${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  if (!response.ok) {
    throw new Error("Failed to create ticket");
  }

  return response.json();
}

export async function getAllTickets() {
  const response = await fetch(`${API_BASE_URL}/tickets`);

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  return response.json();
}

export async function assignTechnician(ticketId, technicianId) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/assign-technician?technicianId=${technicianId}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to assign technician");
  }

  return response.json();
}

export async function acceptTicket(ticketId) {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/accept`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to accept ticket");
  }

  return response.json();
}

export async function rejectTicket(ticketId, reason) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/reject?reason=${encodeURIComponent(reason)}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to reject ticket");
  }

  return response.json();
}

export async function resolveTicket(ticketId, resolutionNotes) {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/resolve?resolutionNotes=${encodeURIComponent(resolutionNotes)}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to resolve ticket");
  }

  return response.json();
}

export async function closeTicket(ticketId) {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/close`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to close ticket");
  }

  return response.json();
}