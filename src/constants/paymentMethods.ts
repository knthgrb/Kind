// Philippine payment methods supported by Xendit
export const PHILIPPINE_PAYMENT_METHODS = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "GCASH",
  "GRABPAY",
  "PAYMAYA",
  "BANK_TRANSFER",
] as const;

export type PaymentMethod = (typeof PHILIPPINE_PAYMENT_METHODS)[number];

// Primary payment methods for subscriptions (most reliable for recurring payments)
export const SUBSCRIPTION_PAYMENT_METHODS = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "GCASH",
] as const;

export type SubscriptionPaymentMethod =
  (typeof SUBSCRIPTION_PAYMENT_METHODS)[number];

// Payment method display names
export const PAYMENT_METHOD_DISPLAY_NAMES: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  GCASH: "GCash",
  GRABPAY: "GrabPay",
  PAYMAYA: "Maya",
  BANK_TRANSFER: "Bank Transfer",
};

// Payment method icons (you can replace with actual icon components)
export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  CREDIT_CARD: "💳",
  DEBIT_CARD: "💳",
  GCASH: "📱",
  GRABPAY: "🚗",
  PAYMAYA: "💙",
  BANK_TRANSFER: "🏦",
};
