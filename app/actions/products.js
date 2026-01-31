"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  uploadProductImage,
  uploadProductImages,
  deleteProductImages,
} from "@/lib/utils/imageUpload";

/**
 * Create a new product with image upload to Supabase Storage
 * Used for: Admin product creation form
 */
export async function createProduct(formData) {
  try {
    // Extract basic data
    const name = formData.get("name");
    const slug = formData.get("slug") || generateSlug(name);

    // Validate required fields first
    if (!name || !formData.get("price") || !formData.get("category_id")) {
      return {
        success: false,
        error: "Name, price, and category are required",
      };
    }

    // Check for duplicate slug
    const { data: existingProduct } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingProduct) {
      return {
        success: false,
        error: "A product with this slug already exists",
      };
    }

    // Handle image uploads to Supabase Storage
    const imageUrls = [];
    const imageFiles = formData.getAll("images"); // Get all image files from form

    // Upload images to product-images bucket
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const imageUrl = await uploadProductImage(file, "products");
          imageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          // Continue with other images even if one fails
        }
      }
    }

    // Fallback: If no images were uploaded but URLs provided (for external images or seeding)
    const externalImageUrls = formData.get("imageUrls");
    if (imageUrls.length === 0 && externalImageUrls) {
      try {
        const parsedUrls = JSON.parse(externalImageUrls);
        imageUrls.push(...parsedUrls);
      } catch (e) {
        console.error("Failed to parse image URLs:", e);
      }
    }

    // Prepare product data
    const productData = {
      name,
      slug,
      description: formData.get("description") || "",
      short_description: formData.get("short_description") || "",
      category_id: formData.get("category_id"),
      price: parseFloat(formData.get("price")),
      compare_at_price: formData.get("compare_at_price")
        ? parseFloat(formData.get("compare_at_price"))
        : null,
      sku: formData.get("sku") || generateSKU(),
      stock_quantity: parseInt(formData.get("stock_quantity") || "0"),
      low_stock_threshold: parseInt(formData.get("low_stock_threshold") || "5"),
      images: imageUrls, // Array of Supabase Storage URLs
      is_featured: formData.get("is_featured") === "true",
      is_active: formData.get("is_active") !== "false", // Default to true
      meta_title: formData.get("meta_title") || name,
      meta_description:
        formData.get("meta_description") ||
        formData.get("short_description") ||
        "",
    };

    // Insert product
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;

    // Revalidate pages
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

/**
 * Update an existing product with image upload support
 * Used for: Admin product edit form
 */
export async function updateProduct(productId, formData) {
  try {
    const name = formData.get("name");
    const slug = formData.get("slug");

    // Check for duplicate slug (excluding current product)
    const { data: existingProduct } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", slug)
      .neq("id", productId)
      .single();

    if (existingProduct) {
      return {
        success: false,
        error: "A product with this slug already exists",
      };
    }

    // Get existing product to manage images
    const { data: currentProduct } = await supabaseAdmin
      .from("products")
      .select("images, slug")
      .eq("id", productId)
      .single();

    let imageUrls = [];

    // Check if user wants to keep existing images
    const keepExistingImages = formData.get("keepExistingImages") === "true";

    if (keepExistingImages) {
      imageUrls = [...(currentProduct?.images || [])];
    }

    // Handle new image uploads
    const newImageFiles = formData.getAll("images");

    for (const file of newImageFiles) {
      if (file && file.size > 0) {
        try {
          const imageUrl = await uploadProductImage(file, "products");
          imageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
        }
      }
    }

    // If replacing all images, delete old ones from storage
    if (!keepExistingImages && currentProduct?.images?.length > 0) {
      try {
        await deleteProductImages(currentProduct.images);
      } catch (deleteError) {
        console.error("Failed to delete old images:", deleteError);
        // Continue even if deletion fails
      }
    }

    // Allow manual image URLs (for external images or seeding)
    const externalImageUrls = formData.get("imageUrls");
    if (externalImageUrls) {
      try {
        const parsedUrls = JSON.parse(externalImageUrls);
        imageUrls.push(...parsedUrls);
      } catch (e) {
        console.error("Failed to parse image URLs:", e);
      }
    }

    const productData = {
      name,
      slug,
      description: formData.get("description") || "",
      short_description: formData.get("short_description") || "",
      category_id: formData.get("category_id"),
      price: parseFloat(formData.get("price")),
      compare_at_price: formData.get("compare_at_price")
        ? parseFloat(formData.get("compare_at_price"))
        : null,
      sku: formData.get("sku"),
      stock_quantity: parseInt(formData.get("stock_quantity")),
      low_stock_threshold: parseInt(formData.get("low_stock_threshold")) || 5,
      images: imageUrls,
      is_featured: formData.get("is_featured") === "true",
      is_active: formData.get("is_active") === "true",
      meta_title: formData.get("meta_title") || name,
      meta_description: formData.get("meta_description") || "",
    };

    // Update product
    const { data, error } = await supabaseAdmin
      .from("products")
      .update(productData)
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;

    // Revalidate pages
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);
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

/**
 * Delete a product (soft delete by setting is_active to false)
 * Used for: Admin product management
 */
export async function deleteProduct(productId) {
  try {
    // Soft delete - set is_active to false
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", productId);

    if (error) throw error;

    // Revalidate pages
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

/**
 * Hard delete a product (permanent deletion)
 * Used for: Admin - permanent removal
 */
export async function permanentlyDeleteProduct(productId) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    // Revalidate pages
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      message: "Product permanently deleted",
    };
  } catch (error) {
    console.error("Error permanently deleting product:", error);
    return {
      success: false,
      error: error.message || "Failed to permanently delete product",
    };
  }
}

/**
 * Bulk update product status
 * Used for: Admin - activate/deactivate multiple products
 */
export async function bulkUpdateProductStatus(productIds, isActive) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: isActive })
      .in("id", productIds);

    if (error) throw error;

    // Revalidate pages
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

/**
 * Update product stock quantity
 * Used for: Quick stock updates in admin
 */
export async function updateProductStock(productId, quantity) {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ stock_quantity: quantity })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;

    // Revalidate product pages
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      data,
      message: "Stock updated successfully",
    };
  } catch (error) {
    console.error("Error updating stock:", error);
    return {
      success: false,
      error: error.message || "Failed to update stock",
    };
  }
}

/**
 * Toggle product featured status
 * Used for: Quick feature/unfeature in admin
 */
export async function toggleProductFeatured(productId, isFeatured) {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ is_featured: isFeatured })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;

    // Revalidate pages
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data,
      message: `Product ${isFeatured ? "featured" : "unfeatured"}`,
    };
  } catch (error) {
    console.error("Error toggling featured:", error);
    return {
      success: false,
      error: error.message || "Failed to update featured status",
    };
  }
}

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper function to generate SKU
function generateSKU() {
  const prefix = "FARZ";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
