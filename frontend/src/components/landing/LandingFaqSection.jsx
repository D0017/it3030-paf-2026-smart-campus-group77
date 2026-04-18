import { useState } from "react";

const faqItems = [
  {
    question: "How do I sign in to CampusOps Hub?",
    answer:
      "Use your Google account to sign in securely. If this is your first time, your account will be created automatically.",
  },
  {
    question: "Can students use the system immediately after first sign-in?",
    answer:
      "Yes. Regular users can access the portal right after their first successful Google sign-in.",
  },
  {
    question: "How do Technician and Admin roles work?",
    answer:
      "Users sign in through the same Google flow. An administrator can later assign Technician or Admin roles from the user management area.",
  },
  {
    question: "What can I do in CampusOps Hub?",
    answer:
      "You can browse resources, manage bookings, report tickets, and receive notifications in one unified portal.",
  },
  {
    question: "Will I receive notifications about updates?",
    answer:
      "Yes. The system provides notifications for broadcasts, actions, and important workflow updates.",
  },
  {
    question: "Who should I contact if I need higher access?",
    answer:
      "After your first sign-in, contact the system administrator if you need Technician or Admin access.",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#212325]/8 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-[#F4F4F4]"
      >
        <span className="text-lg font-medium text-[#212325]">{item.question}</span>

        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#212325]/10 text-[#70071C] transition-transform duration-300 ${
            isOpen ? "rotate-180 bg-[#70071C]/5" : "bg-white"
          }`}
        >
          ▾
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#212325]/8 px-6 py-5 text-sm leading-7 text-[#212325]/70">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-[#F4F4F4] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#70071C]">
            Support
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[#212325] md:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base leading-8 text-[#212325]/70">
            Everything you need to know about access, roles, and how CampusOps Hub
            works.
          </p>
        </div>

        <div className="mt-12 grid gap-4">
          {faqItems.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingFaqSection;