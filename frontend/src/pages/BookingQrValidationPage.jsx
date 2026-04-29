import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { validateBookingQrToken } from "../services/bookingApi";

function BookingQrValidationPage() {
  const { qrToken } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function validateToken() {
      try {
        setLoading(true);
        setError("");
        const response = await validateBookingQrToken(qrToken);
        setResult(response);
      } catch (validationError) {
        setError(validationError.message || "Failed to validate booking QR code");
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [qrToken]);

  const isValid = result?.valid;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section
          className={`rounded-4xl px-8 py-10 text-white shadow-sm ${
            isValid
              ? "bg-linear-to-r from-emerald-700 to-emerald-600"
              : "bg-linear-to-r from-[#70071C] to-[#4A0513]"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            Booking QR validation
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
            {loading
              ? "Checking booking access..."
              : isValid
                ? "Approved booking verified."
                : "Booking QR code is not valid."}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/85">
            {loading
              ? "Please wait while the booking pass is verified against the booking system."
              : result?.message || error}
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-500">Validating QR code...</p>
          ) : error ? (
            <p className="text-sm text-rose-700">{error}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Booking ID
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result?.bookingId ?? "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Status
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result?.status ?? "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Resource
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result?.assetName ?? "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Booked By
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result?.userName ?? "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Start Time
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result?.startTime
                    ? new Date(result.startTime).toLocaleString()
                    : "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  End Time
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result?.endTime
                    ? new Date(result.endTime).toLocaleString()
                    : "Unavailable"}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Return to portal
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BookingQrValidationPage;
