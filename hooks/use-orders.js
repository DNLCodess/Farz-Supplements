import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getOrderStatus,
  cancelOrder,
  getCustomerOrders,
  getOrderById,
  getSavedPaymentMethods,
  deleteSavedPaymentMethod,
  setDefaultPaymentMethod,
  checkStockAvailability,
} from "@/app/actions/orders";

export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  list: (email, filters) => [...orderKeys.lists(), email, filters],
  details: () => [...orderKeys.all, "detail"],
  detail: (orderId) => [...orderKeys.details(), orderId],
  status: (orderId) => [...orderKeys.all, "status", orderId],
  paymentMethods: (email) => [...orderKeys.all, "payment-methods", email],
};

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useOrderStatus(orderId, enabled = true) {
  return useQuery({
    queryKey: orderKeys.status(orderId),
    queryFn: () => getOrderStatus(orderId),
    enabled: !!orderId && enabled,
    refetchInterval: (data) => {
      const status = data?.order?.payment_status;
      return status === "paid" || status === "failed" ? false : 2000;
    },
    staleTime: 0,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason, customerEmail }) =>
      cancelOrder(orderId, reason, customerEmail),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(variables.orderId),
        });
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      }
    },
  });
}

export function useCustomerOrders(email, options = {}) {
  return useQuery({
    queryKey: orderKeys.list(email, options),
    queryFn: () => getCustomerOrders(email, options),
    enabled: !!email,
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrder(orderId, customerEmail) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderById(orderId, customerEmail),
    enabled: !!orderId && !!customerEmail,
    staleTime: 1 * 60 * 1000,
  });
}

export function useSavedPaymentMethods(email) {
  return useQuery({
    queryKey: orderKeys.paymentMethods(email),
    queryFn: () => getSavedPaymentMethods(email),
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCheckout() {
  const createOrderMutation = useCreateOrder();
  const checkStock = async (items) => checkStockAvailability(items);

  const initiateCheckout = async (checkoutData) => {
    const stockCheck = await checkStock(checkoutData.items);
    if (!stockCheck.available) {
      return { success: false, error: stockCheck.error, step: "stock_check" };
    }

    const result = await createOrderMutation.mutateAsync(checkoutData);
    return result;
  };

  return {
    initiateCheckout,
    isLoading: createOrderMutation.isPending,
    error: createOrderMutation.error,
  };
}
