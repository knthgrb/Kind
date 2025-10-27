"use server";

import {
  getUserSubscription as getXenditUserSubscription,
  createUserSubscription,
  createCustomer,
  createSubscriptionPlan,
  cancelSubscriptionPlan,
  getSubscriptionPlan,
  updateSubscriptionStatus,
} from "@/services/server/XenditService";
import { createClient } from "@/utils/supabase/server";
import { UserSubscription } from "@/types/subscription";
import { SUBSCRIPTION_PLANS } from "@/constants/subscriptionPlans";

export async function getUserSubscription(): Promise<{
  success: boolean;
  subscription: UserSubscription | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        subscription: null,
        error: "Unauthorized",
      };
    }

    const subscription = await getXenditUserSubscription(user.id);

    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return {
      success: false,
      subscription: null,
      error: "Failed to fetch subscription",
    };
  }
}

export async function createSubscription(
  planId: string,
  nextUrl?: string
): Promise<{
  success: boolean;
  subscriptionUrl?: string;
  error?: string;
}> {
  try {
    if (!planId) {
      return {
        success: false,
        error: "Plan ID is required",
      };
    }

    // Get the subscription plan
    const subscriptionPlan = SUBSCRIPTION_PLANS.find(
      (plan) => plan.id === planId
    );

    if (!subscriptionPlan) {
      return {
        success: false,
        error: "Invalid plan ID",
      };
    }

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get user details
    const userEmail = user.email || "user@example.com";
    const firstName = user.user_metadata?.first_name || "User";
    const lastName = user.user_metadata?.last_name || "";

    // Create customer in Xendit
    const customerResult = await createCustomer(
      user.id,
      userEmail,
      firstName,
      lastName
    );

    if (!customerResult.success || !customerResult.customerId) {
      return {
        success: false,
        error: customerResult.error || "Failed to create customer",
      };
    }

    // Check if user already has a subscription for this plan
    const existingSubscription = await getXenditUserSubscription(user.id);

    let subscriptionResult;
    let xenditSubscriptionId;

    if (
      existingSubscription &&
      existingSubscription.xendit_plan_id === planId
    ) {
      // User already has a subscription for this plan, use existing Xendit subscription
      console.log(
        "Using existing subscription:",
        existingSubscription.xendit_subscription_id
      );
      xenditSubscriptionId = existingSubscription.xendit_subscription_id;

      // Return the existing subscription's action URL if it's in REQUIRES_ACTION status
      if (
        existingSubscription.status === "pending" ||
        existingSubscription.status === "requires_action"
      ) {
        // We need to get the current status from Xendit to get the action URL
        const { getSubscriptionPlan } = await import(
          "@/services/server/XenditService"
        );
        const currentPlan = await getSubscriptionPlan(
          existingSubscription.xendit_subscription_id!
        );

        if (
          currentPlan.success &&
          currentPlan.subscription?.actions?.[0]?.url
        ) {
          return {
            success: true,
            subscriptionUrl: currentPlan.subscription.actions[0].url,
          };
        }
      }

      // If subscription is already active, return success without creating new plan
      if (existingSubscription.status === "active") {
        return {
          success: true,
          subscriptionUrl: undefined, // No action needed
        };
      }
    }

    // Create new subscription plan in Xendit only if no existing subscription
    if (!xenditSubscriptionId) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // Build success URL with next parameter if provided
      const successUrlParams = new URLSearchParams({ plan: planId });
      if (nextUrl) {
        successUrlParams.set("next", nextUrl);
      }
      const successUrl = `${baseUrl}/api/subscription/success?${successUrlParams.toString()}`;

      // Build failure URL with error_next parameter if provided
      const failureUrlParams = new URLSearchParams({ plan: planId });
      if (nextUrl) {
        failureUrlParams.set("error_next", nextUrl);
      }
      const failureUrl = `${baseUrl}/api/subscription/failure?${failureUrlParams.toString()}`;

      subscriptionResult = await createSubscriptionPlan(
        user.id,
        customerResult.customerId,
        planId,
        subscriptionPlan.priceMonthly,
        subscriptionPlan.currency,
        subscriptionPlan.description,
        successUrl,
        failureUrl
      );

      if (!subscriptionResult.success || !subscriptionResult.subscription) {
        return {
          success: false,
          error:
            subscriptionResult.error || "Failed to create subscription plan",
        };
      }

      xenditSubscriptionId = subscriptionResult.subscription.id;
    }

    // Store subscription in database
    const dbResult = await createUserSubscription(
      user.id,
      planId,
      xenditSubscriptionId,
      customerResult.customerId,
      subscriptionPlan.priceMonthly,
      subscriptionPlan.currency
    );

    if (!dbResult.success) {
      return {
        success: false,
        error: dbResult.error || "Failed to save subscription",
      };
    }

    // If we created a new subscription, check for action URL
    if (subscriptionResult) {
      // Debug: Log the subscription result (can be removed in production)
      console.log(
        "Subscription status:",
        subscriptionResult.subscription?.status
      );
      console.log("Actions array:", subscriptionResult.subscription?.actions);

      // Check if subscription requires action and has an action URL
      if (
        subscriptionResult.subscription?.status === "REQUIRES_ACTION" &&
        subscriptionResult.subscription?.actions?.[0]?.url
      ) {
        return {
          success: true,
          subscriptionUrl: subscriptionResult.subscription.actions[0].url,
        };
      }

      // Fallback: Check for actions URL regardless of status
      if (subscriptionResult.subscription?.actions?.[0]?.url) {
        return {
          success: true,
          subscriptionUrl: subscriptionResult.subscription.actions[0].url,
        };
      }
    }

    return {
      success: false,
      error: "No payment URL available",
    };
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function cancelSubscription(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get current subscription
    const subscription = await getXenditUserSubscription(user.id);
    if (!subscription || !subscription.xendit_subscription_id) {
      return {
        success: false,
        error: "No active subscription found",
      };
    }

    // Cancel subscription in Xendit
    const cancelResult = await cancelSubscriptionPlan(
      subscription.xendit_subscription_id
    );

    if (!cancelResult.success) {
      return {
        success: false,
        error: cancelResult.error || "Failed to cancel subscription",
      };
    }

    // Update subscription status in database
    const updateResult = await updateSubscriptionStatus(
      subscription.xendit_subscription_id,
      "cancelled",
      {
        cancelled_at: new Date().toISOString(),
        cancel_at_period_end: true,
      }
    );

    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || "Failed to update subscription status",
      };
    }

    return {
      success: true,
      message: "Subscription cancelled successfully",
    };
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return {
      success: false,
      error: "Failed to cancel subscription",
    };
  }
}

export async function getSubscriptionStatus(subscriptionId: string): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const subscriptionResult = await getSubscriptionPlan(subscriptionId);

    if (!subscriptionResult.success || !subscriptionResult.subscription) {
      return {
        success: false,
        error: subscriptionResult.error || "Failed to fetch subscription",
      };
    }

    return {
      success: true,
      status: subscriptionResult.subscription.status,
    };
  } catch (error: any) {
    console.error("Error fetching subscription status:", error);
    return {
      success: false,
      error: "Failed to fetch subscription status",
    };
  }
}
