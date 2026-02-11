"use client";

import { Loader2 } from "lucide-react";

export default function AddressModal({
  address,
  onClose,
  onSubmit,
  isLoading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {address ? "Edit Address" : "Add New Address"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Address Type
            </label>
            <select
              name="addressType"
              defaultValue={address?.address_type || "shipping"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Address Line 1
            </label>
            <input
              type="text"
              name="addressLine1"
              defaultValue={address?.address_line1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Address Line 2 <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              name="addressLine2"
              defaultValue={address?.address_line2 || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                defaultValue={address?.city}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                defaultValue={address?.state}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Postal Code <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              name="postalCode"
              defaultValue={address?.postal_code || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              value="true"
              defaultChecked={address?.is_default}
              className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-900"
            />
            <span className="text-base text-gray-700">Set as default</span>
          </label>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-900 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : address ? (
                "Update Address"
              ) : (
                "Add Address"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
