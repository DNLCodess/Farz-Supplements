"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  Lock,
  LogOut,
  Loader2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import {
  useAuth,
  useSignOut,
  useUpdateProfile,
  useChangePassword,
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useUserOrders,
} from "@/hooks/use-auth";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { mutate: signOut, isPending: signingOut } = useSignOut();
  const { mutate: updateProfile, isPending: updatingProfile } =
    useUpdateProfile();
  const { mutate: changePassword, isPending: changingPassword } =
    useChangePassword();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { mutate: addAddress, isPending: addingAddress } = useAddAddress();
  const { mutate: updateAddress, isPending: updatingAddress } =
    useUpdateAddress();
  const { mutate: deleteAddress, isPending: deletingAddress } =
    useDeleteAddress();
  const { data: ordersData, isLoading: ordersLoading } = useUserOrders();

  const [activeTab, setActiveTab] = useState("profile");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/login?redirect=/profile");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-900 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Orders", icon: Package },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              My Account
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back, {user?.first_name}!
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-green-50 text-green-900"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => signOut()}
                    disabled={signingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {signingOut ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogOut className="w-5 h-5" />
                    )}
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <ProfileTab
                  user={user}
                  updateProfile={updateProfile}
                  isLoading={updatingProfile}
                />
              )}
              {activeTab === "addresses" && (
                <AddressesTab
                  addresses={addresses || []}
                  isLoading={addressesLoading}
                  addAddress={addAddress}
                  updateAddress={updateAddress}
                  deleteAddress={deleteAddress}
                  addingAddress={addingAddress}
                  updatingAddress={updatingAddress}
                  deletingAddress={deletingAddress}
                  showModal={showAddressModal}
                  setShowModal={setShowAddressModal}
                  editingAddress={editingAddress}
                  setEditingAddress={setEditingAddress}
                />
              )}
              {activeTab === "orders" && (
                <OrdersTab
                  orders={ordersData?.orders || []}
                  isLoading={ordersLoading}
                />
              )}
              {activeTab === "security" && (
                <SecurityTab
                  changePassword={changePassword}
                  isLoading={changingPassword}
                  showModal={showPasswordModal}
                  setShowModal={setShowPasswordModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ user, updateProfile, isLoading }) {
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

// Helper component for info rows
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-200 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

// Addresses Tab Component
function AddressesTab({
  addresses,
  isLoading,
  addAddress,
  updateAddress,
  deleteAddress,
  addingAddress,
  updatingAddress,
  deletingAddress,
  showModal,
  setShowModal,
  editingAddress,
  setEditingAddress,
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-900 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
          <button
            onClick={() => {
              setEditingAddress(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No addresses saved yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-green-900 text-white rounded-lg font-bold hover:bg-green-800 transition-colors"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => {
                  setEditingAddress(address);
                  setShowModal(true);
                }}
                onDelete={() => {
                  if (
                    confirm("Are you sure you want to delete this address?")
                  ) {
                    deleteAddress(address.id);
                  }
                }}
                isDeleting={deletingAddress}
              />
            ))}
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showModal && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setShowModal(false);
            setEditingAddress(null);
          }}
          onSubmit={(formData) => {
            if (editingAddress) {
              updateAddress(
                { addressId: editingAddress.id, formData },
                {
                  onSuccess: (result) => {
                    if (result.success) {
                      setShowModal(false);
                      setEditingAddress(null);
                    }
                  },
                },
              );
            } else {
              addAddress(formData, {
                onSuccess: (result) => {
                  if (result.success) {
                    setShowModal(false);
                  }
                },
              });
            }
          }}
          isLoading={addingAddress || updatingAddress}
        />
      )}
    </>
  );
}

// Address Card Component
function AddressCard({ address, onEdit, onDelete, isDeleting }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-50 text-green-900 text-sm font-medium rounded">
            {address.address_type}
          </span>
          {address.is_default && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-green-900 transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="text-gray-900">
        <p>{address.address_line1}</p>
        {address.address_line2 && <p>{address.address_line2}</p>}
        <p>
          {address.city}, {address.state}
          {address.postal_code && ` ${address.postal_code}`}
        </p>
      </div>
    </div>
  );
}

// Address Modal Component
function AddressModal({ address, onClose, onSubmit, isLoading }) {
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

// Orders Tab Component
function OrdersTab({ orders, isLoading }) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-900 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No orders yet</p>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-green-900 text-white rounded-lg font-bold hover:bg-green-800 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-900 transition-colors cursor-pointer"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-900">
                    Order #{order.order_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "delivered"
                      ? "bg-green-50 text-green-900"
                      : order.status === "cancelled"
                        ? "bg-red-50 text-red-900"
                        : "bg-blue-50 text-blue-900"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-sm text-gray-600">
                  {order.order_items?.length} item(s)
                </p>
                <p className="text-lg font-bold text-green-900">
                  ₦{(order.total_amount || order.total || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Security Tab Component
function SecurityTab({ changePassword, isLoading, showModal, setShowModal }) {
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

      {/* Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Change Password
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
