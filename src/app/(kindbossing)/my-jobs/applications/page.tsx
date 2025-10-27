"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { JobPost } from "@/types/jobPosts";
import { Application } from "@/types/application";
import { UserProfile } from "@/types/userProfile";
import { useToastActions } from "@/stores/useToastStore";
import { ChatService } from "@/services/client/ChatService";
import ApplicationSwipeInterface from "./_components/ApplicationSwipeInterface";
import { FaUser } from "react-icons/fa";

export default function ApplicationsPage() {
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToastActions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentApplication, setCurrentApplication] =
    useState<Application | null>(null);
  const [kindtaoProfile, setKindtaoProfile] = useState<UserProfile | null>(
    null
  );
  const [nextKindtaoProfile, setNextKindtaoProfile] =
    useState<UserProfile | null>(null);
  const [jobDetails, setJobDetails] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSwipeModalForApplication, setShowSwipeModalForApplication] =
    useState<Application | null>(null);
  const [approvedApplicationData, setApprovedApplicationData] = useState<{
    matchId?: string;
    applicantId: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      const jobId = searchParams.get("jobId");
      setSelectedJobId(jobId);
      loadApplications(jobId);
    }
  }, [user, searchParams]);

  const loadApplications = async (jobId?: string | null) => {
    try {
      setLoading(true);

      if (!user?.id) return;

      const supabase = createClient();

      // Get job details if specific job ID is provided
      if (jobId) {
        const { data: jobData, error: jobError } = await supabase
          .from("job_posts")
          .select("*")
          .eq("id", jobId)
          .eq("kindbossing_user_id", user.id)
          .single();

        if (jobError) {
          console.error("Error fetching job details:", jobError);
          showError("Job not found or access denied");
          return;
        }

        setJobDetails(jobData);
      }

      // Get applications for the specific job or all user's jobs - only pending status
      let query = supabase
        .from("job_applications")
        .select(
          `
          *,
          job_posts!inner(job_title, location, job_description, salary, job_type)
        `
        )
        .eq("status", "pending");

      if (jobId) {
        query = query.eq("job_post_id", jobId);
      } else {
        // Get all job IDs for this user
        const { data: userJobs } = await supabase
          .from("job_posts")
          .select("id")
          .eq("kindbossing_user_id", user.id);

        if (userJobs && userJobs.length > 0) {
          const jobIds = userJobs.map((job) => job.id);
          query = query.in("job_post_id", jobIds);
        } else {
          setApplications([]);
          return;
        }
      }

      // Add order by after all filters
      const { data, error } = await query.order("applied_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching applications:", error);
        showError("Failed to load applications");
        return;
      }

      if (!data || data.length === 0) {
        setApplications([]);
        return;
      }

      // Transform data to match Application interface
      // Only pending applications are returned from the query
      const applications: Application[] = data.map((app) => ({
        id: app.id,
        job_id: app.job_post_id,
        applicant_id: app.kindtao_user_id,
        status: app.status,
        applied_at: app.applied_at,
        applicant_name: "Applicant", // Anonymous for privacy
        applicant_phone: "", // Not shown in list
        job_title: app.job_posts?.job_title || "",
        job_location: app.job_posts?.location || "",
        cover_message: app.message,
      }));

      setApplications(applications);

      // Load first application's profile if available
      if (applications.length > 0) {
        await loadKindTaoProfile(applications[0].applicant_id);
        setCurrentApplication(applications[0]);

        // Preload next applicant profile for blur preview
        if (applications.length > 1) {
          const nextProfile = await loadKindTaoProfileAsync(
            applications[1].applicant_id
          );
          setNextKindtaoProfile(nextProfile);
        }
      }
    } catch (error) {
      console.error("Error loading applications:", error);
      showError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadKindTaoProfileAsync = async (
    applicantId: string
  ): Promise<UserProfile | null> => {
    try {
      const supabase = createClient();

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          `
          id,
          email,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          profile_image_url,
          barangay,
          municipality,
          province,
          zip_code,
          swipe_credits,
          boost_credits,
          status
        `
        )
        .eq("id", applicantId)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return null;
      }

      // Fetch KindTao profile data
      const { data: kindtaoData, error: kindtaoError } = await supabase
        .from("kindtaos")
        .select(
          `
          skills,
          languages,
          expected_salary_range,
          availability_schedule,
          highest_educational_attainment,
          rating,
          reviews,
          is_verified
        `
        )
        .eq("user_id", applicantId)
        .single();

      // Fetch work experiences with attachments
      const { data: workExperiences, error: workError } = await supabase
        .from("kindtao_work_experiences")
        .select("*")
        .eq("kindtao_user_id", applicantId)
        .order("start_date", { ascending: false });

      // Fetch attachments for each work experience
      if (workExperiences && workExperiences.length > 0) {
        const experienceIds = workExperiences.map((exp) => exp.id);

        const { data: attachments } = await supabase
          .from("kindtao_work_experience_attachments")
          .select("*")
          .in("kindtao_work_experience_id", experienceIds);

        // Attach attachments to their respective work experiences
        const experiencesWithAttachments = workExperiences.map((exp) => ({
          ...exp,
          attachments:
            attachments?.filter(
              (att) => att.kindtao_work_experience_id === exp.id
            ) || [],
        }));

        const profile: UserProfile = {
          ...userData,
          kindtao_profile: kindtaoData
            ? {
                skills: kindtaoData.skills,
                languages: kindtaoData.languages,
                expected_salary_range: kindtaoData.expected_salary_range,
                availability_schedule: kindtaoData.availability_schedule,
                highest_educational_attainment:
                  kindtaoData.highest_educational_attainment,
                rating: kindtaoData.rating,
                reviews: kindtaoData.reviews,
                is_verified: kindtaoData.is_verified,
              }
            : null,
          work_experiences: experiencesWithAttachments,
        };

        return profile;
      } else {
        const profile: UserProfile = {
          ...userData,
          kindtao_profile: kindtaoData
            ? {
                skills: kindtaoData.skills,
                languages: kindtaoData.languages,
                expected_salary_range: kindtaoData.expected_salary_range,
                availability_schedule: kindtaoData.availability_schedule,
                highest_educational_attainment:
                  kindtaoData.highest_educational_attainment,
                rating: kindtaoData.rating,
                reviews: kindtaoData.reviews,
                is_verified: kindtaoData.is_verified,
              }
            : null,
          work_experiences: [],
        };

        return profile;
      }
    } catch (error) {
      console.error("Error loading KindTao profile:", error);
      return null;
    }
  };

  const loadKindTaoProfile = async (applicantId: string) => {
    try {
      const supabase = createClient();

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          `
          id,
          email,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          profile_image_url,
          barangay,
          municipality,
          province,
          zip_code,
          swipe_credits,
          boost_credits,
          status
        `
        )
        .eq("id", applicantId)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      // Fetch KindTao profile data
      const { data: kindtaoData, error: kindtaoError } = await supabase
        .from("kindtaos")
        .select(
          `
          skills,
          languages,
          expected_salary_range,
          availability_schedule,
          highest_educational_attainment,
          rating,
          reviews,
          is_verified
        `
        )
        .eq("user_id", applicantId)
        .single();

      // Fetch work experiences with attachments
      const { data: workExperiences, error: workError } = await supabase
        .from("kindtao_work_experiences")
        .select("*")
        .eq("kindtao_user_id", applicantId)
        .order("start_date", { ascending: false });

      // Fetch attachments for each work experience
      if (workExperiences && workExperiences.length > 0) {
        const experienceIds = workExperiences.map((exp) => exp.id);

        const { data: attachments } = await supabase
          .from("kindtao_work_experience_attachments")
          .select("*")
          .in("kindtao_work_experience_id", experienceIds);

        // Attach attachments to their respective work experiences
        const experiencesWithAttachments = workExperiences.map((exp) => ({
          ...exp,
          attachments:
            attachments?.filter(
              (att) => att.kindtao_work_experience_id === exp.id
            ) || [],
        }));

        const profile: UserProfile = {
          ...userData,
          kindtao_profile: kindtaoData
            ? {
                skills: kindtaoData.skills,
                languages: kindtaoData.languages,
                expected_salary_range: kindtaoData.expected_salary_range,
                availability_schedule: kindtaoData.availability_schedule,
                highest_educational_attainment:
                  kindtaoData.highest_educational_attainment,
                rating: kindtaoData.rating,
                reviews: kindtaoData.reviews,
                is_verified: kindtaoData.is_verified,
              }
            : null,
          work_experiences: experiencesWithAttachments,
        };

        setKindtaoProfile(profile);
      } else {
        const profile: UserProfile = {
          ...userData,
          kindtao_profile: kindtaoData
            ? {
                skills: kindtaoData.skills,
                languages: kindtaoData.languages,
                expected_salary_range: kindtaoData.expected_salary_range,
                availability_schedule: kindtaoData.availability_schedule,
                highest_educational_attainment:
                  kindtaoData.highest_educational_attainment,
                rating: kindtaoData.rating,
                reviews: kindtaoData.reviews,
                is_verified: kindtaoData.is_verified,
              }
            : null,
          work_experiences: [],
        };

        setKindtaoProfile(profile);
      }
    } catch (error) {
      console.error("Error loading KindTao profile:", error);
    }
  };

  const handleApplicationApproved = async (application: Application) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const supabase = createClient();

      // Create a match
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .insert({
          kindbossing_user_id: user?.id,
          kindtao_user_id: application.applicant_id,
          job_post_id: application.job_id,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (matchError) {
        console.error("Error creating match:", matchError);
        showError("Failed to approve application");
        return;
      }

      // Update application status to approved (this removes it from the feed)
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({ status: "approved" })
        .eq("id", application.id);

      if (updateError) {
        console.error("Error updating application:", updateError);
        showError("Failed to approve application");
        return;
      }

      // Store the approved application data for the modal
      setApprovedApplicationData({
        matchId: matchData?.id,
        applicantId: application.applicant_id,
      });

      // Show the modal by storing the application BEFORE removing from list
      setShowSwipeModalForApplication(application);

      showSuccess("✅ Candidate approved!");
    } catch (error) {
      console.error("Error processing application:", error);
      showError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartMessaging = async () => {
    // Remove the approved application from list before closing modal
    if (showSwipeModalForApplication) {
      setApplications((prev) =>
        prev.filter((app) => app.id !== showSwipeModalForApplication.id)
      );
    }

    // Close modal
    setShowSwipeModalForApplication(null);

    if (!approvedApplicationData) {
      router.push("/chats");
      return;
    }

    // Get the match ID for the approved application
    const matchId = approvedApplicationData.matchId;

    if (matchId) {
      try {
        const supabase = createClient();

        // Check if conversation already exists for this match
        const { data: existingConversation, error: convError } = await supabase
          .from("conversations")
          .select("id")
          .eq("match_id", matchId)
          .single();

        let conversationId = existingConversation?.id;

        // If no conversation exists, create one using ChatService
        if (!conversationId) {
          try {
            const newConversation = await ChatService.createConversation(
              matchId
            );
            conversationId = newConversation?.id;

            // Send an initial welcome message
            if (conversationId && user?.id) {
              await ChatService.sendMessage(
                conversationId,
                user.id,
                "Hello! I'd like to discuss this opportunity with you.",
                "text"
              );

              // Small delay to ensure message is saved
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          } catch (createError) {
            console.error("Error creating conversation:", createError);
            showError("Failed to create conversation");
          }
        }

        // Navigate to chat with conversation ID
        if (conversationId) {
          // Add jobId as query parameter to maintain context
          const jobId = showSwipeModalForApplication?.job_id;
          const url = jobId
            ? `/chats/${conversationId}?job=${jobId}`
            : `/chats/${conversationId}`;
          router.push(url);
        } else {
          router.push("/chats");
        }
      } catch (error) {
        console.error("Error starting conversation:", error);
        showError("Failed to start conversation");
        router.push("/chats");
      }
    } else {
      router.push("/chats");
    }

    setApprovedApplicationData(null);
  };

  const handleSaveForLaterAction = () => {
    // Remove the approved application from list before closing modal
    if (showSwipeModalForApplication) {
      setApplications((prev) =>
        prev.filter((app) => app.id !== showSwipeModalForApplication.id)
      );
    }

    // Close modal
    setShowSwipeModalForApplication(null);
    setApprovedApplicationData(null);

    // Reload applications to show next pending application
    loadApplications(selectedJobId);
  };

  const handleApplicationRejected = async (application: Application) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const supabase = createClient();

      // Reject application
      const { error: rejectError } = await supabase
        .from("job_applications")
        .update({ status: "rejected" })
        .eq("id", application.id);

      if (rejectError) {
        console.error("Error rejecting application:", rejectError);
        showError("Failed to reject application");
        return;
      }

      showSuccess("Candidate rejected");

      // Reload applications to get the updated list (rejected app won't show)
      await loadApplications(selectedJobId);
    } catch (error) {
      console.error("Error processing application:", error);
      showError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextApplication = async () => {
    if (currentIndex < applications.length - 1) {
      const nextIndex = currentIndex + 1;

      // Move to next application
      setCurrentIndex(nextIndex);
      setCurrentApplication(applications[nextIndex]);

      // Load the current applicant's profile
      await loadKindTaoProfile(applications[nextIndex].applicant_id);

      // Preload the next next applicant profile if available
      if (nextIndex + 1 < applications.length) {
        const nextNextProfile = await loadKindTaoProfileAsync(
          applications[nextIndex + 1].applicant_id
        );
        setNextKindtaoProfile(nextNextProfile);
      } else {
        setNextKindtaoProfile(null);
      }
    }
  };

  const handlePreviousApplication = async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevApplication = applications[prevIndex];
      setCurrentApplication(prevApplication);
      await loadKindTaoProfile(prevApplication.applicant_id);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8vh)] bg-gray-50">
        {/* Sidebar Skeleton */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md h-[600px] bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8vh)] bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Job Applications
            </h1>
            <p className="text-gray-600 text-sm">
              {jobDetails
                ? `Applications for "${jobDetails.job_title}"`
                : "All job applications"}
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
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
              {selectedJobId
                ? "No Applications for This Job"
                : "No Applications Yet"}
            </h3>
            <p className="text-gray-600 max-w-md">
              {selectedJobId
                ? "No candidates have applied to this specific job yet. Check back later for new applications."
                : "When candidates apply to your jobs, they'll appear here for you to review and approve."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row overflow-hidden h-[calc(100vh-8vh)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Job Applications
          </h1>
          <p className="text-gray-600 text-sm">
            {jobDetails
              ? `Applications for "${jobDetails.job_title}"`
              : "All job applications"}
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-3">
          <div className="text-sm text-gray-500 mb-3">
            {applications.length} application
            {applications.length !== 1 ? "s" : ""} pending
          </div>

          {applications.map((app, index) => (
            <div
              key={app.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                index === currentIndex
                  ? "border-[#CC0000] bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={async () => {
                setCurrentIndex(index);
                setCurrentApplication(app);
                await loadKindTaoProfile(app.applicant_id);

                // Preload next applicant profile if available
                if (index + 1 < applications.length) {
                  const nextProfile = await loadKindTaoProfileAsync(
                    applications[index + 1].applicant_id
                  );
                  setNextKindtaoProfile(nextProfile);
                } else {
                  setNextKindtaoProfile(null);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Applicant</p>
                  <p className="text-xs text-gray-500 truncate">
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Swipe Interface */}
      <div className="flex-1 flex flex-col w-full">
        {/* Job Cards Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Job Swiper - Full Height */}
          <div className="flex-1 flex items-center justify-center p-1 md:p-4">
            <div className="w-full max-w-sm md:max-w-md h-full flex items-center justify-center">
              {currentApplication && kindtaoProfile ? (
                <ApplicationSwipeInterface
                  application={currentApplication}
                  kindtaoProfile={kindtaoProfile}
                  jobDetails={jobDetails}
                  currentIndex={currentIndex}
                  totalApplications={applications.length}
                  isProcessing={isProcessing}
                  onApprove={() =>
                    handleApplicationApproved(currentApplication)
                  }
                  onReject={() => handleApplicationRejected(currentApplication)}
                  onNext={handleNextApplication}
                  onPrevious={handlePreviousApplication}
                  onStartMessaging={handleStartMessaging}
                  onSaveForLater={handleSaveForLaterAction}
                  forceShowModal={
                    showSwipeModalForApplication?.id === currentApplication?.id
                  }
                  canGoNext={currentIndex < applications.length - 1}
                  canGoPrevious={currentIndex > 0}
                  nextApplication={applications[currentIndex + 1] || null}
                  nextKindtaoProfile={nextKindtaoProfile}
                />
              ) : (
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Loading Profile...
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we load the candidate's profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
