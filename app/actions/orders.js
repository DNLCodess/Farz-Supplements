"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import {
  initializeTransaction,
  generatePaymentReference,
  nairaToKobo,
  calculatePaystackFee,
} from "@/lib/paystack";
import {
  sendOrderConfirmationEmail,
  sendOrderCancellationEmail,
} from "@/lib/email";

/**
 * CRITICAL: Payment verification happens ONLY in webhook handler
 * Never trust client-side callbacks or redirects for payment status
 * Webhooks are the single source of truth for payment state
 */

/**
 * Create order and initialize payment
 * Used for: Checkout process (both guest and registered users)
 */
export async function createOrder(orderData) {
  try {
    // Validate required fields
    const requiredFields = [
      "customer_email",
      "customer_phone",
      "shipping_first_name",
      "shipping_last_name",
      "shipping_address",
      "shipping_city",
      "shipping_state",
      "items",
    ];

    for (const field of requiredFields) {
      if (!orderData[field]) {
        return {
          success: false,
          error: `${field.replace("_", " ")} is required`,
        };
      }
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return {
        success: false,
        error: "Cart is empty",
      };
    }

    // Check stock availability before creating order
    const stockCheck = await checkStockAvailability(orderData.items);
    if (!stockCheck.available) {
      return {
        success: false,
        error: stockCheck.error,
        product: stockCheck.product,
      };
    }

    // Calculate transaction fee (1.5% capped at ₦2,000)
    const subtotal = orderData.subtotal;
    const shipping = orderData.shipping_cost || 0;
    const transactionFee = calculatePaystackFee(
      nairaToKobo(subtotal + shipping),
    );
    const transactionFeeInNaira = transactionFee / 100;
    const totalAmount = subtotal + shipping + transactionFeeInNaira;

    // Prepare shipping address as proper JSONB object
    const shippingAddressJson = {
      address: orderData.shipping_address.trim(),
      city: orderData.shipping_city.trim(),
      state: orderData.shipping_state.trim(),
      postal_code: orderData.shipping_postal_code?.trim() || null,
      country: "NG",
    };

    // Prepare order data - shipping_address will be handled separately
    const orderPayload = {
      customer_email: orderData.customer_email.toLowerCase().trim(),
      customer_phone: orderData.customer_phone.trim(),
      customer_id: orderData.customer_id || null, // NULL for guests
      customer_first_name: orderData.customer_first_name.trim(),
      customer_last_name: orderData.customer_last_name.trim(),
      shipping_first_name: orderData.shipping_first_name.trim(),
      shipping_last_name: orderData.shipping_last_name.trim(),
      shipping_city: orderData.shipping_city.trim(),
      shipping_state: orderData.shipping_state.trim(),
      shipping_postal_code: orderData.shipping_postal_code?.trim() || null,
      subtotal: parseFloat(subtotal),
      shipping_cost: parseFloat(shipping),
      transaction_fee: parseFloat(transactionFeeInNaira.toFixed(2)),
      total: parseFloat(totalAmount.toFixed(2)), // NOT NULL field
      total_amount: parseFloat(totalAmount.toFixed(2)), // Nullable duplicate field
      payment_method: "card",
      order_notes: orderData.order_notes?.trim() || null,
      ip_address: orderData.ip_address || null,
      user_agent: orderData.user_agent || null,
    };

    // Create order directly (bypassing RPC for now to avoid JSONB issues)
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        ...orderPayload,
        shipping_address: shippingAddressJson,
        order_number: `FS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return {
        success: false,
        error: orderError.message || "Failed to create order",
      };
    }

    // Create order items (matching database schema)
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name || "Product",
      product_image: item.images?.[0] || null,
      product_sku: item.sku || null,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.unit_price),
      total: parseFloat(item.subtotal),
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      // Rollback: delete the order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return {
        success: false,
        error: "Failed to create order items",
      };
    }

    // Reduce stock for each item
    for (const item of orderData.items) {
      await supabaseAdmin.rpc("reduce_product_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }

    if (orderError) {
      console.error("Order creation error:", orderError);
      return {
        success: false,
        error: orderError.message || "Failed to create order",
      };
    }

    // Send order confirmation email (payment still pending)
    try {
      await sendOrderConfirmationEmail(order, orderData.items);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail order creation if email fails
    }

    // Initialize payment with Paystack
    const paymentReference = generatePaymentReference("FS");
    const amountInKobo = nairaToKobo(order.total_amount);

    const customerName = `${orderData.customer_first_name} ${orderData.customer_last_name}`;

    const paymentInit = await initializeTransaction({
      email: order.customer_email,
      amount: amountInKobo,
      reference: paymentReference,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        customer_name: customerName,
        customer_phone: order.customer_phone,
        cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      },
      channels: ["card", "bank", "bank_transfer"],
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify?reference=${paymentReference}&order_id=${order.id}`,
    });

    if (!paymentInit.success) {
      // Cancel order if payment initialization failed
      await cancelOrderInternal(order.id, "Payment initialization failed");
      return {
        success: false,
        error: paymentInit.error || "Failed to initialize payment",
      };
    }

    // Create payment transaction record (non-blocking)
    try {
      await supabaseAdmin.from("payment_transactions").insert({
        order_id: order.id,
        paystack_reference: paymentReference,
        paystack_access_code: paymentInit.access_code,
        amount: order.total_amount,
        currency: "NGN",
        channel: "card",
        status: "pending",
        ip_address: orderData.ip_address || null,
      });
    } catch (txError) {
      console.error("Failed to create transaction record:", txError);
      // Don't fail the entire order if transaction logging fails
    }

    return {
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
      },
      payment: {
        reference: paymentReference,
        authorization_url: paymentInit.authorization_url,
        access_code: paymentInit.access_code,
      },
    };
  } catch (error) {
    console.error("Error in createOrder:", error);
    return {
      success: false,
      error: error.message || "Failed to create order",
    };
  }
}

