"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Loader2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCustomers,
  deleteCustomer,
  getCustomerStats,
} from "@/app/actions/customers";

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch customers
  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", currentPage, searchQuery],
    queryFn: () =>
      getCustomers({
        page: currentPage,
        limit: 20,
        search: searchQuery,
      }),
    staleTime: 30000,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["customer-stats"],
    queryFn: getCustomerStats,
    staleTime: 60000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete customer");
    },
  });

  const handleDelete = (customerId) => {
    if (
      confirm(
        "Are you sure you want to delete this customer? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate(customerId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Customers</h1>
        <p className="text-gray-600 mt-1">Manage your customer base</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Total Customers
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.total_customers}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-green-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                New (Last 30 Days)
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.new_customers_30d}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Avg. Lifetime Value
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              ₦{Math.round(stats.avg_lifetime_value).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900 transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
        </div>
      )}

      {/* Customers Table */}
      {!isLoading && data?.customers && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-charcoal">
                          {customer.first_name} {customer.last_name}
                        </p>
                        {customer.user_id && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-900 rounded text-xs font-medium">
                            Registered
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <a
                            href={`mailto:${customer.email}`}
                            className="hover:text-green-900 transition-colors"
                          >
                            {customer.email}
                          </a>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a
                              href={`tel:${customer.phone}`}
                              className="hover:text-green-900 transition-colors"
                            >
                              {customer.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {customer.order_count}{" "}
                          {customer.order_count === 1 ? "order" : "orders"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-charcoal">
                          ₦{customer.total_spent.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(customer.created_at).toLocaleDateString(
                          "en-NG",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id)}
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
          {data.customers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No customers found</p>
              <p className="text-sm text-gray-500 mt-1">
                Customers will appear here when they make their first purchase
              </p>
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
