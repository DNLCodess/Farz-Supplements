"use client";

import { useState } from "react";
import { MapPin, Plus, Check, Edit2, Trash2, X } from "lucide-react";
import { formatAddress, getAddressLabel } from "@/hooks/use-addresses";

export default function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNew,
  isLoading,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-16 bg-gray-100 rounded-lg"></div>
        <div className="h-16 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-sm text-gray-600 mb-3">No saved addresses yet</p>
        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center gap-2 text-green-900 font-semibold text-sm hover:text-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>
    );
  }

  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  return (
    <div className="space-y-3">
      {/* Selected Address Display */}
      {selectedAddress && !isExpanded && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-700" />
                <span className="font-bold text-green-900 text-sm">
                  {getAddressLabel(selectedAddress)}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {formatAddress(selectedAddress)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-green-900 hover:text-green-700 font-semibold text-sm transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      {(!selectedAddress || isExpanded) && (
        <div className="space-y-2">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddressId;

            return (
              <button
                key={address.id}
                type="button"
                onClick={() => {
                  onSelectAddress(address);
                  setIsExpanded(false);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-green-900 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-green-900 bg-green-900"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm mb-1">
                      {getAddressLabel(address)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {formatAddress(address)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add New Button */}
          <button
            type="button"
            onClick={onAddNew}
            className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-900 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-gray-700 hover:text-green-900 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>

          {/* Cancel Button (when expanded) */}
          {isExpanded && selectedAddress && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full p-3 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-700 font-semibold text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
