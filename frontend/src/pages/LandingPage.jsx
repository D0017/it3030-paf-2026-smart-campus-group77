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

      <section id="modules" className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
              Core modules
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[#212325]">
              A cleaner digital layer for daily university operations
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-[#F4F4F4] p-8">
              <h3 className="text-2xl font-semibold text-[#212325]">Resources</h3>
              <p className="mt-4 leading-7 text-[#212325]/75">
                Browse rooms, labs and equipment with a clear availability view.
              </p>
            </div>

            <div className="rounded-3xl bg-[#F4F4F4] p-8">
              <h3 className="text-2xl font-semibold text-[#212325]">Bookings</h3>
              <p className="mt-4 leading-7 text-[#212325]/75">
                Submit requests and track approvals through a consistent workflow.
              </p>
            </div>

            <div className="rounded-3xl bg-[#F4F4F4] p-8">
              <h3 className="text-2xl font-semibold text-[#212325]">Tickets</h3>
              <p className="mt-4 leading-7 text-[#212325]/75">
                Report incidents, follow updates and keep technicians informed.
              </p>
            </div>
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