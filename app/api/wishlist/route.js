import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/wishlist - Get user's wishlist
export async function GET() {
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

    // Get wishlist items with product details
    const { data: items, error: wishlistError } = await supabase
      .from("wishlist")
      .select(
        `
        id,
        product_id,
        created_at,
        products (
          id,
          name,
          slug,
          description,
          short_description,
          price,
          compare_at_price,
          sku,
          stock_quantity,
          low_stock_threshold,
          images,
          is_featured,
          is_active,
          category_id,
          categories (
            id,
            name,
            slug
          )
        )
      `,
      )
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (wishlistError) {
      throw wishlistError;
    }

    return NextResponse.json({
      success: true,
      items: items || [],
      count: items?.length || 0,
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request) {
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

    const body = await request.json();
    const { productId } = body;

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

    // Check if product exists and is active
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, is_active")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.is_active) {
      return NextResponse.json(
        { error: "Product is not available" },
        { status: 400 },
      );
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from("wishlist")
      .select("id")
      .eq("customer_id", customer.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 400 },
      );
    }

    // Add to wishlist
    const { data: wishlistItem, error: insertError } = await supabase
      .from("wishlist")
      .insert({
        customer_id: customer.id,
        product_id: productId,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      item: wishlistItem,
      message: "Added to wishlist",
    });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 },
    );
  }
}
