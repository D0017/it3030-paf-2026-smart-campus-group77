import { useEffect, useState } from "react";
import { createTicket, getAllTickets } from "../services/ticketApi";

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    preferredContactDetails: "",
    priority: "MEDIUM",
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const userId = 1;

      await createTicket(formData, userId);

      setSuccess("Ticket created successfully.");

      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        preferredContactDetails: "",
        priority: "MEDIUM",
      });

      await loadTickets();
    } catch (err) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Tickets</h1>

      <div className="bg-white shadow rounded-xl p-6 mb-8 border">
        <h2 className="text-xl font-semibold mb-4">Create Ticket</h2>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter ticket title"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue"
              className="w-full border rounded-lg px-3 py-2"
              rows="4"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Equipment / Electrical / Network"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Lecture Hall A"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Contact
              </label>
              <input
                type="text"
                name="preferredContactDetails"
                value={formData.preferredContactDetails}
                onChange={handleChange}
                placeholder="0771234567"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Create Ticket"}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-xl p-6 border">
        <h2 className="text-xl font-semibold mb-4">All Tickets</h2>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && tickets.length === 0 && (
          <p className="text-gray-500">No tickets found.</p>
        )}

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border rounded-lg p-4 bg-slate-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                <h3 className="font-semibold text-lg">{ticket.title}</h3>
                <span className="px-3 py-1 text-sm bg-gray-200 rounded w-fit">
                  {ticket.status}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-3">{ticket.description}</p>

              <div className="text-sm space-y-1">
                <p>
                  <strong>Category:</strong> {ticket.category}
                </p>
                <p>
                  <strong>Location:</strong> {ticket.location}
                </p>
                <p>
                  <strong>Priority:</strong> {ticket.priority}
                </p>
                <p>
                  <strong>Preferred Contact:</strong>{" "}
                  {ticket.preferredContactDetails}
                </p>
                <p>
                  <strong>Technician Assignment:</strong>{" "}
                  {ticket.technicianAssignmentStatus}
                </p>
                {ticket.technicianResponseReason && (
                  <p>
                    <strong>Technician Response Reason:</strong>{" "}
                    {ticket.technicianResponseReason}
                  </p>
                )}
                {ticket.resolutionNotes && (
                  <p>
                    <strong>Resolution Notes:</strong> {ticket.resolutionNotes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TicketsPage;