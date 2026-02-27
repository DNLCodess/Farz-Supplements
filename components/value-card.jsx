export function ValueCard({ icon, title, description }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-sm transition-all duration-200">
      <span className="text-2xl mb-3 block">{icon}</span>
      <h3 className="font-semibold text-stone-900 text-[17px] mb-2 font-sans">
        {title}
      </h3>
      <p className="text-[15px] text-stone-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
