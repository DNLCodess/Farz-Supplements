/**
 * Email Utility with Resend - FIXED VERSION
 * Handles all transactional emails for orders and payments
 * Fixed: Field mismatches, address formatting, undefined values
 */

import { Resend } from "resend";
import { formatPrice, formatDate } from "@/utils/format";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const SUPPORT_EMAIL =
  process.env.RESEND_SUPPORT_EMAIL ||
  "support@https://farz-supplements.vercel.app/";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Helper function to safely extract shipping address
 */
function extractShippingAddress(order) {
  // Handle JSONB object
  if (typeof order.shipping_address === "object" && order.shipping_address) {
    return {
      address: order.shipping_address.address || "",
      city: order.shipping_address.city || order.shipping_city || "",
      state: order.shipping_address.state || order.shipping_state || "",
      postal_code:
        order.shipping_address.postal_code || order.shipping_postal_code || "",
    };
  }

  // Fallback to individual fields
  return {
    address: order.shipping_address || "",
    city: order.shipping_city || "",
    state: order.shipping_state || "",
    postal_code: order.shipping_postal_code || "",
  };
}

/**
 * Helper function to get total amount (handles both total and total_amount)
 */
function getTotalAmount(order) {
  return order.total_amount || order.total || 0;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order, items) {
  try {
    const customerName =
      `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim();

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      replyTo: SUPPORT_EMAIL,
      subject: `Order Confirmation - ${order.order_number}`,
      html: generateOrderConfirmationHTML(order, items, customerName),
    });

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return {
      success: false,
      error: error.message || "Failed to send confirmation email",
    };
  }
}

/**
 * Send payment successful email
 */
export async function sendPaymentSuccessEmail(order, transaction) {
  try {
    const customerName =
      `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim();

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      replyTo: SUPPORT_EMAIL,
      subject: `Payment Received - ${order.order_number}`,
      html: generatePaymentSuccessHTML(order, transaction, customerName),
    });

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error("Error sending payment success email:", error);
    return {
      success: false,
      error: error.message || "Failed to send payment email",
    };
  }
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(order, trackingInfo = null) {
  try {
    const customerName =
      `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim();

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      replyTo: SUPPORT_EMAIL,
      subject: `Your Order Has Been Shipped - ${order.order_number}`,
      html: generateOrderShippedHTML(order, customerName, trackingInfo),
    });

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error("Error sending order shipped email:", error);
    return {
      success: false,
      error: error.message || "Failed to send shipping email",
    };
  }
}

/**
 * Send order cancellation email
 */
export async function sendOrderCancellationEmail(order, reason) {
  try {
    const customerName =
      `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim();

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      replyTo: SUPPORT_EMAIL,
      subject: `Order Cancelled - ${order.order_number}`,
      html: generateOrderCancellationHTML(order, customerName, reason),
    });

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return {
      success: false,
      error: error.message || "Failed to send cancellation email",
    };
  }
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(order, reason) {
  try {
    const customerName =
      `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim();

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      replyTo: SUPPORT_EMAIL,
      subject: `Payment Issue - ${order.order_number}`,
      html: generatePaymentFailedHTML(order, customerName, reason),
    });

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error("Error sending payment failed email:", error);
    return {
      success: false,
      error: error.message || "Failed to send payment failed email",
    };
  }
}

// ============================================================================
// HTML EMAIL TEMPLATES - FIXED
// ============================================================================

function generateOrderConfirmationHTML(order, items, customerName) {
  const totalAmount = getTotalAmount(order);
  const shippingAddr = extractShippingAddress(order);

  // Build items HTML with safe property access
  const itemsHTML = items
    .map((item) => {
      const itemName = item.product_name || item.name || "Product";
      const itemQty = item.quantity || 1;
      const itemTotal = item.total || item.subtotal || 0;

      return `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #E5E7EB;">
        <div style="display: flex; gap: 16px; align-items: start;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111827;">
              ${itemName}
            </h4>
            <p style="margin: 0; font-size: 14px; color: #6B7280;">
              Quantity: ${itemQty}
            </p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #14532D;">
              ${formatPrice(itemTotal)}
            </p>
          </div>
        </div>
      </td>
    </tr>
  `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14532D 0%, #166534 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">
                🌿 Farz Supplements
              </h1>
              <p style="margin: 12px 0 0 0; color: #D1FAE5; font-size: 18px;">
                Order Confirmed
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #111827;">
                Thank you, ${customerName || "Valued Customer"}!
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                We've received your order and will send you a confirmation when it ships.
              </p>

              <!-- Order Number -->
              <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 32px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">Order Number</p>
                <h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #14532D;">
                  ${order.order_number}
                </h3>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #6B7280;">
                  ${formatDate(order.created_at)}
                </p>
              </div>

              <!-- Order Items -->
              <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">
                Order Details
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                ${itemsHTML}
              </table>

              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 8px 0; font-size: 16px; color: #6B7280;">Subtotal</td>
                  <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #111827; text-align: right;">
                    ${formatPrice(order.subtotal || 0)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 16px; color: #6B7280;">Shipping</td>
                  <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #111827; text-align: right;">
                    ${(order.shipping_cost || 0) === 0 ? '<span style="color: #14532D;">Free</span>' : formatPrice(order.shipping_cost)}
                  </td>
                </tr>
                ${
                  (order.transaction_fee || 0) > 0
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-size: 16px; color: #6B7280;">Transaction Fee</td>
                  <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #111827; text-align: right;">
                    ${formatPrice(order.transaction_fee)}
                  </td>
                </tr>
                `
                    : ""
                }
                <tr style="border-top: 2px solid #E5E7EB;">
                  <td style="padding: 16px 0 0 0; font-size: 20px; font-weight: 700; color: #111827;">Total</td>
                  <td style="padding: 16px 0 0 0; font-size: 24px; font-weight: 700; color: #14532D; text-align: right;">
                    ${formatPrice(totalAmount)}
                  </td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">
                Shipping Address
              </h3>
              <div style="background-color: #F9FAFB; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111827;">
                  ${order.shipping_first_name || ""} ${order.shipping_last_name || ""}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #6B7280; line-height: 20px;">
                  ${shippingAddr.address}<br>
                  ${shippingAddr.city}, ${shippingAddr.state}${shippingAddr.postal_code ? ` ${shippingAddr.postal_code}` : ""}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${APP_URL}/orders/${order.id}" 
                   style="display: inline-block; background-color: #14532D; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                  View Order Status
                </a>
              </div>

              <!-- Support Info -->
              <div style="background-color: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #14532D;">
                  Need Help?
                </p>
                <p style="margin: 0; font-size: 14px; color: #166534;">
                  Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #14532D; font-weight: 600;">${SUPPORT_EMAIL}</a><br>
                  or call +2349123368239
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                © ${new Date().getFullYear()} Farz Supplements. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                Natural health supplements for wellness
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generatePaymentSuccessHTML(order, transaction, customerName) {
  const totalAmount = getTotalAmount(order);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14532D 0%, #166534 100%); padding: 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #FFFFFF; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 48px; line-height: 1;">✓</span>
              </div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">
                Payment Successful!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #111827;">
                Thank you, ${customerName || "Valued Customer"}!
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                We've received your payment and your order is being processed.
              </p>

              <!-- Payment Details -->
              <div style="background-color: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #166534;">Order Number</td>
                    <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #14532D; text-align: right;">
                      ${order.order_number}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #166534;">Amount Paid</td>
                    <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #14532D; text-align: right;">
                      ${formatPrice(totalAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #166534;">Payment Method</td>
                    <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #14532D; text-align: right; text-transform: capitalize;">
                      ${transaction.channel || "Card"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #166534;">Transaction Ref</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #14532D; text-align: right;">
                      ${transaction.paystack_reference || transaction.reference || "N/A"}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- What's Next -->
              <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">
                What's Next?
              </h3>
              <ul style="margin: 0 0 32px 0; padding-left: 20px; font-size: 16px; line-height: 28px; color: #6B7280;">
                <li>Your order is being carefully prepared</li>
                <li>We'll send you tracking information once it ships</li>
                <li>Delivery within 2 working days in Lagos, 3-5 days elsewhere</li>
              </ul>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${APP_URL}/orders/${order.id}" 
                   style="display: inline-block; background-color: #14532D; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                  Track Your Order
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                © ${new Date().getFullYear()} Farz Supplements. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateOrderShippedHTML(order, customerName, trackingInfo) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #14532D 0%, #166534 100%); padding: 40px; text-align: center;">
              <span style="font-size: 64px;">📦</span>
              <h1 style="margin: 16px 0 0 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">
                Your Order is On Its Way!
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #111827;">
                Hi ${customerName || "Valued Customer"}!
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                Great news! Your order <strong>${order.order_number}</strong> has been shipped and is on its way to you.
              </p>

              ${
                trackingInfo
                  ? `
              <div style="background-color: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #166534;">Tracking Number</p>
                <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #14532D;">
                  ${trackingInfo}
                </h3>
              </div>
              `
                  : ""
              }

              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                Your package should arrive within 2 working days if you're in Lagos, or 3-5 days for other locations.
              </p>

              <div style="text-align: center;">
                <a href="${APP_URL}/orders/${order.id}" 
                   style="display: inline-block; background-color: #14532D; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                  Track Your Order
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #F9FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">
                © ${new Date().getFullYear()} Farz Supplements. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateOrderCancellationHTML(order, customerName, reason) {
  const totalAmount = getTotalAmount(order);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #FEF2F2; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 48px; color: #EF4444; line-height: 1;">✕</span>
              </div>
              <h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 700; color: #111827;">
                Order Cancelled
              </h1>
              <p style="margin: 0; font-size: 16px; color: #6B7280;">
                Order ${order.order_number}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                Hi ${customerName || "Valued Customer"}, your order has been cancelled.
              </p>

              ${
                reason
                  ? `
              <div style="background-color: #FEF2F2; border: 2px solid #FECACA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #991B1B;">Reason:</p>
                <p style="margin: 0; font-size: 14px; color: #7F1D1D;">${reason}</p>
              </div>
              `
                  : ""
              }

              ${
                order.payment_status === "paid"
                  ? `
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                Your payment of <strong>${formatPrice(totalAmount)}</strong> will be refunded within 5-7 business days.
              </p>
              `
                  : ""
              }

              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                If you have any questions, please don't hesitate to contact us.
              </p>

              <div style="text-align: center;">
                <a href="${APP_URL}/products" 
                   style="display: inline-block; background-color: #14532D; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                  Continue Shopping
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #F9FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">
                Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #14532D;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generatePaymentFailedHTML(order, customerName, reason) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #FEF2F2; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 48px; color: #EF4444; line-height: 1;">⚠</span>
              </div>
              <h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 700; color: #111827;">
                Payment Issue
              </h1>
              <p style="margin: 0; font-size: 16px; color: #6B7280;">
                Order ${order.order_number}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                Hi ${customerName || "Valued Customer"}, we encountered an issue processing your payment.
              </p>

              <div style="background-color: #FEF2F2; border: 2px solid #FECACA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #991B1B;">Issue:</p>
                <p style="margin: 0; font-size: 14px; color: #7F1D1D;">${reason}</p>
              </div>

              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 24px; color: #6B7280;">
                Don't worry - your order is still reserved for the next ${process.env.ORDER_CANCELLATION_WINDOW || 10} minutes. Please try completing your payment again.
              </p>

              <div style="text-align: center;">
                <a href="${APP_URL}/checkout?order=${order.id}" 
                   style="display: inline-block; background-color: #14532D; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                  Retry Payment
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #F9FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">
                Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #14532D;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export default {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendOrderShippedEmail,
  sendOrderCancellationEmail,
  sendPaymentFailedEmail,
};
