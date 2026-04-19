import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getAllTickets,
  getUserTickets,
  getTechnicianTickets,
  getTechnicians,
  assignTechnician,
  acceptTicket,
  rejectTicket,
  resolveTicket,
  closeTicket,
  deleteTicket,
  uploadTicketAttachment,
  getTicketAttachments,
  getAttachmentDownloadUrl,
} from "../services/ticketApi";

function TicketsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [attachmentLists, setAttachmentLists] = useState({});
  const [attachmentFiles, setAttachmentFiles] = useState({});
  const [attachmentErrors, setAttachmentErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");

  const [assignTech, setAssignTech] = useState({});
  const [assignErrors, setAssignErrors] = useState({});
  const [rejectReasons, setRejectReasons] = useState({});
  const [rejectErrors, setRejectErrors] = useState({});
  const [resolutionNotes, setResolutionNotes] = useState({});
  const [resolutionErrors, setResolutionErrors] = useState({});

  const showSuccessToast = (message, redirectPath = null) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast("");
      if (redirectPath) {
        navigate(redirectPath);
      }
    }, 1500);
  };

  const showErrorToast = (message) => {
    setErrorToast(message);
    setTimeout(() => {
      setErrorToast("");
    }, 2500);
  };

  const loadAttachmentsForTickets = async (ticketData) => {
    const next = {};

    await Promise.all(
      ticketData.map(async (ticket) => {
        try {
          next[ticket.id] = await getTicketAttachments(ticket.id);
        } catch {
          next[ticket.id] = [];
        }
      })
    );

    setAttachmentLists(next);
  };

  const loadTickets = async () => {
    if (!currentUser?.id || !currentUser?.role) return;

    let data = [];

    if (currentUser.role === "ADMIN") {
      data = await getAllTickets();
    } else if (currentUser.role === "TECHNICIAN") {
      data = await getTechnicianTickets(currentUser.id);
    } else if (currentUser.role === "USER") {
      data = await getUserTickets(currentUser.id);
    }

    setTickets(data);
    await loadAttachmentsForTickets(data);
  };

  const loadTechnicians = async () => {
    if (currentUser?.role !== "ADMIN") return;
    const data = await getTechnicians();
    setTechnicians(data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await loadTickets();
        await loadTechnicians();
      } catch (err) {
        showErrorToast(err.message || "Failed to load ticket data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [currentUser?.id, currentUser?.role]);

  const handleAssignTechnician = async (ticketId) => {
    setAssignErrors((prev) => ({ ...prev, [ticketId]: "" }));

    if (!assignTech[ticketId]) {
      setAssignErrors((prev) => ({
        ...prev,
        [ticketId]: "Please select a technician",
      }));
      return;
    }

    try {
      await assignTechnician(ticketId, assignTech[ticketId]);
      await loadTickets();
      showSuccessToast("Technician assigned successfully");
    } catch (err) {
      showErrorToast(err.message || "Failed to assign technician");
    }
  };

  const handleAccept = async (ticketId) => {
    try {
      await acceptTicket(ticketId, currentUser.id);
      await loadTickets();
      showSuccessToast("Ticket accepted successfully");
    } catch (err) {
      showErrorToast(err.message || "Failed to accept ticket");
    }
  };

  const handleReject = async (ticketId) => {
    setRejectErrors((prev) => ({ ...prev, [ticketId]: "" }));

    if (!rejectReasons[ticketId]?.trim()) {
      setRejectErrors((prev) => ({
        ...prev,
        [ticketId]: "Reject reason is required",
      }));
      return;
    }

    try {
      await rejectTicket(ticketId, currentUser.id, rejectReasons[ticketId]);
      await loadTickets();
      showSuccessToast("Ticket rejected successfully");
    } catch (err) {
      showErrorToast(err.message || "Failed to reject ticket");
    }
  };

  const handleResolve = async (ticketId) => {
    setResolutionErrors((prev) => ({ ...prev, [ticketId]: "" }));

    if (!resolutionNotes[ticketId]?.trim()) {
      setResolutionErrors((prev) => ({
        ...prev,
        [ticketId]: "Resolution notes are required",
      }));
      return;
    }

    try {
      await resolveTicket(ticketId, currentUser.id, resolutionNotes[ticketId]);
      await loadTickets();
      showSuccessToast("Ticket resolved successfully");
    } catch (err) {
      showErrorToast(err.message || "Failed to resolve ticket");
    }
  };

  const handleDelete = async (ticketId) => {
    const confirmed = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmed) return;

    try {
      await deleteTicket(ticketId, currentUser.id);
      await loadTickets();
      showSuccessToast("Ticket deleted successfully");
    } catch (err) {
      showErrorToast(err.message || "Failed to delete ticket");
    }
  };

  const handleClose = async (ticketId) => {
    const confirmed = window.confirm("Are you satisfied and want to close this ticket?");
    if (!confirmed) return;

    try {
      await closeTicket(ticketId, currentUser.id);
      await loadTickets();
      showSuccessToast("Ticket closed successfully");
    } catch (err) {
      showErrorToast(err.message || "Failed to close ticket");
    }
  };

  const handleAttachmentFileChange = (ticketId, file) => {
    setAttachmentFiles((prev) => ({
      ...prev,
      [ticketId]: file,
    }));

    setAttachmentErrors((prev) => ({
      ...prev,
      [ticketId]: "",
    }));
  };

  const handleUploadAttachment = async (ticketId) => {
    const file = attachmentFiles[ticketId];

    if (!file) {
      setAttachmentErrors((prev) => ({
        ...prev,
        [ticketId]: "Please choose an image",
      }));
      return;
    }

    try {
      await uploadTicketAttachment(ticketId, currentUser.id, file);
      await loadTickets();

      setAttachmentFiles((prev) => ({
        ...prev,
        [ticketId]: null,
      }));

      setAttachmentErrors((prev) => ({
        ...prev,
        [ticketId]: "",
      }));

      showSuccessToast("Attachment uploaded successfully");
    } catch (err) {
      setAttachmentErrors((prev) => ({
        ...prev,
        [ticketId]: err.message || "Failed to upload attachment",
      }));
    }
  };

  const getTicketDisplayTitle = (ticket) => {
    return ticket.subject || ticket.title || "Untitled Ticket";
  };

  const getLastActionLabel = (ticket) => {
    if (ticket.status === "CLOSED") return "Closed";
    if (ticket.status === "RESOLVED") return "Responded";
    if (ticket.technicianAssignmentStatus === "REJECTED") return "Declined";
    if (ticket.status === "IN_PROGRESS") return "Responded";
    return "Pending";
  };

  const formatDateTime = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const getUserTicketsSummary = () => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      resolved: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
      closed: tickets.filter((ticket) => ticket.status === "CLOSED").length,
    };
  };

  const assignedDisplayStyle = {
    marginTop: "12px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#eef2f7",
    border: "1px solid #d6deea",
    color: "#334155",
  };

  if (currentUser?.role === "USER") {
    const summary = getUserTicketsSummary();

    return (
      <div className="max-w-7xl">
        {successToast && (
          <div className="fixed right-5 top-5 z-[9999] rounded-lg bg-green-600 px-4 py-3 font-semibold text-white shadow-lg">
            {successToast}
          </div>
        )}

        {errorToast && (
          <div className="fixed right-5 top-5 z-[9999] rounded-lg bg-red-600 px-4 py-3 font-semibold text-white shadow-lg">
            {errorToast}
          </div>
        )}

        <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#70071C] to-[#4A0513] p-8 text-white shadow-lg sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
            Student Support
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-5xl">How can we help you</h1>
          <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
            Submit a support ticket, track your previous requests, and check the latest
            action taken by the support team.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/tickets/create")}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#70071C] transition hover:bg-slate-100"
            >
              Submit Ticket
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Tickets</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">{summary.total}</h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Open Tickets</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">{summary.open}</h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Resolved Tickets</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">{summary.resolved}</h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Closed Tickets</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">{summary.closed}</h2>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
                Ticket History
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Previous Tickets</h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/tickets/create")}
              className="rounded-2xl bg-[#70071C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0513]"
            >
              Create Ticket
            </button>
          </div>

          {loading && <p className="px-6 py-8 text-slate-600">Loading...</p>}

          {!loading && tickets.length === 0 && (
            <div className="px-6 py-10">
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-xl font-semibold text-slate-900">No tickets yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  You have not submitted any support requests yet.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/tickets/create")}
                  className="mt-5 rounded-2xl bg-[#70071C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0513]"
                >
                  Submit Your First Ticket
                </button>
              </div>
            </div>
          )}

          {!loading && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <div className="min-w-[760px] px-6 py-5">
                <div className="grid grid-cols-[120px_1.6fr_1.2fr_0.9fr_140px] gap-4 border-b border-slate-200 pb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  <div>Ticket ID</div>
                  <div>Title</div>
                  <div>Date & Time Created</div>
                  <div>Last Action</div>
                  <div>Actions</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="grid grid-cols-[120px_1.6fr_1.2fr_0.9fr_140px] items-center gap-4 py-5"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        #{ticket.id}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {getTicketDisplayTitle(ticket)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Priority: {ticket.priority}
                        </p>
                      </div>

                      <div className="text-sm text-slate-600">
                        {formatDateTime(ticket.createdAt)}
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            getLastActionLabel(ticket) === "Closed"
                              ? "bg-slate-200 text-slate-700"
                              : getLastActionLabel(ticket) === "Declined"
                                ? "bg-red-100 text-red-700"
                                : getLastActionLabel(ticket) === "Responded"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {getLastActionLabel(ticket)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ticket.status === "OPEN" && (
                          <button
                            onClick={() => handleDelete(ticket.id)}
                            className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}

                        {ticket.status === "RESOLVED" && (
                          <button
                            onClick={() => handleClose(ticket.id)}
                            className="rounded-xl bg-[#70071C] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4A0513]"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px" }}>
      {successToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#16a34a",
            color: "white",
            padding: "12px 18px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            zIndex: 9999,
            fontWeight: "600",
          }}
        >
          {successToast}
        </div>
      )}

      {errorToast && (
        <div
          style={{
            position: "fixed",
            top: successToast ? "76px" : "20px",
            right: "20px",
            background: "#dc2626",
            color: "white",
            padding: "12px 18px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            zIndex: 9999,
            fontWeight: "600",
          }}
        >
          {errorToast}
        </div>
      )}

      <h1 style={{ fontSize: "42px", marginBottom: "24px" }}>Tickets</h1>

      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "28px" }}>
          All Tickets
        </h3>

        {loading && <p>Loading...</p>}
        {!loading && tickets.length === 0 && <p>No tickets found.</p>}

        {tickets.map((ticket) => {
          const isClosedTicket = ticket.status === "CLOSED";

          return (
            <div
              key={ticket.id}
              style={{
                position: "relative",
                borderBottom: "1px solid #d1d5db",
                padding: "22px 18px 18px 18px",
                marginBottom: "18px",
                borderRadius: "14px",
                background: isClosedTicket ? "#edf1f5" : "transparent",
                border: isClosedTicket ? "1px solid #d7dee8" : "none",
              }}
            >
              {isClosedTicket && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#dbe7dc",
                    color: "#1f5131",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "1px solid #bfd3c2",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      color: "white",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: "800",
                    }}
                  >
                    ✓
                  </span>
                  <span>Done • Closed</span>
                </div>
              )}

              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "24px",
                  paddingRight: isClosedTicket ? "150px" : "0",
                }}
              >
                {getTicketDisplayTitle(ticket)}
              </h4>

              <p>{ticket.message || ticket.description}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Assignment:</strong> {ticket.technicianAssignmentStatus}</p>

              {ticket.assignedTechnician && (
                <div style={{ marginTop: "8px" }}>
                  <strong>Assigned Technician:</strong>{" "}
                  {ticket.assignedTechnician.fullName} ({ticket.assignedTechnician.email})
                </div>
              )}

              {ticket.technicianResponseReason && (
                <p><strong>Reject Reason:</strong> {ticket.technicianResponseReason}</p>
              )}

              {ticket.resolutionNotes && (
                <p><strong>Resolution Notes:</strong> {ticket.resolutionNotes}</p>
              )}

              <div style={{ marginTop: "10px" }}>
                <strong>Attachments:</strong>
                {attachmentLists[ticket.id]?.length > 0 ? (
                  <ul style={{ marginTop: "8px" }}>
                    {attachmentLists[ticket.id].map((attachment) => (
                      <li key={attachment.id}>
                        <a
                          href={getAttachmentDownloadUrl(attachment.id)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {attachment.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ marginTop: "6px" }}>No attachments</p>
                )}
              </div>

              {currentUser?.role === "ADMIN" &&
                ticket.status !== "CLOSED" &&
                (!ticket.assignedTechnician ? (
                  <div style={{ marginTop: "12px" }}>
                    <select
                      value={assignTech[ticket.id] || ""}
                      onChange={(e) => {
                        setAssignTech({
                          ...assignTech,
                          [ticket.id]: e.target.value,
                        });
                        setAssignErrors({
                          ...assignErrors,
                          [ticket.id]: "",
                        });
                      }}
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        marginRight: "8px",
                        minWidth: "220px",
                      }}
                    >
                      <option value="">Select Technician</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.fullName} ({tech.email})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAssignTechnician(ticket.id)}
                      style={{
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#1d4ed8",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Assign Technician
                    </button>

                    {assignErrors[ticket.id] && (
                      <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                        {assignErrors[ticket.id]}
                      </p>
                    )}
                  </div>
                ) : ticket.status !== "CLOSED" ? (
                  <div style={assignedDisplayStyle}>
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                      Technician assigned
                    </div>
                    <div>{ticket.assignedTechnician?.fullName}</div>
                    <div style={{ fontSize: "14px", color: "#64748b", marginTop: "2px" }}>
                      {ticket.assignedTechnician?.email}
                    </div>
                  </div>
                ) : null)}

              {currentUser?.role === "TECHNICIAN" && (
                <div style={{ marginTop: "12px" }}>
                  {ticket.technicianAssignmentStatus === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleAccept(ticket.id)}
                        style={{
                          padding: "8px 12px",
                          border: "none",
                          borderRadius: "8px",
                          background: "#16a34a",
                          color: "white",
                          cursor: "pointer",
                          marginRight: "8px",
                        }}
                      >
                        Accept
                      </button>

                      <input
                        placeholder="Reject reason"
                        value={rejectReasons[ticket.id] || ""}
                        onChange={(e) => {
                          setRejectReasons({
                            ...rejectReasons,
                            [ticket.id]: e.target.value,
                          });
                          setRejectErrors({
                            ...rejectErrors,
                            [ticket.id]: "",
                          });
                        }}
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          marginRight: "8px",
                        }}
                      />

                      <button
                        onClick={() => handleReject(ticket.id)}
                        style={{
                          padding: "8px 12px",
                          border: "none",
                          borderRadius: "8px",
                          background: "#dc2626",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>

                      {rejectErrors[ticket.id] && (
                        <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                          {rejectErrors[ticket.id]}
                        </p>
                      )}
                    </>
                  )}

                  {ticket.status === "IN_PROGRESS" && (
                    <div style={{ marginTop: "12px" }}>
                      <input
                        placeholder="Resolution notes"
                        value={resolutionNotes[ticket.id] || ""}
                        onChange={(e) => {
                          setResolutionNotes({
                            ...resolutionNotes,
                            [ticket.id]: e.target.value,
                          });
                          setResolutionErrors({
                            ...resolutionErrors,
                            [ticket.id]: "",
                          });
                        }}
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          marginRight: "8px",
                        }}
                      />

                      <button
                        onClick={() => handleResolve(ticket.id)}
                        style={{
                          padding: "8px 12px",
                          border: "none",
                          borderRadius: "8px",
                          background: "#7c3aed",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Resolve
                      </button>

                      {resolutionErrors[ticket.id] && (
                        <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                          {resolutionErrors[ticket.id]}
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: "12px" }}>
                    <strong>Add Attachment:</strong>
                    <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleAttachmentFileChange(ticket.id, e.target.files?.[0] || null)
                        }
                      />
                      <button
                        onClick={() => handleUploadAttachment(ticket.id)}
                        style={{
                          padding: "8px 12px",
                          border: "none",
                          borderRadius: "8px",
                          background: "#111827",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Upload
                      </button>
                    </div>

                    {attachmentErrors[ticket.id] && (
                      <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                        {attachmentErrors[ticket.id]}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentUser?.role === "ADMIN" && (
                <div style={{ marginTop: "12px" }}>
                  <strong>Add Attachment:</strong>
                  <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleAttachmentFileChange(ticket.id, e.target.files?.[0] || null)
                      }
                    />
                    <button
                      onClick={() => handleUploadAttachment(ticket.id)}
                      style={{
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#111827",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Upload
                    </button>
                  </div>

                  {attachmentErrors[ticket.id] && (
                    <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                      {attachmentErrors[ticket.id]}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TicketsPage;