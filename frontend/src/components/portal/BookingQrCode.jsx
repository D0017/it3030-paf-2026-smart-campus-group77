import { useEffect, useState } from "react";
import QRCode from "qrcode";

function BookingQrCode({ value, size = 200 }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderQrCode() {
      if (!value) {
        setQrDataUrl("");
        return;
      }

      try {
        setError("");
        const dataUrl = await QRCode.toDataURL(value, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: size,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });

        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to generate QR code");
        }
      }
    }

    renderQrCode();

    return () => {
      cancelled = true;
    };
  }, [size, value]);

  if (error) {
    return (
      <div className="flex h-[200px] w-[200px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-center text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className="flex h-[200px] w-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
        Generating QR...
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="Booking QR code"
      className="h-[200px] w-[200px] rounded-2xl border border-slate-200 bg-white p-3"
    />
  );
}

export default BookingQrCode;
