import { Reveal } from "@/components/common/reveal";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-16 sm:py-20 px-5 sm:px-8">
      <Reveal className="max-w-lg mx-auto text-center">
        <h2 className="text-3xl font-bold text-stone-900 mb-3 font-display">
          Ready to start your wellness journey?
        </h2>
        <p className="text-[16px] text-stone-600 mb-8 leading-relaxed font-sans">
          Browse our range of natural health products, or call us and we&apos;ll
          help you find exactly what you need.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-900 hover:bg-green-800 text-white font-bold text-[15px] rounded-xl transition-all duration-200 hover:-translate-y-px min-h-12 font-sans"
          >
            Shop Now
          </Link>
          <a
            href="tel:+2349123368239"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-stone-50 text-stone-900 font-bold text-[15px] rounded-xl border-2 border-stone-900 transition-all duration-200 hover:-translate-y-px min-h-12 font-sans"
          >
            +2349123368239
          </a>
        </div>
      </Reveal>
    </section>
  );
}
