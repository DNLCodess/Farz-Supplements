"use server";

import { verifyTransaction } from "@/lib/paystack";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";
import {
  sendPaymentSuccessEmail,
  sendAdminOrderNotificationEmail,
} from "@/lib/email";

export async function verifyPayment(reference) {
  try {
    console.log(`[Verify] Checking payment: ${reference}`);

    const verification = await verifyTransaction(reference);

    if (!verification.success) {
      return {
        success: false,
        error: "Failed to verify payment with Paystack",
      };
    }

    // Get transaction + full order (including items for the admin email)
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("payment_transactions")
      .select(
        `
        *,
        orders(
          *,
          order_items(*)
        )
      `,
      )
      .eq("paystack_reference", reference)
      .single();

    if (txError || !transaction) {
      console.error(`[Verify] Transaction not found: ${reference}`);
      return { success: false, error: "Transaction not found" };
    }

    // Already processed — don't send emails again
    if (transaction.status === "success") {
      console.log(`[Verify] Already processed: ${reference}`);
      return {
        success: true,
        status: "paid",
        orderId: transaction.orders.id,
      };
    }

    const paystackStatus = verification.status;
    const order = transaction.orders;
    const orderItems = order.order_items || [];

    // ── PAYMENT SUCCESSFUL ────────────────────────────────────────────────────
    if (paystackStatus === "success") {
      console.log(`[Verify] Payment successful: ${reference}`);

      // 1. Update transaction record
      await supabaseAdmin
        .from("payment_transactions")
        .update({
          status: "success",
          channel: verification.channel,
          gateway_response: verification.gateway_response,
          paid_at: verification.paid_at,
          paystack_authorization_code:
            verification.authorization?.authorization_code || null,
          card_type: verification.authorization?.card_type || null,
          card_last4: verification.authorization?.last4 || null,
          card_exp_month: verification.authorization?.exp_month || null,
          card_exp_year: verification.authorization?.exp_year || null,
          card_bank: verification.authorization?.bank || null,
        })
        .eq("id", transaction.id);

      // 2. Update order status
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
          paid_at: verification.paid_at,
        })
        .eq("id", order.id);

      // 3. Save reusable card (non-blocking)
      if (
        verification.authorization?.reusable &&
        verification.authorization?.authorization_code
      ) {
        supabaseAdmin
          .from("saved_payment_methods")
          .upsert(
            {
              customer_email: order.customer_email,
              customer_id: order.customer_id,
              paystack_authorization_code:
                verification.authorization.authorization_code,
              card_type: verification.authorization.card_type || "unknown",
              card_last4: verification.authorization.last4 || "0000",
              card_exp_month: verification.authorization.exp_month || "12",
              card_exp_year: verification.authorization.exp_year || "99",
              card_bank: verification.authorization.bank || null,
              card_brand: verification.authorization.brand || null,
              channel: verification.channel || "card",
              is_active: true,
              last_used_at: new Date().toISOString(),
            },
            { onConflict: "paystack_authorization_code" },
          )
          .then(({ error }) => {
            if (error) console.error("[Verify] Failed to save card:", error);
          });
      }

      // 4. Send emails concurrently (non-blocking — never fail the verify call)
      Promise.all([
        // Customer: payment receipt
        sendPaymentSuccessEmail(order, {
          ...transaction,
          channel: verification.channel,
        }).catch((err) =>
          console.error("[Verify] Customer email failed:", err),
        ),
        // Admin: new order notification
        sendAdminOrderNotificationEmail(
          order,
          {
            ...transaction,
            channel: verification.channel,
            paystack_reference: reference,
          },
          orderItems,
        ).catch((err) => console.error("[Verify] Admin email failed:", err)),
      ]);

      revalidatePath(`/orders/${order.id}`);
      revalidatePath("/orders");
      revalidatePath("/admin/orders");

      return {
        success: true,
        status: "paid",
        orderId: order.id,
      };
    }

    // ── PAYMENT FAILED ────────────────────────────────────────────────────────
    if (paystackStatus === "failed") {
      console.log(`[Verify] Payment failed: ${reference}`);

      await supabaseAdmin
        .from("payment_transactions")
        .update({
          status: "failed",
          gateway_response: verification.gateway_response,
          failure_reason: verification.message || "Payment failed",
        })
        .eq("id", transaction.id);

      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: "Payment failed",
        })
        .eq("id", order.id);

      // Restore stock
      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", order.id);

      if (items) {
        await Promise.all(
          items.map((item) =>
            supabaseAdmin
              .rpc("restore_product_stock", {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              })
              .catch((err) =>
                console.error("[Verify] Stock restore failed:", err),
              ),
          ),
        );
      }

      return { success: true, status: "failed", orderId: order.id };
    }

    // Still pending
    return { success: true, status: "pending", orderId: order.id };
  } catch (error) {
    console.error("[Verify] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to verify payment",
    };
  }
}
