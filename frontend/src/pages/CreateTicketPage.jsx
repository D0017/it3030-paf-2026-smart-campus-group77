import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createTicket, uploadTicketAttachment } from "../services/ticketApi";
import ticketBg from "../assets/bg01-ticket.jpg";

function CreateTicketPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const [formData, setFormData] = useState({
    studentName: currentUser?.fullName || "",
    studentEmail: currentUser?.email || "",
    contactNumber: "",
    subject: "",
    message: "",
    priority: "MEDIUM",
  });

  const [formErrors, setFormErrors] = useState({
    studentName: "",
    studentEmail: "",
    contactNumber: "",
    subject: "",
    message: "",
    priority: "",
    attachments: "",
  });

  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");

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

  const handleAttachmentSelection = (files) => {
    const result = validateSelectedFiles(files, attachments);

    if (!result.valid) {
      setFormErrors((prev) => ({
        ...prev,
        attachments: result.message,
      }));
      return;
    }

    setAttachments(result.files);
    setFormErrors((prev) => ({
      ...prev,
      attachments: "",
    }));
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));

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
    handleAttachmentSelection(e.dataTransfer.files);
  };

  const validateForm = () => {
    const errors = {
      studentName: "",
      studentEmail: "",
      contactNumber: "",
      subject: "",
      message: "",
      priority: "",
      attachments: "",
    };

    if (!formData.studentName.trim()) {
      errors.studentName = "Student name is required";
    }

    if (!formData.studentEmail.trim()) {
      errors.studentEmail = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.studentEmail.trim())) {
        errors.studentEmail = "Enter a valid email address";
      }
    }

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else {
      const phoneRegex = /^(\+94\d{9}|0\d{9}|\d{9})$/;
      if (!phoneRegex.test(formData.contactNumber.trim())) {
        errors.contactNumber =
          "Use +94XXXXXXXXX, 0XXXXXXXXX, or 9 digits without 0";
      }
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    if (!formData.priority) {
      errors.priority = "Priority is required";
    }

    if (attachments.length > 3) {
      errors.attachments = "Maximum 3 image attachments are allowed";
    }

    for (const file of attachments) {
      if (!file.type.startsWith("image/")) {
        errors.attachments = "Only image files are allowed";
        break;
      }
    }

    setFormErrors(errors);
    return Object.values(errors).every((value) => value === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?.id) {
      showErrorToast("User session not found");
      return;
    }

    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      const createdTicket = await createTicket(formData, currentUser.id);

      if (attachments.length > 0) {
        for (const file of attachments) {
          await uploadTicketAttachment(createdTicket.id, currentUser.id, file);
        }
      }

      showSuccessToast("Ticket created successfully", "/tickets");
    } catch (err) {
      showErrorToast(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-[calc(100vh-5rem)] overflow-hidden rounded-[32px] border border-slate-200 shadow-sm"
      style={{
        backgroundImage: `url(${ticketBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#70071C]/35 via-slate-950/45 to-slate-950/55" />

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

      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-5xl rounded-[32px] border border-white/20 bg-white/12 p-6 shadow-[0_12px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
              Ticket Support
            </p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Student Support
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
              Submit your issue and our support team will review it as soon as possible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Student Name
                </label>
                <input
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-white placeholder:text-white/55 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-white/18"
                  placeholder="Student name"
                />
                {formErrors.studentName && (
                  <p className="mt-2 text-sm text-red-300">{formErrors.studentName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Email
                </label>
                <input
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-white placeholder:text-white/55 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-white/18"
                  placeholder="Email address"
                />
                {formErrors.studentEmail && (
                  <p className="mt-2 text-sm text-red-300">{formErrors.studentEmail}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/90">
                Contact Number
              </label>
              <input
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-white placeholder:text-white/55 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-white/18"
                placeholder="+94771234567 / 0771234567 / 771234567"
              />
              {formErrors.contactNumber && (
                <p className="mt-2 text-sm text-red-300">{formErrors.contactNumber}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/90">
                Subject
              </label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-white placeholder:text-white/55 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-white/18"
                placeholder="What is this ticket about?"
              />
              {formErrors.subject && (
                <p className="mt-2 text-sm text-red-300">{formErrors.subject}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/90">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className="w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-white placeholder:text-white/55 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-white/18"
                placeholder="What would you like to tell us?"
              />
              {formErrors.message && (
                <p className="mt-2 text-sm text-red-300">{formErrors.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/90">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-white/18"
              >
                <option value="LOW" className="text-slate-900">LOW</option>
                <option value="MEDIUM" className="text-slate-900">MEDIUM</option>
                <option value="HIGH" className="text-slate-900">HIGH</option>
              </select>
              {formErrors.priority && (
                <p className="mt-2 text-sm text-red-300">{formErrors.priority}</p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-white/90">
                Add Attachments
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-3xl border-2 border-dashed p-6 backdrop-blur-md transition ${
                  isDragActive
                    ? "border-white/45 bg-white/18"
                    : "border-white/20 bg-white/10"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleAttachmentSelection(e.target.files)}
                  className="hidden"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#70071C] transition hover:bg-slate-100"
                  >
                    Choose files
                  </button>

                  <span className="text-sm text-white/75">
                    or drag and drop up to 3 images
                  </span>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <p className="mb-3 text-sm font-semibold text-white/85">
                    Selected attachments
                  </p>

                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-sm text-white/90">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="w-fit rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formErrors.attachments && (
                <p className="mt-2 text-sm text-red-300">{formErrors.attachments}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/tickets")}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/18"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-[#70071C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0513] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateTicketPage;