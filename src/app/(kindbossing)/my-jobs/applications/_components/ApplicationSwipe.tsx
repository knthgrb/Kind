"use client";

import { useState, useRef, useCallback } from "react";
import { Application } from "@/types/application";
import ApplicationCardMobile from "./ApplicationCardMobile";
import { useToast } from "@/contexts/ToastContext";
import { ApplicationService } from "@/services/client/ApplicationService";
import { useAuthStore } from "@/stores/useAuthStore";

interface ApplicationSwipeProps {
  initialApplications: Application[];
  onApplicationProcessed: (application: Application) => void;
}

export default function ApplicationSwipe({
  initialApplications,
  onApplicationProcessed,
}: ApplicationSwipeProps) {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [cards, setCards] = useState<Application[]>(initialApplications);
  const [activeIndex, setActiveIndex] = useState(
    initialApplications.length - 1
  );
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating || isProcessing || isProcessingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    startX.current = e.clientX;
    startY.current = e.clientY;
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isAnimating || isProcessing || isProcessingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.preventDefault();

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // Allow more vertical movement but still limit it
    const limitedY = Math.abs(dy) > 100 ? (dy > 0 ? 100 : -100) : dy;

    setOffset({ x: dx, y: limitedY });
  };

  const handlePointerUp = useCallback(async () => {
    if (!isDragging || isAnimating || isProcessing || isProcessingRef.current) {
      return;
    }

    setIsDragging(false);
    setIsAnimating(true);

    const currentApplication = cards[activeIndex];
    if (!currentApplication) {
      setIsAnimating(false);
      return;
    }

    // Swipe thresholds
    const SWIPE_THRESHOLD = 80;
    const VELOCITY_THRESHOLD = 0.2;
    const RETURN_THRESHOLD = 70;

    // Calculate velocity based on distance and time
    const velocity = Math.abs(offset.x) / 50;

    // Check if user wants to return card to middle (swipe back towards center)
    if (Math.abs(offset.x) < RETURN_THRESHOLD) {
      // Reset card with smooth animation
      animateCardReset();
      return;
    }

    // Check for swipe with adjusted threshold
    if (
      offset.x > SWIPE_THRESHOLD ||
      (offset.x > 50 && velocity > VELOCITY_THRESHOLD)
    ) {
      // Swipe right = approve
      setIsProcessing(true);
      isProcessingRef.current = true;
      animateCardExit("right", async () => {
        await handleApprove(currentApplication);
        removeCard();
        // Keep isProcessing true for a bit longer to prevent any additional swipes
        setTimeout(() => {
          setIsProcessing(false);
          isProcessingRef.current = false;
        }, 1000);
      });
      return;
    } else if (
      offset.x < -SWIPE_THRESHOLD ||
      (offset.x < -50 && velocity > VELOCITY_THRESHOLD)
    ) {
      // Swipe left = reject
      setIsProcessing(true);
      isProcessingRef.current = true;
      animateCardExit("left", async () => {
        await handleReject(currentApplication);
        removeCard();
        setTimeout(() => {
          setIsProcessing(false);
          isProcessingRef.current = false;
        }, 1000);
      });
      return;
    }

    // If not enough for action but more than return threshold, still allow return to middle
    animateCardReset();
  }, [offset.x, cards, activeIndex, isDragging, isAnimating, isProcessing]);

  const animateCardExit = (
    direction: "left" | "right",
    callback: () => void
  ) => {
    const exitX = direction === "right" ? 1000 : -1000;
    setOffset({ x: exitX, y: 0 });

    setTimeout(() => {
      callback();
      // Clean up all states
      setOffset({ x: 0, y: 0 });
      setIsAnimating(false);
    }, 250);
  };

  const animateCardReset = () => {
    setOffset({ x: 0, y: 0 });
    setTimeout(() => {
      setIsAnimating(false);
    }, 150);
  };

  const removeCard = useCallback(() => {
    // Actually remove the card from the array
    setCards((prevCards) => {
      const newCards = prevCards.filter((_, index) => index !== activeIndex);
      return newCards;
    });

    // Update active index to point to the next card
    setActiveIndex((prev) => prev - 1);
  }, [activeIndex]);

  const handleApprove = async (application: Application) => {
    try {
      // Approve application using ApplicationService
      const result = await ApplicationService.approveApplication(
        application.id,
        application.job_id,
        application.applicant_id,
        user?.id || ""
      );

      if (result.success) {
        onApplicationProcessed(application);
        showToast(
          "✅ Candidate approved! Go send a message chuchuc",
          "success"
        );
      } else {
        showToast("Failed to approve candidate. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error approving application:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  const handleReject = async (application: Application) => {
    try {
      // Reject application using ApplicationService
      const result = await ApplicationService.rejectApplication(
        application.id,
        user?.id || ""
      );

      if (result.success) {
        onApplicationProcessed(application);
        showToast("Candidate rejected.", "info");
      } else {
        showToast("Failed to reject candidate. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  // More responsive rotation and overlay
  const rotation = offset.x * 0.15;
  const overlayText =
    offset.x > 80 ? "Approve" : offset.x < -80 ? "Reject" : null;
  const overlayOpacity = Math.min(Math.abs(offset.x) / 120, 0.9);

  // Show overlay with gradual color based on swipe direction
  const showOverlay = Math.abs(offset.x) > 20; // Start showing overlay at 20px
  const overlayColor = offset.x > 0 ? "bg-green-500" : "bg-red-500";

  // Show no more applications state
  if (activeIndex < 0 || cards.length === 0) {
    return (
      <div className="relative w-full max-w-md h-[600px] mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No more applications
          </h3>
          <p className="text-gray-600">
            You've reviewed all applications. Check back later for new
            candidates!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Swiper Container */}
      <div
        className="relative w-full h-[600px] mx-auto overflow-hidden"
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        {/* Full area overlay for active card */}
        {showOverlay && !isProcessing && (
          <div
            className={`absolute inset-0 flex items-start justify-center pt-8 text-4xl font-bold text-white pointer-events-none transition-all duration-300 ease-in-out ${overlayColor}`}
            style={{ opacity: overlayOpacity, zIndex: 1 }}
          >
            {overlayText}
          </div>
        )}

        {/* Processing overlay */}
        {(isProcessing || isProcessingRef.current) && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none transition-all duration-300 ease-in-out"
            style={{ zIndex: 1 }}
          >
            <div className="bg-white rounded-lg p-6 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CC0000] mb-3"></div>
              <p className="text-lg font-semibold text-gray-800">
                Processing...
              </p>
            </div>
          </div>
        )}

        {cards.map((application, index) => {
          const isActive = index === activeIndex;
          const isVisible = index >= activeIndex - 2;

          if (!isVisible) return null;

          return (
            <div
              key={application.id}
              className={`absolute inset-0 flex items-center justify-center w-full ${
                (isProcessing || isProcessingRef.current) && isActive
                  ? "pointer-events-none"
                  : ""
              }`}
              style={{ zIndex: index + 1 }} // Higher z-index to stay above overlay
              onPointerDown={
                isActive && !isProcessing && !isProcessingRef.current
                  ? handlePointerDown
                  : undefined
              }
              onPointerMove={
                isActive && !isProcessing && !isProcessingRef.current
                  ? handlePointerMove
                  : undefined
              }
              onPointerUp={
                isActive && !isProcessing && !isProcessingRef.current
                  ? handlePointerUp
                  : undefined
              }
            >
              {/* Card */}
              <div
                className={`w-full max-w-md transition-transform duration-150 ${
                  isActive ? "" : "scale-95"
                }`}
                style={
                  isActive
                    ? {
                        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                      }
                    : {
                        transform: `scale(${
                          0.95 - (activeIndex - index) * 0.05
                        })`,
                      }
                }
              >
                <ApplicationCardMobile
                  application={application}
                  isProcessing={
                    (isProcessing || isProcessingRef.current) && isActive
                  }
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
