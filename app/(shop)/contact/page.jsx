"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Send,
} from "lucide-react";
import { sendContactEmail } from "@/app/actions/contact";
import { Reveal } from "@/components/common/reveal";
import { ContactHero } from "@/components/shared/contact/hero";

/* ─── Contact info items ────────────────────────────────────────────────── */
const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Phone",
    value: "+2349123368239",
    href: "tel:+2349123368239",
    sub: "Mon – Fri, 8am – 6pm",
  },
  {
    icon: Mail,
    label: "Email",
    value: "farzstore02@gmail.com",
    href: "mailto:farzstore02@gmail.com",
    sub: "We reply within 24–48 hours",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Lagos, Nigeria",
    href: null,
    sub: "Nationwide delivery available",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Mon – Sat",
    href: null,
    sub: "8am – 6pm weekdays · 9am – 4pm Sat",
  },
];

const SUBJECTS = [
  "Order Enquiry",
  "Product Information",
  "Delivery & Shipping",
  "Returns & Refunds",
  "Wholesale / Bulk Orders",
  "Partnership",
  "Other",
];

/* ─── Field wrapper ─────────────────────────────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-stone-700 font-sans">
        {label}
        {required && <span className="text-green-600 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[12px] text-red-500 font-sans flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Input styles ──────────────────────────────────────────────────────── */
const inputCls =
  "w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-[15px] text-stone-900 font-sans placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-500 transition-all duration-150 min-h-[48px]";

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const formRef = useRef(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(formRef.current);

    startTransition(async () => {
      setStatus(null);
      const result = await sendContactEmail(formData);

      if (result.success) {
        setStatus("success");
        formRef.current?.reset();
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Something went wrong.");
      }
    });
  }

  return (
    <main className="bg-[#fafaf8] min-h-screen">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <ContactHero />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* ── Form ─────────────────────────────────────────────────── */}
          <Reveal>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
              {/* Success state */}
              {status === "success" ? (
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2 font-display">
                      Message sent!
                    </h3>
                    <p className="text-[15px] text-stone-600 leading-relaxed font-sans max-w-xs mx-auto">
                      Thanks for reaching out. We&apos;ll reply to your email
                      within 24–48 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setStatus(null)}
                    className="mt-2 text-[14px] font-semibold text-green-700 hover:text-green-900 transition-colors font-sans flex items-center gap-1.5 group"
                  >
                    Send another message
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                  <h2 className="text-xl font-bold text-stone-900 mb-6 font-display">
                    Send us a message
                  </h2>

                  <div className="flex flex-col gap-5">
                    {/* Name + Email row */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Full Name" required>
                        <input
                          name="name"
                          type="text"
                          placeholder="e.g. Amara Johnson"
                          required
                          className={inputCls}
                          disabled={isPending}
                        />
                      </Field>
                      <Field label="Email Address" required>
                        <input
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          className={inputCls}
                          disabled={isPending}
                        />
                      </Field>
                    </div>

                    {/* Phone + Subject row */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Phone Number">
                        <input
                          name="phone"
                          type="tel"
                          placeholder="+234 800 000 0000"
                          className={inputCls}
                          disabled={isPending}
                        />
                      </Field>
                      <Field label="Subject" required>
                        <select
                          name="subject"
                          required
                          className={`${inputCls} cursor-pointer`}
                          disabled={isPending}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select a topic
                          </option>
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {/* Message */}
                    <Field label="Message" required>
                      <textarea
                        name="message"
                        rows={5}
                        required
                        placeholder="Tell us how we can help you..."
                        className={`${inputCls} min-h-[140px] resize-none`}
                        disabled={isPending}
                      />
                    </Field>

                    {/* Error banner */}
                    {status === "error" && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[14px] text-red-700 font-sans">
                          {errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-green-900 hover:bg-green-800 disabled:bg-green-900/60 text-white font-bold text-[15px] rounded-xl transition-all duration-200 hover:-translate-y-px active:translate-y-0 min-h-[52px] font-sans"
                    >
                      {isPending ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-center text-[12px] text-stone-400 font-sans">
                      We typically respond within 24–48 hours on business days.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          {/* ── Sidebar: contact info ────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Contact cards */}
            {CONTACT_INFO.map((item, i) => {
              const Icon = item.icon;
              const Inner = (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                    <Icon
                      className="w-4.5 h-4.5 text-green-700"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-[0.15em] uppercase text-stone-400 mb-0.5 font-sans">
                      {item.label}
                    </p>
                    <p className="text-[15px] font-semibold text-stone-900 font-sans">
                      {item.value}
                    </p>
                    <p className="text-[13px] text-stone-500 font-sans mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </div>
              );

              return (
                <Reveal key={item.label} delay={i * 60}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="block bg-white border border-stone-200 rounded-2xl p-5 hover:border-green-300 hover:shadow-sm transition-all duration-150 group"
                    >
                      {Inner}
                    </a>
                  ) : (
                    <div className="bg-white border border-stone-200 rounded-2xl p-5">
                      {Inner}
                    </div>
                  )}
                </Reveal>
              );
            })}

            {/* Quick links */}
          </div>
        </div>
      </div>
    </main>
  );
}
