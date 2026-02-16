"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  GripVertical,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} from "@/app/actions/categories";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: null,
    image_url: "",
    display_order: 0,
    is_active: true,
  });

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getCategories({ includeInactive: true }),
    staleTime: 30000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  const toggleExpanded = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      parent_id: null,
      image_url: "",
      display_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parent_id: category.parent_id,
      image_url: category.image_url || "",
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setEditingCategory(category.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (categoryId) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This cannot be undone.",
      )
    ) {
      deleteMutation.mutate(categoryId);
    }
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const productCount = category.products?.[0]?.count || 0;

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
            level > 0 ? "ml-8" : ""
          }`}
        >
          {/* Expand/Collapse */}
          <button
            onClick={() => toggleExpanded(category.id)}
            className={`shrink-0 w-6 h-6 flex items-center justify-center ${
              !hasChildren ? "invisible" : ""
            }`}
          >
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ))}
          </button>

          {/* Drag Handle */}
          <div className="shrink-0">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          </div>

          {/* Category Icon */}
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5 text-green-700" />
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <span className="text-xs text-gray-500">
                ({productCount} products)
              </span>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600 line-clamp-1">
                {category.description}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {category.is_active ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-900 rounded-lg text-xs font-medium">
                <Eye className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                <EyeOff className="w-3 h-3" />
                Inactive
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleEdit(category)}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              disabled={deleteMutation.isPending}
              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Categories</h1>
          <p className="text-gray-600 mt-1">Organize your product catalog</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderTree className="w-5 h-5 text-blue-700" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Total Categories
            </span>
          </div>
          <p className="text-2xl font-bold text-charcoal">
            {categories?.reduce(
              (sum, cat) => sum + 1 + (cat.children?.length || 0),
              0,
            ) || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-700" />
            </div>
            <span className="text-sm font-medium text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-charcoal">
            {categories?.filter((cat) => cat.is_active).length || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FolderTree className="w-5 h-5 text-purple-700" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Root Categories
            </span>
          </div>
          <p className="text-2xl font-bold text-charcoal">
            {categories?.length || 0}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
        </div>
      )}

      {/* Categories List */}
      {!isLoading && categories && (
        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No categories yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Category
              </button>
            </div>
          ) : (
            categories.map((category) => renderCategory(category))
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-charcoal mb-6">
              {editingCategory ? "Edit Category" : "New Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    }));
                  }}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                  placeholder="category-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                  placeholder="Brief description of this category"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parent_id: e.target.value || null,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                >
                  <option value="">None (Root Category)</option>
                  {categories?.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      disabled={cat.id === editingCategory}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_order: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-green-900 border-gray-300 rounded focus:ring-green-900"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-semibold text-gray-900"
                >
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1 px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : editingCategory ? (
                    "Update Category"
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
