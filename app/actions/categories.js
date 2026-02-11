"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function getCategories({ includeInactive = false } = {}) {
  try {
    let query = supabaseAdmin
      .from("categories")
      .select(
        `
        *,
        parent:parent_id(id, name, slug),
        products:products(count)
      `,
      )
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Structure hierarchically
    const categoriesMap = new Map();
    const rootCategories = [];

    data.forEach((cat) => {
      categoriesMap.set(cat.id, { ...cat, children: [] });
    });

    data.forEach((cat) => {
      if (cat.parent_id) {
        const parent = categoriesMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(categoriesMap.get(cat.id));
        }
      } else {
        rootCategories.push(categoriesMap.get(cat.id));
      }
    });

    return rootCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function getCategoryById(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(
        `
        *,
        parent:parent_id(id, name, slug),
        products:products(count)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
}

export async function createCategory(formData) {
  try {
    const categoryData = {
      name: formData.name,
      slug:
        formData.slug ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      image_url: formData.image_url || null,
      display_order: formData.display_order || 0,
      is_active: formData.is_active !== false,
    };

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data,
      message: "Category created successfully",
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error.message || "Failed to create category",
    };
  }
}

export async function updateCategory(id, formData) {
  try {
    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      image_url: formData.image_url || null,
      display_order: formData.display_order,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update(categoryData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data,
      message: "Category updated successfully",
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error.message || "Failed to update category",
    };
  }
}

export async function deleteCategory(id) {
  try {
    // Check if category has products
    const { count } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (count > 0) {
      return {
        success: false,
        error:
          "Cannot delete category with products. Please reassign or delete the products first.",
      };
    }

    // Check if category has children
    const { count: childCount } = await supabaseAdmin
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", id);

    if (childCount > 0) {
      return {
        success: false,
        error:
          "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
      };
    }

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error.message || "Failed to delete category",
    };
  }
}

export async function updateCategoryOrder(categoryId, newOrder) {
  try {
    const { error } = await supabaseAdmin
      .from("categories")
      .update({ display_order: newOrder, updated_at: new Date().toISOString() })
      .eq("id", categoryId);

    if (error) throw error;

    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Category order updated",
    };
  } catch (error) {
    console.error("Error updating category order:", error);
    return {
      success: false,
      error: error.message || "Failed to update category order",
    };
  }
}
