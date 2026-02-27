import { Reveal } from "@/components/common/reveal";
import { ValueCard } from "@/components/value-card";

const values = [
  {
    icon: "🌿",
    title: "Products That Work",
    description:
      "Research-backed supplements carefully selected to deliver real, measurable health benefits.",
  },
  {
    icon: "🛡️",
    title: "Natural & Safe",
    description:
      "Rooted in nature and free from harmful additives — you can trust what you put in your body.",
  },
  {
    icon: "🤝",
    title: "Customer-First",
    description:
      "We guide you to the right products for your needs before and after every purchase.",
  },
  {
    icon: "💰",
    title: "Affordable Wellness",
    description:
      "Premium herbal products at competitive prices, because good health should be accessible.",
  },
  {
    icon: "⏳",
    title: "Time-Tested Traditions",
    description:
      "Centuries of herbal wisdom combined with modern quality standards.",
  },
  {
    icon: "🔬",
    title: "Holistic Approach",
    description:
      "Supporting total body wellness — energy, immunity, balance, and long-term vitality.",
  },
];

export function ValuesSection() {
  return (
    <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <Reveal className="mb-10">
        <p className="text-[11px] font-black tracking-[0.2em] uppercase text-green-600 mb-2 font-sans">
          Why Choose Farz
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="text-3xl font-bold text-stone-900 leading-snug max-w-sm font-display">
            What sets us apart
          </h2>
          <p className="text-[16px] text-stone-500 max-w-xs leading-relaxed font-sans">
            We&apos;re your wellness partner — helping you navigate natural
            health with confidence.
          </p>
        </div>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {values.map((v, i) => (
          <Reveal key={v.title} delay={i * 50}>
            <ValueCard {...v} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
