import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionPlan } from "@/services/server/XenditService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("plan");
  const subscriptionId = searchParams.get("subscription_id");
  const next = searchParams.get("next"); // Where to redirect after success
  const errorNext = searchParams.get("error_next"); // Where to redirect on error

  try {
    // Determine redirect URL based on 'next' parameter or default to settings subscriptions tab
    const getRedirectUrl = (path: string, params?: Record<string, string>) => {
      const baseUrl = next || "/settings?tab=subscriptions";
      const url = new URL(baseUrl, request.url);

      // Add any additional parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      return url.toString();
    };

    if (!planId) {
      return NextResponse.redirect(
        new URL(
          getRedirectUrl("/settings?tab=subscriptions", {
            error: "missing_plan",
          })
        )
      );
    }

    if (subscriptionId) {
      // Verify subscription status with Xendit
      const statusResult = await getSubscriptionPlan(subscriptionId);

      if (
        statusResult.success &&
        statusResult.subscription?.status === "ACTIVE"
      ) {
        return NextResponse.redirect(
          new URL(
            getRedirectUrl("/settings?tab=subscriptions", { success: "true" })
          )
        );
      }
    }

    return NextResponse.redirect(
      new URL(
        getRedirectUrl("/settings?tab=subscriptions", { success: "true" })
      )
    );
  } catch (error) {
    console.error("Error handling subscription success:", error);
    const errorUrl = errorNext || "/settings?tab=subscriptions";
    return NextResponse.redirect(
      new URL(`${errorUrl}?error=processing_failed`)
    );
  }
}
