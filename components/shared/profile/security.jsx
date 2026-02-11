"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useChangePassword } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function SecurityTab() {
  const { mutate: changePassword, isPending: isLoading } = useChangePassword();
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: (result) => {
          if (result.success) {
            setShowModal(false);
            e.target.reset();
          }
        },
      },
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Security Settings
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-600">
                Last changed: Never or unknown
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <PasswordModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </>
  );
}

function PasswordModal({ onClose, onSubmit, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Change Password
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-900 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
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
