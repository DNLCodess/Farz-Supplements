"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────────────────
   Layout: Full-height split-screen
   - Left: dark green panel with all copy + CTAs (55% width on desktop)
   - Right: full-bleed lifestyle photo, clipped to panel (45% width)
   - Mobile: stacks vertically, image above copy (collapsed height)

   Why this layout for Farz:
   • Split-screen outperforms pure gradient heroes for product/lifestyle brands
     — the image builds trust and emotional pull, copy drives action
   • Left-aligned text is easier to scan for 35+ demographic vs. centered
   • Full image height (no thumbnail) signals premium quality
   • Dark overlay gradient on the left keeps text legible at all contrast ratios
───────────────────────────────────────────────────────────────────────── */

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=85&auto=format&fit=crop";
// Photo: Anna Pelzer — vibrant flat-lay of natural foods, herbs, greens
// Unsplash license: free for commercial use, no attribution required

const TRUST_BADGES = [
  { label: "100% Natural" },
  { label: "Lab Tested" },
  { label: "Fast Delivery" },
];

export function HeroSection() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const fadeIn = (delay = 0) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  return (
    <header className="relative w-full min-h-[88vh] md:min-h-screen flex flex-col md:flex-row overflow-hidden bg-green-950">
      {/* ── LEFT PANEL — copy ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center w-full md:w-[55%] px-6 sm:px-10 lg:px-16 py-16 md:py-24">
        {/* Subtle radial glow behind text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 20% 50%, rgba(20,83,45,0.6) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-lg">
          {/* Badge */}
          <div style={fadeIn(0)}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/[0.14] px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-green-300 font-sans">
                Herbal Solutions for Wellness
              </span>
            </div>
          </div>

          {/* Headline */}
          <div style={fadeIn(80)}>
            <h1 className="text-[2.6rem] sm:text-5xl md:text-[3.25rem] lg:text-[3.6rem] font-bold text-white leading-[1.08] mb-5 font-display tracking-[-0.01em]">
              Nature&apos;s Power.
              <br />
              <span className="text-green-300">Your Health.</span>
            </h1>
          </div>

          {/* Body */}
          <div style={fadeIn(160)}>
            <p className="text-[16px] sm:text-[17px] text-green-100/70 leading-relaxed mb-8 font-sans">
              Premium herbal supplements and natural health products — carefully
              sourced, rigorously tested, and delivered across Nigeria.
            </p>
          </div>

          {/* CTAs */}
          <div style={fadeIn(220)}>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-400 text-white font-bold text-[15px] rounded-xl transition-all duration-200 hover:-translate-y-px active:translate-y-0 min-h-12 font-sans shadow-lg shadow-green-900/40"
              >
                Shop Products
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <a
                href="tel:+2349123368239"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/[0.07] hover:bg-white/[0.13] text-white font-semibold text-[15px] rounded-xl border border-white/[0.18] hover:border-white/[0.32] transition-all duration-200 hover:-translate-y-px active:translate-y-0 min-h-12 font-sans"
              >
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                Call to Order
              </a>
            </div>
          </div>

          {/* Trust badges */}
          <div style={fadeIn(300)}>
            <div className="flex items-center gap-4 flex-wrap">
              {TRUST_BADGES.map((b) => (
                <div key={b.label} className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-green-400 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-[13px] text-green-300/80 font-medium font-sans">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — image ───────────────────────────────────────── */}
      <div className="relative w-full md:w-[45%] h-[52vw] md:h-auto min-h-70 md:min-h-0 overflow-hidden">
        {/* Gradient mask: left edge bleeds into the dark left panel */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgb(5,46,22) 0%, rgba(5,46,22,0.35) 22%, transparent 48%), linear-gradient(to top, rgba(5,46,22,0.5) 0%, transparent 30%)",
          }}
        />

        <Image
          src={HERO_IMAGE}
          alt="Natural herbs and wellness ingredients"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover object-center"
          quality={90}
        />
      </div>
    </header>
  );
}
