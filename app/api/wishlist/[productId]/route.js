import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/wishlist/[productId] - Remove item from wishlist
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Get customer record
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Delete from wishlist
    const { error: deleteError } = await supabase
      .from("wishlist")
      .delete()
      .eq("customer_id", customer.id)
      .eq("product_id", productId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 },
    );
  }
}
