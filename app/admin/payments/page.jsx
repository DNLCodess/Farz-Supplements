"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Loader2,
  Calendar,
  Eye,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPayments,
  getPaymentStats,
  refundPayment,
} from "@/app/actions/payment-settings";

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({
    orderId: null,
    amount: 0,
    reason: "",
  });

  // Fetch payments
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", currentPage, statusFilter, dateRange],
    queryFn: () =>
      getPayments({
        page: currentPage,
        limit: 20,
        status: statusFilter,
        startDate: dateRange.start,
        endDate: dateRange.end,
      }),
    staleTime: 30000,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["payment-stats", dateRange],
    queryFn: () =>
      getPaymentStats({
        startDate: dateRange.start,
        endDate: dateRange.end,
      }),
    staleTime: 60000,
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: ({ orderId, amount, reason }) =>
      refundPayment(orderId, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      toast.success("Refund processed successfully");
      setShowRefundModal(false);
      setRefundData({ orderId: null, amount: 0, reason: "" });
    },
    onError: () => {
      toast.error("Failed to process refund");
    },
  });

  const handleRefund = () => {
    if (!refundData.reason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }
    refundMutation.mutate(refundData);
  };

  const statusConfig = {
    success: {
      icon: CheckCircle2,
      label: "Success",
      bgColor: "bg-green-100",
      textColor: "text-green-900",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      bgColor: "bg-amber-100",
      textColor: "text-amber-900",
    },
    processing: {
      icon: Loader2,
      label: "Processing",
      bgColor: "bg-blue-100",
      textColor: "text-blue-900",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      bgColor: "bg-red-100",
      textColor: "text-red-900",
    },
    abandoned: {
      icon: AlertCircle,
      label: "Abandoned",
      bgColor: "bg-gray-100",
      textColor: "text-gray-900",
    },
    refunded: {
      icon: RotateCcw,
      label: "Refunded",
      bgColor: "bg-purple-100",
      textColor: "text-purple-900",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Payments</h1>
          <p className="text-gray-600 mt-1">
            Track and manage all transactions
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl font-semibold hover:border-green-900 transition-colors">
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Total Transactions
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.total_transactions}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              ₦{stats.total_revenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Net Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              ₦{stats.net_revenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Fees: ₦{stats.total_fees.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Success Rate
              </span>
            </div>
            <p className="text-2xl font-bold text-charcoal">
              {stats.total_transactions > 0
                ? Math.round(
                    (stats.successful_payments / stats.total_transactions) *
                      100,
                  )
                : 0}
              %
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {stats.successful_payments} / {stats.total_transactions}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === null
                ? "bg-green-900 text-white"
                : "bg-white border border-gray-300 text-gray-900 hover:border-green-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("success")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "success"
                ? "bg-green-900 text-white"
                : "bg-white border border-gray-300 text-gray-900 hover:border-green-900"
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-green-900 text-white"
                : "bg-white border border-gray-300 text-gray-900 hover:border-green-900"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "processing"
                ? "bg-green-900 text-white"
                : "bg-white border border-gray-300 text-gray-900 hover:border-green-900"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setStatusFilter("failed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "failed"
                ? "bg-green-900 text-white"
                : "bg-white border border-gray-300 text-gray-900 hover:border-green-900"
            }`}
          >
            Failed
          </button>
          <button
            onClick={() => setStatusFilter("abandoned")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "abandoned"
                ? "bg-green-900 text-white"
                : "bg-white border border-gray-300 text-gray-900 hover:border-green-900"
            }`}
          >
            Abandoned
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
        </div>
      )}

      {/* Payments Table */}
      {!isLoading && data?.payments && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => {
                  const status =
                    statusConfig[payment.payment_status] ||
                    statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${payment.order_id}`}
                          className="font-semibold text-green-900 hover:text-green-700 transition-colors"
                        >
                          #{payment.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.customer_first_name}{" "}
                            {payment.customer_last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.customer_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          <div>
                            {new Date(payment.created_at).toLocaleDateString(
                              "en-NG",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.created_at).toLocaleTimeString(
                              "en-NG",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-charcoal">
                            ₦{payment.total_amount.toLocaleString()}
                          </p>
                          {payment.card_type && payment.card_last4 && (
                            <p className="text-xs text-gray-600">
                              {payment.card_type} •••• {payment.card_last4}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 capitalize">
                          {payment.payment_method || "Card"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 ${status.bgColor} ${status.textColor} rounded-lg text-xs font-medium`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-600 font-mono">
                          {payment.payment_reference}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/orders/${payment.order_id}`}
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            title="View Order"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {payment.payment_status === "success" && (
                            <button
                              onClick={() => {
                                setRefundData({
                                  orderId: payment.order_id,
                                  amount: payment.total_amount,
                                  reason: "",
                                });
                                setShowRefundModal(true);
                              }}
                              className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                              title="Refund"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {data.payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No payments found</p>
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

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-charcoal mb-4">
              Process Refund
            </h3>
            <p className="text-base text-gray-600 mb-6">
              Refund amount:{" "}
              <strong>₦{refundData.amount.toLocaleString()}</strong>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Reason for Refund *
              </label>
              <textarea
                value={refundData.reason}
                onChange={(e) =>
                  setRefundData((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={4}
                placeholder="Explain why this refund is being processed..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundData({ orderId: null, amount: 0, reason: "" });
                }}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={refundMutation.isPending || !refundData.reason.trim()}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {refundMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Refund"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
