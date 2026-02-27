"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Scroll Reveal ─────────────────────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
function Section({ id, label, title, children }) {
  return (
    <Reveal>
      <section
        id={id}
        className="py-10 border-b border-stone-100 last:border-0"
      >
        <div className="flex items-start gap-4 mb-5">
          <span className="mt-1 text-[10px] font-black tracking-widest uppercase text-green-600 bg-green-50 border border-green-200 rounded-md px-2 py-1 whitespace-nowrap shrink-0">
            {label}
          </span>
          <h2 className="text-xl font-bold text-stone-900 leading-snug">
            {title}
          </h2>
        </div>
        <div className="text-[17px] text-stone-700 leading-relaxed space-y-3">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

function Callout({ variant = "green", children }) {
  const styles = {
    green: "bg-green-50 border-green-500 text-green-900",
    amber: "bg-amber-50 border-amber-500 text-amber-900",
  };
  return (
    <div
      className={`mt-4 border-l-[3px] rounded-r-xl px-5 py-4 text-[15px] leading-relaxed ${styles[variant]}`}
    >
      {children}
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex gap-4 py-4 border-b border-stone-100 last:border-0">
      <div className="w-7 h-7 rounded-full bg-green-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-semibold text-stone-900 text-[15px] mb-1">{title}</p>
        <p className="text-[15px] text-stone-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function RefundPolicyPage() {
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const toc = [
    { href: "#returns", label: "Returns" },
    { href: "#refunds", label: "Refunds" },
    { href: "#non-returnable", label: "Non-returnable items" },
    { href: "#damaged", label: "Damaged products" },
    { href: "#how-to", label: "How to return" },
    { href: "#agreement", label: "Agreement" },
  ];

  const quickFacts = [
    {
      value: "5 days",
      label: "to request a return",
      accent: "text-green-800 bg-green-50 border-green-200",
    },
    {
      value: "7 days",
      label: "refund processing",
      accent: "text-blue-800 bg-blue-50 border-blue-200",
    },
    {
      value: "48 hrs",
      label: "to report damage",
      accent: "text-amber-800 bg-amber-50 border-amber-200",
    },
    {
      value: "Unopened",
      label: "only eligible",
      accent: "text-stone-700 bg-stone-50 border-stone-200",
    },
  ];

  return (
    <main className="bg-[#fafaf8] text-stone-900 min-h-screen">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-white/[0.05] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full border border-white/[0.04] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24 relative z-10">
          <div
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(16px)",
              transition:
                "opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s",
            }}
          >
            <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
              <Link href="/" className="hover:text-white/70 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white/60">Refund & Returns</span>
            </div>
            <p className="text-[11px] font-black tracking-[0.2em] uppercase text-green-400 mb-3">
              Legal
            </p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Refund &amp; Returns Policy
            </h1>
            <p className="text-base sm:text-lg text-green-200/80 max-w-md leading-relaxed">
              Your satisfaction is our priority. Here's everything you need to
              know.
            </p>
            <p className="mt-5 text-[13px] text-white/30 font-medium">
              Effective: August 2025
            </p>
          </div>
        </div>
      </header>

      {/* ── QUICK FACTS ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickFacts.map((f, i) => (
              <Reveal key={f.value} delay={i * 60}>
                <div
                  className={`border rounded-2xl px-4 py-5 text-center ${f.accent}`}
                >
                  <p className="text-xl font-bold leading-none mb-1.5">
                    {f.value}
                  </p>
                  <p className="text-[13px] leading-snug opacity-80">
                    {f.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex gap-12 items-start">
        <article className="flex-1 min-w-0">
          {/* Intro */}
          <Reveal>
            <p className="text-[17px] text-stone-700 leading-relaxed pb-10 border-b border-stone-100">
              At{" "}
              <strong className="text-stone-900 font-semibold">
                Farz Supplements and Herbal Store
              </strong>
              , your satisfaction and well-being are our top priorities. If for
              any reason you&lsquo;re not completely satisfied with your
              purchase, this policy is here to help.
            </p>
          </Reveal>

          <Section id="returns" label="01" title="Returns">
            <p>
              We accept returns when{" "}
              <strong className="text-stone-900">all</strong> of the following
              conditions are met:
            </p>
            <div className="rounded-xl border border-stone-200 overflow-hidden mt-3">
              {[
                [true, "Item is unopened and unused"],
                [true, "Item is in its original, unaltered packaging"],
                [true, "Purchased directly from our online store"],
                [true, "We are notified within 5 days of delivery"],
                [false, "Opened, used, or tampered items are not eligible"],
              ].map(([ok, text], i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3 text-[15px] border-b border-stone-100 last:border-0 ${!ok ? "bg-red-50" : ""}`}
                >
                  <span
                    className={`font-bold shrink-0 mt-0.5 text-base ${ok ? "text-green-600" : "text-red-500"}`}
                  >
                    {ok ? "✓" : "✗"}
                  </span>
                  <span className={!ok ? "text-red-700" : "text-stone-700"}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <Callout variant="green">
              Contact us <strong>within 5 days of receiving your order</strong>{" "}
              to initiate a return. Requests after this window may not be
              accepted.
            </Callout>
          </Section>

          <Section id="refunds" label="02" title="Refunds">
            <p>Once we receive and inspect your return, here's what happens:</p>
            <div className="mt-3 rounded-xl border border-stone-200 overflow-hidden">
              <Step
                number="1"
                title="Inspection"
                description="We verify the returned product meets our eligibility conditions."
              />
              <Step
                number="2"
                title="Notification"
                description="We contact you by email or phone with our decision."
              />
              <Step
                number="3"
                title="Refund issued"
                description="If approved, a full or partial refund (excluding shipping) is processed to your original payment method within 7 business days."
              />
            </div>
            <Callout variant="green">
              Shipping fees are non-refundable unless the return is due to our
              error.
            </Callout>
          </Section>

          <Section id="non-returnable" label="03" title="Non-returnable items">
            <Callout variant="amber">
              For health and hygiene reasons, we{" "}
              <strong>cannot accept returns</strong> on opened supplements, used
              products, or perishable goods — unless they arrived damaged or
              defective.
            </Callout>
            <div className="mt-4 rounded-xl border border-stone-200 overflow-hidden">
              {[
                "Opened supplement bottles or capsules",
                "Used personal care or beauty products",
                "Perishable wellness items",
                "Any item showing signs of use or tampering",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 border-b border-stone-100 last:border-0 bg-red-50/40"
                >
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">
                    ✗
                  </span>
                  <span className="text-[15px] text-stone-700">{item}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="damaged"
            label="04"
            title="Damaged or incorrect products"
          >
            <p>
              If you received a damaged, defective, or wrong product, we will
              make it right at{" "}
              <strong className="text-stone-900">no extra cost</strong>.
            </p>
            <Callout variant="amber">
              Contact us <strong>within 48 hours of delivery</strong> with photo
              or video proof. We cannot process claims outside this window.
            </Callout>
            <p className="text-[15px] text-stone-600 mt-3">
              We'll arrange either a{" "}
              <strong className="text-stone-800">replacement product</strong> or
              a <strong className="text-stone-800">full refund</strong> — your
              choice.
            </p>
          </Section>

          <Section id="how-to" label="05" title="How to start a return">
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <Step
                number="1"
                title="Prepare details"
                description="Have your order number and a description or photos of the issue ready."
              />
              <Step
                number="2"
                title="Contact us"
                description="Email sales@https://farz-supplements.vercel.app/.ng or use our contact form. Quote your order number and reason."
              />
              <Step
                number="3"
                title="Wait for confirmation"
                description="Our team responds within 1–2 business days with instructions."
              />
              <Step
                number="4"
                title="Ship the item"
                description="If approved, pack the item securely and send it back as instructed."
              />
              <Step
                number="5"
                title="Receive your refund"
                description="After inspection, your refund is processed within 7 business days."
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href="mailto:sales@https://farz-supplements.vercel.app/.ng"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-900 hover:bg-green-800 text-white font-semibold text-[15px] rounded-xl transition-colors duration-150 min-h-[48px]"
              >
                Email Us
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-stone-50 text-stone-900 font-semibold text-[15px] rounded-xl border border-stone-300 transition-colors duration-150 min-h-[48px]"
              >
                Contact Form
              </Link>
            </div>
          </Section>

          <Section id="agreement" label="06" title="Policy agreement">
            <p>
              By shopping with Farz Supplements and Herbal Store, you agree to
              this policy. We reserve the right to update it at any time —
              changes will be posted here with a revised date.
            </p>
            <p className="text-[15px] text-stone-500 mt-2">
              Thank you for trusting Farz Supplements — your reliable partner in
              natural wellness.
            </p>
          </Section>
        </article>

        {/* ── Sticky TOC (desktop) ─────────────────────────────────────── */}
        <aside className="w-52 shrink-0 sticky top-8 hidden lg:flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="px-5 pt-5 pb-3 border-b border-stone-100">
              <p className="text-[10px] font-black tracking-[0.18em] uppercase text-stone-400">
                On this page
              </p>
            </div>
            <nav className="p-2">
              {toc.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-2.5 rounded-lg text-[13px] font-medium text-stone-600 hover:text-green-800 hover:bg-green-50 transition-colors duration-150"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <p className="text-[13px] font-bold text-green-900 mb-1">
              Need help?
            </p>
            <p className="text-[12px] text-stone-500 mb-4 leading-relaxed">
              Mon–Sat, 8am – 5pm Lagos time
            </p>
            <a
              href="tel:+2349123368239"
              className="flex items-center justify-center w-full px-3 py-2.5 bg-green-900 hover:bg-green-800 text-white font-semibold text-[13px] rounded-xl transition-colors duration-150 min-h-11 mb-2"
            >
              +2349123368239
            </a>
            <a
              href="mailto:sales@https://farz-supplements.vercel.app/.ng"
              className="flex items-center justify-center w-full px-3 py-2.5 bg-white hover:bg-stone-50 text-stone-900 font-semibold text-[13px] rounded-xl border border-stone-200 transition-colors duration-150 min-h-11"
            >
              Email Us
            </a>
          </div>
        </aside>
      </div>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-stone-200 px-5 sm:px-8 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[17px] font-semibold text-stone-800 mb-1">
            Questions about your order or a return?
          </p>
          <p className="text-[14px] text-stone-400 mb-6">
            Mon–Sat, 8am – 5pm (Lagos time)
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:sales@https://farz-supplements.vercel.app/.ng"
              className="inline-flex items-center gap-2 px-7 py-3 bg-green-900 hover:bg-green-800 text-white font-semibold text-[15px] rounded-xl transition-colors duration-150 min-h-[48px]"
            >
              Email Support
            </a>
            <a
              href="tel:+2349123368239"
              className="inline-flex items-center gap-2 px-7 py-3 bg-white hover:bg-stone-50 text-stone-900 font-semibold text-[15px] rounded-xl border border-stone-300 transition-colors duration-150 min-h-[48px]"
            >
              Call Us
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
