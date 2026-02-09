/**
 * PAYSTACK WEBHOOK HANDLER - SINGLE SOURCE OF TRUTH
 *
 * This is the ONLY place where payment status is verified and updated
 * Never trust client-side redirects or callbacks
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { verifyWebhookSignature } from "@/lib/paystack";
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Log webhook receipt
    console.log("[Webhook] Received webhook");

    if (!signature) {
      console.error("[Webhook] Missing signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const payload = JSON.parse(body);

    // Verify this request is actually from Paystack
    const isValid = verifyWebhookSignature(payload, signature);
    if (!isValid) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { event, data } = payload;
    console.log(`[Webhook] Event: ${event}, Ref: ${data.reference}`);

    switch (event) {
      case "charge.success":
        await handleChargeSuccess(data);
        break;
      case "charge.failed":
        await handleChargeFailed(data);
        break;
      case "charge.pending":
        await handleChargePending(data);
        break;
      default:
        console.log(`[Webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    // Always return 200 to prevent Paystack retries on our errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

async function handleChargeSuccess(data) {
  const reference = data.reference;
  console.log(`[Webhook] Processing charge.success for ${reference}`);

  try {
    // Get transaction with order details
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("payment_transactions")
      .select("*, orders(*)")
      .eq("paystack_reference", reference)
      .single();

    if (txError || !transaction) {
      console.error(`[Webhook] Transaction not found: ${reference}`, txError);
      return;
    }

    if (transaction.status === "success") {
      console.log(`[Webhook] Already processed: ${reference}`);
      return; // Already processed
    }

    const order = transaction.orders;

    // Update transaction record
    await supabaseAdmin
      .from("payment_transactions")
      .update({
        status: "success",
        channel: data.channel,
        gateway_response: data.gateway_response,
        paid_at: data.paid_at,
        paystack_authorization_code:
          data.authorization?.authorization_code || null,
        card_type: data.authorization?.card_type || null,
        card_last4: data.authorization?.last4 || null,
        card_exp_month: data.authorization?.exp_month || null,
        card_exp_year: data.authorization?.exp_year || null,
        card_bank: data.authorization?.bank || null,
        webhook_received_at: new Date().toISOString(),
        webhook_payload: data,
      })
      .eq("id", transaction.id);

    // Update order status
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        paid_at: data.paid_at,
      })
      .eq("id", order.id);

    // NOTE: Stock was already reduced during order creation
    // We use reduce_product_stock (not deduct_product_stock) in createOrder

    // Save card for future use if it's reusable
    if (
      data.authorization?.reusable &&
      data.authorization?.authorization_code
    ) {
      try {
        await supabaseAdmin.from("saved_payment_methods").upsert(
          {
            customer_email: order.customer_email,
            customer_id: order.customer_id,
            paystack_authorization_code: data.authorization.authorization_code,
            card_type: data.authorization.card_type || "unknown",
            card_last4: data.authorization.last4 || "0000",
            card_exp_month: data.authorization.exp_month || "12",
            card_exp_year: data.authorization.exp_year || "99",
            card_bank: data.authorization.bank || null,
            card_brand: data.authorization.brand || null,
            channel: data.channel || "card",
            is_active: true,
            last_used_at: new Date().toISOString(),
          },
          { onConflict: "paystack_authorization_code" },
        );
      } catch (cardError) {
        console.error("[Webhook] Failed to save card:", cardError);
        // Don't fail the whole process if card saving fails
      }
    }

    // Send success email
    try {
      await sendPaymentSuccessEmail(order, transaction);
    } catch (emailError) {
      console.error("[Webhook] Failed to send success email:", emailError);
    }

    console.log(`[Webhook] Success processed: ${reference}`);
  } catch (error) {
    console.error(
      `[Webhook] Error processing success for ${reference}:`,
      error,
    );
  }
}

async function handleChargeFailed(data) {
  const reference = data.reference;
  console.log(`[Webhook] Processing charge.failed for ${reference}`);

  try {
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("payment_transactions")
      .select("*, orders(*)")
      .eq("paystack_reference", reference)
      .single();

    if (txError || !transaction) {
      console.error(`[Webhook] Transaction not found: ${reference}`, txError);
      return;
    }

    // Update transaction
    await supabaseAdmin
      .from("payment_transactions")
      .update({
        status: "failed",
        gateway_response: data.gateway_response,
        failure_reason: data.message || "Payment failed",
        webhook_received_at: new Date().toISOString(),
        webhook_payload: data,
      })
      .eq("id", transaction.id);

    // Update order
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "failed",
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: "Payment failed",
      })
      .eq("id", transaction.orders.id);

    // Restore stock since payment failed
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", transaction.orders.id);

    if (items) {
      for (const item of items) {
        try {
          await supabaseAdmin.rpc("restore_product_stock", {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        } catch (stockError) {
          console.error("[Webhook] Failed to restore stock:", stockError);
        }
      }
    }

    // Send failure email
    try {
      await sendPaymentFailedEmail(
        transaction.orders,
        data.gateway_response || "Payment failed",
      );
    } catch (emailError) {
      console.error("[Webhook] Failed to send failure email:", emailError);
    }

    console.log(`[Webhook] Failure processed: ${reference}`);
  } catch (error) {
    console.error(
      `[Webhook] Error processing failure for ${reference}:`,
      error,
    );
  }
}

async function handleChargePending(data) {
  const reference = data.reference;
  console.log(`[Webhook] Processing charge.pending for ${reference}`);

  try {
    await supabaseAdmin
      .from("payment_transactions")
      .update({
        status: "processing",
        channel: data.channel,
        webhook_received_at: new Date().toISOString(),
      })
      .eq("paystack_reference", reference);

    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "processing",
      })
      .eq("paystack_reference", reference);

    console.log(`[Webhook] Pending processed: ${reference}`);
  } catch (error) {
    console.error(
      `[Webhook] Error processing pending for ${reference}:`,
      error,
    );
  }
}
