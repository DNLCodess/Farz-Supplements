import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useAddresses(userId) {
  const queryClient = useQueryClient();

  // Fetch user addresses
  const {
    data: addresses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["addresses", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("customer_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Get default address
  const defaultAddress = addresses.find((addr) => addr.is_default) || null;

  // Create new address
  const createAddress = useMutation({
    mutationFn: async (addressData) => {
      const { data, error } = await supabase
        .from("addresses")
        .insert([
          {
            customer_id: userId,
            ...addressData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      toast.success("Address saved successfully");
    },
    onError: (error) => {
      console.error("Error creating address:", error);
      toast.error("Failed to save address");
    },
  });

  // Update address
  const updateAddress = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from("addresses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      toast.success("Address updated successfully");
    },
    onError: (error) => {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
    },
  });

  // Delete address
  const deleteAddress = useMutation({
    mutationFn: async (addressId) => {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;
      return addressId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      toast.success("Address deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    },
  });

  // Set default address
  const setDefaultAddress = useMutation({
    mutationFn: async (addressId) => {
      // First, unset all other defaults
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("customer_id", userId);

      // Then set the new default
      const { data, error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      toast.success("Default address updated");
    },
    onError: (error) => {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
    },
  });

  return {
    addresses,
    defaultAddress,
    isLoading,
    error,
    createAddress: createAddress.mutate,
    updateAddress: updateAddress.mutate,
    deleteAddress: deleteAddress.mutate,
    setDefaultAddress: setDefaultAddress.mutate,
    isCreating: createAddress.isPending,
    isUpdating: updateAddress.isPending,
    isDeleting: deleteAddress.isPending,
  };
}

// Helper function to format address for display
export function formatAddress(address) {
  if (!address) return "";

  const parts = [
    address.address_line1,
    address.address_line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean);

  return parts.join(", ");
}

// Helper function to get address display name
export function getAddressLabel(address) {
  if (!address) return "";

  const type = address.address_type === "billing" ? "Billing" : "Shipping";
  const defaultLabel = address.is_default ? " (Default)" : "";

  return `${type} - ${address.city}, ${address.state}${defaultLabel}`;
}
