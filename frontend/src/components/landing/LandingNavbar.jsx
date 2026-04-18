import { Link } from "react-router-dom";
import campusLogo from "../../assets/logo2.png";

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function UserBadgeIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1.5-3 4.2-4.5 7-4.5s5.5 1.5 7 4.5" />
    </svg>
  );
}

function UserAvatar({ currentUser }) {
  const displayName =
    currentUser?.fullName || currentUser?.name || currentUser?.email || "User";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#212325]/10 bg-white shadow-sm transition hover:shadow-md"
      title={displayName}
    >
      <span className="flex h-full w-full items-center justify-center bg-[#70071C] text-sm font-semibold text-white">
        {initial}
      </span>

      <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#F4F4F4] bg-[#212325] text-white">
        <UserBadgeIcon />
      </span>
    </button>
  );
}

export default function LandingNavbar({
  isAuthenticated,
  currentUser,
  mobileOpen,
  setMobileOpen,
}) {
  const role = currentUser?.role;

  const publicLinks = [
    { label: "Overview", href: "#overview" },
    { label: "Modules", href: "#modules" },
    { label: "Roles", href: "#roles" },
  ];

  const privateLinks = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Resources", to: "/resources" },
    { label: "Bookings", to: "/bookings" },
    { label: "Tickets", to: "/tickets" },
    { label: "Notifications", to: "/notifications" },
    ...(role === "ADMIN" ? [{ label: "Users", to: "/users" }] : []),
  ];

  const links = isAuthenticated ? privateLinks : publicLinks;

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link to="/" className="flex items-center gap-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/30 backdrop-blur-sm">
                          <img
                            src={campusLogo}
                            alt="CampusOps Hub logo"
                            className="h-12 w-12 object-contain"
                          />
                        </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4A0513]">
                CampusOps
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 xl:flex">
            {links.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-sm font-semibold uppercase tracking-wide text-[#212325] transition hover:text-[#70071C]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-semibold uppercase tracking-wide text-[#212325] transition hover:text-[#70071C]"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>

                <Link
                  to="/login"
                  className="inline-flex rounded-full bg-[#70071C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A0513]"
                >
                  Log in
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-semibold text-[#212325]">
                    {currentUser?.fullName || currentUser?.name || "Campus User"}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-[#70071C]">
                    {currentUser?.role || "User"}
                  </p>
                </div>

                <UserAvatar currentUser={currentUser} />
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#212325]/10 bg-white/80 text-[#212325] shadow-sm xl:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="absolute inset-x-6 top-24 z-40 rounded-3xl border border-[#212325]/10 bg-white/95 p-6 shadow-xl backdrop-blur xl:hidden">
          <div className="flex flex-col gap-4">
            {links.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="font-semibold text-[#212325]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="font-semibold text-[#212325]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}