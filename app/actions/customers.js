"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function getCustomers({ page = 1, limit = 20, search = "" }) {
  try {
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from("customers").select(
      `
        *,
        orders:orders(count),
        total_spent:orders(total_amount)
      `,
      { count: "exact" },
    );

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Calculate total spent for each customer
    const customersWithStats = data.map((customer) => ({
      ...customer,
      order_count: customer.orders?.[0]?.count || 0,
      total_spent:
        customer.total_spent?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0,
        ) || 0,
    }));

    return {
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0),
      },
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

export async function getCustomerById(id) {
  try {
    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Get customer orders
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at
      `,
      )
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    // Get customer addresses
    const { data: addresses } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("customer_id", id)
      .order("is_default", { ascending: false });

    const totalSpent =
      orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    return {
      ...customer,
      orders: orders || [],
      addresses: addresses || [],
      order_count: orders?.length || 0,
      total_spent: totalSpent,
    };
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
}

export async function updateCustomer(id, formData) {
  try {
    const customerData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update(customerData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${id}`);

    return {
      success: true,
      data,
      message: "Customer updated successfully",
    };
  } catch (error) {
    console.error("Error updating customer:", error);
    return {
      success: false,
      error: error.message || "Failed to update customer",
    };
  }
}

export async function deleteCustomer(id) {
  try {
    // Check if customer has orders
    const { count } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", id);

    if (count > 0) {
      return {
        success: false,
        error:
          "Cannot delete customer with existing orders. Customer data must be retained for order history.",
      };
    }

    const { error } = await supabaseAdmin
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/customers");

    return {
      success: true,
      message: "Customer deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return {
      success: false,
      error: error.message || "Failed to delete customer",
    };
  }
}

export async function getCustomerStats() {
  try {
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [
      { count: totalCustomers },
      { count: newCustomers },
      { data: allOrders },
    ] = await Promise.all([
      supabaseAdmin
        .from("customers")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("customers")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo),
      supabaseAdmin
        .from("orders")
        .select("customer_id, total_amount")
        .eq("payment_status", "paid"),
    ]);

    // Calculate customer lifetime values
    const customerSpending = {};
    allOrders?.forEach((order) => {
      if (order.customer_id) {
        customerSpending[order.customer_id] =
          (customerSpending[order.customer_id] || 0) + order.total_amount;
      }
    });

    const avgLifetimeValue =
      Object.values(customerSpending).reduce((sum, val) => sum + val, 0) /
      (totalCustomers || 1);

    return {
      total_customers: totalCustomers || 0,
      new_customers_30d: newCustomers || 0,
      avg_lifetime_value: avgLifetimeValue,
    };
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    throw error;
  }
}
