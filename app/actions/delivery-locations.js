"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function getDeliveryLocations() {
  try {
    const { data, error } = await supabaseAdmin
      .from("delivery_locations")
      .select("*")
      .order("state", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching delivery locations:", error);
    throw error;
  }
}

export async function getActiveDeliveryLocations() {
  try {
    const { data, error } = await supabaseAdmin
      .from("delivery_locations")
      .select("*")
      .eq("is_active", true)
      .order("state", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching active delivery locations:", error);
    throw error;
  }
}

export async function createDeliveryLocation(data) {
  try {
    const { data: created, error } = await supabaseAdmin
      .from("delivery_locations")
      .insert({
        name: data.name.trim(),
        state: data.state.trim(),
        fee: parseFloat(data.fee) || 0,
        estimated_days: data.estimated_days?.trim() || null,
        is_active: data.is_active !== false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/delivery-locations");
    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating delivery location:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDeliveryLocation(id, data) {
  try {
    const { data: updated, error } = await supabaseAdmin
      .from("delivery_locations")
      .update({
        name: data.name.trim(),
        state: data.state.trim(),
        fee: parseFloat(data.fee) || 0,
        estimated_days: data.estimated_days?.trim() || null,
        is_active: data.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/delivery-locations");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating delivery location:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDeliveryLocation(id) {
  try {
    const { error } = await supabaseAdmin
      .from("delivery_locations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/delivery-locations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting delivery location:", error);
    return { success: false, error: error.message };
  }
}

export async function getProductDeliveryLocations(productId) {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_delivery_locations")
      .select("delivery_location_id")
      .eq("product_id", productId);

    if (error) throw error;
    return (data || []).map((r) => r.delivery_location_id);
  } catch (error) {
    console.error("Error fetching product delivery locations:", error);
    return [];
  }
}

/**
 * Replace all delivery location assignments for a product.
 * Deletes existing, inserts new ones.
 */
export async function setProductDeliveryLocations(productId, locationIds) {
  try {
    // Delete existing assignments
    const { error: deleteError } = await supabaseAdmin
      .from("product_delivery_locations")
      .delete()
      .eq("product_id", productId);

    if (deleteError) throw deleteError;

    // Insert new ones if any
    if (locationIds.length > 0) {
      const rows = locationIds.map((locationId) => ({
        product_id: productId,
        delivery_location_id: locationId,
      }));

      const { error: insertError } = await supabaseAdmin
        .from("product_delivery_locations")
        .insert(rows);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error setting product delivery locations:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Given a state and a list of product IDs, return the applicable delivery fee.
 * Uses the highest fee among matched delivery locations for the cart's products.
 * Returns null if no delivery location exists for the state.
 */
export async function getDeliveryFeeForState(state, productIds) {
  try {
    if (!state || !productIds?.length) return null;

    // Find active delivery locations matching the state
    const { data: locations, error: locError } = await supabaseAdmin
      .from("delivery_locations")
      .select("id, name, fee, estimated_days")
      .eq("is_active", true)
      .ilike("state", state);

    if (locError) throw locError;
    if (!locations?.length) return null;

    const locationIds = locations.map((l) => l.id);

    // Find which of these locations are assigned to at least one product in the cart
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from("product_delivery_locations")
      .select("delivery_location_id")
      .in("product_id", productIds)
      .in("delivery_location_id", locationIds);

    if (assignError) throw assignError;

    if (!assignments?.length) return null;

    // Get the unique matched location IDs
    const matchedIds = [...new Set(assignments.map((a) => a.delivery_location_id))];
    const matchedLocations = locations.filter((l) => matchedIds.includes(l.id));

    // Return the one with the highest fee
    const best = matchedLocations.reduce((max, loc) =>
      loc.fee > max.fee ? loc : max
    );

    return {
      fee: best.fee,
      name: best.name,
      estimated_days: best.estimated_days,
    };
  } catch (error) {
    console.error("Error getting delivery fee for state:", error);
    return null;
  }
}
