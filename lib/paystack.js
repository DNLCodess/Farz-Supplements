/**
 * Paystack Integration Utility
 * Handles all Paystack API interactions with proper error handling and retry logic
 */

const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

// Paystack transaction fee calculation
// Nigerian Cards: 1.5% capped at ₦2,000 (200000 kobo)
// International Cards: 3.9% + ₦100 (10000 kobo)
const PAYSTACK_FEES = {
  local: {
    percentage: 0.015, // 1.5%
    cap: 200000, // ₦2,000 in kobo
  },
  international: {
    percentage: 0.039, // 3.9%
    additional: 10000, // ₦100 in kobo
  },
};

/**
 * Calculate Paystack transaction fee
 * @param {number} amount - Amount in kobo
 * @param {boolean} isInternational - Whether card is international
 * @returns {number} Fee in kobo
 */
export function calculatePaystackFee(amount, isInternational = false) {
  if (isInternational) {
    return (
      Math.round(amount * PAYSTACK_FEES.international.percentage) +
      PAYSTACK_FEES.international.additional
    );
  }

  const fee = Math.round(amount * PAYSTACK_FEES.local.percentage);
  return Math.min(fee, PAYSTACK_FEES.local.cap);
}

/**
 * Make authenticated request to Paystack API
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response
 */
