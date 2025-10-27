"use client";

import React, { useState } from "react";
import { FaCrown, FaTimes, FaArrowUp } from "react-icons/fa";
import PricingModal from "@/app/settings/_components/PricingModal";
import { PaymentPlan } from "@/types/payment";

interface UpgradeBannerProps {
  currentPlan: string;
}

export default function UpgradeBanner({ currentPlan }: UpgradeBannerProps) {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is not on free plan or if dismissed
  if ((currentPlan !== "free" && currentPlan !== "Free") || isDismissed) {
    return null;
  }

  const handlePlanSelect = (plan: PaymentPlan) => {
    // Handle plan selection - you might want to redirect or refresh the page
    console.log("Selected plan:", plan);
    setIsPricingModalOpen(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <>
      <div className="bg-gradient-to-r my-6 from-[#CC0000] to-red-600 rounded-xl p-4 mb-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaCrown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">
                  Unlock More Opportunities
                </h3>
                <p className="text-white/90 text-sm mb-3">
                  Upgrade to access unlimited job matches and premium features
                </p>
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="bg-white cursor-pointer text-[#CC0000] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <FaArrowUp className="w-3 h-3" />
                  Upgrade Now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 cursor-pointer hover:text-white p-1 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlan={handlePlanSelect}
        currentPlan={currentPlan}
      />
    </>
  );
}
