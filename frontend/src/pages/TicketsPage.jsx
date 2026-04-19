import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  createTicket,
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
  const fileInputRef = useRef(null);

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [attachmentLists, setAttachmentLists] = useState({});
  const [attachmentFiles, setAttachmentFiles] = useState({});
  const [attachmentErrors, setAttachmentErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    preferredContactDetails: "",
    priority: "MEDIUM",
  });

  const [createAttachments, setCreateAttachments] = useState([]);
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    preferredContactDetails: "",
    priority: "",
    attachments: "",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateSelectedFiles = (files, existingFiles = []) => {
    const incomingFiles = Array.from(files || []);

    if (incomingFiles.length === 0) {
      return { valid: true, files: existingFiles };
    }

    for (const file of incomingFiles) {
      if (!file.type.startsWith("image/")) {
        return {
          valid: false,
          message: "Only image files are allowed",
        };
      }
    }

    const mergedFiles = [...existingFiles];

    for (const file of incomingFiles) {
      const alreadyExists = mergedFiles.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      );

      if (!alreadyExists) {
        mergedFiles.push(file);
      }
    }

    if (mergedFiles.length > 3) {
      return {
        valid: false,
        message: "Maximum 3 image attachments are allowed",
      };
    }

    return { valid: true, files: mergedFiles };
  };

  const handleCreateAttachmentSelection = (files) => {
    const result = validateSelectedFiles(files, createAttachments);

    if (!result.valid) {
      setFormErrors((prev) => ({
        ...prev,
        attachments: result.message,
      }));
      return;
    }

    setCreateAttachments(result.files);
    setFormErrors((prev) => ({
      ...prev,
      attachments: "",
    }));
  };

  const handleRemoveCreateAttachment = (indexToRemove) => {
    setCreateAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );

    setFormErrors((prev) => ({
      ...prev,
      attachments: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    handleCreateAttachmentSelection(e.dataTransfer.files);
  };

  const validateTicketForm = () => {
    const errors = {
      title: "",
      description: "",
      category: "",
      location: "",
      preferredContactDetails: "",
      priority: "",
      attachments: "",
    };

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (!formData.location.trim()) errors.location = "Location is required";

    if (!formData.preferredContactDetails.trim()) {
      errors.preferredContactDetails = "Contact is required";
    } else {
      const phoneRegex = /^[0-9+\-\s]{7,15}$/;
      if (!phoneRegex.test(formData.preferredContactDetails.trim())) {
        errors.preferredContactDetails = "Enter a valid contact number";
      }
    }

    if (!formData.priority) errors.priority = "Priority is required";

    if (createAttachments.length > 3) {
      errors.attachments = "Maximum 3 image attachments are allowed";
    }

    for (const file of createAttachments) {
      if (!file.type.startsWith("image/")) {
        errors.attachments = "Only image files are allowed";
        break;
      }
    }

    setFormErrors(errors);
    return Object.values(errors).every((value) => value === "");
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const isValid = validateTicketForm();
    if (!isValid) return;

    try {
      setLoading(true);

      const createdTicket = await createTicket(formData, currentUser.id);

      if (createAttachments.length > 0) {
        for (const file of createAttachments) {
          await uploadTicketAttachment(createdTicket.id, currentUser.id, file);
        }
      }

      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        preferredContactDetails: "",
        priority: "MEDIUM",
      });

      setCreateAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setFormErrors({
        title: "",
        description: "",
        category: "",
        location: "",
        preferredContactDetails: "",
        priority: "",
        attachments: "",
      });

      await loadTickets();
      showSuccessToast("Ticket created successfully", "/resources");
    } catch (err) {
      showErrorToast(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
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

  const assignedDisplayStyle = {
    marginTop: "12px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#eef2f7",
    border: "1px solid #d6deea",
    color: "#334155",
  };

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

      {currentUser?.role === "USER" && (
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "28px" }}>
            Create Ticket
          </h3>

          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <input
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                />
                {formErrors.title && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                />
                {formErrors.description && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                />
                {formErrors.category && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                    {formErrors.category}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                />
                {formErrors.location && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                    {formErrors.location}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="preferredContactDetails"
                  placeholder="Contact"
                  value={formData.preferredContactDetails}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                />
                {formErrors.preferredContactDetails && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                    {formErrors.preferredContactDetails}
                  </p>
                )}
              </div>

              <div>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
                {formErrors.priority && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                    {formErrors.priority}
                  </p>
                )}
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Add attachment
                </p>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: isDragActive ? "2px dashed #2563eb" : "2px dashed #d1d5db",
                    borderRadius: "12px",
                    padding: "20px",
                    background: isDragActive ? "#eff6ff" : "#f9fafb",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleCreateAttachmentSelection(e.target.files)}
                    style={{ display: "none" }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Choose files
                  </button>

                  <span style={{ color: "#6b7280", fontSize: "16px" }}>
                    or Drag and drop
                  </span>
                </div>

                {createAttachments.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Selected attachments:
                    </p>

                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                      {createAttachments.map((file, index) => (
                        <li
                          key={`${file.name}-${index}`}
                          style={{
                            marginBottom: "8px",
                            color: "#374151",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCreateAttachment(index)}
                            style={{
                              padding: "4px 8px",
                              border: "none",
                              borderRadius: "6px",
                              background: "#dc2626",
                              color: "white",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {formErrors.attachments && (
                  <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
                    {formErrors.attachments}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#111827",
                  color: "white",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                {loading ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

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

        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              borderBottom: "1px solid #d1d5db",
              paddingBottom: "18px",
              marginBottom: "18px",
            }}
          >
            <h4 style={{ marginBottom: "10px", fontSize: "24px" }}>{ticket.title}</h4>

            <p>{ticket.description}</p>
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
              ) : (
                <div style={assignedDisplayStyle}>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    Technician assigned
                  </div>
                  <div>
                    {ticket.assignedTechnician?.fullName}
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "2px" }}>
                    {ticket.assignedTechnician?.email}
                  </div>
                </div>
              ))}

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
              </div>
            )}

            {currentUser?.role === "USER" && (
              <div style={{ marginTop: "12px" }}>
                {ticket.status === "OPEN" && (
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    style={{
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#dc2626",
                      color: "white",
                      cursor: "pointer",
                      marginRight: "8px",
                    }}
                  >
                    Delete
                  </button>
                )}

                {ticket.status === "RESOLVED" && (
                  <button
                    onClick={() => handleClose(ticket.id)}
                    style={{
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#16a34a",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Close Ticket
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicketsPage;