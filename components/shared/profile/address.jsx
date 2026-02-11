"use client";

import { useState } from "react";
import { MapPin, Loader2, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/use-auth";
import AddressModal from "./address-modal";

export default function AddressesTab() {
  const { data: addresses, isLoading } = useAddresses();
  const { mutate: addAddress, isPending: addingAddress } = useAddAddress();
  const { mutate: updateAddress, isPending: updatingAddress } =
    useUpdateAddress();
  const { mutate: deleteAddress, isPending: deletingAddress } =
    useDeleteAddress();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddressSubmit = (formData) => {
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
  };

  const handleDeleteAddress = (addressId) => {
    if (confirm("Are you sure you want to delete this address?")) {
      deleteAddress(addressId);
    }
  };

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

        {addresses?.length === 0 ? (
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
            {addresses?.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => {
                  setEditingAddress(address);
                  setShowModal(true);
                }}
                onDelete={() => handleDeleteAddress(address.id)}
                isDeleting={deletingAddress}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setShowModal(false);
            setEditingAddress(null);
          }}
          onSubmit={handleAddressSubmit}
          isLoading={addingAddress || updatingAddress}
        />
      )}
    </>
  );
}

function AddressCard({ address, onEdit, onDelete, isDeleting }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
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
            aria-label="Edit address"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
            aria-label="Delete address"
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
