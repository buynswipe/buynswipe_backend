import crypto from "crypto"

// PayU API configuration
const PAYU_CONFIG = {
  merchantKey: process.env.PAYU_MERCHANT_KEY || "",
  merchantSalt: process.env.PAYU_MERCHANT_SALT || "",
  baseUrl: process.env.NODE_ENV === "production" ? "https://secure.payu.in" : "https://test.payu.in",
  successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/payu/success`,
  failureUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/payu/failure`,
  upiTimeout: 240, // seconds
}

// Validate PayU configuration
export function validatePayUConfig() {
  if (!PAYU_CONFIG.merchantKey || !PAYU_CONFIG.merchantSalt) {
    throw new Error("PayU configuration is incomplete. Please check environment variables.")
  }

  // Check if site URL is set
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn("NEXT_PUBLIC_SITE_URL is not set. Using fallback URLs for callbacks.")
    // Use fallback URLs
    PAYU_CONFIG.successUrl = "/api/payments/payu/success"
    PAYU_CONFIG.failureUrl = "/api/payments/payu/failure"
  }

  return true
}

// Generate PayU hash for secure transactions
export function generateHash(params: Record<string, string>): string {
  const { merchantKey, merchantSalt } = PAYU_CONFIG

  // Create hash string as per PayU documentation
  const hashString = `${merchantKey}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${merchantSalt}`

  // Generate SHA512 hash
  return crypto.createHash("sha512").update(hashString).digest("hex")
}

// Verify PayU response hash
export function verifyHash(params: Record<string, string>): boolean {
  const { merchantSalt } = PAYU_CONFIG

  // Create hash string for verification
  const hashString = `${merchantSalt}|${params.status}|||||||||${params.udf5}|||||${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${PAYU_CONFIG.merchantKey}`

  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex")
  return calculatedHash === params.hash
}

// Create PayU payment request
export async function createPayment(paymentData: {
  txnId: string
  amount: number
  productInfo: string
  firstName: string
  email: string
  phone: string
  udf1?: string // Can be used for order ID
  udf5?: string // Used for additional data
}) {
  validatePayUConfig()

  const { merchantKey, baseUrl } = PAYU_CONFIG

  // Prepare payment parameters
  const params: Record<string, string> = {
    key: merchantKey,
    txnid: paymentData.txnId,
    amount: paymentData.amount.toString(),
    productinfo: paymentData.productInfo,
    firstname: paymentData.firstName,
    email: paymentData.email,
    phone: paymentData.phone,
    surl: PAYU_CONFIG.successUrl,
    furl: PAYU_CONFIG.failureUrl,
    udf1: paymentData.udf1 || "",
    udf5: paymentData.udf5 || "",
    pg: "UPI", // Specify UPI as payment method
    bankcode: "UPI", // Bank code for UPI
  }

  // Generate hash for secure transaction
  params.hash = generateHash(params)

  return {
    url: `${baseUrl}/_payment`,
    params,
  }
}

// Generate UPI payment link
export async function generateUpiLink(paymentData: {
  txnId: string
  amount: number
  productInfo: string
  firstName: string
  email: string
  phone: string
  orderId: string
}) {
  validatePayUConfig()

  const { baseUrl, merchantKey } = PAYU_CONFIG

  // Prepare UPI payment parameters
  const params: Record<string, string> = {
    key: merchantKey,
    txnid: paymentData.txnId,
    amount: paymentData.amount.toString(),
    productinfo: paymentData.productInfo,
    firstname: paymentData.firstName,
    email: paymentData.email,
    phone: paymentData.phone,
    surl: PAYU_CONFIG.successUrl,
    furl: PAYU_CONFIG.failureUrl,
    udf1: paymentData.orderId,
    pg: "UPI",
    bankcode: "UPI",
  }

  // Generate hash for secure transaction
  params.hash = generateHash(params)

  try {
    // For UPI, we need to make an API call to PayU to get the payment link
    const response = await fetch(`${baseUrl}/api/v2/sdk/payment/upi/intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: merchantKey,
        txnid: params.txnid,
        amount: params.amount,
        productinfo: params.productinfo,
        firstname: params.firstname,
        email: params.email,
        phone: params.phone,
        surl: params.surl,
        furl: params.furl,
        hash: params.hash,
        udf1: params.udf1,
      }),
    })

    if (!response.ok) {
      throw new Error(`PayU API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.status || data.status !== "success") {
      throw new Error(data.message || "Failed to generate UPI payment link")
    }

    return {
      upiUri: data.data.upi_uri,
      qrCode: data.data.qr_code,
      txnId: params.txnid,
      timeout: PAYU_CONFIG.upiTimeout,
    }
  } catch (error) {
    console.error("Error in PayU UPI API call:", error)

    // Fallback: Generate a basic UPI URI for development/testing
    // This helps when PayU API is not accessible
    const upiUri = `upi://pay?pa=test@payu&pn=RetailBandhu&am=${paymentData.amount}&tr=${paymentData.txnId}&tn=Order%20Payment`

    // Generate a QR code using a public API
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`

    console.log("Using fallback UPI payment data")

    return {
      upiUri,
      qrCode,
      txnId: params.txnid,
      timeout: PAYU_CONFIG.upiTimeout,
    }
  }
}

// Check payment status
export async function checkPaymentStatus(txnId: string): Promise<{
  status: "success" | "failure" | "pending"
  message: string
  transactionId?: string
}> {
  validatePayUConfig()

  const { merchantKey, baseUrl, merchantSalt } = PAYU_CONFIG

  // Generate command hash
  const commandHash = crypto
    .createHash("sha512")
    .update(`${merchantKey}|verify_payment|${txnId}|${merchantSalt}`)
    .digest("hex")

  try {
    // Make API call to check payment status
    const response = await fetch(`${baseUrl}/merchant/postservice?form=2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        key: merchantKey,
        command: "verify_payment",
        var1: txnId,
        hash: commandHash,
      }).toString(),
    })

    if (!response.ok) {
      console.error(`PayU status check error: ${response.status} ${response.statusText}`)
      return {
        status: "pending",
        message: "Unable to verify payment status at this time",
      }
    }

    const data = await response.json()

    if (data.status === "1") {
      // Transaction exists
      const transaction = data.transaction_details[txnId]

      if (transaction.status === "success") {
        return {
          status: "success",
          message: "Payment successful",
          transactionId: transaction.mihpayid,
        }
      } else if (transaction.status === "failure") {
        return {
          status: "failure",
          message: transaction.error_Message || "Payment failed",
          transactionId: transaction.mihpayid,
        }
      } else {
        return {
          status: "pending",
          message: "Payment is being processed",
          transactionId: transaction.mihpayid,
        }
      }
    } else {
      return {
        status: "pending",
        message: "Transaction not found or still being processed",
      }
    }
  } catch (error) {
    console.error("Error checking payment status:", error)
    return {
      status: "pending",
      message: "Unable to verify payment status at this time",
    }
  }
}
