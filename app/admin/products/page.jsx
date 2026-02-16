"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  TrendingUp,
  DollarSign,
  Archive,
  Filter,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProducts,
  deleteProduct,
  bulkUpdateProductStatus,
  getProductStats,
} from "@/app/actions/products";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: [
      "admin-products",
      currentPage,
      searchQuery,
      statusFilter,
      categoryFilter,
    ],
    queryFn: () =>
      getProducts({
        page: currentPage,
        limit: 20,
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
      }),
    staleTime: 30000,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["product-stats"],
    queryFn: getProductStats,
    staleTime: 60000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ productIds, isActive }) =>
      bulkUpdateProductStatus(productIds, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      setSelectedProducts([]);
      toast.success("Products updated successfully");
    },
    onError: () => {
      toast.error("Failed to update products");
    },
  });

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(data?.products.map((p) => p.id) || []);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Total Products
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.total_products}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.active_products}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Low Stock
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.low_stock_products}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Inventory Value
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              ₦{Math.round(stats.inventory_value).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, SKU, or description..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900 transition-colors"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedProducts.length} selected
              </span>
              <button
                onClick={() =>
                  bulkUpdateMutation.mutate({
                    productIds: selectedProducts,
                    isActive: true,
                  })
                }
                disabled={bulkUpdateMutation.isPending}
                className="px-4 py-2 bg-green-100 text-green-900 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                Activate
              </button>
              <button
                onClick={() =>
                  bulkUpdateMutation.mutate({
                    productIds: selectedProducts,
                    isActive: false,
                  })
                }
                disabled={bulkUpdateMutation.isPending}
                className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Deactivate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
        </div>
      )}

      {/* Products Table */}
      {!isLoading && data?.products && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === data.products.length &&
                        data.products.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-900"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-900"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                          {!imageErrors[product.id] && product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              onError={() => handleImageError(product.id)}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xl">
                              🌿
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-semibold text-charcoal hover:text-green-900 transition-colors"
                          >
                            {product.name}
                          </Link>
                          {product.short_description && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {product.short_description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700 font-mono">
                        {product.sku || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span className="font-semibold text-charcoal">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.compare_at_price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ₦{product.compare_at_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                          product.stock_quantity <= product.low_stock_threshold
                            ? "bg-red-100 text-red-900"
                            : "bg-green-100 text-green-900"
                        }`}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {product.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-900 rounded-lg text-sm font-medium">
                          <Eye className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          <EyeOff className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this product?",
                              )
                            ) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {data.products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No products found</p>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg font-medium hover:border-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!data.pagination.hasMore}
              className="px-4 py-2 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
