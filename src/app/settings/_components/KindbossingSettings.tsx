"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { NotificationService } from "@/services/client/NotificationService";
import {
  SubscriptionService,
  SubscriptionData,
} from "@/services/client/SubscriptionService";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import ToggleButton from "../_components/toggleButton";
import SettingsLayout from "./SettingsLayout";
import dynamic from "next/dynamic";
import { IoNotificationsOutline, IoCardOutline } from "react-icons/io5";

const SubscriptionModal = dynamic(
  () => import("@/components/modals/SubscriptionModal"),
  { ssr: false }
);

export default function KindbossingSettings() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "notifications";

  const [pushToggled, setPushToggled] = useState(false);
  const [emailToggled, setEmailToggled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [currentSubscription, setCurrentSubscription] =
    useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useToastStore();
  const { user } = useAuthStore();

  // Load subscription data
  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const { data, error } = await SubscriptionService.getSubscription();
      if (error) {
        console.error("Error loading subscription:", error);
        showError("Error", "Failed to load subscription data");
      } else {
        setCurrentSubscription(data);
        if (data?.subscription_tier) {
          setCurrentPlan(data.subscription_tier);
        }
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
      showError("Error", "Failed to load subscription data");
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Check browser notification permission on mount
  useEffect(() => {
    const updateToggleState = () => {
      const isEnabled = NotificationService.isEnabled();
      setPushToggled(isEnabled);
    };

    updateToggleState();

    // Listen for permission changes
    const handlePermissionChange = () => {
      updateToggleState();
    };

    // Listen for subscription modal open event
    const handleOpenSubscriptionModal = () => {
      setIsSubscriptionModalOpen(true);
    };

    // Check if browser supports notifications
    if (typeof window !== "undefined" && "Notification" in window) {
      // Listen for permission changes (some browsers support this)
      window.addEventListener("focus", handlePermissionChange);
      window.addEventListener(
        "openSubscriptionModal",
        handleOpenSubscriptionModal
      );

      return () => {
        window.removeEventListener("focus", handlePermissionChange);
        window.removeEventListener(
          "openSubscriptionModal",
          handleOpenSubscriptionModal
        );
      };
    }
  }, []);

  const handlePushToggle = async (newValue: boolean) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (newValue) {
        // User wants to enable notifications
        const permission = await NotificationService.requestPermission();

        if (permission) {
          setPushToggled(true);
          showSuccess(
            "Notifications Enabled",
            "You'll now receive notifications for new messages and updates.",
            { duration: 5000 }
          );
        } else {
          setPushToggled(false);
          showWarning(
            "Notifications Blocked",
            "Notifications are blocked by your browser. Please enable them in your browser settings to receive notifications.",
            {
              persistent: true,
              duration: 10000,
              action: {
                label: "Learn More",
                onClick: () => {
                  window.open(
                    "https://support.google.com/chrome/answer/3220216",
                    "_blank"
                  );
                },
              },
            }
          );
        }
      } else {
        // User wants to disable notifications
        setPushToggled(false);
        showInfo(
          "Notifications Disabled",
          "You won't receive push notifications anymore. You can re-enable them anytime.",
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      setPushToggled(NotificationService.isEnabled());
      showError(
        "Error",
        "Failed to update notification settings. Please try again.",
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "notifications":
        return renderNotificationsTab();
      case "subscriptions":
        return renderSubscriptionsTab();
      default:
        return renderNotificationsTab();
    }
  };

  const renderNotificationsTab = () => (
    <div className="p-6">
      <h3 className="mb-4 text-xl sm:text-[1.578rem] font-medium text-black">
        Notifications
      </h3>
      <div className="max-w-5xl grid grid-cols-1 sm:gap-20 sm:grid-cols-2">
        <div className="flex justify-between items-center py-4 sm:py-10">
          <div className="flex flex-col">
            <p className="text-sm sm:text-[0.934rem] text-[#12223B] font-medium">
              Push Notifications
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {pushToggled
                ? "You'll receive notifications for new messages and updates"
                : "Enable to receive notifications for new messages and updates"}
            </p>
          </div>
          <ToggleButton
            toggled={pushToggled}
            onToggle={handlePushToggle}
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-between items-center py-4 sm:py-10">
          <div className="flex flex-col">
            <p className="text-sm sm:text-[0.934rem] text-[#12223B] font-medium">
              Email Notifications
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {emailToggled
                ? "You'll receive email notifications for important updates"
                : "Enable to receive email notifications for important updates"}
            </p>
          </div>
          <ToggleButton toggled={emailToggled} onToggle={setEmailToggled} />
        </div>
      </div>

      {/* Test notification button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-[#12223B]">
              Test Notifications
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Send a test notification to verify your settings
            </p>
          </div>
          <button
            onClick={() => NotificationService.testNotification()}
            disabled={!pushToggled || isLoading}
            className={`px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
              pushToggled && !isLoading
                ? "bg-[#cc0000] text-white hover:bg-red-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Loading..." : "Test"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionsTab = () => (
    <div className="p-6">
      <h3 className="mb-4 text-xl sm:text-[1.578rem] font-medium text-black">
        Subscription & Credits
      </h3>
      <div className="max-w-5xl space-y-6">
        {/* Current Plan Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">
                  {currentSubscription?.subscription_tier
                    ?.charAt(0)
                    .toUpperCase() || "F"}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {currentSubscription?.subscription_tier === "free" ||
                  !currentSubscription
                    ? "Free Plan"
                    : `${
                        currentSubscription.subscription_tier
                          .charAt(0)
                          .toUpperCase() +
                        currentSubscription.subscription_tier.slice(1)
                      } Plan`}
                </h4>
                <p className="text-sm text-gray-600">
                  {currentSubscription?.subscription_tier === "free" ||
                  !currentSubscription
                    ? "You're on the free plan"
                    : `Active subscription - ${currentSubscription.subscription_tier} tier`}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentSubscription?.subscription_tier === "free" ||
                !currentSubscription
                  ? "bg-gray-100 text-gray-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {currentSubscription?.subscription_tier?.toUpperCase() || "FREE"}
            </span>
          </div>

          {/* Credits Display */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500">⚡</span>
                <span className="text-sm font-medium text-gray-700">
                  Swipe Credits
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currentSubscription?.daily_swipe_limit === -1
                  ? "Unlimited"
                  : currentSubscription?.daily_swipe_limit || "10"}
              </div>
              <div className="text-xs text-gray-500">
                {currentSubscription?.daily_swipe_limit === -1
                  ? "Unlimited per day"
                  : currentSubscription?.daily_swipe_limit
                  ? "Per day"
                  : "Per day"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-500">🚀</span>
                <span className="text-sm font-medium text-gray-700">
                  Boost Credits
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currentSubscription?.subscription_tier === "free" ||
                !currentSubscription
                  ? "0"
                  : currentSubscription?.subscription_tier === "basic"
                  ? "5"
                  : currentSubscription?.subscription_tier === "premium"
                  ? "20"
                  : "50"}
              </div>
              <div className="text-xs text-gray-500">
                {currentSubscription?.subscription_tier === "free" ||
                !currentSubscription
                  ? "Not available"
                  : "Per week"}
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          <button
            onClick={() => setIsSubscriptionModalOpen(true)}
            className="w-full cursor-pointer py-2 px-4 bg-[#CC0000] text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            {currentSubscription ? "Change Plan" : "Upgrade Plan"}
          </button>
        </div>
      </div>
    </div>
  );

  const settingsTabs = [
    {
      id: "notifications",
      label: "Notifications",
      icon: IoNotificationsOutline,
      description: "Manage your notification preferences",
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: IoCardOutline,
      description: "Manage your subscription and credits",
    },
  ];

  return (
    <SettingsLayout
      tabs={settingsTabs}
      title="Settings"
      description="Manage your notifications, subscriptions, and account preferences"
    >
      {renderTabContent()}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userRole={user?.user_metadata?.role || "kindbossing"}
        currentPlan={currentPlan}
      />
    </SettingsLayout>
  );
}
