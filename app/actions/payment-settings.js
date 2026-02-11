"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

// ============ PAYMENTS ============

export async function getPayments({
  page = 1,
  limit = 20,
  status = null,
  startDate = null,
  endDate = null,
}) {
  try {
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_email,
        customer_first_name,
        customer_last_name,
        total_amount,
        transaction_fee,
        payment_method,
        payment_status,
        payment_reference,
        paid_at,
        created_at
      `,
        { count: "exact" },
      )
      .not("payment_reference", "is", null);

    if (status) {
      query = query.eq("payment_status", status);
    }

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      payments: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0),
      },
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
}

export async function getPaymentStats({
  startDate = null,
  endDate = null,
} = {}) {
  try {
    let query = supabaseAdmin
      .from("orders")
      .select("total_amount, transaction_fee, payment_status, created_at")
      .not("payment_reference", "is", null);

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total_transactions: data.length,
      total_revenue: 0,
      total_fees: 0,
      net_revenue: 0,
      successful_payments: 0,
      failed_payments: 0,
      pending_payments: 0,
    };

    data.forEach((payment) => {
      stats.total_revenue += payment.total_amount || 0;
      stats.total_fees += payment.transaction_fee || 0;

      if (payment.payment_status === "paid") {
        stats.successful_payments++;
      } else if (payment.payment_status === "failed") {
        stats.failed_payments++;
      } else {
        stats.pending_payments++;
      }
    });

    stats.net_revenue = stats.total_revenue - stats.total_fees;

    return stats;
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    throw error;
  }
}

export async function refundPayment(orderId, amount, reason) {
  try {
    // In a real app, this would call Paystack's refund API
    // For now, we'll just update the order status

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "refunded",
        order_notes: `Refund: ₦${amount.toLocaleString()} - Reason: ${reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/payments");
    revalidatePath("/admin/orders");

    return {
      success: true,
      data,
      message: "Refund processed successfully",
    };
  } catch (error) {
    console.error("Error processing refund:", error);
    return {
      success: false,
      error: error.message || "Failed to process refund",
    };
  }
}

// ============ SETTINGS ============

export async function getSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*");

    if (error) throw error;

    // Convert array to object for easier access
    const settings = {};
    data?.forEach((setting) => {
      settings[setting.key] = setting.value;
    });

    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
}

export async function getSettingByKey(key) {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data?.value || null;
  } catch (error) {
    console.error("Error fetching setting:", error);
    throw error;
  }
}

export async function updateSetting(key, value, description = null) {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        {
          key,
          value,
          description,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      )
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/settings");

    return {
      success: true,
      data,
      message: "Setting updated successfully",
    };
  } catch (error) {
    console.error("Error updating setting:", error);
    return {
      success: false,
      error: error.message || "Failed to update setting",
    };
  }
}

export async function updateMultipleSettings(settings) {
  try {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .upsert(updates, { onConflict: "key" })
      .select();

    if (error) throw error;

    revalidatePath("/admin/settings");

    return {
      success: true,
      data,
      message: "Settings updated successfully",
    };
  } catch (error) {
    console.error("Error updating settings:", error);
    return {
      success: false,
      error: error.message || "Failed to update settings",
    };
  }
}

export async function deleteSetting(key) {
  try {
    const { error } = await supabaseAdmin
      .from("site_settings")
      .delete()
      .eq("key", key);

    if (error) throw error;

    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "Setting deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting setting:", error);
    return {
      success: false,
      error: error.message || "Failed to delete setting",
    };
  }
}
