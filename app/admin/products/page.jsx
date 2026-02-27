"use client";

import { useState, useCallback, useTransition } from "react";
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
  DollarSign,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProducts,
  deleteProduct,
  deactivateProduct,
  bulkUpdateProductStatus,
  bulkDeleteProducts,
  getProductStats,
} from "@/app/actions/products";

/* ─── Delete confirmation modal ─────────────────────────────────────────── */
function DeleteModal({ product, onClose, onDeactivate, onDelete, isPending }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-[17px]">
              Remove Product
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              &ldquo;{product.name}&rdquo;
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {/* Deactivate option */}
          <button
            onClick={() => onDeactivate(product.id)}
            disabled={isPending || !product.is_active}
            className="w-full flex items-start gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <EyeOff className="w-5 h-5 text-gray-500 shrink-0 mt-0.5 group-hover:text-gray-700" />
            <div>
              <p className="font-semibold text-gray-900 text-[14px]">
                Deactivate
                {!product.is_active && (
                  <span className="ml-2 text-[11px] font-normal text-gray-400">
                    (already inactive)
                  </span>
                )}
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                Hides from the store. Preserves order history. Can be
                re-activated later.
              </p>
            </div>
          </button>

          {/* Permanent delete option */}
          <button
            onClick={() => onDelete(product.id)}
            disabled={isPending}
            className="w-full flex items-start gap-3 p-4 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-xl text-left transition-colors disabled:opacity-50 group"
          >
            <Trash2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-[14px]">
                Permanently Delete
              </p>
              <p className="text-[12px] text-red-500 mt-0.5 leading-relaxed">
                Removes from database entirely. Cannot be undone. Will fail if
                product has order history.
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  onClick,
  active,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-white rounded-xl border p-5 text-left transition-all duration-150 ${
        active
          ? "border-green-900 ring-1 ring-green-900"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-charcoal">{value}</p>
    </button>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null); // product object
  const [, startTransition] = useTransition();

  // Debounce search to avoid query-per-keystroke
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 350);
  }, []);

  // Products query — keyed on all filters including status
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "admin-products",
      currentPage,
      debouncedSearch,
      statusFilter,
      categoryFilter,
    ],
    queryFn: () =>
      getProducts({
        page: currentPage,
        limit: 20,
        search: debouncedSearch,
        status: statusFilter,
        category: categoryFilter,
      }),
    staleTime: 30_000,
    placeholderData: (prev) => prev, // keep previous data visible while fetching next page
  });

  // Stats query — separate, cached longer
  const { data: stats } = useQuery({
    queryKey: ["product-stats"],
    queryFn: getProductStats,
    staleTime: 60_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["product-stats"] });
  };

  /* Deactivate (soft) */
  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("Product deactivated");
    },
    onError: (e) => toast.error(e.message || "Failed to deactivate product"),
  });

  /* Hard delete */
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (result) => {
      if (!result.success) {
        if (result.fkError) {
          toast.error(result.error, { duration: 6000 });
        } else {
          toast.error(result.error || "Delete failed");
        }
        return;
      }
      invalidate();
      setDeleteTarget(null);
      toast.success("Product permanently deleted");
    },
    onError: (e) => toast.error(e.message || "Failed to delete product"),
  });

  /* Bulk status update */
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ productIds, isActive }) =>
      bulkUpdateProductStatus(productIds, isActive),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      invalidate();
      setSelectedProducts([]);
      toast.success(result.message);
    },
    onError: () => toast.error("Failed to update products"),
  });

  /* Bulk hard delete */
  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteProducts,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error, { duration: result.fkError ? 6000 : 4000 });
        return;
      }
      invalidate();
      setSelectedProducts([]);
      toast.success(result.message);
    },
    onError: () => toast.error("Failed to delete products"),
  });

  const handleImageError = useCallback((id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleSelectAll = (checked) => {
    setSelectedProducts(checked ? data?.products.map((p) => p.id) || [] : []);
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleStatusCardClick = (status) => {
    setStatusFilter((prev) => (prev === status ? null : status));
    setCurrentPage(1);
    setSelectedProducts([]);
  };

  const isPending =
    deactivateMutation.isPending ||
    deleteMutation.isPending ||
    bulkUpdateMutation.isPending ||
    bulkDeleteMutation.isPending;

  return (
    <>
      <div className="space-y-5">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Products</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Manage your product catalog
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-green-900 text-white rounded-xl font-semibold text-sm hover:bg-green-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* ── Stat cards — clickable to filter ─────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Package}
              iconBg="bg-blue-100"
              iconColor="text-blue-700"
              label="Total Products"
              value={stats.total_products}
              onClick={() => {
                setStatusFilter(null);
                setCurrentPage(1);
              }}
              active={statusFilter === null}
            />
            <StatCard
              icon={Eye}
              iconBg="bg-green-100"
              iconColor="text-green-700"
              label="Active"
              value={stats.active_products}
              onClick={() => handleStatusCardClick("active")}
              active={statusFilter === "active"}
            />
            <StatCard
              icon={EyeOff}
              iconBg="bg-gray-100"
              iconColor="text-gray-600"
              label="Inactive"
              value={stats.inactive_products}
              onClick={() => handleStatusCardClick("inactive")}
              active={statusFilter === "inactive"}
            />
            <StatCard
              icon={DollarSign}
              iconBg="bg-purple-100"
              iconColor="text-purple-700"
              label="Inventory Value"
              value={`₦${Math.round(stats.inventory_value).toLocaleString()}`}
              onClick={() => {}}
              active={false}
            />
          </div>
        )}

        {/* ── Search + filter bar ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, SKU, or description…"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-900 transition-colors"
              />
            </div>

            <select
              value={statusFilter || ""}
              onChange={(e) => {
                setStatusFilter(e.target.value || null);
                setCurrentPage(1);
                setSelectedProducts([]);
              }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-900 transition-colors bg-white min-w-[130px]"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Active filter pills */}
          {(statusFilter || debouncedSearch) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-500">Filtering:</span>
              {statusFilter && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-800">
                  {statusFilter === "active" ? "Active only" : "Inactive only"}
                  <button
                    onClick={() => {
                      setStatusFilter(null);
                      setCurrentPage(1);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-800">
                  &ldquo;{debouncedSearch}&rdquo;
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearch("");
                      setCurrentPage(1);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Bulk actions */}
          {selectedProducts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-700 mr-1">
                {selectedProducts.length} selected:
              </span>
              <button
                onClick={() =>
                  bulkUpdateMutation.mutate({
                    productIds: selectedProducts,
                    isActive: true,
                  })
                }
                disabled={isPending}
                className="px-3 py-1.5 bg-green-100 text-green-900 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
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
                disabled={isPending}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Deactivate
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Permanently delete ${selectedProducts.length} products? This cannot be undone.`,
                    )
                  ) {
                    bulkDeleteMutation.mutate(selectedProducts);
                  }
                }}
                disabled={isPending}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Loading ───────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-green-900 animate-spin" />
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────── */}
        {!isLoading && data?.products && (
          <div
            className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-10">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-900"
                        />
                      </td>

                      {/* Product name + image */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            {!imageErrors[product.id] && product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                onError={() => handleImageError(product.id)}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-lg">
                                🌿
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-semibold text-sm text-charcoal hover:text-green-900 transition-colors truncate block max-w-[200px]"
                            >
                              {product.name}
                            </Link>
                            {product.short_description && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {product.short_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                          {product.sku || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-700">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-sm text-charcoal">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.compare_at_price && (
                          <span className="ml-1.5 text-xs text-gray-400 line-through">
                            ₦{product.compare_at_price.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                            product.stock_quantity <=
                            (product.low_stock_threshold || 10)
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {product.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                            <Eye className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                            <EyeOff className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete / Deactivate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {data.products.length === 0 && (
              <div className="text-center py-14">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">
                  {statusFilter === "inactive"
                    ? "No inactive products found"
                    : debouncedSearch
                      ? `No products match "${debouncedSearch}"`
                      : "No products found"}
                </p>
                {!statusFilter && !debouncedSearch && (
                  <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-900 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Product
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {(data.pagination.page - 1) * data.pagination.limit + 1}–
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total,
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {data.pagination.total}
              </span>{" "}
              {statusFilter ? `${statusFilter} ` : ""}products
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isFetching}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:border-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!data.pagination.hasMore || isFetching}
                className="px-3 py-1.5 bg-green-900 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete / Deactivate modal ──────────────────────────────── */}
      <DeleteModal
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeactivate={(id) => deactivateMutation.mutate(id)}
        onDelete={(id) => deleteMutation.mutate(id)}
        isPending={isPending}
      />
    </>
  );
}
