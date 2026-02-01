"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({
  value = 1,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
}) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="inline-flex items-center border border-neutral-300 rounded-md overflow-hidden">
      <button
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4 text-neutral-700" />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="w-12 h-9 text-center text-sm font-medium text-neutral-900 border-x border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-inset disabled:opacity-50"
        aria-label="Quantity"
      />

      <button
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4 text-neutral-700" />
      </button>
    </div>
  );
}
