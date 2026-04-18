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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Tickets</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4">Create Ticket</h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-100 text-red-700 px-4 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-100 text-green-700 px-4 py-2">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Ticket title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              rows="4"
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <input
              type="text"
              name="preferredContactDetails"
              placeholder="Preferred contact details"
              value={formData.preferredContactDetails}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />

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
              <div
                key={ticket.id}
                className="border rounded-lg p-4 bg-slate-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{ticket.title}</h3>
                  <span className="text-sm font-medium px-2 py-1 rounded bg-gray-200">
                    {ticket.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-2">
                  {ticket.description}
                </p>

                <div className="text-sm text-gray-600 space-y-1">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketsPage;