// app/api/admin/orders/stats/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function GET() {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch data in parallel
    const [
      { count: totalOrders },
      { data: allOrders },
      { data: thisMonthOrders },
      { count: pendingOrders },
    ] = await Promise.all([
      // Total orders
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),

      // All orders for revenue calculation
      supabaseAdmin
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "paid"),

      // This month orders
      supabaseAdmin
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "paid")
        .gte("created_at", firstDayThisMonth.toISOString()),

      // Pending orders
      supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    // Calculate revenue
    const totalRevenue =
      allOrders?.reduce(
        (sum, order) => sum + (parseFloat(order.total_amount) || 0),
        0,
      ) || 0;

    const monthRevenue =
      thisMonthOrders?.reduce(
        (sum, order) => sum + (parseFloat(order.total_amount) || 0),
        0,
      ) || 0;

    return NextResponse.json({
      total_orders: totalOrders || 0,
      total_revenue: totalRevenue,
      month_revenue: monthRevenue,
      pending_orders: pendingOrders || 0,
    });
  } catch (error) {
    console.error("Orders stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order statistics" },
      { status: 500 },
    );
  }
}
