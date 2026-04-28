import { useEffect, useState } from "react";
import { getAssets } from "../services/assetApi.js";
import { getResourceAvailability } from "../services/bookingApi.js";

function ResourcesPage() {
  const [assets, setAssets] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(() => {
    const start = new Date();
    start.setHours(start.getHours() + 1, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    return {
      startTime: toDateTimeLocalValue(start),
      endTime: toDateTimeLocalValue(end),
      expectedAttendees: 1,
    };
  });

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const data = await getAssets();
        setAssets(data);
      } catch (err) {
        setError(err.message || "Failed to load resources");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!filters.startTime || !filters.endTime) {
      return;
    }

    void (async () => {
      try {
        setError(null);
        const data = await getResourceAvailability({
          startTime: formatDateTime(filters.startTime),
          endTime: formatDateTime(filters.endTime),
          expectedAttendees: Number(filters.expectedAttendees),
        });
        setAvailability(data);
      } catch (err) {
        setError(err.message || "Failed to load resource availability");
      }
    })();
  }, [filters.startTime, filters.endTime, filters.expectedAttendees]);

  const resourceCards =
    availability.length > 0
      ? availability
      : assets.map((asset) => ({
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          location: asset.location,
          capacity: asset.capacity,
          status: asset.status,
          availabilityWindows: asset.availabilityWindows,
          available: asset.status === "ACTIVE",
          message: asset.status === "ACTIVE" ? "Available" : "Out of service",
          suggestedTimeSlots: [],
        }));

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[28px] bg-linear-to-r from-slate-900 via-slate-800 to-cyan-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Campus Resources
          </p>
          <h1 className="mt-3 text-4xl font-bold">Find spaces and equipment that are free right now.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            Adjust the booking window to see which rooms and resources are available, which ones conflict, and the next time each one opens up.
          </p>
        </div>

        <div className="mb-6 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-3">
          <FilterField
            label="Start Time"
            type="datetime-local"
            value={filters.startTime}
            onChange={(value) => setFilters((previous) => ({ ...previous, startTime: value }))}
          />
          <FilterField
            label="End Time"
            type="datetime-local"
            value={filters.endTime}
            onChange={(value) => setFilters((previous) => ({ ...previous, endTime: value }))}
          />
          <FilterField
            label="Attendees"
            type="number"
            min="1"
            value={filters.expectedAttendees}
            onChange={(value) =>
              setFilters((previous) => ({
                ...previous,
                expectedAttendees: parseInt(value, 10) || 1,
              }))
            }
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-100 p-4 text-red-800">{error}</div>
        )}

        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading resources...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resourceCards.map((resource) => (
              <article
                key={resource.assetId}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {resource.assetType}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {resource.assetName}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      resource.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {resource.message}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p>Location: {resource.location || "Not specified"}</p>
                  <p>Capacity: {resource.capacity}</p>
                  <p>Status: {resource.status}</p>
                  <p>
                    Hours: {resource.availabilityWindows?.trim() || "08:00-18:00"}
                  </p>
                </div>

                {resource.suggestedTimeSlots?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-900">
                      Next available slots
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resource.suggestedTimeSlots.map((slot) => (
                        <span
                          key={`${resource.assetId}-${slot.startTime}`}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                        >
                          {slot.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterField({ label, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

function formatDateTime(value) {
  if (value.length === 16) {
    return `${value}:00`;
  }

  return value;
}

function toDateTimeLocalValue(date) {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

export default ResourcesPage;
