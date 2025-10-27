"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToastStore } from "@/stores/useToastStore";

export default function SubscriptionSuccessHandler() {
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    const subscription = searchParams.get("subscription");

    if (subscription === "success") {
      showSuccess(
        "🎉 Subscription activated! Your premium features are now available."
      );

      // Trigger a custom event to notify other components to refresh subscription data
      window.dispatchEvent(new CustomEvent("subscriptionUpdated"));

      // Clean up the URL by removing the success parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("subscription");
      window.history.replaceState({}, "", url.toString());
    } else if (subscription === "cancelled") {
      showError("❌ Payment cancelled. You can try again anytime.");

      // Clean up the URL by removing the cancelled parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("subscription");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, showSuccess, showError]);

  return null; // This component doesn't render anything
}
