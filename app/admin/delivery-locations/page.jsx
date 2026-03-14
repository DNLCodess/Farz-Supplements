"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDeliveryLocations,
  createDeliveryLocation,
  updateDeliveryLocation,
  deleteDeliveryLocation,
} from "@/app/actions/delivery-locations";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
];

const emptyForm = {
  name: "",
  state: "",
  fee: "",
  estimated_days: "",
  is_active: true,
};

// Defined outside the page component to prevent remounting on every render
function FormFields({ data, onChange, errors, isPending, onCancel }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g. Lagos Island, Ikeja, Abuja"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-green-900 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State <span className="text-red-500">*</span>
        </label>
        <select
          value={data.state}
          onChange={(e) => onChange({ ...data, state: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-green-900 bg-white ${
            errors.state ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select state</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.state && (
          <p className="mt-1 text-xs text-red-600">{errors.state}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Fee (₦) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
            ₦
          </span>
          <input
            type="number"
            min="0"
            step="50"
            value={data.fee}
            onChange={(e) => onChange({ ...data, fee: e.target.value })}
            placeholder="2500"
            className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-green-900 ${
              errors.fee ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.fee && (
          <p className="mt-1 text-xs text-red-600">{errors.fee}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Delivery Time
        </label>
        <input
          type="text"
          value={data.estimated_days}
          onChange={(e) =>
            onChange({ ...data, estimated_days: e.target.value })
          }
          placeholder="e.g. 1-2 days, Same day"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-900"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={data.is_active}
            onChange={(e) => onChange({ ...data, is_active: e.target.checked })}
            className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-900"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
      </div>

      <div className="sm:col-span-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm text-white bg-green-900 rounded-lg hover:bg-green-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </div>
  );
}

export default function DeliveryLocationsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["delivery-locations"],
    queryFn: getDeliveryLocations,
  });

  const createMutation = useMutation({
    mutationFn: createDeliveryLocation,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["delivery-locations"] });
        toast.success("Delivery location added");
        setForm(emptyForm);
        setShowAddForm(false);
        setFormErrors({});
      } else {
        toast.error(result.error || "Failed to add location");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateDeliveryLocation(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["delivery-locations"] });
        toast.success("Location updated");
        setEditingId(null);
        setEditForm(null);
      } else {
        toast.error(result.error || "Failed to update location");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeliveryLocation,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["delivery-locations"] });
        toast.success("Location deleted");
      } else {
        toast.error(result.error || "Failed to delete location");
      }
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Failed to delete location");
      setDeletingId(null);
    },
  });

  const validateForm = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = "Name is required";
    if (!data.state) errors.state = "State is required";
    if (!data.fee || isNaN(parseFloat(data.fee)) || parseFloat(data.fee) < 0)
      errors.fee = "Valid fee is required";
    return errors;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    createMutation.mutate(form);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(editForm);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    updateMutation.mutate({ id: editingId, data: editForm });
  };

  const startEdit = (loc) => {
    setEditingId(loc.id);
    setEditForm({
      name: loc.name,
      state: loc.state,
      fee: loc.fee.toString(),
      estimated_days: loc.estimated_days || "",
      is_active: loc.is_active,
    });
    setFormErrors({});
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setFormErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
            <Truck className="w-6 h-6 text-green-900" />
            Delivery Locations
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage delivery areas and their fees. Assign locations to products
            when creating or editing them.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setForm(emptyForm);
              setFormErrors({});
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-900 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white border border-green-200 rounded-xl p-5 mb-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-900" />
            New Delivery Location
          </h2>
          <form onSubmit={handleAddSubmit}>
            <FormFields
              data={form}
              onChange={setForm}
              errors={formErrors}
              isPending={createMutation.isPending}
              onCancel={() => {
                setShowAddForm(false);
                setFormErrors({});
              }}
            />
          </form>
        </div>
      )}

      {/* Locations List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-green-900" />
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No delivery locations yet
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Add your first delivery location to start assigning delivery fees
              to products.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {locations.map((loc) => (
                <div key={loc.id}>
                  {editingId === loc.id && editForm ? (
                    <div className="p-4 bg-green-50">
                      <p className="text-sm font-semibold text-green-900 mb-3">
                        Editing: {loc.name}
                      </p>
                      <form onSubmit={handleEditSubmit}>
                        <FormFields
                          data={editForm}
                          onChange={setEditForm}
                          errors={formErrors}
                          isPending={updateMutation.isPending}
                          onCancel={cancelEdit}
                        />
                      </form>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{loc.name}</p>
                          <p className="text-sm text-gray-500">{loc.state}</p>
                          {loc.estimated_days && (
                            <p className="text-xs text-gray-400 mt-0.5">{loc.estimated_days}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-sm font-semibold text-gray-900">
                            {loc.fee === 0 ? (
                              <span className="text-green-700">Free</span>
                            ) : (
                              `₦${Number(loc.fee).toLocaleString()}`
                            )}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              loc.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {loc.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => startEdit(loc)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {deletingId === loc.id ? (
                          <div className="flex flex-1 items-center gap-2">
                            <button
                              onClick={() => deleteMutation.mutate(loc.id)}
                              disabled={deleteMutation.isPending}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : null}
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="flex-1 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(loc.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <table className="hidden sm:table w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">State</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Fee</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Est. Time</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => (
                  <>
                    <tr
                      key={loc.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        editingId === loc.id ? "hidden" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{loc.name}</td>
                      <td className="px-4 py-3 text-gray-700">{loc.state}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {loc.fee === 0 ? (
                          <span className="text-green-700">Free</span>
                        ) : (
                          `₦${Number(loc.fee).toLocaleString()}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{loc.estimated_days || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            loc.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {loc.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(loc)}
                            className="p-1.5 text-gray-500 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {deletingId === loc.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteMutation.mutate(loc.id)}
                                disabled={deleteMutation.isPending}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                              >
                                {deleteMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : null}
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(loc.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {editingId === loc.id && editForm && (
                      <tr key={`edit-${loc.id}`}>
                        <td colSpan={6} className="px-4 py-4 bg-green-50">
                          <p className="text-sm font-semibold text-green-900 mb-3">
                            Editing: {loc.name}
                          </p>
                          <form onSubmit={handleEditSubmit}>
                            <FormFields
                              data={editForm}
                              onChange={setEditForm}
                              errors={formErrors}
                              isPending={updateMutation.isPending}
                              onCancel={cancelEdit}
                            />
                          </form>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {locations.length > 0 && (
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Deleting a location removes it from all product assignments.
        </p>
      )}
    </div>
  );
}
