"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Store,
  Mail,
  CreditCard,
  Truck,
  Globe,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  getSettings,
  updateMultipleSettings,
} from "@/app/actions/payment-settings";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettings,
    staleTime: 60000,
  });

  const [formData, setFormData] = useState({
    // General
    site_name: "",
    site_description: "",
    site_logo: "",
    contact_email: "",
    contact_phone: "",

    // Store
    currency: "NGN",
    tax_rate: 0,
    low_stock_threshold: 10,

    // Shipping
    shipping_enabled: true,
    flat_shipping_rate: 0,
    free_shipping_threshold: 0,

    // Payment
    paystack_public_key: "",
    paystack_secret_key: "",

    // Email
    email_from_name: "",
    email_from_address: "",
  });

  // Update when settings load
  useState(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...Object.entries(settings).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {}),
      }));
    }
  }, [settings]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateMultipleSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "email", label: "Email", icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your store settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-green-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
        </div>
      )}

      {/* Settings Form */}
      {!isLoading && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  Store Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={formData.site_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          site_name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                      placeholder="Farz Supplements"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Store Description
                    </label>
                    <textarea
                      value={formData.site_description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          site_description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                      placeholder="Your trusted source for natural health supplements..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            contact_email: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                        placeholder="support@farz.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            contact_phone: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  Store Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          currency: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tax_rate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tax_rate: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          low_stock_threshold: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Settings */}
          {activeTab === "shipping" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  Shipping Configuration
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="shipping_enabled"
                      checked={formData.shipping_enabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shipping_enabled: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 text-green-900 border-gray-300 rounded focus:ring-green-900"
                    />
                    <label
                      htmlFor="shipping_enabled"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Enable Shipping
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Flat Shipping Rate (₦)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.flat_shipping_rate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            flat_shipping_rate: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                        placeholder="0"
                        disabled={!formData.shipping_enabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Free Shipping Threshold (₦)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.free_shipping_threshold}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            free_shipping_threshold: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                        placeholder="0 (disabled)"
                        disabled={!formData.shipping_enabled}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Set to 0 to disable free shipping threshold
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  Paystack Integration
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Public Key
                    </label>
                    <input
                      type="text"
                      value={formData.paystack_public_key}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paystack_public_key: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-mono focus:outline-none focus:border-green-900"
                      placeholder="pk_live_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      value={formData.paystack_secret_key}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paystack_secret_key: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-mono focus:outline-none focus:border-green-900"
                      placeholder="sk_live_..."
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      This key will be encrypted and stored securely
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm mb-1">
                          Security Notice
                        </h4>
                        <p className="text-sm text-blue-800">
                          Your Paystack credentials are encrypted and never
                          exposed to the client. Use live keys only in
                          production.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === "email" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  Email Configuration
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={formData.email_from_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email_from_name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                        placeholder="Farz Supplements"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        From Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email_from_address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email_from_address: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                        placeholder="noreply@farz.com"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      Email notifications are sent via Resend. Configure your
                      API key in environment variables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200 mt-6">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
