import { Reveal } from "@/components/common/reveal";

const stats = [
  { value: "500+", label: "Products" },
  { value: "8+", label: "Trusted Brands" },
  { value: "9", label: "Categories" },
  { value: "100%", label: "Natural" },
];

export function StatsBar() {
  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-8xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-200">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 70}
            className="flex flex-col items-center gap-1.5 py-8 px-4"
          >
            <span className="text-3xl sm:text-4xl font-bold text-green-900 font-display">
              {s.value}
            </span>
            <span className="text-[13px] text-stone-500 font-medium text-center font-sans">
              {s.label}
            </span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
