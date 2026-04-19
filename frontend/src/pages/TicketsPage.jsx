import { useEffect, useMemo, useState } from "react";
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
  getTicketAttachments,
  getAttachmentDownloadUrl,
} from "../services/ticketApi";

function TicketsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [attachmentLists, setAttachmentLists] = useState({});
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

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

  const initializePage = async () => {
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

  useEffect(() => {
    initializePage();
  }, [currentUser?.id, currentUser?.role]);

  const handleRefresh = async () => {
    await initializePage();
    showSuccessToast("Tickets refreshed successfully");
  };

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
      await initializePage();
      showSuccessToast("Technician assigned successfully");
    } catch (err) {
      showErrorToast(err.message || "Failed to assign technician");
    }
  };

  const handleAccept = async (ticketId) => {
    try {
      await acceptTicket(ticketId, currentUser.id);
      await initializePage();
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
      await initializePage();
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
      await initializePage();
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
      await initializePage();
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
      await initializePage();
      showSuccessToast("Ticket closed successfully");
    } catch (err) {
      showErrorToast(err.message || "Failed to close ticket");
    }
  };

  const getTicketDisplayTitle = (ticket) => {
    return ticket.subject || ticket.title || "Untitled Ticket";
  };

  const getTicketDisplayMessage = (ticket) => {
    return ticket.message || ticket.description || "No message available";
  };

  const getLastActionLabel = (ticket) => {
    if (ticket.status === "CLOSED") return "Closed";
    if (ticket.status === "RESOLVED") return "Responded";
    if (ticket.technicianAssignmentStatus === "REJECTED") return "Declined";
    if (ticket.status === "IN_PROGRESS") return "Responded";
    return "Pending";
  };

  const getTicketStatusLabel = (ticket) => {
    if (ticket.technicianAssignmentStatus === "REJECTED") return "Rejected";
    if (ticket.technicianAssignmentStatus === "ACCEPTED") return "Accepted";
    if (ticket.status === "RESOLVED") return "Resolved";
    if (ticket.status === "CLOSED") return "Closed";
    if (ticket.status === "IN_PROGRESS") return "In Progress";
    return "Open";
  };

  const getStatusBadgeClasses = (label) => {
    if (label === "Closed") return "bg-slate-200 text-slate-700";
    if (label === "Rejected") return "bg-red-100 text-red-700";
    if (label === "Accepted") return "bg-emerald-100 text-emerald-700";
    if (label === "Resolved") return "bg-green-100 text-green-700";
    if (label === "In Progress") return "bg-amber-100 text-amber-700";
    return "bg-blue-100 text-blue-700";
  };

  const formatDateTime = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const getTicketTimeValue = (ticket) => {
    if (!ticket.createdAt) return 0;
    const time = new Date(ticket.createdAt).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const getUserTicketsSummary = () => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      resolved: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
      closed: tickets.filter((ticket) => ticket.status === "CLOSED").length,
    };
  };

  const getRoleSummary = () => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      inProgress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
      closed: tickets.filter((ticket) => ticket.status === "CLOSED").length,
    };
  };

  const getPriorityCounts = () => {
    return {
      high: tickets.filter((ticket) => ticket.priority === "HIGH").length,
      medium: tickets.filter((ticket) => ticket.priority === "MEDIUM").length,
      low: tickets.filter((ticket) => ticket.priority === "LOW").length,
    };
  };

  const filteredAndSortedTickets = useMemo(() => {
    let next = [...tickets];

    if (statusFilter !== "ALL") {
      next = next.filter((ticket) => {
        if (statusFilter === "OPEN") return ticket.status === "OPEN";
        if (statusFilter === "RESOLVED") return ticket.status === "RESOLVED";
        if (statusFilter === "CLOSED") return ticket.status === "CLOSED";
        if (statusFilter === "IN_PROGRESS") return ticket.status === "IN_PROGRESS";
        return true;
      });
    }

    if (priorityFilter !== "ALL") {
      next = next.filter((ticket) => ticket.priority === priorityFilter);
    }

    next.sort((a, b) => {
      const first = getTicketTimeValue(a);
      const second = getTicketTimeValue(b);
      return sortOrder === "newest" ? second - first : first - second;
    });

    return next;
  }, [tickets, sortOrder, statusFilter, priorityFilter]);

  const getTileClass = (active) =>
    `rounded-3xl border p-5 shadow-sm transition cursor-pointer ${
      active
        ? "border-[#70071C] bg-[#70071C] text-white shadow-lg"
        : "border-slate-200 bg-white hover:border-[#70071C]/40"
    }`;

  const getTileLabelClass = (active) =>
    active ? "text-sm font-medium text-white/80" : "text-sm font-medium text-slate-500";

  const getTileValueClass = (active) =>
    active ? "mt-3 text-3xl font-bold text-white" : "mt-3 text-3xl font-bold text-slate-900";

  const GlassActionButtons = () => (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleRefresh}
        className="rounded-2xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
      >
        Refresh
      </button>

      <button
        type="button"
        onClick={() =>
          setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
        }
        className="rounded-2xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
      >
        Sort: {sortOrder === "newest" ? "New to Old" : "Old to New"}
      </button>
    </div>
  );

  const PriorityFilterButtons = () => {
    const counts = getPriorityCounts();

    const priorities = [
      { key: "ALL", label: "All Priorities", count: tickets.length },
      { key: "HIGH", label: "High", count: counts.high },
      { key: "MEDIUM", label: "Medium", count: counts.medium },
      { key: "LOW", label: "Low", count: counts.low },
    ];

    return (
      <div className="flex flex-wrap gap-3">
        {priorities.map((item) => {
          const active = priorityFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setPriorityFilter(item.key)}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-[#70071C] bg-[#70071C] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#70071C]/40"
              }`}
            >
              {item.label} ({item.count})
            </button>
          );
        })}
      </div>
    );
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
                Student Support
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-5xl">How can we help you</h1>
              <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
                Submit a support ticket, track your previous requests, and check the latest
                action taken by the support team.
              </p>
            </div>

            <GlassActionButtons />
          </div>

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
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={getTileClass(statusFilter === "ALL")}
          >
            <p className={getTileLabelClass(statusFilter === "ALL")}>Total Tickets</p>
            <h2 className={getTileValueClass(statusFilter === "ALL")}>{summary.total}</h2>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("OPEN")}
            className={getTileClass(statusFilter === "OPEN")}
          >
            <p className={getTileLabelClass(statusFilter === "OPEN")}>Open Tickets</p>
            <h2 className={getTileValueClass(statusFilter === "OPEN")}>{summary.open}</h2>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("RESOLVED")}
            className={getTileClass(statusFilter === "RESOLVED")}
          >
            <p className={getTileLabelClass(statusFilter === "RESOLVED")}>Resolved Tickets</p>
            <h2 className={getTileValueClass(statusFilter === "RESOLVED")}>{summary.resolved}</h2>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("CLOSED")}
            className={getTileClass(statusFilter === "CLOSED")}
          >
            <p className={getTileLabelClass(statusFilter === "CLOSED")}>Closed Tickets</p>
            <h2 className={getTileValueClass(statusFilter === "CLOSED")}>{summary.closed}</h2>
          </button>
        </section>

        <section className="mt-6">
          <PriorityFilterButtons />
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

          {!loading && filteredAndSortedTickets.length === 0 && (
            <div className="px-6 py-10">
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-xl font-semibold text-slate-900">No matching tickets</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Try changing the selected status or priority filter.
                </p>
              </div>
            </div>
          )}

          {!loading && filteredAndSortedTickets.length > 0 && (
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
                  {filteredAndSortedTickets.map((ticket) => (
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

  const summary = getRoleSummary();

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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
              {currentUser?.role === "ADMIN" ? "Admin Panel" : "Technician Panel"}
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-5xl">
              {currentUser?.role === "ADMIN" ? "Ticket Management" : "Assigned Tickets"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
              {currentUser?.role === "ADMIN"
                ? "Review ticket progress, assign technicians, and monitor campus incident handling."
                : "Manage your assigned incidents, respond to requests, and update ticket progress."}
            </p>
          </div>

          <GlassActionButtons />
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={getTileClass(statusFilter === "ALL")}
        >
          <p className={getTileLabelClass(statusFilter === "ALL")}>Total Tickets</p>
          <h2 className={getTileValueClass(statusFilter === "ALL")}>{summary.total}</h2>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("OPEN")}
          className={getTileClass(statusFilter === "OPEN")}
        >
          <p className={getTileLabelClass(statusFilter === "OPEN")}>Open Tickets</p>
          <h2 className={getTileValueClass(statusFilter === "OPEN")}>{summary.open}</h2>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={getTileClass(statusFilter === "IN_PROGRESS")}
        >
          <p className={getTileLabelClass(statusFilter === "IN_PROGRESS")}>In Progress</p>
          <h2 className={getTileValueClass(statusFilter === "IN_PROGRESS")}>{summary.inProgress}</h2>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("CLOSED")}
          className={getTileClass(statusFilter === "CLOSED")}
        >
          <p className={getTileLabelClass(statusFilter === "CLOSED")}>Closed Tickets</p>
          <h2 className={getTileValueClass(statusFilter === "CLOSED")}>{summary.closed}</h2>
        </button>
      </section>

      <section className="mt-6">
        <PriorityFilterButtons />
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
            Ticket Overview
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">All Tickets</h2>
        </div>

        {loading && <p className="px-6 py-8 text-slate-600">Loading...</p>}
        {!loading && filteredAndSortedTickets.length === 0 && (
          <p className="px-6 py-8 text-slate-600">No matching tickets found.</p>
        )}

        {!loading && filteredAndSortedTickets.length > 0 && (
          <div className="space-y-5 px-6 py-6">
            {filteredAndSortedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex rounded-full bg-[#70071C]/10 px-3 py-1 text-xs font-semibold text-[#70071C]">
                        Ticket #{ticket.id}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                          getTicketStatusLabel(ticket)
                        )}`}
                      >
                        {getTicketStatusLabel(ticket)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-bold text-slate-900">
                      {getTicketDisplayTitle(ticket)}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {getTicketDisplayMessage(ticket)}
                    </p>
                  </div>

                  <div className="grid min-w-[240px] gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Created
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDateTime(ticket.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Priority
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {ticket.priority}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Ticket Status
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {ticket.technicianAssignmentStatus}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Student Name
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {ticket.studentName || ticket.createdBy?.fullName || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Email
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-slate-800">
                      {ticket.studentEmail || ticket.createdBy?.email || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Contact Number
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {ticket.contactNumber || ticket.preferredContactDetails || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Assigned Technician
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {ticket.assignedTechnician?.fullName || "Not assigned"}
                    </p>
                    {ticket.assignedTechnician?.email && (
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {ticket.assignedTechnician.email}
                      </p>
                    )}
                  </div>
                </div>

                {(ticket.technicianResponseReason || ticket.rejectionReason || ticket.resolutionNotes) && (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {(ticket.technicianResponseReason || ticket.rejectionReason) && (
                      <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">
                          Reject Reason
                        </p>
                        <p className="mt-2 text-sm text-red-700">
                          {ticket.technicianResponseReason || ticket.rejectionReason}
                        </p>
                      </div>
                    )}

                    {ticket.resolutionNotes && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
                          Resolution Notes
                        </p>
                        <p className="mt-2 text-sm text-emerald-700">
                          {ticket.resolutionNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Attachments
                  </p>

                  {attachmentLists[ticket.id]?.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {attachmentLists[ticket.id].map((attachment) => (
                        <a
                          key={attachment.id}
                          href={getAttachmentDownloadUrl(attachment.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#70071C] hover:text-[#70071C]"
                        >
                          {attachment.fileName}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No attachments</p>
                  )}
                </div>

                {currentUser?.role === "ADMIN" &&
                  ticket.status !== "CLOSED" &&
                  !ticket.assignedTechnician && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Assign Technician
                      </p>

                      <div className="mt-3 flex flex-col gap-3 lg:flex-row">
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#70071C] focus:bg-white"
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
                          className="rounded-2xl bg-[#70071C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0513]"
                        >
                          Assign
                        </button>
                      </div>

                      {assignErrors[ticket.id] && (
                        <p className="mt-3 text-sm text-red-600">
                          {assignErrors[ticket.id]}
                        </p>
                      )}
                    </div>
                  )}

                {currentUser?.role === "TECHNICIAN" && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                    {ticket.technicianAssignmentStatus === "PENDING" && (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Ticket Response
                        </p>

                        <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center">
                          <button
                            onClick={() => handleAccept(ticket.id)}
                            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Accept
                          </button>

                          <input
                            placeholder="Enter reject reason"
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
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#70071C] focus:bg-white"
                          />

                          <button
                            onClick={() => handleReject(ticket.id)}
                            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>

                        {rejectErrors[ticket.id] && (
                          <p className="mt-3 text-sm text-red-600">
                            {rejectErrors[ticket.id]}
                          </p>
                        )}
                      </>
                    )}

                    {ticket.status === "IN_PROGRESS" && (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Resolution Update
                        </p>

                        <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center">
                          <input
                            placeholder="Enter resolution notes"
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
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#70071C] focus:bg-white"
                          />

                          <button
                            onClick={() => handleResolve(ticket.id)}
                            className="rounded-2xl bg-[#70071C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0513]"
                          >
                            Resolve
                          </button>
                        </div>

                        {resolutionErrors[ticket.id] && (
                          <p className="mt-3 text-sm text-red-600">
                            {resolutionErrors[ticket.id]}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TicketsPage;