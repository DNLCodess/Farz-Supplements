import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function GET() {
  try {
    // Get current date ranges
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all data in parallel
    const [
      { data: allOrders },
      { data: thisMonthOrders },
      { data: lastMonthOrders },
      { count: totalProducts },
      { count: lowStockProducts },
      { count: totalCustomers },
      { count: lastMonthCustomers },
      { data: recentOrders },
    ] = await Promise.all([
      // All paid orders
      supabaseAdmin
        .from("orders")
        .select("total_amount, created_at")
        .eq("payment_status", "paid"),

      // This month orders
      supabaseAdmin
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "paid")
        .gte("created_at", firstDayThisMonth.toISOString()),

      // Last month orders for growth calculation
      supabaseAdmin
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "paid")
        .gte("created_at", firstDayLastMonth.toISOString())
        .lte("created_at", lastDayLastMonth.toISOString()),

      // Total products
      supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),

      // Low stock products
      supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true })
        .filter("stock_quantity", "lte", "low_stock_threshold"),

      // Total customers
      supabaseAdmin
        .from("customers")
        .select("*", { count: "exact", head: true }),

      // Last month customers for growth
      supabaseAdmin
        .from("customers")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayLastMonth.toISOString())
        .lte("created_at", lastDayLastMonth.toISOString()),

      // Recent orders for activity feed
      supabaseAdmin
        .from("orders")
        .select("id, order_number, customer_email, total_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Calculate revenue
    const totalRevenue =
      allOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
      0;
    const monthRevenue =
      thisMonthOrders?.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      ) || 0;
    const lastMonthRevenue =
      lastMonthOrders?.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      ) || 0;

    // Calculate growth percentages
    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(
            ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
          )
        : 0;

    const ordersGrowth =
      lastMonthOrders?.length > 0
        ? Math.round(
            ((thisMonthOrders.length - lastMonthOrders.length) /
              lastMonthOrders.length) *
              100,
          )
        : 0;

    const customersGrowth =
      lastMonthCustomers > 0
        ? Math.round(
            ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100,
          )
        : 0;

    // Get pending orders count
    const { count: pendingOrders } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const stats = {
      total_revenue: totalRevenue,
      month_revenue: monthRevenue,
      revenue_growth: revenueGrowth,

      total_orders: allOrders?.length || 0,
      orders_growth: ordersGrowth,
      pending_orders: pendingOrders || 0,

      total_products: totalProducts || 0,
      low_stock_products: lowStockProducts || 0,

      total_customers: totalCustomers || 0,
      customers_growth: customersGrowth,

      recent_orders:
        recentOrders?.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          customer_email: order.customer_email,
          total: order.total_amount,
          created_at: order.created_at,
        })) || [],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 },
    );
  }
}
