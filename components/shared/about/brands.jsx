import { Reveal } from "@/components/common/reveal";

const brands = [
  "Longrich",
  "Faforlife",
  "Allemax",
  "Superlife",
  "Aloe Ferox",
  "Biotrend Organic",
  "Jigsimur",
  "Oriflame",
];

export function BrandsSection() {
  return (
    <section className="bg-white border-b border-stone-200 py-14 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-8">
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-green-600 mb-2 font-sans">
            Our Partners
          </p>
          <h2 className="text-2xl font-bold text-stone-900 font-display">
            Globally trusted brands
          </h2>
        </Reveal>

        <Reveal delay={60}>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {brands.map((b) => (
              <span
                key={b}
                className="px-4 py-2.5 rounded-full border border-stone-200 bg-[#fafaf8] text-[14px] font-semibold text-stone-700 hover:border-green-300 hover:text-green-800 hover:bg-green-50 transition-all duration-150 cursor-default font-sans"
              >
                {b}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
