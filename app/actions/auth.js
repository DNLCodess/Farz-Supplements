"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "farz@admin.com";

/**
 * Sign up new user
 * Creates auth user and customer record
 */
export async function signUp(formData) {
  try {
    const email = formData.get("email")?.toString().toLowerCase().trim();
    const password = formData.get("password")?.toString();
    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return {
        success: false,
        error: "All fields are required",
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return {
        success: false,
        error: "Invalid email address",
      };
    }

    // Check if email already exists
    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();

    if (existingCustomer) {
      return {
        success: false,
        error: "Email already registered",
      };
    }

    const supabase = await createClient();

    // Create auth user (no email verification required)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        },
      },
    });

    if (authError) {
      console.error("Auth signup error:", authError);
      return {
        success: false,
        error: authError.message || "Failed to create account",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create account",
      };
    }

    // Create customer record
    const { error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        user_id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      });

    if (customerError) {
      console.error("Customer creation error:", customerError);
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: "Failed to create customer profile",
      };
    }

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Sign in user
 * Supports both regular users and admin
 */
export async function signIn(formData) {
  try {
    const email = formData.get("email")?.toString().toLowerCase().trim();
    const password = formData.get("password")?.toString();
    const rememberMe = formData.get("rememberMe") === "true";

    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    const supabase = await createClient();

    // Sign in with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Auth signin error:", authError);

      // Provide user-friendly error messages
      if (authError.message.includes("Invalid login credentials")) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      return {
        success: false,
        error: authError.message || "Failed to sign in",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to sign in",
      };
    }

    // Check if user is admin
    const isAdmin = email === ADMIN_EMAIL;

    // Get customer profile for non-admin users
    let customer = null;
    if (!isAdmin) {
      const { data: customerData } = await supabaseAdmin
        .from("customers")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      customer = customerData;
    }

    return {
      success: true,
      isAdmin,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        ...customer,
      },
      redirectTo: isAdmin ? "/admin/dashboard" : "/profile",
    };
  } catch (error) {
    console.error("Signin error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Signout error:", error);
      return {
        success: false,
        error: error.message || "Failed to sign out",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Signout error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        user: null,
        isAdmin: false,
      };
    }

    // Check if admin
    const isAdmin = user.email === ADMIN_EMAIL;

    // Get customer profile for non-admin users
    let customer = null;
    if (!isAdmin) {
      const { data: customerData } = await supabaseAdmin
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      customer = customerData;
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ...customer,
      },
      isAdmin,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return {
      success: false,
      user: null,
      isAdmin: false,
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email) {
  try {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return {
        success: false,
        error: "Invalid email address",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error("Password reset request error:", error);
      // Don't reveal if email exists or not for security
      return {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link",
      };
    }

    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error: "Failed to process password reset request",
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(newPassword) {
  try {
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: error.message || "Failed to reset password",
      };
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(formData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();

    if (!firstName || !lastName) {
      return {
        success: false,
        error: "First name and last name are required",
      };
    }

    // Update customer record
    const { error: updateError } = await supabaseAdmin
      .from("customers")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return {
        success: false,
        error: "Failed to update profile",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Change password (for logged-in users)
 */
export async function changePassword(currentPassword, newPassword) {
  try {
    if (!currentPassword || !newPassword) {
      return {
        success: false,
        error: "Both passwords are required",
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        error: "New password must be at least 8 characters",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Verify current password by attempting sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Password change error:", updateError);
      return {
        success: false,
        error: updateError.message || "Failed to change password",
      };
    }

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Password change error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Get user addresses
 */
export async function getUserAddresses() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
        addresses: [],
      };
    }

    // Get customer ID
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!customer) {
      return {
        success: false,
        error: "Customer profile not found",
        addresses: [],
      };
    }

    // Get addresses
    const { data: addresses, error } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("customer_id", customer.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get addresses error:", error);
      return {
        success: false,
        error: "Failed to fetch addresses",
        addresses: [],
      };
    }

    return {
      success: true,
      addresses: addresses || [],
    };
  } catch (error) {
    console.error("Get addresses error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      addresses: [],
    };
  }
}

/**
 * Add new address
 */
export async function addAddress(formData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get customer ID
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!customer) {
      return {
        success: false,
        error: "Customer profile not found",
      };
    }

    const addressType = formData.get("addressType")?.toString() || "shipping";
    const addressLine1 = formData.get("addressLine1")?.toString().trim();
    const addressLine2 = formData.get("addressLine2")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const state = formData.get("state")?.toString().trim();
    const postalCode = formData.get("postalCode")?.toString().trim();
    const isDefault = formData.get("isDefault") === "true";

    if (!addressLine1 || !city || !state) {
      return {
        success: false,
        error: "Address line 1, city, and state are required",
      };
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabaseAdmin
        .from("addresses")
        .update({ is_default: false })
        .eq("customer_id", customer.id)
        .eq("address_type", addressType);
    }

    // Add address
    const { error: insertError } = await supabaseAdmin
      .from("addresses")
      .insert({
        customer_id: customer.id,
        address_type: addressType,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state,
        postal_code: postalCode || null,
        is_default: isDefault,
      });

    if (insertError) {
      console.error("Add address error:", insertError);
      return {
        success: false,
        error: "Failed to add address",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: "Address added successfully",
    };
  } catch (error) {
    console.error("Add address error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Update address
 */
export async function updateAddress(addressId, formData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get customer ID
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!customer) {
      return {
        success: false,
        error: "Customer profile not found",
      };
    }

    const addressLine1 = formData.get("addressLine1")?.toString().trim();
    const addressLine2 = formData.get("addressLine2")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const state = formData.get("state")?.toString().trim();
    const postalCode = formData.get("postalCode")?.toString().trim();
    const isDefault = formData.get("isDefault") === "true";

    if (!addressLine1 || !city || !state) {
      return {
        success: false,
        error: "Address line 1, city, and state are required",
      };
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      const { data: address } = await supabaseAdmin
        .from("addresses")
        .select("address_type")
        .eq("id", addressId)
        .single();

      if (address) {
        await supabaseAdmin
          .from("addresses")
          .update({ is_default: false })
          .eq("customer_id", customer.id)
          .eq("address_type", address.address_type);
      }
    }

    // Update address
    const { error: updateError } = await supabaseAdmin
      .from("addresses")
      .update({
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state,
        postal_code: postalCode || null,
        is_default: isDefault,
      })
      .eq("id", addressId)
      .eq("customer_id", customer.id);

    if (updateError) {
      console.error("Update address error:", updateError);
      return {
        success: false,
        error: "Failed to update address",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: "Address updated successfully",
    };
  } catch (error) {
    console.error("Update address error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Delete address
 */
export async function deleteAddress(addressId) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get customer ID
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!customer) {
      return {
        success: false,
        error: "Customer profile not found",
      };
    }

    // Delete address
    const { error: deleteError } = await supabaseAdmin
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("customer_id", customer.id);

    if (deleteError) {
      console.error("Delete address error:", deleteError);
      return {
        success: false,
        error: "Failed to delete address",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: "Address deleted successfully",
    };
  } catch (error) {
    console.error("Delete address error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
