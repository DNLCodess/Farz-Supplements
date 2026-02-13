// app/api/admin/orders/[orderId]/status/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function PATCH(request, { params }) {
  try {
    const { orderId } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    // Update order status
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    // If cancelling, add cancellation timestamp
    if (status === "cancelled") {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      order: data,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 },
    );
  }
}
