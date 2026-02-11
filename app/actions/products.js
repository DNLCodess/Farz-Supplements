"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function getProducts({
  page = 1,
  limit = 20,
  search = "",
  category = null,
  status = null,
}) {
  try {
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from("products").select(
      `
        *,
        category:categories(id, name, slug)
      `,
      { count: "exact" },
    );

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`,
      );
    }

    if (category) {
      query = query.eq("category_id", category);
    }

    if (status !== null) {
      query = query.eq("is_active", status === "active");
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      products: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0),
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductById(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        *,
        category:categories(id, name, slug)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export async function createProduct(formData) {
  try {
    const productData = {
      name: formData.name,
      slug:
        formData.slug ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: formData.description,
      short_description: formData.short_description,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price
        ? parseFloat(formData.compare_at_price)
        : null,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      sku: formData.sku || generateSKU(),
      barcode: formData.barcode || null,
      category_id: formData.category_id || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      dimensions: formData.dimensions || null,
      images: formData.images || [],
      is_active: formData.is_active !== false,
      is_featured: formData.is_featured || false,
      meta_title: formData.meta_title || formData.name,
      meta_description:
        formData.meta_description || formData.short_description || "",
    };

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error.message || "Failed to create product",
    };
  }
}

export async function updateProduct(id, formData) {
  try {
    const productData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      short_description: formData.short_description,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price
        ? parseFloat(formData.compare_at_price)
        : null,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      sku: formData.sku,
      barcode: formData.barcode || null,
      category_id: formData.category_id || null,
      stock_quantity: parseInt(formData.stock_quantity),
      low_stock_threshold: parseInt(formData.low_stock_threshold),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      dimensions: formData.dimensions || null,
      images: formData.images || [],
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      meta_title: formData.meta_title || formData.name,
      meta_description: formData.meta_description || "",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error.message || "Failed to update product",
    };
  }
}

export async function deleteProduct(id) {
  try {
    // Soft delete - set is_active to false
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: error.message || "Failed to delete product",
    };
  }
}

export async function bulkUpdateProductStatus(productIds, isActive) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .in("id", productIds);

    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      message: `${productIds.length} products ${isActive ? "activated" : "deactivated"}`,
    };
  } catch (error) {
    console.error("Error bulk updating products:", error);
    return {
      success: false,
      error: error.message || "Failed to update products",
    };
  }
}

export async function getProductStats() {
  try {
    const [
      { count: totalProducts },
      { count: activeProducts },
      { count: lowStockProducts },
      { data: allProducts },
    ] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true })
        .filter("stock_quantity", "lte", "low_stock_threshold"),
      supabaseAdmin.from("products").select("price, stock_quantity"),
    ]);

    const inventoryValue = (allProducts || []).reduce(
      (sum, p) => sum + p.price * p.stock_quantity,
      0,
    );

    return {
      total_products: totalProducts || 0,
      active_products: activeProducts || 0,
      low_stock_products: lowStockProducts || 0,
      inventory_value: inventoryValue,
    };
  } catch (error) {
    console.error("Error fetching product stats:", error);
    throw error;
  }
}

// Helper function to generate SKU
function generateSKU() {
  const prefix = "FARZ";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
