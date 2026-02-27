import { Reveal } from "@/components/common/reveal";

const points = [
  "Plant-based remedies with fewer side effects",
  "Rich in vitamins, minerals, and antioxidants",
  "Works with your body, not against it",
  "Backed by centuries of traditional use",
  "Builds immunity and long-term resilience",
  "Safer, more sustainable path to health",
];

export function PhilosophySection() {
  return (
    <section className="bg-green-950 py-16 sm:py-20 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-green-400 mb-3 font-sans">
            Our Philosophy
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-snug font-display">
            Why herbal solutions?
          </h2>
          <p className="text-[16px] text-green-200/75 leading-relaxed font-sans">
            In today&apos;s fast-paced world, people are rediscovering the
            healing power of nature. Unlike synthetic products, herbs work in
            harmony with the body — restoring, strengthening, and supporting
            long-term health without harsh side effects.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <ul className="space-y-0 rounded-2xl border border-white/10 overflow-hidden">
            {points.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-5 py-4 border-b border-white/6 last:border-0 text-[16px] text-green-100 font-sans"
              >
                <span className="text-green-400 font-bold shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