/**
 * Get order status (for polling after redirect)
 * Used for: Payment verification page polling
 */
export async function getOrderStatus(orderId) {
  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        paid_at
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error getting order status:", error);
    return {
      success: false,
      error: error.message || "Failed to get order status",
    };
  }
}

/**
 * Cancel order (within cancellation window)
 * Used for: Customer-initiated cancellation
 */
export async function cancelOrder(orderId, reason, customerEmail) {
  try {
    // Get order and verify ownership
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("customer_email", customerEmail) // Verify ownership
      .single();

    if (fetchError || !order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Check if order can be cancelled
    if (
      order.status === "delivered" ||
      order.status === "cancelled" ||
      order.status === "shipped"
    ) {
      return {
        success: false,
        error: "Order cannot be cancelled at this stage",
      };
    }

    // Paid orders require support contact
    if (order.payment_status === "paid") {
      return {
        success: false,
        error: "Please contact support to cancel paid orders",
        requiresSupport: true,
      };
    }

    // Check cancellation window for pending orders
    const cancellationWindow =
      parseInt(process.env.ORDER_CANCELLATION_WINDOW) || 10;
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const minutesElapsed = (now - orderTime) / 1000 / 60;

    if (minutesElapsed > cancellationWindow) {
      return {
        success: false,
        error: `Cancellation window (${cancellationWindow} minutes) has expired. Please contact support.`,
        requiresSupport: true,
      };
    }

    // Cancel the order
    await cancelOrderInternal(orderId, reason);

    // Send cancellation email
    try {
      await sendOrderCancellationEmail(order, reason);
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");

    return {
      success: true,
      message: "Order cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel order",
    };
  }
}

/**
 * Internal cancel order helper
 */
async function cancelOrderInternal(orderId, reason) {
  // Update order status
  await supabaseAdmin
    .from("orders")
    .update({
      status: "cancelled",
      payment_status: "failed",
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  // Restore stock for all items
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (items) {
    for (const item of items) {
      await supabaseAdmin.rpc("restore_product_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }
  }

  // Cancel any pending transactions
  await supabaseAdmin
    .from("payment_transactions")
    .update({ status: "abandoned" })
    .eq("order_id", orderId)
    .eq("status", "pending");
}

/**
 * Get customer orders by email (works for both guests and registered users)
 * Used for: Order history page
 */
export async function getCustomerOrders(email, options = {}) {
  try {
    const { page = 1, limit = 10, status = null } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        paid_at,
        order_items!inner(
          id,
          product_name,
          product_image,
          product_sku,
          quantity,
          price,
          total
        )
      `,
        { count: "exact" },
      )
      .eq("customer_email", email.toLowerCase().trim())
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const {
      data: orders,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch orders",
    };
  }
}

/**
 * Get order by ID (with ownership verification)
 * Used for: Order detail page
 */
export async function getOrderById(orderId, customerEmail) {
  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          products(name, slug, images)
        ),
        payment_transactions(*)
      `,
      )
      .eq("id", orderId)
      .eq("customer_email", customerEmail.toLowerCase().trim())
      .single();

    if (error || !order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch order",
    };
  }
}

/**
 * Get saved payment methods for returning customers
 * Used for: Checkout - one-click payment
 */
export async function getSavedPaymentMethods(email) {
  try {
    const { data: methods, error } = await supabaseAdmin
      .from("saved_payment_methods")
      .select("*")
      .eq("customer_email", email.toLowerCase().trim())
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("last_used_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      methods: methods || [],
    };
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch payment methods",
      methods: [],
    };
  }
}

/**
 * Delete saved payment method
 * Used for: Payment methods management
 */
export async function deleteSavedPaymentMethod(methodId, email) {
  try {
    const { error } = await supabaseAdmin
      .from("saved_payment_methods")
      .delete()
      .eq("id", methodId)
      .eq("customer_email", email.toLowerCase().trim());

    if (error) throw error;

    return {
      success: true,
      message: "Payment method deleted",
    };
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return {
      success: false,
      error: error.message || "Failed to delete payment method",
    };
  }
}

/**
 * Set default payment method
 * Used for: Payment methods management
 */
export async function setDefaultPaymentMethod(methodId, email) {
  try {
    // Remove default from all methods
    await supabaseAdmin
      .from("saved_payment_methods")
      .update({ is_default: false })
      .eq("customer_email", email.toLowerCase().trim());

    // Set new default
    const { error } = await supabaseAdmin
      .from("saved_payment_methods")
      .update({ is_default: true })
      .eq("id", methodId)
      .eq("customer_email", email.toLowerCase().trim());

    if (error) throw error;

    return {
      success: true,
      message: "Default payment method updated",
    };
  } catch (error) {
    console.error("Error setting default payment method:", error);
    return {
      success: false,
      error: error.message || "Failed to update default payment method",
    };
  }
}

/**
 * Check stock availability for cart items
 * Used for: Pre-order validation
 */
export async function checkStockAvailability(items) {
  try {
    for (const item of items) {
      const { data: product, error } = await supabaseAdmin
        .from("products")
        .select("id, name, stock_quantity, is_active")
        .eq("id", item.product_id)
        .single();

      if (error || !product) {
        return {
          available: false,
          error: `Product not found`,
          productId: item.product_id,
        };
      }

      if (!product.is_active) {
        return {
          available: false,
          error: `${product.name} is no longer available`,
          product,
        };
      }

      if (product.stock_quantity < item.quantity) {
        return {
          available: false,
          error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.`,
          product,
          availableQuantity: product.stock_quantity,
        };
      }
    }

    return { available: true };
  } catch (error) {
    console.error("Error checking stock:", error);
    return {
      available: false,
      error: "Failed to check stock availability",
    };
  }
}

/**
 * Get order statistics (for admin)
 * Used for: Admin dashboard
 */
export async function getOrderStatistics(startDate = null, endDate = null) {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_order_statistics", {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;

    return {
      success: true,
      statistics: data,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch statistics",
    };
  }
}
