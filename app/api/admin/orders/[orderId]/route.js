// app/api/admin/orders/[orderId]/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function GET(request, { params }) {
  try {
    const { orderId } = await params;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_image,
          product_sku,
          quantity,
          price,
          total
        )
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
