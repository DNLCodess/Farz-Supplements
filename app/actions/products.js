"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

function generateSKU() {
  const prefix = "FARZ";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get paginated products with server-side filtering.
 * status filter applies globally across ALL products, not just the current page.
 */
export async function getProducts({
  page = 1,
  limit = 20,
  search = "",
  category = null,
  status = null, // "active" | "inactive" | null (all)
} = {}) {
  try {
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from("products").select(
      `
        id,
        name,
        slug,
        short_description,
        price,
        compare_at_price,
        sku,
        stock_quantity,
        low_stock_threshold,
        image_url,
        is_active,
        is_featured,
        created_at,
        category:categories(id, name, slug)
      `,
      { count: "exact" },
    );

    // --- Filters applied BEFORE pagination so count reflects full filtered set ---
    if (search?.trim()) {
      query = query.or(
        `name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%`,
      );
    }

    if (category) {
      query = query.eq("category_id", category);
    }

    // Status filter: convert string to boolean for exact DB match
    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }
    // null = no filter = show all

    // --- Pagination applied AFTER filters ---
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
      .select(`*, category:categories(id, name, slug)`)
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
      description: formData.description || null,
      short_description: formData.short_description || null,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price
        ? parseFloat(formData.compare_at_price)
        : null,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      sku: formData.sku || generateSKU(),
      barcode: formData.barcode || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      dimensions: formData.dimensions || null,
      image_url: formData.image_url || null,
      images:
        formData.images || (formData.image_url ? [formData.image_url] : []),
      category_id: formData.category_id || null,
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
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, data, message: "Product created successfully" };
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
      description: formData.description || null,
      short_description: formData.short_description || null,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price
        ? parseFloat(formData.compare_at_price)
        : null,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      sku: formData.sku,
      barcode: formData.barcode || null,
      stock_quantity: parseInt(formData.stock_quantity),
      low_stock_threshold: parseInt(formData.low_stock_threshold),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      dimensions: formData.dimensions || null,
      image_url: formData.image_url || null,
      images:
        formData.images || (formData.image_url ? [formData.image_url] : []),
      category_id: formData.category_id || null,
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
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, data, message: "Product updated successfully" };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error.message || "Failed to update product",
    };
  }
}

/**
 * Deactivate a product (soft delete — hides from storefront, keeps order history)
 */
export async function deactivateProduct(id) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, message: "Product deactivated" };
  } catch (error) {
    console.error("Error deactivating product:", error);
    return {
      success: false,
      error: error.message || "Failed to deactivate product",
    };
  }
}

/**
 * Permanently delete a product from the database.
 * Will fail if the product has order line items referencing it (FK constraint).
 * In that case, use deactivateProduct instead.
 */
export async function deleteProduct(id) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      // FK violation — product is referenced by orders
      if (error.code === "23503") {
        return {
          success: false,
          fkError: true,
          error:
            "This product has order history and cannot be permanently deleted. Use 'Deactivate' to hide it from the store instead.",
        };
      }
      throw error;
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, message: "Product permanently deleted" };
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
    revalidatePath("/shop");
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

/**
 * Permanently delete multiple products.
 * Returns partial success info if some have FK constraints.
 */
export async function bulkDeleteProducts(productIds) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .in("id", productIds);

    if (error) {
      if (error.code === "23503") {
        return {
          success: false,
          fkError: true,
          error:
            "One or more products have order history and cannot be deleted. Deactivate them instead.",
        };
      }
      throw error;
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, message: `${productIds.length} products deleted` };
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return {
      success: false,
      error: error.message || "Failed to delete products",
    };
  }
}

export async function getProductStats() {
  try {
    // Run all stat queries in parallel — no sequential awaiting
    const [
      { count: totalProducts },
      { count: activeProducts },
      { count: inactiveProducts },
      { count: lowStockProducts },
      { data: inventoryData },
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
        .eq("is_active", false),
      supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .filter("stock_quantity", "lte", "low_stock_threshold"),
      // Only fetch the two columns needed for inventory value calculation
      supabaseAdmin.from("products").select("price, stock_quantity"),
    ]);

    const inventoryValue = (inventoryData || []).reduce(
      (sum, p) => sum + p.price * p.stock_quantity,
      0,
    );

    return {
      total_products: totalProducts || 0,
      active_products: activeProducts || 0,
      inactive_products: inactiveProducts || 0,
      low_stock_products: lowStockProducts || 0,
      inventory_value: inventoryValue,
    };
  } catch (error) {
    console.error("Error fetching product stats:", error);
    throw error;
  }
}