async function paystackRequest(endpoint, options = {}) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key not configured");
  }

  const url = `${PAYSTACK_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Paystack API request failed");
  }

  if (!data.status) {
    throw new Error(data.message || "Paystack request unsuccessful");
  }

  return data.data;
}

/**
 * Initialize a payment transaction
 * @param {object} params - Transaction parameters
 * @returns {Promise<object>} Transaction details with authorization_url
 */
export async function initializeTransaction({
  email,
  amount, // in kobo
  reference,
  metadata = {},
  channels = ["card", "bank", "bank_transfer"],
  callbackUrl,
}) {
  try {
    const payload = {
      email,
      amount: Math.round(amount), // Ensure integer
      reference,
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: "Order Number",
            variable_name: "order_number",
            value: metadata.order_number,
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: metadata.customer_name,
          },
        ],
      },
      channels,
    };

    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    const data = await paystackRequest("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      authorization_url: data.authorization_url,
      access_code: data.access_code,
      reference: data.reference,
    };
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return {
      success: false,
      error: error.message || "Failed to initialize payment",
    };
  }
}

/**
 * Verify a transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<object>} Transaction verification details
 */
export async function verifyTransaction(reference) {
  try {
    const data = await paystackRequest(`/transaction/verify/${reference}`);

    return {
      success: true,
      status: data.status, // 'success', 'failed', 'abandoned'
      amount: data.amount,
      currency: data.currency,
      channel: data.channel,
      paid_at: data.paid_at,
      transaction_date: data.transaction_date,

      // Payment method details
      authorization: data.authorization,
      customer: data.customer,

      // Gateway response
      gateway_response: data.gateway_response,
      message: data.message,

      // Full data for storage
      data,
    };
  } catch (error) {
    console.error("Transaction verification error:", error);
    return {
      success: false,
      error: error.message || "Failed to verify transaction",
    };
  }
}

/**
 * Charge authorization (for returning customers with saved cards)
 * @param {object} params - Charge parameters
 * @returns {Promise<object>} Charge result
 */
export async function chargeAuthorization({
  email,
  amount,
  authorization_code,
  reference,
  metadata = {},
}) {
  try {
    const payload = {
      email,
      amount: Math.round(amount),
      authorization_code,
      reference,
      metadata,
    };

    const data = await paystackRequest("/transaction/charge_authorization", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      status: data.status,
      reference: data.reference,
      amount: data.amount,
      message: data.message,
      data,
    };
  } catch (error) {
    console.error("Charge authorization error:", error);
    return {
      success: false,
      error: error.message || "Failed to charge saved card",
    };
  }
}

/**
 * Get transaction details
 * @param {string} idOrReference - Transaction ID or reference
 * @returns {Promise<object>} Transaction details
 */
export async function getTransaction(idOrReference) {
  try {
    const data = await paystackRequest(`/transaction/${idOrReference}`);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get transaction error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch transaction",
    };
  }
}

/**
 * List transactions (with optional filters)
 * @param {object} params - Query parameters
 * @returns {Promise<object>} Transactions list
 */
export async function listTransactions(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const data = await paystackRequest(`/transaction?${queryString}`);

    return {
      success: true,
      transactions: data,
    };
  } catch (error) {
    console.error("List transactions error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch transactions",
    };
  }
}

/**
 * Generate payment reference
 * @param {string} prefix - Reference prefix (e.g., 'FS')
 * @returns {string} Unique reference
 */
export function generatePaymentReference(prefix = "FS") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Convert Naira to Kobo
 * @param {number} naira - Amount in Naira
 * @returns {number} Amount in Kobo
 */
export function nairaToKobo(naira) {
  return Math.round(naira * 100);
}

/**
 * Convert Kobo to Naira
 * @param {number} kobo - Amount in Kobo
 * @returns {number} Amount in Naira
 */
export function koboToNaira(kobo) {
  return kobo / 100;
}

/**
 * Verify webhook signature
 * @param {object} payload - Webhook payload
 * @param {string} signature - X-Paystack-Signature header
 * @returns {boolean} Whether signature is valid
 */
export function verifyWebhookSignature(payload, signature) {
  const crypto = require("crypto");

  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest("hex");

  return hash === signature;
}

/**
 * Get supported payment channels
 * @returns {array} Array of channel objects
 */
export function getPaymentChannels() {
  const channels = process.env.PAYSTACK_CHANNELS?.split(",") || [
    "card",
    "bank",
    "bank_transfer",
  ];

  const channelInfo = {
    card: {
      name: "Card Payment",
      description: "Pay with debit or credit card",
      icon: "credit-card",
    },
    bank: {
      name: "Bank",
      description: "Pay via your bank",
      icon: "building",
    },
    bank_transfer: {
      name: "Bank Transfer",
      description: "Transfer to our account",
      icon: "arrow-right-left",
    },
    ussd: {
      name: "USSD",
      description: "Pay with USSD code",
      icon: "smartphone",
    },
    qr: {
      name: "QR Code",
      description: "Scan QR code to pay",
      icon: "qr-code",
    },
    mobile_money: {
      name: "Mobile Money",
      description: "Pay with mobile wallet",
      icon: "wallet",
    },
  };

  return channels
    .map((channel) => ({
      value: channel.trim(),
      ...channelInfo[channel.trim()],
    }))
    .filter((ch) => ch.name);
}

/**
 * Handle transaction status
 * @param {string} status - Paystack status
 * @returns {object} Standardized status object
 */
export function parseTransactionStatus(status) {
  const statusMap = {
    success: {
      status: "paid",
      message: "Payment successful",
      color: "green",
    },
    failed: {
      status: "failed",
      message: "Payment failed",
      color: "red",
    },
    abandoned: {
      status: "failed",
      message: "Payment was abandoned",
      color: "gray",
    },
    pending: {
      status: "pending",
      message: "Payment pending",
      color: "amber",
    },
  };

  return (
    statusMap[status?.toLowerCase()] || {
      status: "unknown",
      message: "Unknown payment status",
      color: "gray",
    }
  );
}

/**
 * Retry payment operation with exponential backoff
 * @param {function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise<any>} Operation result
 */
export async function retryPaymentOperation(
  operation,
  maxRetries = 3,
  baseDelay = 1000,
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.message.includes("400") || error.message.includes("404")) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Validate Paystack configuration
 * @returns {object} Validation result
 */
export function validatePaystackConfig() {
  const errors = [];

  if (!PAYSTACK_SECRET_KEY) {
    errors.push("PAYSTACK_SECRET_KEY is not configured");
  }

  if (!PAYSTACK_PUBLIC_KEY) {
    errors.push("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured");
  }

  if (PAYSTACK_SECRET_KEY && !PAYSTACK_SECRET_KEY.startsWith("sk_")) {
    errors.push("Invalid PAYSTACK_SECRET_KEY format");
  }

  if (PAYSTACK_PUBLIC_KEY && !PAYSTACK_PUBLIC_KEY.startsWith("pk_")) {
    errors.push("Invalid NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY format");
  }

  return {
    isValid: errors.length === 0,
    errors,
    environment: PAYSTACK_SECRET_KEY?.includes("test") ? "test" : "live",
  };
}

export default {
  calculatePaystackFee,
  initializeTransaction,
  verifyTransaction,
  chargeAuthorization,
  getTransaction,
  listTransactions,
  generatePaymentReference,
  nairaToKobo,
  koboToNaira,
  verifyWebhookSignature,
  getPaymentChannels,
  parseTransactionStatus,
  retryPaymentOperation,
  validatePaystackConfig,
};
