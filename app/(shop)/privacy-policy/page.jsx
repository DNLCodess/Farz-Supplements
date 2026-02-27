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

function Reveal({ children, className = "", delay = 0, y = 20 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────────────────────── */
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
    green: "bg-green-50 border-green-600 text-green-900",
  };
  return (
    <div
      className={`mt-4 border-l-[3px] rounded-r-lg px-5 py-4 text-[15px] leading-relaxed ${styles[variant]}`}
    >
      {children}
    </div>
  );
}

function DataRow({ term, note }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-stone-100 last:border-0 text-[15px]">
      <span className="font-semibold text-stone-900 min-w-[140px] shrink-0">
        {term}
      </span>
      <span className="text-stone-600">{note}</span>
    </div>
  );
}

function RightRow({ label, desc }) {
  return (
    <div className="flex gap-4 py-3 border-b border-stone-100 last:border-0">
      <span className="text-[11px] font-black tracking-wider uppercase text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 h-fit mt-0.5 shrink-0 min-w-[60px] text-center">
        {label}
      </span>
      <span className="text-[15px] text-stone-700 leading-relaxed">{desc}</span>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function PrivacyPolicyPage() {
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const toc = [
    { href: "#collect", label: "What we collect" },
    { href: "#use", label: "How we use it" },
    { href: "#security", label: "Data security" },
    { href: "#cookies", label: "Cookies" },
    { href: "#marketing", label: "Marketing emails" },
    { href: "#rights", label: "Your rights" },
    { href: "#updates", label: "Policy updates" },
    { href: "#contact", label: "Contact us" },
  ];

  return (
    <main className="bg-[#fafaf8] text-stone-900 min-h-screen">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-800">
        {/* Subtle decorative rings */}
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
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
              <Link href="/" className="hover:text-white/70 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white/60">Privacy Policy</span>
            </div>

            <p className="text-[11px] font-black tracking-[0.2em] uppercase text-green-400 mb-3">
              Legal
            </p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-green-200/80 max-w-md leading-relaxed">
              How we collect, use, and protect your personal information.
            </p>
            <p className="mt-5 text-[13px] text-white/30 font-medium">
              Effective: August 2025
            </p>
          </div>
        </div>
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex gap-12 items-start">
        {/* Content */}
        <article className="flex-1 min-w-0">
          {/* Intro */}
          <Reveal>
            <p className="text-[17px] text-stone-700 leading-relaxed pb-10 border-b border-stone-100">
              At{" "}
              <strong className="text-stone-900 font-semibold">
                Farz Supplements and Herbal Store
              </strong>
              , your privacy matters. This policy explains what we collect, how
              we use it, and how we keep it safe. Our website is{" "}
              <a
                href="https://https://farz-supplements.vercel.app/.ng"
                className="text-green-700 font-medium underline underline-offset-2 hover:text-green-800"
              >
                https://farz-supplements.vercel.app/.ng
              </a>
              .
            </p>
          </Reveal>

          <Section id="collect" label="01" title="What information we collect">
            <p>When you visit or place an order, we may collect:</p>
            <div className="mt-3 rounded-xl border border-stone-200 overflow-hidden">
              <DataRow term="Full name" note="To personalise your order" />
              <DataRow
                term="Email address"
                note="For confirmations and support"
              />
              <DataRow term="Phone number" note="For delivery coordination" />
              <DataRow term="Delivery address" note="To ship your products" />
              <DataRow
                term="Payment information"
                note="Processed securely — we never store card details"
              />
            </div>
          </Section>

          <Section id="use" label="02" title="How we use your information">
            <ul className="space-y-2">
              {[
                "Process and fulfil your orders accurately",
                "Send order confirmations, receipts, and shipping updates",
                "Provide responsive customer support",
                "Improve our website, products, and experience",
                "Send promotional content (with your consent)",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-[10px] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Callout>
              <strong>
                We never sell, rent, or share your data with third parties for
                marketing.
              </strong>{" "}
              Your information is used solely to serve you.
            </Callout>
          </Section>

          <Section id="security" label="03" title="Data security">
            <p>
              All personal information is stored securely and accessible only by
              authorised staff. Payment transactions are processed by{" "}
              <strong className="text-stone-900 font-semibold">Paystack</strong>{" "}
              (PCI-DSS compliant). We never store your full card number or
              financial credentials.
            </p>
          </Section>

          <Section id="cookies" label="04" title="Cookies & tracking">
            <p>
              We use cookies to improve your browsing experience — keeping your
              cart, remembering preferences, and helping us understand site
              usage.
            </p>
            <p className="text-[15px] text-stone-500">
              You can disable cookies in your browser settings. Note: some
              features like the shopping cart may stop working.
            </p>
          </Section>

          <Section id="marketing" label="05" title="Marketing communications">
            <p>
              We may occasionally send emails about new products, discounts, or
              wellness tips.
            </p>
            <Callout>
              You can <strong>unsubscribe at any time</strong> via the link at
              the bottom of any email. We'll remove you promptly.
            </Callout>
          </Section>

          <Section id="rights" label="06" title="Your rights">
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <RightRow
                label="Access"
                desc="Request a copy of data we hold about you"
              />
              <RightRow
                label="Correct"
                desc="Ask us to fix inaccurate information"
              />
              <RightRow
                label="Delete"
                desc="Request deletion (subject to legal obligations)"
              />
              <RightRow
                label="Opt out"
                desc="Withdraw consent for marketing at any time"
              />
            </div>
            <p className="mt-4 text-[15px] text-stone-600">
              To exercise any right:{" "}
              <a
                href="mailto:sales@https://farz-supplements.vercel.app/.ng"
                className="text-green-700 font-medium underline underline-offset-2 hover:text-green-800"
              >
                sales@https://farz-supplements.vercel.app/.ng
              </a>
            </p>
          </Section>

          <Section id="updates" label="07" title="Policy updates">
            <p>
              We may update this policy at any time. Changes will be posted here
              with a revised effective date. Continued use of our site means you
              accept the updated terms.
            </p>
          </Section>

          <Section id="contact" label="08" title="Contact us">
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              {[
                {
                  label: "Email",
                  value: "sales@https://farz-supplements.vercel.app/.ng",
                  href: "mailto:sales@https://farz-supplements.vercel.app/.ng",
                },
                {
                  label: "Email",
                  value: "farzsupplementsandherbalstore@gmail.com",
                  href: "mailto:farzsupplementsandherbalstore@gmail.com",
                },
                {
                  label: "Phone",
                  value: "+2349123368239",
                  href: "tel:+2349123368239",
                },
                {
                  label: "Phone",
                  value: "+234 912 202 9818",
                  href: "tel:+2349122029818",
                },
                { label: "Location", value: "Lagos, Nigeria", href: null },
              ].map((c, i) => (
                <DataRow
                  key={i}
                  term={c.label}
                  note={
                    c.href ? (
                      <a
                        href={c.href}
                        className="text-green-700 font-medium underline underline-offset-2 hover:text-green-800"
                      >
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )
                  }
                />
              ))}
            </div>
          </Section>
        </article>

        {/* ── Sticky TOC (desktop) ─────────────────────────────────────── */}
        <aside className="w-52 shrink-0 sticky top-8 hidden lg:block">
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
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-stone-600 hover:text-green-800 hover:bg-green-50 transition-colors duration-150"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="p-4 border-t border-stone-100">
              <a
                href="mailto:sales@https://farz-supplements.vercel.app/.ng"
                className="flex items-center justify-center w-full px-3 py-3 bg-green-900 hover:bg-green-800 text-white font-semibold text-[13px] rounded-xl transition-colors duration-150 min-h-11"
              >
                Email Us
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-stone-200 px-5 sm:px-8 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[17px] text-stone-700 mb-6">
            Questions about this policy? We&apos;re happy to help.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:sales@https://farz-supplements.vercel.app/.ng"
              className="inline-flex items-center gap-2 px-7 py-3 bg-green-900 hover:bg-green-800 text-white font-semibold text-[15px] rounded-xl transition-colors duration-150 min-h-12"
            >
              Email Us
            </a>
            <a
              href="tel:+2349123368239"
              className="inline-flex items-center gap-2 px-7 py-3 bg-white hover:bg-stone-50 text-stone-900 font-semibold text-[15px] rounded-xl border border-stone-300 transition-colors duration-150 min-h-12"
            >
              Call Us
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

+2349123368239;
