import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getCurrentUser,
  signOut,
  updateProfile,
  changePassword,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "@/app/actions/auth";
import { getCustomerOrders } from "@/app/actions/orders";

// Query keys
export const authKeys = {
  all: ["auth"],
  user: () => [...authKeys.all, "user"],
  addresses: () => [...authKeys.all, "addresses"],
  orders: (email) => [...authKeys.all, "orders", email],
};

/**
 * Hook to get current user
 * Auto-refetches on window focus
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to check if user is authenticated
 */
export function useAuth() {
  const { data, isLoading } = useCurrentUser();

  return {
    user: data?.user || null,
    isAdmin: data?.isAdmin || false,
    isAuthenticated: !!data?.user,
    isLoading,
  };
}

/**
 * Hook for sign out
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: (result) => {
      if (result.success) {
        // Clear all queries
        queryClient.clear();
        toast.success("Signed out successfully");
        router.push("/login");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to sign out");
      }
    },
    onError: (error) => {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    },
  });
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.user() });
        toast.success(result.message || "Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    },
    onError: (error) => {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      changePassword(currentPassword, newPassword),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Password changed successfully");
      } else {
        toast.error(result.error || "Failed to change password");
      }
    },
    onError: (error) => {
      console.error("Change password error:", error);
      toast.error("Failed to change password");
    },
  });
}

/**
 * Hook to get user addresses
 */
export function useAddresses() {
  return useQuery({
    queryKey: authKeys.addresses(),
    queryFn: getUserAddresses,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => data?.addresses || [],
  });
}

/**
 * Hook for adding address
 */
export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAddress,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
        toast.success(result.message || "Address added successfully");
      } else {
        toast.error(result.error || "Failed to add address");
      }
    },
    onError: (error) => {
      console.error("Add address error:", error);
      toast.error("Failed to add address");
    },
  });
}

/**
 * Hook for updating address
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, formData }) => updateAddress(addressId, formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
        toast.success(result.message || "Address updated successfully");
      } else {
        toast.error(result.error || "Failed to update address");
      }
    },
    onError: (error) => {
      console.error("Update address error:", error);
      toast.error("Failed to update address");
    },
  });
}

/**
 * Hook for deleting address
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
        toast.success(result.message || "Address deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete address");
      }
    },
    onError: (error) => {
      console.error("Delete address error:", error);
      toast.error("Failed to delete address");
    },
  });
}

/**
 * Hook to get user orders
 */
export function useUserOrders(options = {}) {
  const { data: userData } = useCurrentUser();

  return useQuery({
    queryKey: authKeys.orders(userData?.user?.email),
    queryFn: () =>
      userData?.user?.email
        ? getCustomerOrders(userData.user.email, options)
        : Promise.resolve({ success: false, orders: [] }),
    enabled: !!userData?.user?.email,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => ({
      orders: data?.orders || [],
      pagination: data?.pagination,
    }),
  });
}

/**
 * Hook to check authentication and redirect if needed
 */
export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    router.push(redirectTo);
  }

  return { user, isLoading };
}

/**
 * Hook to check admin and redirect if needed
 */
export function useRequireAdmin(redirectTo = "/") {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();

  if (!isLoading && (!user || !isAdmin)) {
    router.push(redirectTo);
  }

  return { user, isAdmin, isLoading };
}
