"use server";

import { verifyTransaction } from "@/lib/paystack";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export async function verifyPayment(reference) {
  try {
    console.log(`[Verify] Checking payment: ${reference}`);

    // Call Paystack API to verify transaction
    const verification = await verifyTransaction(reference);

    if (!verification.success) {
      return {
        success: false,
        error: "Failed to verify payment with Paystack",
      };
    }

    // Get the transaction from our database
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("payment_transactions")
      .select("*, orders(*)")
      .eq("paystack_reference", reference)
      .single();

    if (txError || !transaction) {
      console.error(`[Verify] Transaction not found: ${reference}`);
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    // Check if already processed
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

    if (paystackStatus === "success") {
      // Payment successful - update database
      console.log(`[Verify] Payment successful: ${reference}`);

      // Update transaction
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

      // Update order
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
          paid_at: verification.paid_at,
        })
        .eq("id", order.id);

      // Save card if reusable
      if (
        verification.authorization?.reusable &&
        verification.authorization?.authorization_code
      ) {
        try {
          await supabaseAdmin.from("saved_payment_methods").upsert(
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
          );
        } catch (cardError) {
          console.error("[Verify] Failed to save card:", cardError);
        }
      }

      revalidatePath(`/orders/${order.id}`);
      revalidatePath("/orders");

      return {
        success: true,
        status: "paid",
        orderId: order.id,
      };
    } else if (paystackStatus === "failed") {
      // Payment failed
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
        for (const item of items) {
          try {
            await supabaseAdmin.rpc("restore_product_stock", {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            });
          } catch (stockError) {
            console.error("[Verify] Failed to restore stock:", stockError);
          }
        }
      }

      return {
        success: true,
        status: "failed",
        orderId: order.id,
      };
    }

    // Still pending
    return {
      success: true,
      status: "pending",
      orderId: order.id,
    };
  } catch (error) {
    console.error("[Verify] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to verify payment",
    };
  }
}
