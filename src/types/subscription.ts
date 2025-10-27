// Subscription types for the platform
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  userRole: "kindbossing" | "kindtao";
  priceMonthly: number;
  priceYearly?: number;
  currency: string;
  description: string;
  features: string[];
  swipeCreditsMonthly: number;
  boostCreditsMonthly: number;
  isActive: boolean;
  isPopular?: boolean;
  metadata?: Record<string, any>;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  xendit_plan_id: string;
  subscription_tier: string;
  status:
    | "active"
    | "incomplete"
    | "incomplete_cancelled"
    | "past_due"
    | "unpaid"
    | "cancelled"
    | "downgraded"
    | "upgraded"
    | "requires_action"
    | "pending"
    | "inactive";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  xendit_subscription_id?: string;
  xendit_customer_id?: string;
  daily_swipe_limit?: number;
  amount_paid?: number;
  currency?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  subscription_plans?: {
    name: string;
    tier: string;
    price_monthly: number;
    features: string[];
    swipe_credits_monthly: number;
    boost_credits_monthly: number;
  };
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  xendit_payment_id?: string;
  xendit_action_id?: string;
  amount: number;
  currency: string;
  status: "succeeded" | "failed" | "pending" | "refunded";
  payment_method: string;
  created_at: string;
  updated_at: string;
}

// Payment method types
export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "GCASH"
  | "GRABPAY"
  | "PAYMAYA"
  | "BANK_TRANSFER";

// Xendit-specific types
export interface XenditSubscriptionPlan {
  id: string;
  reference_id: string;
  customer_id: string;
  recurring_action: "PAYMENT";
  currency: string;
  amount: number;
  status: "REQUIRES_ACTION" | "PENDING" | "ACTIVE" | "INACTIVE";
  created: string;
  updated: string;
  schedule_id: string;
  payment_methods: PaymentMethod[];
  schedule: {
    id: string;
    reference_id: string;
    interval: "DAY" | "WEEK" | "MONTH" | "YEAR";
    interval_count: number;
    total_recurrence: number;
    anchor_date: string;
    retry_interval: "DAY" | "WEEK" | "MONTH";
    retry_interval_count: number;
    total_retry: number;
    failed_attempt_notifications: number[];
  };
  immediate_action_type: "FULL_AMOUNT" | "PRORATED";
  notification_config: {
    locale: string;
    recurring_created: string[];
    recurring_succeeded: string[];
    recurring_failed: string[];
  };
  failed_cycle_action: "STOP" | "CONTINUE";
  payment_link_for_failed_attempt: boolean;
  metadata?: Record<string, any>;
  description: string;
  success_return_url: string;
  failure_return_url: string;
  actions?: {
    url: string;
    action: string;
    method: string;
    url_type: string;
  }[];
}

export interface XenditWebhookEvent {
  id: string;
  created: string;
  updated: string;
  type: string;
  data: {
    id: string;
    reference_id: string;
    customer_id: string;
    recurring_action: string;
    currency: string;
    amount: number;
    status: string;
    created: string;
    updated: string;
    schedule_id: string;
    payment_methods: string[];
    schedule: any;
    immediate_action_type: string;
    notification_config: any;
    failed_cycle_action: string;
    payment_link_for_failed_attempt: boolean;
    metadata?: any;
    description: string;
    success_return_url: string;
    failure_return_url: string;
    actions?: any;
  };
}
