"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";

export function ContactHero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const fadeIn = (delay = 0) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
  });

  return (
    <div className="relative overflow-hidden bg-green-950">
      {/* Decorative rings — consistent with HeroSection language */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-white/[0.04] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full border border-white/[0.06] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full border border-white/[0.04] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 10% 60%, rgba(20,83,45,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* Top: badge + heading + body */}
        <div className="max-w-xl">
          <div style={fadeIn(0)}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] border border-white/[0.1] px-4 py-1.5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-green-300 font-sans">
                Get in Touch
              </span>
            </div>
          </div>

          <div style={fadeIn(80)}>
            <h1 className="text-3xl sm:text-4xl md:text-[2.9rem] font-bold text-white leading-[1.1] mb-5 font-display">
              We&apos;re here{" "}
              <span className="text-green-300">to help you</span>
            </h1>
          </div>

          <div style={fadeIn(160)}>
            <p className="text-[16px] sm:text-[17px] text-green-100/65 leading-relaxed font-sans">
              Have a question about a product, your order, or anything else? Our
              team is ready to assist — reach out and we&apos;ll get back to you
              within 24–48 hours.
            </p>
          </div>
        </div>

        {/* Bottom: response time + direct call strip */}
        <div style={fadeIn(240)} className="mt-10">
          <div className="inline-flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Response time pill */}
            <div className="flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.1] rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <span className="text-[13px] text-green-200/80 font-sans">
                Typically replies within{" "}
                <span className="text-white font-semibold">24–48 hrs</span>
              </span>
            </div>

            {/* Direct call link */}
            <a
              href="tel:+2349123368239"
              className="flex items-center gap-2 text-[13px] text-green-300 hover:text-white transition-colors duration-150 font-semibold font-sans group"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>+2349123368239</span>
              <span className="text-green-600 group-hover:text-green-400 transition-colors">
                ·
              </span>
              <span className="text-green-400/70 font-normal group-hover:text-green-200 transition-colors">
                Call us directly
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
