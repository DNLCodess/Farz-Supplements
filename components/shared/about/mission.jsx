import { Reveal } from "@/components/common/reveal";

const items = [
  {
    icon: "🎯",
    label: "Our Mission",
    text: "To inspire and support individuals on their wellness journey by delivering premium-quality supplements and herbal solutions that promote lasting health, energy, and balance.",
  },
  {
    icon: "🔭",
    label: "Our Vision",
    text: "To become Nigeria's leading natural health store — trusted for results-driven products, exceptional service, and guidance toward a healthier, happier lifestyle.",
  },
];

export function MissionSection() {
  return (
    <section className="bg-white border-y border-stone-200 py-16 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-10">
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-green-600 mb-2 font-sans">
            Our Purpose
          </p>
          <h2 className="text-3xl font-bold text-stone-900 font-display">
            What drives us every day
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 80}>
              <div className="bg-[#fafaf8] border border-stone-200 rounded-2xl p-8 h-full">
                <span className="text-2xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-bold text-green-900 mb-3 font-display">
                  {item.label}
                </h3>
                <p className="text-[16px] text-stone-700 leading-relaxed font-sans">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
