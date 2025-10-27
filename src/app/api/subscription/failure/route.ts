import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("plan");
    const error = searchParams.get("error");
    const errorNext = searchParams.get("error_next"); // Where to redirect on error

    if (!planId) {
      const redirectUrl = errorNext || "/settings?tab=subscriptions";
      return NextResponse.redirect(
        new URL(`${redirectUrl}?error=missing_plan`)
      );
    }

    // Log the failure for debugging
    console.log("Subscription payment failed:", { planId, error });

    const redirectUrl = errorNext || "/settings?tab=subscriptions";
    return NextResponse.redirect(
      new URL(`${redirectUrl}?error=payment_failed`)
    );
  } catch (error) {
    console.error("Error handling subscription failure:", error);
    const { searchParams } = new URL(request.url);
    const errorNext = searchParams.get("error_next");
    const redirectUrl = errorNext || "/settings?tab=subscriptions";
    return NextResponse.redirect(
      new URL(`${redirectUrl}?error=processing_failed`)
    );
  }
}
