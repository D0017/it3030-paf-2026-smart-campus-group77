import { Link } from "react-router-dom";

export default function LandingHero({ isAuthenticated }) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F4F4F4]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/13087749/pexels-photo-13087749.jpeg')",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,244,244,0.98)_0%,rgba(244,244,244,0.90)_32%,rgba(244,244,244,0.52)_62%,rgba(244,244,244,0.20)_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-24 pt-36 lg:px-10">
        <div className="max-w-4xl">
      

          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#4A0513]">
            Smart campus operations platform
          </p>

          <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#212325] md:text-7xl xl:text-[5.7rem]">
            Meaningful operations,
            <span className="mt-2 block font-serif italic text-[#70071C]">
              purposeful workflows.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-[#212325]/80 md:text-lg">
            Manage campus resources, booking requests, maintenance tickets and
            notifications from one polished portal designed for users, admins and
            technicians.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center rounded-md bg-[#70071C] px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#4A0513]"
                >
                  Go to dashboard
                </Link>

                <a
                  href="#modules"
                  className="inline-flex items-center rounded-md border border-[#212325]/15 bg-white/85 px-7 py-4 text-sm font-semibold uppercase tracking-wide text-[#212325] shadow-sm backdrop-blur transition hover:bg-white"
                >
                  Explore features
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-md bg-[#70071C] px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#4A0513]"
                >
                  Take your first step
                </Link>

                <a
                  href="#modules"
                  className="inline-flex items-center rounded-md border border-[#212325]/15 bg-white/85 px-7 py-4 text-sm font-semibold uppercase tracking-wide text-[#212325] shadow-sm backdrop-blur transition hover:bg-white"
                >
                  See how it works
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}