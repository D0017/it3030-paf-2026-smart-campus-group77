import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";
import LandingFaqSection from "../components/landing/LandingFaqSection";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
  const { currentUser, setCurrentUser, isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [profileOverridesByEmail, setProfileOverridesByEmail] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("campusops_profile_overrides_by_email") || "{}"
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "campusops_profile_overrides_by_email",
      JSON.stringify(profileOverridesByEmail)
    );
  }, [profileOverridesByEmail]);

  const mergedUser = useMemo(() => {
    if (!currentUser) return null;
    const emailKey = currentUser.email || "__default__";
    const overrides = profileOverridesByEmail[emailKey] || {};
    return { ...currentUser, ...overrides };
  }, [currentUser, profileOverridesByEmail]);

  const handleProfileUpdate = (updates) => {
    if (!currentUser) return;

    const emailKey = currentUser.email || "__default__";

    setProfileOverridesByEmail((prev) => ({
      ...prev,
      [emailKey]: {
        ...(prev[emailKey] || {}),
        ...updates,
      },
    }));

    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F4] text-[#212325]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F4F4]">
      <div className="relative">
        <LandingNavbar
          isAuthenticated={isAuthenticated}
          currentUser={mergedUser}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onProfileUpdate={handleProfileUpdate}
        />
        <LandingHero isAuthenticated={isAuthenticated} />
      </div>

      <section
        id="overview"
        className="border-t border-[#212325]/8 bg-[#F4F4F4] px-6 py-16 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#212325]/6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
                Unified access
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[#212325]">
                One portal for campus tasks
              </h3>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#212325]/6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
                Faster workflows
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[#212325]">
                Bookings, incidents and updates together
              </h3>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#212325]/6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
                Role-based visibility
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[#212325]">
                Personalized features for each user type
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section
  id="modules"
  className="relative overflow-hidden bg-[#F4F4F4] px-6 py-24 lg:px-10"
>
  <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white to-transparent" />

  <div className="relative mx-auto max-w-7xl">
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="inline-flex items-center rounded-full border border-[#70071C]/15 bg-white px-4 py-2">
          <span className="mr-2 h-2 w-2 rounded-full bg-[#70071C]" />
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#70071C]">
            Core modules
          </p>
        </div>

        <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#212325] sm:text-5xl lg:text-6xl">
          A cleaner digital layer for daily university operations
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#212325]/65">
          Manage shared resources, approvals, and service requests through a
          simple interface designed for staff, students, and technicians.
        </p>
      </div>

      <div className="rounded-2xl border border-[#212325]/10 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm font-medium text-[#212325]/60">Built for</p>
        <p className="mt-1 text-base font-semibold text-[#212325]">
          Faster coordination
        </p>
      </div>
    </div>

    <div className="mt-14 grid gap-6 md:grid-cols-3">
      {[
        {
          number: "01",
          title: "Resources",
          description:
            "Browse rooms, labs, and equipment with a clear availability view.",
          items: ["Room visibility", "Equipment status", "Availability calendar"],
        },
        {
          number: "02",
          title: "Bookings",
          description:
            "Submit requests and track approvals through a consistent workflow.",
          items: ["Request tracking", "Approval flow", "Booking history"],
        },
        {
          number: "03",
          title: "Tickets",
          description:
            "Report incidents, follow updates, and keep technicians informed.",
          items: ["Issue reporting", "Live updates", "Technician notes"],
        },
      ].map((module) => (
        <div
          key={module.title}
          className="group relative overflow-hidden rounded-4xl border border-[#212325]/10 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#70071C]/5 transition-all duration-300 group-hover:bg-[#70071C]/10" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#70071C] text-sm font-bold text-white shadow-lg shadow-[#70071C]/20">
                {module.number}
              </span>

              <span className="rounded-full bg-[#F4F4F4] px-3 py-1 text-xs font-semibold text-[#212325]/55">
                Module
              </span>
            </div>

            <h3 className="mt-8 text-2xl font-semibold tracking-[-0.02em] text-[#212325]">
              {module.title}
            </h3>

            <p className="mt-4 leading-7 text-[#212325]/65">
              {module.description}
            </p>

            <div className="mt-8 space-y-3">
              {module.items.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#70071C]" />
                  <span className="text-sm font-medium text-[#212325]/70">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 h-px bg-[#212325]/10" />

              <a
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#70071C] transition-colors hover:text-[#4A0513]"
              >
                Explore module
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      <LandingFaqSection />

      <section id="roles" className="bg-[#212325] px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F4F4F4]/80">
            Role-based platform
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-[#F4F4F4]">
            Designed for users, admins and technicians
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-semibold text-white">Users</h3>
              <p className="mt-4 leading-7 text-white/75">
                Book resources, raise tickets and receive operational updates.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-semibold text-white">Admins</h3>
              <p className="mt-4 leading-7 text-white/75">
                Review activity, manage workflows and oversee the full system.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-semibold text-white">Technicians</h3>
              <p className="mt-4 leading-7 text-white/75">
                Track assigned work and move issues toward resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />

    </div>
  );
}