"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth, useUpdateProfile } from "@/hooks/use-auth";
import { formatDate } from "@/utils/format";

export default function ProfileTab() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending: isLoading } = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateProfile(formData, {
      onSuccess: (result) => {
        if (result.success) {
          setIsEditing(false);
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Profile Information
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <InfoRow label="First Name" value={user?.first_name} />
          <InfoRow label="Last Name" value={user?.last_name} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Phone" value={user?.phone || "Not provided"} />
          <InfoRow label="Member Since" value={formatDate(user?.created_at)} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              defaultValue={user?.first_name}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              defaultValue={user?.last_name}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={user?.phone || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-900"
            />
          </div>
          <div className="flex gap-3">
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
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-200 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
