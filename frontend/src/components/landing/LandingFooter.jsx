import { Link } from "react-router-dom";
import campusLogo from "../../assets/logo2.png"; 

function LandingFooter() {
  return (
    <footer className="border-t border-[#212325]/8 bg-white px-6 py-16 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.9fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#F4F4F4] shadow-sm ring-1 ring-[#212325]/8">
              <img
                src={campusLogo}
                alt="CampusOps Hub logo"
                className="h-10 w-10 object-contain"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#70071C]">
                CampusOps
              </p>
              <p className="text-3xl font-semibold leading-none text-[#212325]">
                Hub
              </p>
            </div>
          </Link>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#212325]/70">
            A unified smart campus operations portal for managing resources,
            bookings, maintenance tickets and notifications through one connected
            digital workspace.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
            Portal
          </h3>

          <div className="mt-5 space-y-3 text-sm text-[#212325]/75">
            <a href="#modules" className="block transition hover:text-[#70071C]">
              Features
            </a>
            <a href="#faq" className="block transition hover:text-[#70071C]">
              FAQ
            </a>
            <Link to="/login" className="block transition hover:text-[#70071C]">
              Sign in
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
            Access
          </h3>

          <div className="mt-5 space-y-3 text-sm text-[#212325]/75">
            <p>Google OAuth login</p>
            <p>Role-based access control</p>
            <p>Admin-managed role assignment</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
            Support
          </h3>

          <div className="mt-5 space-y-3 text-sm text-[#212325]/75">
            <p>Need Technician or Admin access?</p>
            <p>Contact your campus system administrator after first sign-in.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12  flex max-w-7xl flex-col gap-4 border-t border-[#212325]/8 pt-6 text-sm text-[#212325]/55 md:flex-row md:items-center md:justify-between">
        <p>© 2026 CampusOps Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default LandingFooter;