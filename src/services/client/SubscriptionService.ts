import { logger } from "@/utils/logger";
import { getSubscription } from "@/actions/subscription/get-subscription";

export interface SubscriptionData {
  id: string;
  user_id: string;
  plan_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  daily_swipe_limit: number | null;
  amount_paid: number | null;
  currency: string | null;
  subscription_tier: string;
  subscription_expires_at: string | null;
  xendit_subscription_id: string | null;
  xendit_customer_id: string | null;
  xendit_plan_id: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export class SubscriptionService {
  /**
   * Get subscription data for the current user
   * This now calls the server action directly
   */
  static async getSubscription(): Promise<{
    data: SubscriptionData | null;
    error?: string;
  }> {
    try {
      return await getSubscription();
    } catch (error) {
      logger.error("Error fetching subscription:", error);
      return { data: null, error: "Network error occurred" };
    }
  }
}
